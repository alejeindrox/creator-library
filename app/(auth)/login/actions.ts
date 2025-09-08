'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { setSessionCookie } from '@/lib/auth.server';
import { userRepository } from '@/lib/adapters/prisma-adapter';
import type { LoginState } from './types';

const LoginSchema = z.object({
  email: z.string().email({ message: 'Please, enter a valid email.' }),
});

export const login = async (prevState: LoginState, formData: FormData): Promise<LoginState> => {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation error.',
    };
  }

  const { email } = validatedFields.data;

  const user = await userRepository.findByEmail(email);

  if (user) {
    await setSessionCookie(user.id);
    return redirect('/library');
  }

  return { message: 'The email has not been found.' };
};
