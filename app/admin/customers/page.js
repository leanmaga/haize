'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import CustomersManagement from '@/components/admin/CustomersManagement';

export default function AdminCustomersPage() {
  return (
    <AdminLayout>
      <CustomersManagement />
    </AdminLayout>
  );
}
