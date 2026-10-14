import DeliveryZoneManager from '@/components/admin/DeliveryZoneManager';

export const metadata = { title: 'Zonas de entrega | Admin - HAIZE' };
export default function DeliveryZonesPage() { return <div className="min-h-screen bg-gray-100"><div className="border-b border-gray-200 bg-white px-6 py-5"><h1 className="text-2xl font-bold text-gray-900">Zonas de entrega</h1><p className="mt-1 text-sm text-gray-600">Administrá las zonas Same Day usando geometrías GeoJSON.</p></div><main className="mx-auto max-w-5xl px-6 py-8"><DeliveryZoneManager /></main></div>; }
