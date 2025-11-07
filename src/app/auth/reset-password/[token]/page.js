import React from 'react';
import NewPasswordPage from '@/modules/auth/NewPasswordPage';

const page = ({ params }) => {
  return <NewPasswordPage token={params.token} />;
};

export default page;
