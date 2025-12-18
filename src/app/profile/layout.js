import { redirect } from 'next/navigation';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import PropTypes from 'prop-types';

export const metadata = {
  title: 'Panel de Administración de usuario | HAIZE',
  description: 'Gestiona tu perfil en línea de manera eficiente.',
};

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  // Verificar que el usuario sea admin
  if (!session || session.user.role !== 'user') {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-white mt-[80px]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          <ProfileSidebar />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Validación de props
AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
