# Common-Reach

Frontend-only deployment of the CommonReach directory app, for hosting on a
custom domain (`common-reach.com`). Points at the same live backend as
[`Resource_Directory`](https://github.com/RioFischer/Resource_Directory) —
no separate backend or database here, this repo is UI only.

The Codman Square Anti-Displacement Initiative demo is reachable at
`/Codman-Demo` (rewrites to `/codman-square/search` — see `netlify.toml`).

## Setup (manual steps — one-time)

This repo has code but isn't deployed or connected to a domain yet. Three things need doing in the Netlify/registrar dashboards, which can't be done from here:

### 1. Create a Netlify site from this repo
- Netlify dashboard → **Add new site** → **Import an existing project** → GitHub → `RioFischer/Common-reach`
- Build settings are already in `netlify.toml` (build command, publish dir, Next.js plugin) — Netlify should auto-detect them.

### 2. Set the backend API environment variable
Site settings → **Environment variables** → add:
```
NEXT_PUBLIC_API_URL=https://resourcedirectory-staging.up.railway.app
```
(This points at the same staging backend/database that has the Codman Square demo data. Switch to the production API URL later if this ever needs to go live for real, not just as a demo.)

### 3. Connect the custom domain
- Site settings → **Domain management** → **Add a domain** → `common-reach.com` (and `www.common-reach.com`)
- Netlify will show you either an A/ALIAS record (apex domain) or a CNAME (www) to add at your domain registrar (wherever `common-reach.com` is registered).
- Add those records there. Netlify auto-provisions an SSL certificate once DNS resolves — usually a few minutes, occasionally longer depending on DNS propagation.

Once all three are done, `www.common-reach.com/Codman-Demo` will serve the live demo.

## Local development

```bash
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```
