// Google Search Console — Search Analytics API (REST), autenticado con service account.
// Requiere: GOOGLE_SERVICE_ACCOUNT_JSON + GSC_SITE_URL (configurables en /dashboard/settings).
// La service account necesita ser añadida como usuario (al menos "Restringido") en
// Search Console → Configuración → Usuarios y permisos, con su email (termina en .iam.gserviceaccount.com).
import { getGoogleAccessToken } from '@/lib/google-auth';

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

export interface GSCSummary {
  clicks: number;
  impressions: number;
  ctr: number; // porcentaje, ej. 6.8
  avgPosition: number;
  topPages: Array<{ page: string; clicks: number; ctr: string }>;
}

export async function getGSCSummary(
  { siteUrl, credentialsJson, days = 28 }: { siteUrl: string; credentialsJson: string; days?: number },
): Promise<GSCSummary> {
  const token = await getGoogleAccessToken(credentialsJson, SCOPES);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const [totalsRes, pagesRes] = await Promise.all([
    fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: fmt(start), endDate: fmt(end), dimensions: [] }),
    }),
    fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: fmt(start), endDate: fmt(end), dimensions: ['page'], rowLimit: 10 }),
    }),
  ]);

  if (!totalsRes.ok) throw new Error(`GSC ${totalsRes.status}: ${(await totalsRes.text()).slice(0, 300)}`);
  if (!pagesRes.ok) throw new Error(`GSC ${pagesRes.status}: ${(await pagesRes.text()).slice(0, 300)}`);

  const totalsJson = await totalsRes.json();
  const pagesJson = await pagesRes.json();
  const t = totalsJson.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  const topPages = (pagesJson.rows || []).map((r: { keys: string[]; clicks: number; ctr: number }) => ({
    page: r.keys[0].replace(/^https?:\/\/[^/]+/, ''),
    clicks: r.clicks,
    ctr: (r.ctr * 100).toFixed(1) + '%',
  }));

  return {
    clicks: t.clicks,
    impressions: t.impressions,
    ctr: Number((t.ctr * 100).toFixed(1)),
    avgPosition: Number(t.position.toFixed(1)),
    topPages,
  };
}
