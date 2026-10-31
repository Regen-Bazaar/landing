// POST /api/contact — investor enquiry. DMs the owner directly on Telegram.
import { esc, clip, json, readJson, guard, sendTelegram } from "../_telegram.js";

export async function onRequest({ request, env }) {
  const blocked = guard(request, env);
  if (blocked) return blocked;

  const body = await readJson(request);
  if (body.website) return json(200, { ok: true }); // honeypot → silent success

  const OWNER = env.TELEGRAM_OWNER_CHAT_ID;
  if (!env.TELEGRAM_BOT_TOKEN || !OWNER) return json(500, { ok: false, error: "server_not_configured" });

  const name = clip(body.name, 200);
  const contact = clip(body.contact, 200);
  const message = clip(body.message, 1500);
  if (!contact && !message) return json(400, { ok: false, error: "missing_fields" });

  const lines = ["📩 <b>New investor enquiry</b>"];
  if (name) lines.push(`<b>Name:</b> ${esc(name)}`);
  if (contact) lines.push(`<b>Contact:</b> ${esc(contact)}`);
  if (message) lines.push(`\n<b>Message:</b>\n${esc(message)}`);

  try {
    const data = await sendTelegram(env, { chat_id: OWNER, text: lines.join("\n") });
    if (!data.ok) return json(502, { ok: false, error: "telegram_error", description: data.description });
    return json(200, { ok: true });
  } catch (e) {
    return json(502, { ok: false, error: "telegram_unreachable" });
  }
}
