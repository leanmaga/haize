'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import OrdersManagement from '@/components/admin/OrdersManagement';

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <OrdersManagement />
    </AdminLayout>
  );
}
