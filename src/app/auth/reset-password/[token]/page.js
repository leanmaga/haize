import NewPasswordPage from '@/modules/auth/reset-password/[token]/NewPasswordPage';
import React from 'react';

const page = async ({ params }) => {
  const { token } = await params;
  return <NewPasswordPage token={token} />;
};

export default page;
