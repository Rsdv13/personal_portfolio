"""Traffic logging + chat-captured leads, backed by Postgres (Supabase free tier).

Every public function here degrades to a safe no-op (and logs a warning) on ANY
failure — DATABASE_URL unset, wrong password, network blip, whatever. Traffic
logging and lead capture must never be able to take the main site down; a visit
that fails to log is just a visit that fails to log, not a 500 page.
"""
import logging
import os
from contextlib import contextmanager
from functools import wraps

import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get("DATABASE_URL")

logger = logging.getLogger(__name__)


def _safe(default=None):
    """Decorator: catch and log any exception, returning `default` instead of raising."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                return fn(*args, **kwargs)
            except Exception as exc:
                logger.warning("[db] %s failed, continuing without it: %s", fn.__name__, exc)
                return default
        return wrapper
    return decorator


@contextmanager
def get_conn():
    if not DATABASE_URL:
        yield None
        return
    conn = psycopg2.connect(DATABASE_URL, connect_timeout=5)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


@_safe()
def init_db():
    """Creates the tables if they don't exist yet. Safe to call on every app startup."""
    with get_conn() as conn:
        if conn is None:
            return
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS page_visits (
                    id SERIAL PRIMARY KEY,
                    visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    path TEXT NOT NULL,
                    referrer TEXT,
                    user_agent TEXT,
                    device_type TEXT,
                    ip_hash TEXT
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS leads (
                    id SERIAL PRIMARY KEY,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    email TEXT UNIQUE NOT NULL,
                    message TEXT,
                    referrer TEXT
                )
            """)


@_safe()
def log_visit(path, referrer, user_agent, ip_hash, device_type):
    with get_conn() as conn:
        if conn is None:
            return
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO page_visits (path, referrer, user_agent, device_type, ip_hash) "
                "VALUES (%s, %s, %s, %s, %s)",
                (path, referrer, user_agent, device_type, ip_hash),
            )


@_safe(default=False)
def save_lead(email, message, referrer):
    """Inserts a new lead. Returns True if it was newly captured, False if that
    email was already on file (ON CONFLICT DO NOTHING), the DB isn't configured,
    or the save failed for any reason."""
    with get_conn() as conn:
        if conn is None:
            return False
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO leads (email, message, referrer) VALUES (%s, %s, %s) "
                "ON CONFLICT (email) DO NOTHING",
                (email, message, referrer),
            )
            return cur.rowcount > 0


@_safe()
def get_stats():
    with get_conn() as conn:
        if conn is None:
            return None
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT COUNT(*) AS total FROM page_visits")
            total_visits = cur.fetchone()["total"]

            cur.execute("SELECT COUNT(DISTINCT ip_hash) AS uniq FROM page_visits")
            unique_visitors = cur.fetchone()["uniq"]

            cur.execute(
                "SELECT COUNT(*) AS today FROM page_visits "
                "WHERE visited_at >= date_trunc('day', now())"
            )
            visits_today = cur.fetchone()["today"]

            cur.execute(
                "SELECT path, visited_at, referrer, device_type FROM page_visits "
                "ORDER BY visited_at DESC LIMIT 50"
            )
            recent_visits = cur.fetchall()

            cur.execute("SELECT email, message, created_at FROM leads ORDER BY created_at DESC")
            leads = cur.fetchall()

            return {
                "total_visits": total_visits,
                "unique_visitors": unique_visitors,
                "visits_today": visits_today,
                "recent_visits": recent_visits,
                "leads": leads,
            }
