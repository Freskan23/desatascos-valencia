// /api/chat — Asistente virtual de Lajenuco.
// Conversa con el cliente, recoge datos y, al completar el lead, sintetiza
// la conversación con OpenAI y la envía a Telegram + email (Resend) con la foto adjunta.
//
// Env vars (Vercel): OPENAI_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, RESEND_API_KEY

const SYSTEM_PROMPT = `Eres el asistente virtual de Lajenuco, empresa de desatascos urgentes en Valencia (24h, llegada en ~30 min, presupuesto cerrado antes de empezar, garantía 48h, teléfono +34 677 123 123).

Tu objetivo: ayudar al cliente y recoger los datos para que un técnico le llame cuanto antes.

Habla SIEMPRE en español, tono cercano y profesional, mensajes CORTOS (1-3 frases). Una pregunta cada vez.

Debes conseguir, de forma natural:
1. El nombre del cliente
2. Un teléfono de contacto
3. Qué problema tiene o qué servicio necesita (atasco de WC, tubería, fregadero, fosa séptica, etc.)
4. La zona o barrio de Valencia
5. Si es urgente (ahora mismo) o puede esperar

Si el problema es visual y puede ayudar, invita al cliente a adjuntar una foto con el botón del clip. No insistas si no quiere.

No des precios exactos: di que el técnico confirma un presupuesto cerrado antes de empezar. Si preguntan rango, di "desde 105€ en horario diurno".

Cuando ya tengas AL MENOS nombre, teléfono y una descripción del problema, agradece al cliente, dile que un técnico le llamará en breve, y TERMINA tu mensaje con la etiqueta <LEAD_READY> en una línea aparte. No uses esa etiqueta antes de tener esos tres datos.`;

const SYNTH_PROMPT = `Eres un operador que prepara un parte de aviso para el técnico a partir de la conversación con el cliente. Devuelve SOLO un objeto JSON válido con estas claves exactas:
{"nombre": "...", "telefono": "...", "zona": "...", "servicio": "...", "urgencia": "alta|media|baja", "resumen": "..."}
El "resumen" debe ser 1-2 frases claras de qué necesita el cliente. Si algún dato falta, pon "no facilitado".`;

async function openai(messages, { json = false, model = 'gpt-4o-mini', max = 400 } = {}) {
  const key = process.env.OPENAI_API_KEY;
  const body = { model, messages, temperature: 0.5, max_tokens: max };
  if (json) body.response_format = { type: 'json_object' };
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error('OpenAI ' + r.status + ': ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  return j.choices[0].message.content;
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN, chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown', disable_web_page_preview: true })
  });
}

async function sendEmail({ lead, photo }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const rows = [
    ['Nombre', lead.nombre], ['Teléfono', lead.telefono], ['Zona', lead.zona],
    ['Servicio', lead.servicio], ['Urgencia', lead.urgencia]
  ].map(([k, v]) => `<tr><td style="padding:8px 14px;border:1px solid #e2e8f0;font-weight:700;color:#0f172a;background:#f8fafc;">${k}</td><td style="padding:8px 14px;border:1px solid #e2e8f0;color:#334155;">${esc(v || '—')}</td></tr>`).join('');
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#0f172a;padding:24px;border-radius:12px 12px 0 0;">
      <div style="color:#4a93de;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Lajenuco · Chatbot</div>
      <h1 style="color:#fff;font-size:20px;margin:6px 0 0;">🤖 Nuevo lead desde el chat</h1>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
      <p style="font-size:15px;color:#334155;margin:0 0 16px;"><strong>Qué necesita:</strong> ${esc(lead.resumen || '')}</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">${rows}</table>
      ${photo ? '<p style="font-size:13px;color:#64748b;margin:18px 0 0;">📎 El cliente adjuntó una foto (ver adjunto).</p>' : ''}
      <p style="font-size:12px;color:#94a3b8;margin:20px 0 0;text-align:center;">Lajenuco · Desatascos Valencia · ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
    </div></div>`;

  const payload = {
    from: 'Lajenuco Chatbot <onboarding@resend.dev>',
    to: ['eduardo.laborda.triguero@gmail.com'],
    reply_to: 'info@desatascosvalencia24h.com',
    subject: `🤖 Lead chat: ${lead.nombre || 'Sin nombre'} — ${lead.servicio || 'desatasco'}`,
    html
  };
  if (photo && photo.b64) {
    payload.attachments = [{ filename: photo.name || 'foto-cliente.jpg', content: photo.b64 }];
  }
  await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OpenAI no configurado' });

  const { messages = [], photo = null } = req.body || {};

  // Construir contexto para el modelo
  const convo = [{ role: 'system', content: SYSTEM_PROMPT }];
  for (const m of messages.slice(-20)) {
    if (m.role === 'user' || m.role === 'assistant') {
      convo.push({ role: m.role, content: String(m.content || '').slice(0, 1500) });
    }
  }

  let reply;
  try {
    reply = await openai(convo);
  } catch (err) {
    return res.status(502).json({ error: 'Error del asistente', detail: String(err).slice(0, 200) });
  }

  const done = /<LEAD_READY>/i.test(reply);
  reply = reply.replace(/<LEAD_READY>/ig, '').trim();

  if (done) {
    // Sintetizar y notificar (no bloquea la respuesta al usuario si falla)
    try {
      const transcript = messages.map(m => `${m.role === 'user' ? 'Cliente' : 'Asistente'}: ${m.content}`).join('\n');
      const synthRaw = await openai(
        [{ role: 'system', content: SYNTH_PROMPT }, { role: 'user', content: transcript }],
        { json: true, max: 300 }
      );
      let lead = {};
      try { lead = JSON.parse(synthRaw); } catch { lead = { resumen: transcript.slice(0, 400) }; }

      const tg = [
        '🤖 *NUEVO LEAD (chatbot) — Lajenuco*', '',
        `👤 *Nombre:* ${lead.nombre || '—'}`,
        `📞 *Teléfono:* ${lead.telefono || '—'}`,
        `📍 *Zona:* ${lead.zona || '—'}`,
        `🔧 *Servicio:* ${lead.servicio || '—'}`,
        `⚡ *Urgencia:* ${lead.urgencia || '—'}`,
        photo ? '📎 *Adjunta foto* (ver email)' : '',
        '', `📝 ${lead.resumen || ''}`,
        '', `🕐 ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}`
      ].filter(Boolean).join('\n');

      await Promise.all([ sendTelegram(tg), sendEmail({ lead, photo }) ]);
    } catch (err) {
      console.error('finalize error:', err);
    }
  }

  return res.status(200).json({ reply, done });
}
