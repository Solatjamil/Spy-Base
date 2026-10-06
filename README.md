# SpyBase — Free OSINT, Email & Face Intelligence

SpyBase is a free, open-source intelligence platform cloned and rebranded
from IntelBase with **two major upgrades**:

- 🔎 **Email lookup** that calls **real breach / infostealer / OSINT APIs**
  when you configure keys (HIBP, LeakCheck, Snusbase, IntelX, EmailRep, Hunter,
  WhoisXML, Gravatar, and more) instead of showing dummy data.
- 📸 **Face & Image OSINT** — drag-drop a photo to reverse-search faces/images
  across Google Lens (SerpAPI), Google Cloud Vision, Bing Visual Search,
  TinEye, and Search4Faces, then get an AI-vision investigator brief powered
  by OpenRouter. It's designed to be **stronger than Google Lens** for OSINT
  because it runs every provider simultaneously, extracts metadata, and
  produces an actionable report.

**Every feature is free forever.** Add only the API keys you want — missing
providers are skipped gracefully.

## Pages

| Route | Description |
|---|---|
| `/` | Marketing landing |
| `/lookup` | Email intelligence UI (Overview, Breaches, Infostealer, Accounts, Graph, Timeline, AI) |
| `/lookup/face` | **NEW — Face/Image OSINT** (reverse search + AI vision report) |
| `/dashboard` | Analytics + alerts + recent lookups |
| `/settings` | Owner-only secrets panel (shows which keys are live, masked) |
| `/pricing` | "Everything free forever" plan page |
| `/docs` | Deployment & API docs |
| `/about` | Mission & responsible-use policy |
| `/auth` | Sign in / sign up |

## API routes

- `GET /api/lookup?email=...` — aggregates every email/breach provider you configured
- `POST /api/face` — reverse-image / face search across SerpAPI/GV/Bing/TinEye/S4F
- `POST /api/image-analysis` — OpenRouter vision AI analysis (JSON investigator brief)
- `GET/POST /api/me` — settings/auth status (reveals masked keys only)
- `POST /api/ai` — AI chat proxy

## Deploy to Vercel (1 click)

1. Push this repo to GitHub.
2. Import into Vercel (Next.js preset).
3. In Vercel → Settings → Environment Variables, add any API keys you have
   (start with these):
   - `OPENROUTER_API_KEY` — from https://openrouter.ai/keys (free models work;
     enables both the chat analyst and the face/image vision analysis)
   - `SERPAPI_KEY` — from https://serpapi.com (free tier gives ~100 Google Lens
     reverse-image searches/month — this single key makes the face lookup
     dramatically better than Google Lens alone)
   - `HIBP_NO_KEY=1` — enables free HaveIBeenPwned breach lookups (rate-limited)
   - `ADMIN_PASSWORD` — pick a password to lock the `/settings` page (you said
     you're the only user, so this is sufficient)
   - `SESSION_SECRET` — any long random string
4. Deploy.

## All supported env vars

See `.env.example` for the full annotated list (30+ providers). Categories:

### AI
- `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` (defaults to the free Gemini flash model)

### Email / Breach OSINT
- `HIBP_NO_KEY`, `HIBP_API_KEY` — HaveIBeenPwned
- `LEAKCHECK_API_KEY` — LeakCheck
- `LEAKCHECKIO_API_KEY` — LeaksAPI (infostealer heavy)
- `SNUSBASE_API_KEY` — Snusbase
- `WELEAKINFO_API_KEY` — WeLeakInfo
- `INTELX_API_KEY` — Intelligence.X (free tier)
- `PSBDMP_API_KEY` — pastebin dumps
- `EMAILREP_API_KEY` — EmailRep.io (free tier)
- `HUNTER_API_KEY` — Hunter.io
- `WHOISXML_API_KEY` — WhoisXML (free tier)
- `PYPIG_API_KEY` — Proxycurl / LinkedIn
- `EPLEO_API_KEY` — Epieos (free tier)
- `GRAVATAR_ENABLED=1` — Gravatar (no key)
- `ENRICH_FROM_SOCIAL=1` — public account presence probes (no key)

### Face / Reverse-Image
- `SERPAPI_KEY` — **strongest free option** (Google Lens endpoint)
- `GOOGLE_CLOUD_VISION_API_KEY` — faces, labels, logos, landmarks, OCR, web matches
- `BING_SEARCH_API_KEY` — Bing visual search
- `TINEYE_API_KEY` — exact-match reverse image
- `CLARIFAI_API_KEY` — celebrity/face model
- `YANDEX_VISION_API_KEY` — Yandex vision/OCR
- `SEARCH4FACES_API_KEY` — VK/TikTok/Clubhouse face search
- `FACECHECK_ID_TOKEN`, `PIMEYES_API_KEY`, `SOCIALCATFISH_API_KEY`, `BEENVERIFIED_API_KEY`
- `GOOGLE_CSE_API_KEY`, `GOOGLE_CSE_ID` — Google CSE fallback

### Admin
- `ADMIN_PASSWORD` (or `ADMIN_PASSWORD_SHA256`) — lock `/settings`
- `SESSION_SECRET` — cookie signing secret

### App
- `NEXT_PUBLIC_APP_NAME` — branding override (default `SpyBase`)
- `DEMO_MODE=1` — force sample data for previews/screenshots

## Free-model recommendations for AI vision

OpenRouter free models that support images (as of 2026):

- `google/gemini-2.0-flash-exp:free` — best free option (vision + long context)
- `meta-llama/llama-3.2-11b-vision-instruct:free` (when available)
- `qwen/qwen-2-vl-7b-instruct:free`

Set `OPENROUTER_MODEL` to whichever you want.

## Adding your own data sources

Every provider call is isolated in `src/lib/emailSources.ts` and
`src/app/api/face/route.ts`. Add a new block that calls your API, pushes to
the results array, and you're done — the UI will automatically show the new
source in the "Active providers" panel and badge each result with its source.

## Responsible use

SpyBase is intended for **authorized** security research, threat
intelligence, fraud prevention, and lawful investigations. Do not use it to
stalk, harass, dox, or obtain data without legal authorization.
