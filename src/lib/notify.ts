// Lógica compartida de notificaciones (Telegram + Resend) y OpenAI.
// Portado fielmente desde las antiguas api/contact.js y api/chat.js.
// Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, RESEND_API_KEY, OPENAI_API_KEY

export const SYSTEM_PROMPT = `Eres el asistente virtual de Lajenuco, empresa de desatascos urgentes en Valencia (24h, llegada en ~30 min, presupuesto cerrado antes de empezar, garantía 48h, teléfono +34 677 123 123).

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

export const SYNTH_PROMPT = `Eres un operador que prepara un parte de aviso para el técnico a partir de la conversación con el cliente. Devuelve SOLO un objeto JSON válido con estas claves exactas:
{"nombre": "...", "telefono": "...", "zona": "...", "servicio": "...", "urgencia": "alta|media|baja", "resumen": "..."}
El "resumen" debe ser 1-2 frases claras de qué necesita el cliente. Si algún dato falta, pon "no facilitado".`;

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export function escapeMd(str: unknown): string {
  return String(str).replace(/([_*`\[\]])/g, '\\$1');
}
export function escapeHtml(str: unknown): string {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>
  )[c]);
}
export function esc(s: unknown): string {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as Record<string, string>
  )[c]);
}

export async function sendTelegram(text: string): Promise<{ ok: boolean; detail?: unknown }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { ok: false, detail: 'telegram-not-configured' };
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown', disable_web_page_preview: true }),
  });
  const data = await r.json().catch(() => ({ ok: false }));
  return { ok: !!data.ok, detail: data };
}

// Email de confirmación al cliente (formulario de contacto)
export async function sendContactEmail({ resendKey, to, nombre }: { resendKey: string; to: string; nombre: string }): Promise<void> {
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
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Desatascos Valencia <onboarding@resend.dev>',
      to: [to],
      reply_to: 'info@desatascosvalencia24h.com',
      subject: 'Hemos recibido tu solicitud — Desatascos Valencia',
      html,
    }),
  });
  if (!r.ok) {
    const detail = await r.text();
    throw new Error(`Resend ${r.status}: ${detail}`);
  }
}

export interface ChatLead {
  nombre?: string; telefono?: string; zona?: string; servicio?: string; urgencia?: string; resumen?: string;
}
export interface ChatPhoto { name?: string; b64?: string }

// Email del lead del chatbot al comercial (con foto adjunta)
export async function sendChatLeadEmail({ lead, photo }: { lead: ChatLead; photo: ChatPhoto | null }): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const rows = [
    ['Nombre', lead.nombre], ['Teléfono', lead.telefono], ['Zona', lead.zona],
    ['Servicio', lead.servicio], ['Urgencia', lead.urgencia],
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

  const payload: Record<string, unknown> = {
    from: 'Lajenuco Chatbot <onboarding@resend.dev>',
    to: ['eduardo.laborda.triguero@gmail.com'],
    reply_to: 'info@desatascosvalencia24h.com',
    subject: `🤖 Lead chat: ${lead.nombre || 'Sin nombre'} — ${lead.servicio || 'desatasco'}`,
    html,
  };
  if (photo && photo.b64) {
    payload.attachments = [{ filename: photo.name || 'foto-cliente.jpg', content: photo.b64 }];
  }
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function openai(
  messages: Array<{ role: string; content: string }>,
  { json: jsonMode = false, model = 'gpt-4o-mini', max = 400 }: { json?: boolean; model?: string; max?: number } = {},
): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  const body: Record<string, unknown> = { model, messages, temperature: 0.5, max_tokens: max };
  if (jsonMode) body.response_format = { type: 'json_object' };
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('OpenAI ' + r.status + ': ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  return j.choices[0].message.content;
}
