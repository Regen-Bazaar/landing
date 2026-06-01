// POST /api/contact — investor enquiry. DMs the owner directly on Telegram.
const { esc, clip, readJson, originAllowed, sendTelegram, TOKEN } = require("./_telegram");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });
  if (!originAllowed(req)) return res.status(403).json({ ok: false, error: "forbidden_origin" });

  const body = await readJson(req);
  if (body.website) return res.status(200).json({ ok: true }); // honeypot → silent success

  const OWNER = process.env.TELEGRAM_OWNER_CHAT_ID;
  if (!TOKEN || !OWNER) return res.status(500).json({ ok: false, error: "server_not_configured" });

  const name = clip(body.name, 200);
  const contact = clip(body.contact, 200);
  const message = clip(body.message, 1500);
  if (!contact && !message) return res.status(400).json({ ok: false, error: "missing_fields" });

  const lines = ["📩 <b>New investor enquiry</b>"];
  if (name) lines.push(`<b>Name:</b> ${esc(name)}`);
  if (contact) lines.push(`<b>Contact:</b> ${esc(contact)}`);
  if (message) lines.push(`\n<b>Message:</b>\n${esc(message)}`);

  try {
    const data = await sendTelegram({ chat_id: OWNER, text: lines.join("\n") });
    if (!data.ok) return res.status(502).json({ ok: false, error: "telegram_error", description: data.description });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false, error: "telegram_unreachable" });
  }
};
