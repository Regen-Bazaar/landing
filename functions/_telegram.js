// Shared helpers for the Telegram-routing Cloudflare Pages Functions.
// Exports no onRequest handler, so Pages does not treat it as a route.

// Escape user content for Telegram HTML parse_mode.
export function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Trim + length-cap a value (defence against oversized payloads).
export function clip(s, n) {
  s = String(s == null ? "" : s).trim();
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function readJson(request) {
  const text = await request.text();
  if (text.length > 1e6) return {};
  try {
    const v = JSON.parse(text || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

// CSRF-lite: only accept browser requests whose Origin is allow-listed.
export function originAllowed(request, env) {
  const allow = (env.ALLOWED_ORIGINS ||
    "https://regenbazaar.com,https://www.regenbazaar.com,http://localhost:3000")
    .split(",").map((s) => s.trim()).filter(Boolean);
  if (allow.includes("*")) return true;
  const origin = request.headers.get("origin") || "";
  if (!origin) return true; // non-browser / same-origin requests omit Origin
  return allow.includes(origin);
}

// Common guard for POST-only form endpoints. Returns a Response to short-circuit, or null.
export function guard(request, env) {
  if (request.method !== "POST") return json(405, { ok: false, error: "method_not_allowed" });
  if (!originAllowed(request, env)) return json(403, { ok: false, error: "forbidden_origin" });
  return null;
}

// Send a message via the Telegram Bot API. Returns the parsed API response.
export async function sendTelegram(env, payload) {
  if (!env.TELEGRAM_BOT_TOKEN) return { ok: false, description: "TELEGRAM_BOT_TOKEN not set" };
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parse_mode: "HTML", disable_web_page_preview: true, ...payload }),
  });
  return r.json();
}
