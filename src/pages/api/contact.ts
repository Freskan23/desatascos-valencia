import type { APIRoute } from 'astro';
import { CORS, json, escapeMd, sendTelegram, sendContactEmail } from '@/lib/notify';

export const prerender = false;

export const OPTIONS: APIRoute = () => new Response(null, { status: 200, headers: CORS });

export const POST: APIRoute = async ({ request }) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const resendKey = process.env.RESEND_API_KEY;

  if (!token || !chatId) return json({ error: 'Telegram no configurado en el servidor' }, 500);

  const body = (await request.json().catch(() => ({}))) as Record<string, string>;
  const { nombre, telefono, email, mensaje, origen, website } = body;

  if (!nombre || !telefono) {
    return json({ error: 'Faltan campos obligatorios (nombre, teléfono)' }, 400);
  }
  // Anti-bot honeypot
  if (website) return json({ ok: true });

  // 1) Telegram al comercial (crítico)
  const tgText = [
    '🚨 *NUEVO LEAD — Desatascos Valencia*',
    '',
    `👤 *Nombre:* ${escapeMd(nombre)}`,
    `📞 *Teléfono:* ${escapeMd(telefono)}`,
    email ? `📧 *Email:* ${escapeMd(email)}` : null,
    mensaje ? `💬 *Mensaje:* ${escapeMd(mensaje)}` : null,
    origen ? `🌐 *Origen:* ${escapeMd(origen)}` : null,
    '',
    `🕐 ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}`,
  ].filter(Boolean).join('\n');

  try {
    const tg = await sendTelegram(tgText);
    if (!tg.ok) return json({ error: 'Telegram rechazó el mensaje', detail: tg.detail }, 502);
  } catch (err) {
    return json({ error: 'Error contactando con Telegram', detail: String(err) }, 500);
  }

  // 2) Email de confirmación al cliente (best-effort)
  let emailStatus = 'skipped';
  if (resendKey && email) {
    try {
      await sendContactEmail({ resendKey, to: email, nombre });
      emailStatus = 'sent';
    } catch (err) {
      emailStatus = `failed: ${String(err).slice(0, 200)}`;
      console.error('Resend error:', err);
    }
  }

  // TODO Fase 3: persistir el lead en la BD (prisma.lead.create) — best-effort, sin bloquear.

  return json({ ok: true, email: emailStatus });
};
