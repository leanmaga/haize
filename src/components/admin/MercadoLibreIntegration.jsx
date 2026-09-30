'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function MercadoLibreIntegration() {
  const [status, setStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'connected') toast.success('Cuenta de Mercado Libre conectada');
    if (params.get('error') === 'token_exchange_failed' || params.get('error') === 'invalid_oauth_state') {
      const messages = {
        invalid_client: 'Mercado Libre rechazó el Client ID o Client Secret.',
        invalid_grant: 'El código de autorización expiró o ya fue usado. Volvé a conectar la cuenta.',
        invalid_request: 'Mercado Libre rechazó los datos enviados para obtener el token.',
        invalid_oauth_state: 'La sesión de autorización expiró. Volvé a conectar la cuenta.',
        provider_error: 'Mercado Libre rechazó el intercambio de autorización. Revisá la configuración de la app.',
      };
      const key = params.get('error') === 'invalid_oauth_state' ? 'invalid_oauth_state' : params.get('reason');
      toast.error(messages[key] || messages.provider_error);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetch('/api/mercadolibre/check-status'), fetch('/api/mercadolibre/products')])
      .then(async ([statusResponse, productsResponse]) => {
        const statusData = await statusResponse.json();
        const productsData = await productsResponse.json();
        setStatus(statusData);
        setProducts(productsData.products || []);
      })
      .catch(() => toast.error('No se pudo cargar la integración'));
  }, []);

  const connect = async () => {
    const response = await fetch('/api/mercadolibre/auth/link');
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || 'No se pudo iniciar la conexión');
    window.location.assign(data.authUrl);
  };

  const disconnect = async () => {
    if (!window.confirm('¿Desconectar la cuenta de Mercado Libre de este entorno?')) return;
    try {
      const response = await fetch('/api/mercadolibre/auth/unlink', { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStatus({ isConnected: false });
      toast.success('Cuenta de Mercado Libre desconectada');
    } catch (error) {
      toast.error(error.message || 'No se pudo desconectar la cuenta');
    }
  };

  const saveLink = async (product) => {
    setSaving(product._id);
    try {
      const response = await fetch('/api/mercadolibre/products', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, itemId: product.mercadoLibre?.itemId, variationMappings: product.mercadoLibre?.variationMappings || [] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast.success('Publicación vinculada');
    } catch (error) { toast.error(error.message || 'No se pudo guardar'); }
    finally { setSaving(null); }
  };

  const setItemId = (index, itemId) => setProducts((current) => current.map((product, productIndex) => productIndex === index
    ? { ...product, mercadoLibre: { ...(product.mercadoLibre || {}), itemId } } : product));

  const setVariationId = (productIndex, variant, variationId) => setProducts((current) => current.map((product, index) => {
    if (index !== productIndex) return product;
    const mappings = product.mercadoLibre?.variationMappings || [];
    const keyMatches = (mapping) => (variant.sku && mapping.sku === variant.sku) || (!variant.sku && mapping.size === variant.size && mapping.color === variant.color);
    const previous = mappings.find(keyMatches);
    const next = { variationId, sku: variant.sku, size: variant.size, color: variant.color };
    return { ...product, mercadoLibre: { ...(product.mercadoLibre || {}), variationMappings: [...mappings.filter((mapping) => !keyMatches(mapping)), ...(variationId ? [next] : [])] } };
  }));

  return <div className="space-y-6">
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="text-xl font-semibold text-gray-900">Mercado Libre</h2>
          <p className="text-sm text-gray-600 mt-1">Sincroniza el inventario de Haize con tus publicaciones.</p></div>
        <span className={`rounded-full px-3 py-1 text-sm ${status?.isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
          {status?.isConnected ? 'Conectada' : 'Sin conectar'}
        </span>
      </div>
      {status?.isConnected ? <div className="mt-4 flex flex-wrap items-center gap-3"><p className="text-sm text-gray-700">Cuenta vendedora: {status.sellerId}. Las ventas confirmadas de Mercado Libre descuentan Haize automáticamente.</p><button onClick={disconnect} className="text-sm text-red-700 underline">Desconectar</button></div>
        : <button onClick={connect} className="mt-5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-4 py-2 rounded-md">Conectar cuenta de Mercado Libre</button>}
      <div className="mt-5 rounded-md bg-blue-50 p-4 text-sm text-blue-900">
        En el administrador de aplicaciones de Mercado Libre configurá la URL de notificaciones como <code className="font-mono">/api/mercadolibre/webhook</code> sobre el dominio público de Haize y suscribí el tema <code className="font-mono">orders_v2</code>.
      </div>
    </section>
    <section className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900">Vincular publicaciones</h3>
      <p className="text-sm text-gray-600 mt-1 mb-4">Pegá el ID de publicación (por ejemplo, MLA123456789). Un producto sin ID no se sincroniza.</p>
      <div className="space-y-3">
        {products.map((product, index) => <div key={product._id} className="border rounded-md p-3">
          <div className="grid md:grid-cols-[1fr_180px_auto] gap-3 items-center">
          <div><p className="font-medium text-gray-900">{product.title}</p><p className="text-xs text-gray-500">SKU: {product.sku} · Stock Haize: {product.stock}</p></div>
          <input aria-label={`ID de Mercado Libre para ${product.title}`} value={product.mercadoLibre?.itemId || ''} onChange={(event) => setItemId(index, event.target.value.toUpperCase())} placeholder="MLA…" className="border rounded px-3 py-2 text-sm" />
          <button onClick={() => saveLink(product)} disabled={saving === product._id} className="border border-gray-900 rounded px-3 py-2 text-sm hover:bg-gray-900 hover:text-white disabled:opacity-50">{saving === product._id ? 'Guardando…' : 'Guardar'}</button>
          </div>
          {product.variants?.length > 0 && <details className="mt-3 text-sm"><summary className="cursor-pointer text-gray-700">IDs de variantes de Mercado Libre</summary><div className="mt-2 space-y-2">
            {product.variants.map((variant) => { const mapping = product.mercadoLibre?.variationMappings?.find((entry) => (variant.sku && entry.sku === variant.sku) || (!variant.sku && entry.size === variant.size && entry.color === variant.color)); return <label key={variant._id || `${variant.size}-${variant.color}`} className="flex items-center gap-3 text-xs text-gray-600"><span className="min-w-32">{variant.size} / {variant.color} ({variant.sku || 'sin SKU'})</span><input value={mapping?.variationId || ''} onChange={(event) => setVariationId(index, variant, event.target.value)} placeholder="ID de variante ML" className="border rounded px-2 py-1 text-sm" /></label>; })}
          </div></details>}
        </div>)}
      </div>
    </section>
  </div>;
}
