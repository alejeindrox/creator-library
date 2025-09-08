'use client';

import { useActionState } from 'react';

import { login } from './actions';
import { LoginCard } from './components/LoginCard';
import { LoginHeader } from './components/LoginHeader';
import { LoginForm } from './components/LoginForm';

import type { FC } from 'react';

const LoginPage: FC = () => {
  const [state, formAction] = useActionState(login, {
    message: null,
    errors: {},
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <LoginCard>
        <LoginHeader />
        <LoginForm action={formAction} state={state} />
      </LoginCard>
    </div>
  );
};

export default LoginPage;
