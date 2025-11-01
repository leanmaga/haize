import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <div className="space-y-4">
            <p className="text-lg">
              Bienvenido,{' '}
              <span className="font-semibold">
                {user?.firstName || 'Usuario'}
              </span>
              !
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">ID de Usuario</p>
                <p className="font-medium text-xs">{userId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
