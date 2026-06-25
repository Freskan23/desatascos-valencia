import type { APIRoute } from 'astro';
import {
  CORS, json, SYSTEM_PROMPT, SYNTH_PROMPT, openai,
  sendTelegram, sendChatLeadEmail, type ChatLead, type ChatPhoto,
} from '@/lib/notify';

export const prerender = false;

export const OPTIONS: APIRoute = () => new Response(null, { status: 200, headers: CORS });

export const POST: APIRoute = async ({ request }) => {
  if (!process.env.OPENAI_API_KEY) return json({ error: 'OpenAI no configurado' }, 500);

  const body = (await request.json().catch(() => ({}))) as {
    messages?: Array<{ role: string; content: string }>;
    photo?: ChatPhoto | null;
  };
  const messages = body.messages ?? [];
  const photo = body.photo ?? null;

  const convo: Array<{ role: string; content: string }> = [{ role: 'system', content: SYSTEM_PROMPT }];
  for (const m of messages.slice(-20)) {
    if (m.role === 'user' || m.role === 'assistant') {
      convo.push({ role: m.role, content: String(m.content || '').slice(0, 1500) });
    }
  }

  let reply: string;
  try {
    reply = await openai(convo);
  } catch (err) {
    return json({ error: 'Error del asistente', detail: String(err).slice(0, 200) }, 502);
  }

  const done = /<LEAD_READY>/i.test(reply);
  reply = reply.replace(/<LEAD_READY>/gi, '').trim();

  if (done) {
    try {
      const transcript = messages
        .map((m) => `${m.role === 'user' ? 'Cliente' : 'Asistente'}: ${m.content}`)
        .join('\n');
      const synthRaw = await openai(
        [{ role: 'system', content: SYNTH_PROMPT }, { role: 'user', content: transcript }],
        { json: true, max: 300 },
      );
      let lead: ChatLead = {};
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
        '', `🕐 ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}`,
      ].filter(Boolean).join('\n');

      await Promise.all([sendTelegram(tg), sendChatLeadEmail({ lead, photo })]);

      // TODO Fase 3: persistir el lead en la BD (prisma.lead.create) — best-effort.
    } catch (err) {
      console.error('finalize error:', err);
    }
  }

  return json({ reply, done });
};
