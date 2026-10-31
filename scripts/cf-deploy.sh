#!/usr/bin/env bash
# Deploy to Cloudflare Pages (project "regenbazaar"). Needs CLOUDFLARE_API_TOKEN in env.
# Copies only public files to dist/ so api/, docs, configs are not served; functions/ deploys from repo root.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist && mkdir dist
cp -R assets *.html *.css robots.txt sitemap.xml _headers _redirects dist/
# Gitignored but served on Vercel; keep the URL alive if the file is present locally.
[ -f org-avatar.png ] && cp org-avatar.png dist/
CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-a7e9c308efff0b6c92c2b4a3fff30cf3}" \
  npx -y wrangler@4.143.0 pages deploy dist --project-name regenbazaar --branch main --commit-dirty=true "$@"
