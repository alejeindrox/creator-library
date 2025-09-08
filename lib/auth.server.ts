import { cookies } from 'next/headers';

import { userRepository } from './adapters/prisma-adapter';

export const setSessionCookie = async (userId: string) => {
  const cookieStore = await cookies();
  cookieStore.set('session', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
};

export const getSessionUser = async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie) {
    return null;
  }
  const userId = sessionCookie.value;
  const user = await userRepository.findById(userId);
  return user;
};
