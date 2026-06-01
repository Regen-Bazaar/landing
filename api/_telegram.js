// Shared helpers for the Telegram-routing serverless functions.
// Files prefixed with "_" are NOT treated as routes by Vercel.
// No external dependencies — uses Node 18+ global fetch.

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Escape user content for Telegram HTML parse_mode.
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Trim + length-cap a value (defence against oversized payloads).
function clip(s, n) {
  s = String(s == null ? "" : s).trim();
  return s.length > n ? s.slice(0, n) + "…" : s;
}

// Parse a JSON body whether Vercel pre-parsed it or not.
function readJson(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  if (typeof req.body === "string") {
    try { return Promise.resolve(JSON.parse(req.body || "{}")); } catch { return Promise.resolve({}); }
  }
  return new Promise((resolve) => {
    let d = "";
    req.on("data", (c) => { d += c; if (d.length > 1e6) req.destroy(); });
    req.on("end", () => { try { resolve(JSON.parse(d || "{}")); } catch { resolve({}); } });
    req.on("error", () => resolve({}));
  });
}

// CSRF-lite: only accept browser requests whose Origin is allow-listed.
function originAllowed(req) {
  const allow = (process.env.ALLOWED_ORIGINS ||
    "https://regenbazaar.com,https://www.regenbazaar.com,http://localhost:3000")
    .split(",").map((s) => s.trim()).filter(Boolean);
  if (allow.includes("*")) return true;
  const origin = req.headers.origin || "";
  if (!origin) return true; // non-browser / same-origin requests omit Origin
  return allow.includes(origin);
}

// Send a message via the Telegram Bot API. Returns the parsed API response.
async function sendTelegram(payload) {
  if (!TOKEN) return { ok: false, description: "TELEGRAM_BOT_TOKEN not set" };
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parse_mode: "HTML", disable_web_page_preview: true, ...payload }),
  });
  return r.json();
}

module.exports = { esc, clip, readJson, originAllowed, sendTelegram, TOKEN };
