// Resolución de API keys: BD (tabla Setting, editable en /dashboard/settings) con
// fallback a process.env. Al vivir en la misma Neon DB que usa Vercel, una key
// guardada aquí se aplica igual en local y en producción sin redeploy.
import { prisma } from '@/lib/db';

export interface ApiKeyDef {
  key: string;
  label: string;
  placeholder: string;
  help: string;
  getUrl: string;
  group: 'Notificaciones y contacto' | 'Analítica y SEO';
  multiline?: boolean;
}

export const API_KEYS: ApiKeyDef[] = [
  {
    key: 'OPENAI_API_KEY',
    label: 'OpenAI',
    placeholder: 'sk-...',
    help: 'Genera las respuestas del chatbot de la web.',
    getUrl: 'https://platform.openai.com/api-keys',
    group: 'Notificaciones y contacto',
  },
  {
    key: 'RESEND_API_KEY',
    label: 'Resend',
    placeholder: 're_...',
    help: 'Envía los emails de confirmación al cliente y el aviso de lead al comercial.',
    getUrl: 'https://resend.com/api-keys',
    group: 'Notificaciones y contacto',
  },
  {
    key: 'TELEGRAM_BOT_TOKEN',
    label: 'Telegram — Bot Token',
    placeholder: '123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    help: 'Habla con @BotFather en Telegram → /newbot → sigue los pasos → te da este token.',
    getUrl: 'https://t.me/BotFather',
    group: 'Notificaciones y contacto',
  },
  {
    key: 'TELEGRAM_CHAT_ID',
    label: 'Telegram — Chat ID',
    placeholder: '223391213',
    help: 'Habla con @userinfobot en Telegram y te devuelve tu ID numérico.',
    getUrl: 'https://t.me/userinfobot',
    group: 'Notificaciones y contacto',
  },
  {
    key: 'GOOGLE_SERVICE_ACCOUNT_JSON',
    label: 'Google — Service Account (JSON)',
    placeholder: '{"type":"service_account","project_id":"...","private_key":"...", ...}',
    help: 'Credencial compartida por Analytics (GA4) y Search Console. Se crea en Google Cloud Console y hay que darle acceso a ambas propiedades (ver guía).',
    getUrl: 'https://console.cloud.google.com/iam-admin/serviceaccounts',
    group: 'Analítica y SEO',
    multiline: true,
  },
  {
    key: 'GA4_PROPERTY_ID',
    label: 'GA4 — Property ID',
    placeholder: '123456789',
    help: 'ID numérico de la propiedad de Analytics (Admin → Detalles de la propiedad).',
    getUrl: 'https://analytics.google.com/analytics/web/#/a/p/admin/streams',
    group: 'Analítica y SEO',
  },
  {
    key: 'GSC_SITE_URL',
    label: 'Search Console — Site URL',
    placeholder: 'https://desatascos-valencia.vercel.app/  (o sc-domain:desatascosvalencia24h.com)',
    help: 'La propiedad tal cual aparece en Search Console (con barra final, o "sc-domain:..." si es propiedad de dominio).',
    getUrl: 'https://search.google.com/search-console',
    group: 'Analítica y SEO',
  },
];

export async function getSecret(name: string): Promise<string | undefined> {
  const row = await prisma.setting.findUnique({ where: { key: name } }).catch(() => null);
  return row?.value || process.env[name] || undefined;
}

export async function setSecret(name: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key: name },
    update: { value },
    create: { key: name, value },
  });
}

export function maskValue(v: string): string {
  if (v.length <= 8) return '••••••••';
  return v.slice(0, 4) + '••••••••' + v.slice(-4);
}

export async function getSecretsStatus() {
  const rows = await prisma.setting.findMany({ where: { key: { in: API_KEYS.map((k) => k.key) } } });
  const dbMap = new Map(rows.map((r) => [r.key, r.value]));
  return API_KEYS.map((def) => {
    const dbValue = dbMap.get(def.key);
    const envValue = process.env[def.key];
    const value = dbValue || envValue || '';
    return {
      ...def,
      configured: !!value,
      masked: value ? (def.multiline ? `guardado (${value.length} caracteres)` : maskValue(value)) : null,
      source: dbValue ? 'db' as const : envValue ? 'env' as const : null,
    };
  });
}
