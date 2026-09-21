# Sudharsan Ragothaman — Personal Branding Site

A personal branding website with an embedded AI agent that knows Sudharsan's full background
(resume, projects, skills) and can answer visitor questions about him in real time.

**Live site:** https://Rsdv13.github.io/personal_portfolio/
**Repo:** https://github.com/Rsdv13/personal_portfolio
**Chat API (Cloudflare Worker):** https://sudharsan-agent.sudharsantkd1999.workers.dev

## Architecture

```
site/     React + TypeScript + Tailwind CSS v4 (Vite). Static build, deployed to GitHub Pages.
worker/   Cloudflare Worker. Holds the OpenAI API key server-side and proxies chat requests
          from the site. GitHub Pages can only serve static files, so this is the "backend."
```

The frontend never talks to OpenAI directly — it calls the Worker, which injects a system
prompt containing Sudharsan's resume/experience (`worker/src/knowledge.ts`) and streams the
model's reply back. The OpenAI key never reaches the browser.

If `VITE_CHAT_API_URL` isn't set at build time, the site still builds and deploys fine — the
chat widget just shows a "not connected yet" notice instead of erroring.

---

## How to deploy changes (day-to-day)

Both halves are already live. Redeploying is different for each:

### Frontend changes (anything in `site/`)

Just commit and push to `main` — **that's it.**

```bash
git add -A
git commit -m "describe your change"
git push
```

`.github/workflows/deploy.yml` automatically rebuilds and republishes to GitHub Pages on every
push to `main` that touches `site/**`. Check progress at
https://github.com/Rsdv13/personal_portfolio/actions. Takes about a minute.

If a push doesn't seem to trigger a run (e.g. you pushed an empty/no-op commit, or only touched
files outside `site/**`), trigger it manually: **Actions → "Deploy site to GitHub Pages" → Run
workflow → branch `main`.**

### AI agent / Worker changes (anything in `worker/`)

The Worker does **not** auto-deploy — redeploy it yourself after editing:

```bash
cd worker
npm run deploy
```

That's a straight `wrangler deploy`; it reuses your existing `wrangler login` session and the
`OPENAI_API_KEY` secret already stored in Cloudflare (secrets persist across deploys — you don't
need to re-enter it). Takes a few seconds. Verify with:

```bash
curl -s -N -X POST "https://sudharsan-agent.sudharsantkd1999.workers.dev" \
  -H "Origin: https://rsdv13.github.io" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```
You should see streamed `data: {...}` chunks back. (The `Origin` header matters — the Worker
rejects requests from origins other than the live site; see Known gotchas below.)

### Updating what the AI agent knows

Content lives in two places that must be kept in sync by hand:
- `site/src/data/profile.ts` — what's rendered on the page.
- `worker/src/knowledge.ts` — what the AI agent knows (system prompt + facts).

Edit both, then push (`site/`) and `npm run deploy` (`worker/`) as above.

### If you ever need to re-authenticate

- **GitHub push fails with an auth error:** `printf "protocol=https\nhost=github.com\n" | git credential reject` to clear the cached credential, then `git push` again — Git Credential Manager will re-prompt via browser.
- **Wrangler session expired:** `cd worker && npx wrangler login`.

---

## Known gotchas (things that already bit us once)

- **CORS is case-sensitive by default, but hostnames aren't.** GitHub Pages serves from a
  lowercase host (`rsdv13.github.io`) regardless of how the GitHub username is capitalized. The
  Worker compares `Origin` case-insensitively (`worker/src/index.ts`) specifically because of
  this — if you ever rewrite that check, keep it case-insensitive or the chat widget will fail
  with a CORS error that's easy to misdiagnose (it only shows up in the browser console, not as
  an obvious page error).
- **`wrangler secret put NAME`** — the secret's *name* is `NAME` (e.g. `OPENAI_API_KEY`); wrangler
  then prompts `Enter a secret value:` on a **separate line** where you paste the actual key.
  Passing the key itself as the argument (`wrangler secret put sk-proj-...`) stores it as a
  secret literally *named* after the key — wrong, and it exposes the key in `wrangler secret
  list` output. Always run `wrangler secret put OPENAI_API_KEY` with no value on the command
  line, and paste only at the interactive prompt.
- **This is a GitHub Pages *project* site, not a *user* site** — the repo is `personal_portfolio`,
  not `Rsdv13.github.io`, so the site is served under `/personal_portfolio/` rather than the
  domain root. `site/vite.config.ts` sets `base: '/personal_portfolio/'` to match, and any new
  hardcoded absolute asset path (e.g. `href="/something.pdf"`) needs
  `` `${import.meta.env.BASE_URL}something.pdf` `` instead, or it'll 404 in production while
  working fine in local dev.
- **A push with zero changed files won't trigger the Pages workflow** — it has a `paths:
  ["site/**"]` filter, so an empty commit or a change outside `site/` is silently skipped. Use
  the manual "Run workflow" button in that case.

---

## Initial setup (already done once — kept here for reference)

<details>
<summary>Expand if you ever need to set this up again from scratch (e.g. new machine, new Cloudflare account)</summary>

### Prerequisites
- Node.js 22+ and npm
- A GitHub account and repo
- A free [Cloudflare](https://dash.cloudflare.com/sign-up) account
- An [OpenAI API key](https://platform.openai.com/api-keys)

### 1. Local development
```bash
cd site
npm install
npm run dev
```
Opens at `http://localhost:5173`.

### 2. Deploy the Worker
```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put OPENAI_API_KEY   # paste the key only when prompted — see gotchas above
npm run deploy
```
First deploy may prompt you to register a `workers.dev` subdomain (one-time, via the dashboard
link it prints) — this becomes part of your Worker's URL.

`worker/wrangler.toml`'s `ALLOWED_ORIGIN` must match your GitHub Pages origin **exactly**
(scheme + host, no path, lowercase — see gotchas above).

**Rate limiting (optional, recommended if the link gets shared widely):** uncomment the
`[[unsafe.bindings]]` block at the bottom of `worker/wrangler.toml`.

### 3. Connect frontend to Worker
Local dev: create `site/.env.local` (gitignored):
```
VITE_CHAT_API_URL=https://sudharsan-agent.<your-subdomain>.workers.dev
```
Production: add it as a GitHub Actions repo secret — **Settings → Secrets and variables →
Actions → New repository secret** — `VITE_CHAT_API_URL`.

### 4. Push and enable Pages
```bash
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```
Then **Settings → Pages → Build and deployment → Source → GitHub Actions.**

If the repo is a *project* site (not named `<username>.github.io`), set `base:
'/<repo-name>/'` in `site/vite.config.ts` to match — see gotchas above.

### Optional: auto-deploy the Worker from CI too
`.github/workflows/deploy-worker.yml` can deploy the Worker on every push to `worker/**`
instead of running `npm run deploy` by hand. It's disabled by default. To enable:
1. Create a Cloudflare API token (My Profile → API Tokens → "Edit Cloudflare Workers" template).
2. Add repo secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `OPENAI_API_KEY`.
3. Add a repo **variable** (not secret) `CLOUDFLARE_DEPLOY_ENABLED` = `true`.

</details>

---

## Customizing content

- `site/src/data/profile.ts` — everything rendered on the page (experience, skills, education).
- `worker/src/knowledge.ts` — what the AI agent knows and its persona/guardrails. **Keep this in
  sync with `profile.ts` manually** whenever the resume changes.
- `site/public/resume.pdf` — the "Download résumé" button links here. Already included; replace
  it whenever your résumé changes.
- `site/public/favicon.svg` — browser tab icon (already set to an "SR" monogram).
- `site/public/og-image.png` (1200×630) — optional social-preview image referenced in
  `index.html`'s Open Graph tags; add one for nicer link previews on LinkedIn/Twitter/Slack.
- A professional headshot: swap the initials avatar in `site/src/components/About.tsx`
  (`InitialsAvatar`) for an `<img>` pointing at a photo you add under `site/public/`.

## Security notes

- The OpenAI key lives only as a Cloudflare Worker secret — never in frontend code or git.
- The Worker enforces CORS to `ALLOWED_ORIGIN` (case-insensitively), validates message
  shape/length/count, and its system prompt instructs the model to stay in persona and ignore
  attempts (via user messages) to override its instructions or reveal the system prompt.
- Consider Cloudflare's rate-limiting binding (see Initial setup above) before linking this
  widely, since the chat endpoint is public and each message costs a small amount of OpenAI
  credit.
