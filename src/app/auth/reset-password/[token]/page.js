import NewPasswordPage from '@/modules/auth/reset-password/[token]/NewPasswordPage';
import React from 'react';

const page = ({ params }) => {
  return <NewPasswordPage token={params.token} />;
};

export default page;
