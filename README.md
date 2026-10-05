# SpyBase — Free OSINT & Email Intelligence

SpyBase is a free, open-source email intelligence / OSINT platform cloned
and rebranded from IntelBase. **Every feature is unlocked and free
forever**: email lookup, linked accounts, data breaches, infostealer log
inspection, connection graph, timeline, team workspaces, PDF/JSON exports,
bulk lookup, REST API, webhook alerts, and an AI analyst powered by your own
OpenRouter key.

This project is a Next.js 14 (App Router) + Tailwind app designed for
one-click deployment to **Vercel**.

## Quick start (local)

```bash
npm install
cp .env.example .env.local   # add your OPENROUTER_API_KEY (optional, free tier works)
npm run dev
# open http://localhost:3000
```

## Deploy to Vercel

1. Push this folder to GitHub.
2. Import the repo in Vercel (Next.js preset).
3. Set these environment variables in Vercel → Settings → Environment
   Variables:
   - `OPENROUTER_API_KEY` — your key from https://openrouter.ai/keys
   - `OPENROUTER_MODEL` (optional) — defaults to
     `google/gemini-2.0-flash-exp:free`, a free model
4. Deploy.

### Recommended free OpenRouter models

- `google/gemini-2.0-flash-exp:free`
- `meta-llama/llama-3.2-3b-instruct:free`
- `mistralai/mistral-7b-instruct:free`
- `qwen/qwen-2-7b-instruct:free`

The UI explains how to configure AI if the key is missing.

## Pages & routes

- `/` — marketing landing page
- `/lookup` — core email intelligence UI (overview, breaches, infostealer,
  accounts, graph, timeline, AI analyst tabs)
- `/dashboard` — analytics, recent lookups, monitors, quick actions
- `/pricing` — "everything free forever" plan page
- `/docs` — deployment & API documentation
- `/about` — mission / responsible-use policy
- `/auth` — sign in / sign up (demo — swap in NextAuth/Auth.js/Clerk)
- `/api/lookup` — public JSON lookup endpoint (replace mock data with your sources)
- `/api/ai` — OpenRouter chat proxy (edge runtime, uses your API key)

## Bringing your own data

By default the `/api/lookup` endpoint returns deterministic mock data so the
UI works out of the box. To connect real intelligence sources:

1. Edit `src/app/api/lookup/route.ts`.
2. Call your providers (HIBP, LeakCheck, your own breach DB, infostealer
   indexes, etc.) using server-side env keys.
3. Return the documented JSON shape.

Stub endpoints are ready to extend for monitoring (`/api/monitor`) and bulk
lookup (`/api/bulk`).

## Responsible use

SpyBase is intended for **authorized** security research, threat
intelligence, fraud prevention, and lawful investigations. Do not use it to
stalk, harass, or obtain data without legal authorization.

## License

MIT — do good things with it.
