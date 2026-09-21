# Sudharsan Ragothaman — Personal Branding Site

A personal branding website with an embedded AI agent that knows Sudharsan's full background
(resume, projects, skills) and can answer visitor questions about him in real time.

## Architecture

```
site/     React + TypeScript + Tailwind CSS v4 (Vite). Static build, deployed to GitHub Pages.
worker/   Cloudflare Worker. Holds the OpenAI API key server-side and proxies chat requests
          from the site. GitHub Pages can only serve static files, so this is the "backend."
```

The frontend never talks to OpenAI directly — it calls the Worker, which injects a system
prompt containing Sudharsan's resume/experience (`worker/src/knowledge.ts`) and streams the
model's reply back. The OpenAI key never reaches the browser.

If `VITE_CHAT_API_URL` isn't set, the site still builds and deploys fine — the chat widget just
shows a "not connected yet" notice instead of erroring.

## Prerequisites

- Node.js 22+ and npm
- A GitHub account (repo: `https://github.com/Rsdv13/Rsdv13.github.io` — create it if it
  doesn't exist yet; a repo named `<username>.github.io` is auto-served at the domain root)
- A free [Cloudflare](https://dash.cloudflare.com/sign-up) account (for the Worker)
- An [OpenAI API key](https://platform.openai.com/api-keys)

## 1. Local development

```bash
cd site
npm install
npm run dev
```

Opens at `http://localhost:5173`. Without a configured Worker URL, the AI chat widget still
renders but shows a "not connected" state — everything else works normally.

## 2. Deploy the AI agent (Cloudflare Worker)

```bash
cd worker
npm install
npx wrangler login          # opens a browser to authorize wrangler with your Cloudflare account
npx wrangler secret put OPENAI_API_KEY   # paste your OpenAI key when prompted
npm run deploy
```

Wrangler prints the deployed URL, e.g. `https://sudharsan-agent.<your-subdomain>.workers.dev`.
Copy it — you need it in the next step.

`worker/wrangler.toml` already sets `ALLOWED_ORIGIN = "https://Rsdv13.github.io"` so the Worker
only accepts requests from your live site (CORS-enforced). While testing locally, either:
- temporarily set `ALLOWED_ORIGIN = "*"` in `wrangler.toml` and redeploy, or
- run the site against the deployed worker and add `http://localhost:5173` as an allowed value.

**Rate limiting (optional but recommended before sharing the link widely):** uncomment the
`[[unsafe.bindings]]` block at the bottom of `worker/wrangler.toml` to cap requests per IP using
Cloudflare's free built-in rate limiter. The worker code already checks for this binding and
no-ops if it isn't configured.

**Model/cost:** defaults to `gpt-4o-mini` (cheap, fast, good enough for a Q&A agent). Change
`OPENAI_MODEL` in `wrangler.toml` if you want a different model. Set spending limits on your
OpenAI account — the Worker validates message count/length but a public endpoint can still be
hit repeatedly, which is what the rate limiter above is for.

## 3. Connect the frontend to the Worker

**For local dev:** create `site/.env.local` (gitignored):
```
VITE_CHAT_API_URL=https://sudharsan-agent.<your-subdomain>.workers.dev
```

**For the production build (GitHub Actions):** add a repository secret so CI bakes the URL in
at build time — GitHub repo → Settings → Secrets and variables → Actions → New repository
secret:
```
Name:  VITE_CHAT_API_URL
Value: https://sudharsan-agent.<your-subdomain>.workers.dev
```

## 4. Push to GitHub and enable Pages

```bash
git init
git add .
git commit -m "Initial personal branding site with AI agent"
git branch -M main
git remote add origin https://github.com/Rsdv13/Rsdv13.github.io.git
git push -u origin main
```

Then, in the GitHub repo: **Settings → Pages → Build and deployment → Source → GitHub Actions.**
The included workflow (`.github/workflows/deploy.yml`) builds `site/` and deploys it
automatically on every push to `main`. Your site will be live at `https://Rsdv13.github.io`.

### Optional: auto-deploy the Worker from CI too

`.github/workflows/deploy-worker.yml` can deploy the Worker on every push to `worker/**`. It's
disabled by default so CI doesn't fail before you've set it up. To enable:

1. Create a Cloudflare API token (My Profile → API Tokens → "Edit Cloudflare Workers" template).
2. Add repo secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `OPENAI_API_KEY`.
3. Add a repo **variable** (not secret) `CLOUDFLARE_DEPLOY_ENABLED` = `true`.

Otherwise, just redeploy manually with `npm run deploy` inside `worker/` whenever you change it.

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
- The Worker enforces CORS to `ALLOWED_ORIGIN`, validates message shape/length/count, and its
  system prompt instructs the model to stay in persona and ignore attempts (via user messages)
  to override its instructions or reveal the system prompt.
- Consider Cloudflare's rate-limiting binding (see above) before linking this widely, since the
  chat endpoint is public and each message costs a small amount of OpenAI credit.
