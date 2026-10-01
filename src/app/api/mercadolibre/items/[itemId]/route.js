import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { mercadoLibreRequest } from '@/lib/mercadolibre';

export async function GET(_request, { params }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { itemId } = await params;
  if (!/^MLA\d+$/i.test(itemId)) {
    return NextResponse.json({ error: 'El ID de publicación debe tener el formato MLA123456789' }, { status: 400 });
  }

  try {
    const item = await mercadoLibreRequest(`/items/${itemId.toUpperCase()}`);
    const variations = (item.variations || []).map((variation) => ({
      id: String(variation.id),
      availableQuantity: variation.available_quantity,
      attributes: (variation.attribute_combinations || []).map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
        value: attribute.value_name,
      })),
    }));

    return NextResponse.json({ itemId: item.id, title: item.title, variations });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'No se pudo consultar la publicación en Mercado Libre' },
      { status: 502 },
    );
  }
}
