import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-black hover:bg-gray-800',
            footerActionLink: 'text-black hover:text-gray-800',
          },
        }}
      />
    </div>
  );
}
