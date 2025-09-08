import type { FC, ReactNode } from 'react';

export const LoginCard: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl transition-transform duration-300 ease-in-out hover:scale-[1.02]">
    {children}
  </div>
);
