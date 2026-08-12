// Autenticación con Service Account de Google, compartida por GA4 y Search Console.
// La credencial (JSON completo de la service account) se guarda en Setting vía /dashboard/settings.
import { GoogleAuth } from 'google-auth-library';

export async function getGoogleAccessToken(credentialsJson: string, scopes: string[]): Promise<string> {
  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(credentialsJson);
  } catch {
    throw new Error('El JSON de la service account de Google no es válido');
  }
  const auth = new GoogleAuth({ credentials, scopes });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token.token) throw new Error('No se pudo obtener token de acceso de Google');
  return token.token;
}
