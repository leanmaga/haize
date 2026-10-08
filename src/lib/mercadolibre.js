import connectDB from '@/lib/db';
import MercadoLibreConfig from '@/models/MercadoLibreConfig';

const API_URL = 'https://api.mercadolibre.com';

function credentials() {
  const clientId = process.env.MERCADOLIBRE_CLIENT_ID;
  const clientSecret = process.env.MERCADOLIBRE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Faltan MERCADOLIBRE_CLIENT_ID y MERCADOLIBRE_CLIENT_SECRET');
  }
  return { clientId, clientSecret };
}

export function getMercadoLibreRedirectUri() {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${baseUrl}/api/mercadolibre/auth/callback`;
}

export async function getMercadoLibreAccessToken() {
  await connectDB();
  const config = await MercadoLibreConfig.findOne({ isActive: true });
  if (!config) throw new Error('No hay cuenta de Mercado Libre vinculada');

  // Renovar antes de que expire para que un webhook no falle a mitad de proceso.
  if (config.expiresAt.getTime() > Date.now() + 60_000) return config.accessToken;

  const { clientId, clientSecret } = credentials();
  const response = await fetch(`${API_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: config.refreshToken,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.message || 'No se pudo renovar el acceso a Mercado Libre');
  }

  config.accessToken = data.access_token;
  config.refreshToken = data.refresh_token || config.refreshToken;
  config.expiresAt = new Date(Date.now() + (data.expires_in || 21_600) * 1000);
  config.lastUpdated = new Date();
  await config.save();
  return config.accessToken;
}

export async function mercadoLibreRequest(path, options = {}) {
  const accessToken = await getMercadoLibreAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Mercado Libre respondió ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

/** Actualiza la publicación vinculada con el stock que Haize acaba de calcular. */
export async function syncProductStockToMercadoLibre(product) {
  const link = product.mercadoLibre;
  if (!link?.itemId) return { skipped: true };

  const mappings = link.variationMappings || [];
  const variations = mappings.map((mapping) => {
    const local = product.variants?.find((variant) =>
      (mapping.sku && variant.sku === mapping.sku) ||
      (mapping.size && mapping.color && variant.size === mapping.size && variant.color === mapping.color),
    );
    return local ? { id: mapping.variationId, available_quantity: local.stock } : null;
  }).filter(Boolean);

  const payload = variations.length > 0
    ? { variations }
    : { available_quantity: product.stock };
  await mercadoLibreRequest(`/items/${link.itemId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return { synced: true, itemId: link.itemId };
}
