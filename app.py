import os
import time
from collections import defaultdict, deque
from datetime import datetime, timezone

import requests
from dotenv import load_dotenv
from flask import Flask, Response, jsonify, render_template, request
from werkzeug.middleware.proxy_fix import ProxyFix

from data.profile import achievements, education, experience, profile, research, skills
from knowledge import SYSTEM_PROMPT

load_dotenv()

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

MAX_MESSAGES = 20
MAX_MESSAGE_LENGTH = 2000
RATE_LIMIT_MAX = 20
RATE_LIMIT_WINDOW = 60  # seconds

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


@app.route("/")
def index():
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
