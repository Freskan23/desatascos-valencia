import type { APIRoute } from 'astro';
import { json } from '@/lib/notify';
import { API_KEYS, setSecret } from '@/lib/secrets';

export const prerender = false;

// Gateado por middleware: requiere sesión + role admin (path bajo /api/admin).
export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => ({}))) as { key?: string; value?: string };
  const { key, value } = body;

  if (!key || !API_KEYS.some((k) => k.key === key)) {
    return json({ error: 'Clave desconocida' }, 400);
  }
  if (!value || !value.trim()) {
    return json({ error: 'Valor vacío' }, 400);
  }

  await setSecret(key, value.trim());
  return json({ ok: true });
};
