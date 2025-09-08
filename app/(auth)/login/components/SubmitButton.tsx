'use client';

import type { FC } from 'react';
import { useFormStatus } from 'react-dom';

export const SubmitButton: FC = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className="w-full rounded-full bg-slate-900 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-slate-700 disabled:bg-gray-400"
    >
      {pending ? 'Getting started...' : 'Login'}
    </button>
  );
};
