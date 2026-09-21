"""Emails Sudharsan when Suzie captures a new lead, via Gmail SMTP (stdlib only —
no new dependency). Fails silently (logs a warning) if not configured or if
sending fails — a missed notification should never break the chat response."""
import logging
import os
import smtplib
from email.message import EmailMessage

logger = logging.getLogger(__name__)

GMAIL_ADDRESS = os.environ.get("GMAIL_ADDRESS")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")
LEAD_NOTIFY_EMAIL = os.environ.get("LEAD_NOTIFY_EMAIL", "sudharsan.nitt@gmail.com")


def send_lead_email(email: str, message: str, referrer: str | None) -> bool:
    if not GMAIL_ADDRESS or not GMAIL_APP_PASSWORD:
        logger.warning("[notify] GMAIL_ADDRESS/GMAIL_APP_PASSWORD not set, skipping lead email")
        return False

    msg = EmailMessage()
    msg["Subject"] = f"New lead from your site: {email}"
    msg["From"] = GMAIL_ADDRESS
    msg["To"] = LEAD_NOTIFY_EMAIL

    body = f"Suzie just captured a new lead on your portfolio site.\n\nEmail: {email}\n"
    if referrer:
        body += f"Referrer: {referrer}\n"
    body += f"\nWhat they said:\n{message}\n\n--\nView all leads: /admin/stats"
    msg.set_content(body)

    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=10) as server:
            server.starttls()
            server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as exc:
        logger.warning("[notify] failed to send lead email: %s", exc)
        return False
