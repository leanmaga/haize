import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { categoryExists } from '@/lib/categories';
import { mercadoLibreRequest } from '@/lib/mercadolibre';
import { ImportError, mapMercadoLibreItem, applyImportEdits } from '@/lib/mercadolibre-import';

export const dynamic = 'force-dynamic';
const json = (data, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const imported = (product) => ({ productId: String(product._id), title: product.title });
async function authorize() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') throw new ImportError('No autorizado', 403);
  await connectDB();
  return mercadoLibreRequest('/users/me');
}
function checkId(itemId) {
  if (typeof itemId !== 'string' || !/^MLA\d+$/.test(itemId)) throw new ImportError('ID de publicación inválido.', 400);
}
async function loadOwnedItem(itemId, seller) {
  checkId(itemId);
  const item = await mercadoLibreRequest(`/items/${itemId}?include_attributes=all`);
  if (String(item.seller_id) !== String(seller.id)) throw new ImportError('Esta publicación no pertenece a la cuenta conectada.', 403);
  return item;
}
async function linked(item) {
  const matches = [{ 'mercadoLibre.itemId': item.id }];
  if (item.user_product_id) matches.push({ 'mercadoLibre.userProductId': item.user_product_id });
  return Product.findOne({ $or: matches });
}
function failure(error) {
  return json({ error: error instanceof ImportError ? error.message : 'No se pudo completar la consulta a Mercado Libre. Reintentá o revisá la conexión.' }, error.status || 502);
}

export async function GET(request) {
  try {
    const seller = await authorize();
    const params = new URL(request.url).searchParams;
    const itemId = params.get('itemId');
    if (itemId) {
      const item = await loadOwnedItem(itemId, seller);
      const existing = await linked(item);
      if (existing) return json({ imported: imported(existing) });
      if (seller.tags?.includes('warehouse_management')) throw new ImportError('Esta cuenta usa inventario por depósito. La importación con stock compartido necesita esa configuración.');
      const description = await mercadoLibreRequest(`/items/${itemId}/description`).catch((error) => {
        if (error.status === 404) return { plain_text: '' };
        throw error;
      });
      return json({ preview: mapMercadoLibreItem(item, description.plain_text || ''), status: item.status });
    }
    const cursor = params.get('cursor');
    if (cursor?.length > 2000) throw new ImportError('Página inválida.', 400);
    const search = await mercadoLibreRequest(`/users/${seller.id}/items/search?search_type=scan&limit=20${cursor ? `&scroll_id=${encodeURIComponent(cursor)}` : ''}`);
    const ids = search.results || [];
    if (!ids.length) return json({ items: [], nextCursor: null, total: search.paging?.total || 0 });
    const responses = await mercadoLibreRequest(`/items?ids=${ids.map(encodeURIComponent).join(',')}&include_attributes=all`);
    const items = responses.filter((entry) => entry.code === 200 && String(entry.body.seller_id) === String(seller.id)).map((entry) => entry.body);
    const products = await Product.find({ 'mercadoLibre.itemId': { $in: items.map((item) => item.id) } }).select('_id title mercadoLibre').lean();
    return json({ items: items.map((item) => ({
      id: item.id, title: item.title, price: item.price, currency: item.currency_id,
      thumbnail: item.thumbnail?.replace(/^http:/, 'https:'), status: item.status,
      imported: products.find((product) => product.mercadoLibre.itemId === item.id) ? imported(products.find((product) => product.mercadoLibre.itemId === item.id)) : null,
    })), nextCursor: search.scroll_id || null, total: search.paging?.total || 0,
      warning: items.length !== ids.length ? 'No se pudieron consultar algunas publicaciones de esta página.' : '' });
  } catch (error) { return failure(error); }
}

export async function POST(request) {
  try {
    const seller = await authorize();
    let input;
    try { input = await request.json(); } catch { throw new ImportError('Datos inválidos.', 400); }
    if (!input || typeof input !== 'object') throw new ImportError('Datos inválidos.', 400);
    const item = await loadOwnedItem(input.itemId, seller);
    const existing = await linked(item);
    if (existing) return json({ imported: imported(existing), alreadyImported: true });
    if (seller.tags?.includes('warehouse_management')) throw new ImportError('Esta cuenta usa inventario por depósito. La importación con stock compartido necesita esa configuración.');
    if (!(await categoryExists(input.category))) throw new ImportError('Elegí una categoría de Haize.', 400);
    // Refresh stock on save; never accept quantities or remote links from the browser.
    const data = applyImportEdits(mapMercadoLibreItem(item), input);
    const id = createHash('sha256').update(`mercadolibre:${seller.id}:${item.user_product_id || item.id}`).digest('hex').slice(0, 24);
    try {
      const product = await Product.create({ ...data, _id: id });
      return json({ imported: imported(product) }, 201);
    } catch (error) {
      if (error.code !== 11000) throw error;
      const previous = await Product.findById(id);
      if (previous) return json({ imported: imported(previous), alreadyImported: true });
      throw new ImportError('Ya existe un producto con ese identificador. Revisá la vinculación existente.', 409);
    }
  } catch (error) { return failure(error); }
}
