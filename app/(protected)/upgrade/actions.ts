'use server';

import { revalidatePath } from 'next/cache';

import { getSessionUser } from '@/lib/auth.server';
import { userRepository } from '@/lib/adapters/prisma-adapter';
import { Plan } from '@/lib/domain/types';

export async function updatePlan(newPlan: Plan) {
  const user = await getSessionUser();

  if (!user) {
    throw new Error('User not authenticated.');
  }

  if (!Object.values(Plan).includes(newPlan)) {
    throw new Error('Invalid plan selected.');
  }

  try {
    await userRepository.updatePlan(user.id, newPlan);
    revalidatePath('/upgrade');
    return { success: true };
  } catch (error) {
    console.error('Failed to update plan:', error);
    return { success: false, error: 'Failed to update plan.' };
  }
}
