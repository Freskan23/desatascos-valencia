// Vercel serverless function: recibe el formulario, manda a Telegram y email al cliente
// Variables de entorno necesarias en Vercel:
//   TELEGRAM_BOT_TOKEN — token del bot creado con @BotFather
//   TELEGRAM_CHAT_ID   — ID del chat al que enviar (de @userinfobot)
//   RESEND_API_KEY     — opcional, para mandar email de confirmación al cliente

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const resendKey = process.env.RESEND_API_KEY;

  if (!token || !chatId) {
    return res.status(500).json({ error: 'Telegram no configurado en el servidor' });
  }

  const { nombre, telefono, email, mensaje, origen } = req.body || {};

  if (!nombre || !telefono) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, teléfono)' });
  }

  // Anti-bot honeypot
  if (req.body && req.body.website) {
    return res.status(200).json({ ok: true });
  }

  // 1) Telegram al comercial (crítico, debe funcionar)
  const tgText = [
    '🚨 *NUEVO LEAD — Desatascos Valencia*',
    '',
    `👤 *Nombre:* ${escapeMd(nombre)}`,
    `📞 *Teléfono:* ${escapeMd(telefono)}`,
    email ? `📧 *Email:* ${escapeMd(email)}` : null,
    mensaje ? `💬 *Mensaje:* ${escapeMd(mensaje)}` : null,
    origen ? `🌐 *Origen:* ${escapeMd(origen)}` : null,
    '',
    `🕐 ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}`
  ].filter(Boolean).join('\n');

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: tgText, parse_mode: 'Markdown', disable_web_page_preview: true })
    });
    const data = await tgRes.json();
    if (!data.ok) return res.status(502).json({ error: 'Telegram rechazó el mensaje', detail: data });
  } catch (err) {
    return res.status(500).json({ error: 'Error contactando con Telegram', detail: String(err) });
  }

  // 2) Email de confirmación al cliente (best-effort, no bloquea)
  if (resendKey && email) {
    sendClientEmail({ resendKey, to: email, nombre }).catch(err => {
      console.error('Resend error (no bloquea respuesta):', err);
    });
  }

  return res.status(200).json({ ok: true });
}

async function sendClientEmail({ resendKey, to, nombre }) {
  const html = `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">
        <tr><td style="background:#0f172a;padding:32px 32px 24px;">
          <div style="color:#ffc13b;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">Desatascos urgentes Valencia</div>
          <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0;letter-spacing:-.3px;">Hemos recibido tu solicitud ✓</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="font-size:15px;line-height:1.7;color:#334155;margin:0 0 16px;">Hola ${escapeHtml(nombre)},</p>
          <p style="font-size:15px;line-height:1.7;color:#334155;margin:0 0 16px;">Hemos recibido tu solicitud y un técnico te llamará en los próximos <strong>5 minutos</strong> para confirmar la urgencia y enviarte la unidad más cercana.</p>
          <p style="font-size:15px;line-height:1.7;color:#334155;margin:0 0 24px;">Si tu caso es muy urgente y prefieres llamarnos directamente:</p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr><td style="background:#ffc13b;border-radius:10px;">
              <a href="tel:+34677123123" style="display:inline-block;padding:16px 28px;font-size:16px;font-weight:700;color:#874900;text-decoration:none;">☎ +34 677 123 123</a>
            </td></tr>
          </table>
          <p style="font-size:13px;line-height:1.6;color:#64748b;margin:32px 0 0;text-align:center;">Disponibles 24h · 365 días · Garantía 48h · Presupuesto cerrado antes de empezar</p>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#94a3b8;margin:0;text-align:center;">© 2026 Desatascos urgentes en Valencia — desatascosvalencia24h.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Desatascos Valencia <onboarding@resend.dev>',
      to: [to],
      reply_to: 'info@desatascosvalencia24h.com',
      subject: 'Hemos recibido tu solicitud — Desatascos Valencia',
      html
    })
  });
  if (!r.ok) {
    const detail = await r.text();
    throw new Error(`Resend ${r.status}: ${detail}`);
  }
}

function escapeMd(str) {
  return String(str).replace(/([_*`\[\]])/g, '\\$1');
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
