import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { calculateShipping } from '@/lib/shipping-pricing';

export async function GET(request) {
  const city = new URL(request.url).searchParams.get('city');
  if (!city || city.length > 100) return NextResponse.json({ error: 'Ciudad inválida' }, { status: 400 });
  try {
    await connectDB();
    return NextResponse.json(await calculateShipping(city), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
