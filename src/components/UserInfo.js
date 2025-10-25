'use client';

import { useUser } from '@clerk/nextjs';

export default function UserInfo() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <img
        src={user.imageUrl}
        alt={user.firstName || 'User'}
        className="w-10 h-10 rounded-full"
      />
      <div>
        <p className="font-semibold">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-sm text-gray-600">
          {user.emailAddresses[0].emailAddress}
        </p>
      </div>
    </div>
  );
}
