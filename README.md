# Common-Reach

The public web presence for the CommonReach product (`common-reach.com`). This
is a thin storefront only: a landing page plus slug routes that render the
product **exclusively via iframe**, pointed at instances served by
[`Resource_Directory`](https://github.com/RioFischer/Resource_Directory).

**This repo never contains directory UI code.** Search, browse, provider
pages, and admin all live in `Resource_Directory` — the single source of
truth for the product frontend/backend. See
[`project_three_repo_architecture`] in project memory for the full
three-repo split (`Upriver-fresh` marketing site / `Common-reach` storefront
/ `Resource_Directory` engine).

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page — **placeholder**, awaiting real design/copy |
| `/demo` | Default public demo — iframes the Anytown, USA sample data (production backend) |
| `/codman-square` | Client demo for the Codman Square Anti-Displacement Initiative — iframes the `codman-square` tenant, which currently only exists on the **staging** backend (`stage--resourcedirectory.netlify.app`). Promote that tenant to production if this demo stays active. |
| `/Codman-Demo`, `/codman-demo` | Legacy paths, permanently redirect to `/codman-square` (see `next.config.js`) |

## Setup (manual steps — one-time)

This repo has code but isn't deployed or connected to a domain yet. Two things need doing in the Netlify/registrar dashboards, which can't be done from here:

### 1. Create a Netlify site from this repo
- Netlify dashboard → **Add new site** → **Import an existing project** → GitHub → `RioFischer/Common-reach`
- Build settings are already in `netlify.toml` (build command, publish dir, Next.js plugin) — Netlify should auto-detect them.

### 2. Connect the custom domain
- Site settings → **Domain management** → **Add a domain** → `common-reach.com` (and `www.common-reach.com`)
- Netlify will show you either an A/ALIAS record (apex domain) or a CNAME (www) to add at your domain registrar (wherever `common-reach.com` is registered).
- Add those records there. Netlify auto-provisions an SSL certificate once DNS resolves — usually a few minutes, occasionally longer depending on DNS propagation.

No backend API environment variable is needed — this repo makes no API calls of its own; every demo page is a static shell around an iframe.

## Local development

```bash
npm install
npm run dev
```
