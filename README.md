# Regen Bazaar — Marketing Site

Public landing site for [Regen Bazaar](https://www.regenbazaar.com), a marketplace that turns verified real-world impact (RWI) into a tradable on-chain asset class: for creators (NGOs, communities and individuals) to tokenize impact, and for buyers to purchase it.

**Live:** https://www.regenbazaar.com

## Pages
- `index.html` — home
- `investors.html`: investor thesis, market, traction
- `ngos.html` — for NGOs & communities (how to tokenize impact)

## Stack
- Static HTML + CSS (`investors.css`, `pages.css`), assets in `assets/`
- Cloudflare Pages Functions in `functions/` (Telegram-backed contact & application forms)
- Hosted on Cloudflare Pages (project `regenbazaar`); headers in `_headers`, rewrites in `_redirects`
- `api/`, `vercel.json`, `.vercelignore`: old Vercel setup, kept only as rollback until mid-December 2026

## Deploy
```bash
CLOUDFLARE_API_TOKEN=... ./scripts/cf-deploy.sh
```
The script copies the public files to `dist/` and runs `wrangler pages deploy` (Functions come from `functions/`). Secrets live in the Pages project settings, not in the repo.

## Local development
```bash
cp .env.example .dev.vars   # fill in Telegram values for the functions
BUILD_ONLY=1 ./scripts/cf-deploy.sh     # builds dist/ without deploying
npx wrangler@4.143.0 pages dev dist   # serves the site + functions/ locally
```

The static pages also open directly in a browser, but `/api/contact` and `/api/apply` need the Pages Functions runtime and the environment variables below.

## Environment variables
See `.env.example`. The `functions/` handlers read everything from the environment — no secrets are committed.

| Variable | Purpose |
|----------|---------|
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather |
| `TELEGRAM_OWNER_CHAT_ID` | Where investor enquiries are delivered |
| `TELEGRAM_GROUP_CHAT_ID` | Group/chat for NGO applications |
| `TELEGRAM_TOPIC_ID` | Forum topic id (optional) |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins |
