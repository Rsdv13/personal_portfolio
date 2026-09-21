"""Emails Sudharsan when Suzie captures a new lead, via the Resend API (HTTPS, port
443 — works on Render's free tier, unlike SMTP, which Render blocks outbound on
free web services as of Sep 2025). Fails silently (logs a warning) if not
configured or if sending fails — a missed notification should never break the
chat response."""
import logging
import os

import requests

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
LEAD_NOTIFY_EMAIL = os.environ.get("LEAD_NOTIFY_EMAIL", "sudharsan.nitt@gmail.com")
# Resend's shared sending domain — works out of the box for any recipient with no
# domain verification needed. Swap for your own verified domain's address later if
# you want the "from" name to look more custom (e.g. suzie@yourdomain.com).
FROM_ADDRESS = os.environ.get("RESEND_FROM_ADDRESS", "Suzie <onboarding@resend.dev>")


def send_lead_email(email: str, message: str, referrer: str | None) -> bool:
    if not RESEND_API_KEY:
        logger.warning("[notify] RESEND_API_KEY not set, skipping lead email")
        return False

    body = f"Suzie just captured a new lead on your portfolio site.\n\nEmail: {email}\n"
    if referrer:
        body += f"Referrer: {referrer}\n"
    body += f"\nWhat they said:\n{message}\n\n--\nView all leads: /admin/stats"

    try:
        res = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": FROM_ADDRESS,
                "to": [LEAD_NOTIFY_EMAIL],
                "subject": f"New lead from your site: {email}",
                "text": body,
            },
            timeout=10,
        )
        if res.status_code >= 300:
            logger.warning("[notify] Resend API error (%s): %s", res.status_code, res.text[:300])
            return False
        return True
    except requests.RequestException as exc:
        logger.warning("[notify] failed to send lead email: %s", exc)
        return False
