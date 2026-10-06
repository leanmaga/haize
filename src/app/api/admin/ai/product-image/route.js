import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
const POLLINATIONS_HOST = 'gen.pollinations.ai';
const EDIT_MODEL = 'kontext';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  if (!process.env.POLLINATIONS_API_KEY) {
    return NextResponse.json({ error: 'La generación de imágenes no está configurada' }, { status: 503 });
  }
  try {
    const { imageUrl, color = '', fabricDesign = '' } = await request.json();
    if (typeof imageUrl !== 'string' || !imageUrl) {
      return NextResponse.json({ error: 'Falta la imagen de referencia' }, { status: 400 });
    }
    const referenceUrl = new URL(imageUrl);
    if (referenceUrl.protocol !== 'https:' || referenceUrl.hostname !== 'res.cloudinary.com') {
      return NextResponse.json({ error: 'La imagen de referencia no es válida' }, { status: 400 });
    }

    const sourceResponse = await fetch(referenceUrl, { signal: AbortSignal.timeout(15000) });
    if (!sourceResponse.ok) {
      return NextResponse.json({ error: 'No se pudo leer la imagen de Cloudinary' }, { status: 400 });
    }
    const sourceType = sourceResponse.headers.get('content-type') || 'image/jpeg';
    if (!sourceType.startsWith('image/')) {
      return NextResponse.json({ error: 'La referencia de Cloudinary no es una imagen' }, { status: 400 });
    }
    const sourceBuffer = Buffer.from(await sourceResponse.arrayBuffer());
    if (sourceBuffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imagen supera el límite de 10 MB' }, { status: 400 });
    }

    const prompt = [
      'Crear una imagen comercial de catálogo a partir de la prenda de referencia.',
      'Mantener exactamente el color, diseño, textura, corte y detalles visibles de la prenda.',
      'Mostrar la prenda completa, con iluminación de estudio, fondo neutro claro y composición limpia.',
      'No agregar logos, textos, estampas ni accesorios que no estén en la referencia.',
      color && `Color declarado: ${String(color).slice(0, 80)}.`,
      fabricDesign && `Diseño declarado: ${String(fabricDesign).slice(0, 120)}.`,
    ].filter(Boolean).join(' ');

    const body = new FormData();
    body.append('model', EDIT_MODEL);
    body.append('prompt', prompt);
    body.append('size', '1024x1024');
    body.append('image', new Blob([sourceBuffer], { type: sourceType }), 'reference-image');

    const response = await fetch(`https://${POLLINATIONS_HOST}/v1/images/edits`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}` },
      body,
      signal: AbortSignal.timeout(30000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      console.error('[AI_IMAGE] Pollinations edit rejected', { status: response.status, result });
      if (response.status === 402 || result?.error?.code === 'INSUFFICIENT_BALANCE') {
        return NextResponse.json(
          { error: 'Pollinations no tiene saldo suficiente para generar la imagen. Cargá Pollen en tu cuenta.' },
          { status: 402 },
        );
      }
      return NextResponse.json({ error: 'Pollinations no pudo editar la imagen' }, { status: 502 });
    }

    const generated = result?.data?.[0];
    if (generated?.url) return NextResponse.json({ image: generated.url });
    if (generated?.b64_json) return NextResponse.json({ image: `data:image/png;base64,${generated.b64_json}` });
    return NextResponse.json({ error: 'Pollinations no devolvió una imagen' }, { status: 502 });
  } catch (error) {
    console.error('[AI_IMAGE] Pollinations generation failed', error);
    return NextResponse.json({ error: 'Error al generar la imagen con Pollinations' }, { status: 502 });
  }
}
