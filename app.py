import hashlib
import os
import re
import secrets
import threading
import time
from collections import defaultdict, deque
from datetime import datetime, timezone
from functools import wraps

import requests
from dotenv import load_dotenv
from flask import Flask, Response, jsonify, render_template, request
from werkzeug.middleware.proxy_fix import ProxyFix

import db
import notify
from data.profile import achievements, education, experience, profile, research, skills
from knowledge import SYSTEM_PROMPT

load_dotenv()

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

db.init_db()  # no-ops safely if DATABASE_URL is unset or unreachable — see db.py's @_safe decorator

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
IP_HASH_SALT = os.environ.get("IP_HASH_SALT", "sudharsan-site")

MAX_MESSAGES = 20
MAX_MESSAGE_LENGTH = 2000
RATE_LIMIT_MAX = 20
RATE_LIMIT_WINDOW = 60  # seconds

EMAIL_RE = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")

# Simple in-memory per-IP rate limit. Good enough for a single-instance personal site;
# resets on restart and doesn't share state across multiple gunicorn workers/processes.
_rate_limit_state: dict[str, deque] = defaultdict(deque)


def check_rate_limit(ip: str) -> bool:
    now = time.time()
    timestamps = _rate_limit_state[ip]
    while timestamps and now - timestamps[0] > RATE_LIMIT_WINDOW:
        timestamps.popleft()
    if len(timestamps) >= RATE_LIMIT_MAX:
        return False
    timestamps.append(now)
    return True


def hash_ip(ip: str) -> str:
    """One-way hash, not the raw IP — enough to tell 'same visitor' apart without storing
    a reversible address. Salted so hashes aren't guessable via a plain rainbow table."""
    return hashlib.sha256(f"{IP_HASH_SALT}:{ip}".encode()).hexdigest()[:16]


def detect_device(user_agent: str | None) -> str:
    ua = (user_agent or "").lower()
    if any(b in ua for b in ("bot", "crawl", "spider", "slurp", "bingpreview", "facebookexternalhit")):
        return "bot"
    if "ipad" in ua or "tablet" in ua:
        return "tablet"
    if "mobile" in ua or "iphone" in ua or "android" in ua:
        return "mobile"
    return "desktop"


def require_admin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.authorization
        if not ADMIN_PASSWORD or not auth or not secrets.compare_digest(auth.password, ADMIN_PASSWORD):
            return Response(
                "Authentication required", 401, {"WWW-Authenticate": 'Basic realm="Admin"'}
            )
        return f(*args, **kwargs)

    return wrapper


@app.route("/")
def index():
    client_ip = (request.headers.get("X-Forwarded-For", request.remote_addr) or "").split(",")[0].strip()
    user_agent = request.headers.get("User-Agent")
    db.log_visit(
        path="/",
        referrer=request.referrer,
        user_agent=user_agent,
        ip_hash=hash_ip(client_ip) if client_ip else None,
        device_type=detect_device(user_agent),
    )
    return render_template(
        "index.html",
        profile=profile,
        experience=experience,
        research=research,
        education=education,
        skills=skills,
        achievements=achievements,
        chat_configured=bool(OPENAI_API_KEY),
        current_year=datetime.now(timezone.utc).year,
    )


@app.route("/admin/stats")
@require_admin
def admin_stats():
    return render_template("admin.html", stats=db.get_stats())


@app.route("/api/chat", methods=["POST"])
def chat():
    ip = (request.headers.get("X-Forwarded-For", request.remote_addr) or "unknown").split(",")[0].strip()

    if not check_rate_limit(ip):
        return jsonify({"error": "Too many requests. Please slow down."}), 429

    if not OPENAI_API_KEY:
        return jsonify({"error": "Server not configured: missing OPENAI_API_KEY"}), 500

    body = request.get_json(silent=True) or {}
    messages = body.get("messages")

    if not isinstance(messages, list) or len(messages) == 0:
        return jsonify({"error": "messages array is required"}), 400
    if len(messages) > MAX_MESSAGES:
        return jsonify({"error": f"Too many messages (max {MAX_MESSAGES})"}), 400

    clean_messages = []
    for m in messages:
        if (
            not isinstance(m, dict)
            or m.get("role") not in ("user", "assistant")
            or not isinstance(m.get("content"), str)
            or len(m["content"]) == 0
            or len(m["content"]) > MAX_MESSAGE_LENGTH
        ):
            return jsonify({"error": "Malformed message in messages array"}), 400
        clean_messages.append({"role": m["role"], "content": m["content"]})

    # Lead capture: if the visitor's latest message contains an email address, save it.
    # Fires regardless of whether the OpenAI call below succeeds — the point is capturing
    # what the visitor typed, not waiting on Suzie's reply.
    last_user_message = next(
        (m["content"] for m in reversed(clean_messages) if m["role"] == "user"), None
    )
    if last_user_message:
        email_match = EMAIL_RE.search(last_user_message)
        if email_match:
            captured_email = email_match.group(0)
            is_new_lead = db.save_lead(email=captured_email, message=last_user_message, referrer=request.referrer)
            if is_new_lead:
                # Email in a background thread so a slow/failed SMTP send never delays
                # or breaks the chat response — notify.py already fails silently on its own.
                threading.Thread(
                    target=notify.send_lead_email,
                    args=(captured_email, last_user_message, request.referrer),
                    daemon=True,
                ).start()

    try:
        upstream = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": OPENAI_MODEL,
                "stream": True,
                "temperature": 0.6,
                "max_tokens": 600,
                "messages": [{"role": "system", "content": SYSTEM_PROMPT}, *clean_messages],
            },
            stream=True,
            timeout=60,
        )
    except requests.RequestException as exc:
        return jsonify({"error": f"Failed to reach OpenAI: {exc}"}), 502

    if upstream.status_code != 200:
        error_text = upstream.text[:300]
        upstream.close()
        return jsonify({"error": f"Upstream error ({upstream.status_code}): {error_text}"}), 502

    def generate():
        try:
            for chunk in upstream.iter_content(chunk_size=1024):
                if chunk:
                    yield chunk
        finally:
            upstream.close()

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
