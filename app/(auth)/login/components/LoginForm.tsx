'use client';

import type { FC } from 'react';

import { SubmitButton } from './SubmitButton';
import type { LoginFormProps } from '../types';

export const LoginForm: FC<LoginFormProps> = ({ action, state }) => (
  <form action={action} className="flex flex-col gap-6">
    <div>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="email@example.com"
        required
        className="w-full rounded-full border border-gray-300 bg-gray-100 px-6 py-3 text-base text-gray-800 placeholder-gray-500 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none"
        aria-describedby="email-error"
      />
      <div id="email-error" aria-live="polite" aria-atomic="true">
        {state.errors?.email &&
          state.errors.email.map((error: string) => (
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
      </div>
    </div>
    {state.message && <p className="text-center text-sm font-medium text-red-500">{state.message}</p>}
    <SubmitButton />
  </form>
);
