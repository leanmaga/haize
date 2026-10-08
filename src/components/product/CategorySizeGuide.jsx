'use client';
import { useEffect, useState } from 'react';
import ProductSizeGuideTable from './ProductSizeGuideTable';
export default function CategorySizeGuide({ category, sizeGuide }) {
  const [fallback, setFallback] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    setFallback(null);
    if (sizeGuide?.sizes?.length || !category) return () => controller.abort();
    fetch('/api/size-guides?category=' + encodeURIComponent(category), { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        if (!controller.signal.aborted) setFallback(data.guide);
      }).catch(() => {});
    return () => controller.abort();
  }, [category, sizeGuide]);
  const guide = sizeGuide?.sizes?.length ? sizeGuide : fallback;
  const normalized = guide && !guide.sizes?.length && guide.measurements?.length
    ? { ...guide, sizes: guide.measurements.map((row) => ({ labelSize: row.size, garmentMeasurements: { length: row.length, width: row.width, stretchedWidth: row.stretchedWidth } })) } : guide;
  return <ProductSizeGuideTable category={category} sizeGuide={normalized} />;
}
