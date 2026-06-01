// POST /api/apply — NGO / community tokenization application.
// Posts a formatted message to the Regen Bazaar group "Application" topic.
const { esc, clip, readJson, originAllowed, sendTelegram, TOKEN } = require("./_telegram");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });
  if (!originAllowed(req)) return res.status(403).json({ ok: false, error: "forbidden_origin" });

  const body = await readJson(req);
  if (body.website) return res.status(200).json({ ok: true }); // honeypot → silent success

  const CHAT_ID = process.env.TELEGRAM_GROUP_CHAT_ID;
  const TOPIC_ID = process.env.TELEGRAM_TOPIC_ID;
  if (!TOKEN || !CHAT_ID) return res.status(500).json({ ok: false, error: "server_not_configured" });

  const entity = clip(body.entity, 200);
  const applicant = clip(body.applicant, 200);
  const contact = clip(body.contact, 200);
  if (!entity && !applicant && !contact) return res.status(400).json({ ok: false, error: "missing_fields" });

  const lines = ["🌱 <b>New NGO / community application</b>"];
  if (body.orgType) lines.push(`<b>Type:</b> ${esc(clip(body.orgType, 120))}`);
  if (entity) lines.push(`<b>Entity:</b> ${esc(entity)}`);
  if (body.registered) lines.push(`<b>Registered:</b> ${esc(clip(body.registered, 20))}`);
  if (applicant) lines.push(`<b>Applicant:</b> ${esc(applicant)}`);
  if (contact) lines.push(`<b>Contact:</b> ${esc(contact)}`);

  const actions = Array.isArray(body.actions) ? body.actions.slice(0, 3) : [];
  actions.forEach((a, i) => {
    a = a || {};
    const parts = [];
    if (a.taken) parts.push(`taken: ${clip(a.taken, 200)}`);
    if (a.impact) parts.push(`impact: ${clip(a.impact, 200)}`);
    if (a.period) parts.push(`period: ${clip(a.period, 80)}`);
    if (a.area) parts.push(`area: ${clip(a.area, 120)}`);
    if (a.proof) parts.push(`proof: ${clip(a.proof, 300)}`);
    const acdm = [];
    ["skills", "resources", "scale", "permits", "access"].forEach((k) => {
      if (a[k]) acdm.push(`${k}: ${clip(a[k], 40)}`);
    });
    if (parts.length || acdm.length) {
      lines.push(`\n<b>Action ${i + 1}</b>`);
      parts.forEach((p) => lines.push(esc(p)));
      if (acdm.length) lines.push("<i>ACDM — " + esc(acdm.join(" · ")) + "</i>");
    }
  });

  const payload = { chat_id: CHAT_ID, text: lines.join("\n") };
  if (TOPIC_ID) payload.message_thread_id = Number(TOPIC_ID);

  try {
    const data = await sendTelegram(payload);
    if (!data.ok) return res.status(502).json({ ok: false, error: "telegram_error", description: data.description });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false, error: "telegram_unreachable" });
  }
};
