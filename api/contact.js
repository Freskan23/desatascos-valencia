// Vercel serverless function: recibe el formulario y manda mensaje a Telegram
// Variables de entorno necesarias en Vercel:
//   TELEGRAM_BOT_TOKEN — token del bot creado con @BotFather
//   TELEGRAM_CHAT_ID   — ID del chat al que enviar (de @userinfobot)

export default async function handler(req, res) {
  // CORS básico (por si en el futuro lo llamas desde otro dominio)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: 'Telegram no configurado en el servidor' });
  }

  const { nombre, telefono, email, mensaje, origen } = req.body || {};

  if (!nombre || !telefono) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, teléfono)' });
  }

  // Anti-bot básico: ignora si el "honeypot" tiene valor
  if (req.body && req.body.website) {
    return res.status(200).json({ ok: true });
  }

  const text = [
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
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });
    const data = await tgRes.json();
    if (!data.ok) return res.status(502).json({ error: 'Telegram rechazó el mensaje', detail: data });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Error contactando con Telegram', detail: String(err) });
  }
}

function escapeMd(str) {
  return String(str).replace(/([_*`\[\]])/g, '\\$1');
}
