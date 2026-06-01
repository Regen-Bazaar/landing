# Regen Bazaar — Marketing Site

Public landing site for [Regen Bazaar](https://www.regenbazaar.com), a marketplace that turns verified real-world impact (RWI) into a tradable on-chain asset class — for NGOs and communities to tokenize impact, and for investors to fund it.

**Live:** https://www.regenbazaar.com

## Pages
- `index.html` — home
- `investors.html` — investor thesis, market, $REBAZ
- `ngos.html` — for NGOs & communities (how to tokenize impact)

## Stack
- Static HTML + CSS (`investors.css`, `pages.css`), assets in `assets/`
- Vercel serverless functions in `api/` (Telegram-backed contact & application forms)
- Deployed on Vercel; config in `vercel.json`

## Local development
This is a static site with serverless functions. To run with the Vercel CLI:

```bash
npm i -g vercel       # if not installed
cp .env.example .env  # fill in Telegram values for the api/ functions
vercel dev            # serves the site + api/ locally
```

The static pages also open directly in a browser, but the `/api/contact` and `/api/apply` endpoints require the Vercel runtime and the environment variables below.

## Environment variables
See `.env.example`. The `api/` functions read everything from the environment — no secrets are committed.

| Variable | Purpose |
|----------|---------|
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather |
| `TELEGRAM_OWNER_CHAT_ID` | Where investor enquiries are delivered |
| `TELEGRAM_GROUP_CHAT_ID` | Group/chat for NGO applications |
| `TELEGRAM_TOPIC_ID` | Forum topic id (optional) |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins |
