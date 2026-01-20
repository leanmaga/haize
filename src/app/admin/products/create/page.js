// app/admin/products/create/page.jsx
'use client';

import ProductWizard from '@/components/admin/products/ProductWizard';

export default function ProductCreatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProductWizard />
    </div>
  );
}
