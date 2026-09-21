# Sudharsan Ragothaman — Personal Branding Site

A personal branding website with an embedded AI agent (Suzie) that knows Sudharsan's full
background (resume, projects, skills) and can answer visitor questions about him in real time.

**Repo:** https://github.com/Rsdv13/personal_portfolio

One Flask app serves both the pages and the chat API — no separate frontend/backend split, no
CORS, one deployment target (Render).

## Architecture

```
app.py                  Flask app: routes + the /api/chat streaming endpoint
db.py                   Traffic logging + chat lead capture (Postgres, e.g. Supabase free tier)
notify.py               Emails you when a new lead is captured (Gmail SMTP, stdlib only)
data/profile.py         Everything rendered on the page (experience, skills, education, contact)
knowledge.py            What the AI agent (Suzie) knows + her system prompt/persona
templates/               Jinja2 templates (base.html, index.html, partials/*.html, admin.html)
static/                  CSS (compiled Tailwind output), vanilla JS (nav + chat widget), favicon, resume.pdf
```

The browser only ever talks to this one Flask app. `/api/chat` holds the OpenAI key server-side
(as an environment variable) and streams the model's reply back over SSE — the key never reaches
the browser. If `OPENAI_API_KEY` isn't set, the site still runs fine; the chat widget just shows
a "not connected yet" notice instead of erroring.

There's no build step for the frontend — templates and CSS are served as-is by Flask. The only
"build" is `pip install -r requirements.txt`.

---

## Local development

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows. On macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # then edit .env and paste your OpenAI key
python app.py
```

Opens at `http://localhost:5000`. Without `OPENAI_API_KEY` set, the site still runs — the chat
widget shows a "not connected" state and everything else works normally.

## Deploying (Render)

**First-time setup:**

1. Push this repo to GitHub (already done — see above).
2. Go to [Render](https://dashboard.render.com), **New → Web Service**, connect this GitHub repo.
   Render will detect `render.yaml` and pre-fill the build/start commands
   (`pip install -r requirements.txt` / `gunicorn app:app --workers 2 --threads 4 --timeout 120`).
   Pick the **free** plan.
3. Add the environment variable `OPENAI_API_KEY` in the Render dashboard (Environment tab) —
   paste your key there directly; it's stored as a secret and never touches this repo.
4. Deploy. Render gives you a URL like `https://sudharsan-portfolio.onrender.com`.

**Day-to-day:** just `git push`. Render auto-deploys on every push to `main` once connected —
no separate workflow to trigger, no separate frontend/backend deploy steps.

```bash
git add -A
git commit -m "describe your change"
git push
```

Watch the deploy in the Render dashboard's **Logs** tab. Takes 1-2 minutes.

**Free tier note:** Render's free web services sleep after 15 minutes of no traffic. The first
visitor after a quiet period waits ~30-50s for the app to wake up (Suzie will just look "Not
connected" or slow to respond during that window — it resolves itself once the instance is up).
If that's not acceptable, upgrade to a paid instance type (no sleep) later — no code changes
needed.

---

## Traffic monitoring & chat lead capture

`db.py` logs page views and lets Suzie capture visitor contact info, backed by Postgres — both
features are fully optional and no-op gracefully if unconfigured.

**What it does:**
- Every page load records a row in `page_visits` (path, referrer, a hashed IP — not the raw
  address, user-agent, and a simple device-type guess). No third-party tracker, no cookies.
- Suzie actively asks for a name + email when a conversation shows real interest (see her
  updated ground rules in `knowledge.py`). Separately, `/api/chat` also scans the visitor's own
  messages for anything that looks like an email address and saves it to a `leads` table — this
  fires even if Suzie's reply itself fails, since the point is capturing what the visitor typed.
  Each email is stored once (`ON CONFLICT (email) DO NOTHING`), keyed by the address itself.
- A small disclosure line sits under the chat window: *"Conversations may be reviewed, and any
  contact info you share may be used to follow up with you."* — worth keeping honest and visible
  if you extend this further, since visitors are sharing personal data.
- View it all at **`/admin/stats`** (not linked from the public site — bookmark it), protected by
  HTTP Basic Auth against the `ADMIN_PASSWORD` env var. Without that variable set, the page
  returns 401 for everyone, including you.

**One-time setup (free, via Supabase):**
1. Create a project at [supabase.com](https://supabase.com) (free tier, no credit card). In the
   Render dashboard, the fastest way to the Environment page for a given service is
   `dashboard.render.com/web/<service-id>/env` — the plain "Environment" link in the sidebar can
   be easy to miss in Render's current UI.
2. On the project page, click the green **Connect** button (top of the page) → **Connection
   string** → **URI** tab → **Transaction pooler** mode (port 6543) → copy it. It looks like
   `postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-x-region.pooler.supabase.com:6543/postgres`.
3. **Gotcha:** if your database password contains an `@` (or other URL-special character), it
   must be percent-encoded in the connection string or the whole thing fails to parse (`@` breaks
   host-name parsing specifically) — replace `@` with `%40` before using it anywhere.
4. Add it to Render as the `DATABASE_URL` environment variable, plus set `ADMIN_PASSWORD` to
   something real (any username works at the login prompt — only the password is checked).
   `IP_HASH_SALT` auto-generates on first deploy via `render.yaml` (`generateValue: true`) — you
   don't need to set it yourself.
5. Redeploy (or just push any commit). `db.init_db()` runs on startup and creates the two tables
   (`page_visits`, `leads`) automatically if they don't exist yet — no separate migration step.
6. For local dev, add the same `DATABASE_URL` (and `ADMIN_PASSWORD`) to your `.env` file, or just
   leave them unset — the site runs fine either way, traffic logging and lead capture just quietly
   do nothing.

**Limitation worth knowing:** the per-IP rate limiter in `app.py` is in-memory and doesn't touch
this database — see Security notes below. Traffic/lead data itself is fully durable in Postgres
regardless.

### Email notification on new leads (`notify.py`)

Whenever `/api/chat` captures a genuinely new lead (not a repeat of an email already on file),
it emails a notification in a background thread — via `smtplib`, Python's standard library, no
new dependency — so you find out immediately instead of having to remember to check
`/admin/stats`.

**One-time setup (free, using your own Gmail):**
1. Enable 2-Step Verification on the sending Google account, if it isn't already
   (myaccount.google.com/security).
2. Generate an App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   — **not** your regular Gmail password, a separate 16-character one scoped to this use.
3. Add `GMAIL_ADDRESS` (the sending account) and `GMAIL_APP_PASSWORD` (the 16-character password
   from step 2) to Render's environment variables. `LEAD_NOTIFY_EMAIL` already defaults to
   `sudharsan.nitt@gmail.com` in `render.yaml` — only add it yourself if you want notifications
   to go somewhere else.
4. Leave `GMAIL_ADDRESS`/`GMAIL_APP_PASSWORD` unset to disable this — leads still save to the
   database and show up at `/admin/stats`, you just won't get an email about them.

---

## Updating what's on the site

- `data/profile.py` — everything rendered on the page (experience, skills, education, contact
  info). Plain Python dicts/lists; edit and redeploy.
- `knowledge.py` — what Suzie knows and her persona/guardrails (`SYSTEM_PROMPT`). **Keep this in
  sync with `data/profile.py` by hand** whenever the resume changes — nothing enforces it
  automatically.
- `static/resume.pdf` — the "Download résumé" button links here. Replace the file whenever your
  résumé changes (same filename).
- `static/favicon.svg` — browser tab icon (currently an "SR" monogram).
- `static/og-image.png` (1200×630, not included) — optional social-preview image referenced in
  `templates/base.html`'s Open Graph tags; add one for nicer link previews on LinkedIn/Slack.
- A professional headshot: swap the initials avatar in `templates/partials/about.html` for an
  `<img>` pointing at a photo you add under `static/`.
- Visual/layout changes: edit `templates/partials/*.html` (Jinja2 + the same Tailwind utility
  classes as before) and `static/css/style.css` directly. There's no CSS build step — if you add
  a Tailwind utility class that isn't already used somewhere on the page, it won't have a
  matching rule in `style.css` and won't do anything. Either write the equivalent plain CSS by
  hand into `style.css`, or regenerate it with the standalone Tailwind CLI (no Node.js required):
  https://tailwindcss.com/blog/standalone-cli

## How the chat widget works (`static/js/chat.js`)

Plain vanilla JS, no framework, no build step:
- POSTs to `/api/chat` (same-origin, so no CORS config needed) with the conversation so far.
- Reads the streamed SSE response chunk by chunk and appends each token to the in-progress
  message bubble.
- A small hand-rolled "markdown-lite" renderer handles **bold**, `[link](url)`, and `- ` bullet
  lists in Suzie's replies — it escapes the text first, then applies a few regex substitutions,
  so it's safe against the model ever echoing back HTML/script-like content.

## Security notes

- The OpenAI key lives only as a Render environment variable — never in this repo.
- `/api/chat` validates message shape/length/count (max 20 messages, 2000 chars each), and
  Suzie's system prompt instructs her to stay in persona and ignore attempts (via user messages)
  to override her instructions or reveal the system prompt.
- Simple in-memory per-IP rate limiting (`app.py`, 20 requests/60s) guards against casual abuse.
  It resets on restart and doesn't coordinate across multiple gunicorn worker processes, so it's
  a soft limit, not a hard guarantee — fine for a personal site, not bulletproof. If this link
  gets shared widely, consider a real rate limiter backed by Redis (Render has a Redis add-on) or
  set spending limits on your OpenAI account as a backstop.
- `db.py` stores visitor IPs only as a salted one-way hash, never the raw address, and only ever
  stores an email address if the visitor typed it themselves in the chat. The `/admin/stats` page
  holding that data is Basic-Auth protected and returns 401 if `ADMIN_PASSWORD` isn't set — treat
  that password like any other credential (don't reuse one from elsewhere, don't commit it).
  Collecting any personal data (even just an email) carries real privacy obligations depending on
  who's visiting — this implementation is intentionally minimal (email + the message it appeared
  in, nothing else, no cross-site tracking), but if traffic grows beyond casual/personal use,
  revisit whether a proper privacy policy or consent flow is warranted for your situation.
