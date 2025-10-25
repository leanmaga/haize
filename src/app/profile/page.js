import { UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <UserProfile
        appearance={{
          elements: {
            rootBox: 'w-full max-w-4xl',
            card: 'shadow-xl',
          },
        }}
      />
    </div>
  );
}
