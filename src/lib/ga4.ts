// Google Analytics 4 — Data API (REST), autenticado con service account.
// Requiere: GOOGLE_SERVICE_ACCOUNT_JSON + GA4_PROPERTY_ID (configurables en /dashboard/settings).
// La service account necesita acceso "Viewer" en la propiedad GA4 (Admin → Property access management).
import { getGoogleAccessToken } from '@/lib/google-auth';

const SCOPES = ['https://www.googleapis.com/auth/analytics.readonly'];

export interface GA4Summary {
  totalUsers: number;
  sessions: number;
  trend: Array<{ label: string; value: number }>;
  sources: Array<{ label: string; value: number }>;
}

export async function getGA4Summary(
  { propertyId, credentialsJson, days = 14 }: { propertyId: string; credentialsJson: string; days?: number },
): Promise<GA4Summary> {
  const token = await getGoogleAccessToken(credentialsJson, SCOPES);
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

  const [trendRes, sourceRes] = await Promise.all([
    fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
    }),
    fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      }),
    }),
  ]);

  if (!trendRes.ok) throw new Error(`GA4 ${trendRes.status}: ${(await trendRes.text()).slice(0, 300)}`);
  if (!sourceRes.ok) throw new Error(`GA4 ${sourceRes.status}: ${(await sourceRes.text()).slice(0, 300)}`);

  const trendJson = await trendRes.json();
  const sourceJson = await sourceRes.json();

  const trend = (trendJson.rows || []).map((r: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }) => ({
    label: formatGa4Date(r.dimensionValues[0].value),
    value: Number(r.metricValues[0].value),
  }));

  const sessionsTotal = (sourceJson.rows || []).reduce((a: number, r: { metricValues: { value: string }[] }) => a + Number(r.metricValues[0].value), 0);
  const sources = (sourceJson.rows || []).map((r: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }) => ({
    label: r.dimensionValues[0].value,
    value: sessionsTotal ? Math.round((Number(r.metricValues[0].value) / sessionsTotal) * 100) : 0,
  }));

  const totalUsers = trend.reduce((a: number, t: { value: number }) => a + t.value, 0);

  return { totalUsers, sessions: sessionsTotal, trend, sources };
}

function formatGa4Date(yyyymmdd: string): string {
  const DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const d = new Date(`${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}T00:00:00`);
  return DOW[d.getDay()];
}
