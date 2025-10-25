import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import UserDashboard from '@/components/UserDashboard';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <UserDashboard />;
}
