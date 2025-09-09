'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getSessionUser, clearSessionCookie } from '@/lib/auth.server';
import { assetRepository } from '@/lib/adapters/prisma-adapter';
import { CreateAssetSchema } from '@/lib/schemas/asset-schema';
import type { CreateAssetFormState, AssetWithFavorite } from './types';

export const getLibraryAssets = async (): Promise<AssetWithFavorite[]> => {
  const user = await getSessionUser();

  if (!user) {
    await clearSessionCookie();
    redirect('/login');
  }

  const [assets, favorites] = await Promise.all([
    assetRepository.findAllForUser(user.id),
    assetRepository.findAllFavoritesForUser(user.id),
  ]);

  const favoriteAssetIds = new Set(favorites.map((fav) => fav.assetId));

  const assetsWithFavorite: AssetWithFavorite[] = assets.map((asset) => ({
    ...asset,
    isFavorite: favoriteAssetIds.has(asset.id),
  }));

  return assetsWithFavorite;
};

export const toggleFavoriteAction = async (assetId: string) => {
  const user = await getSessionUser();

  if (!user) {
    throw new Error('Invalid user.');
  }

  await assetRepository.toggleFavorite({ userId: user.id, assetId });

  revalidatePath('/library');
};

export const createAssetAction = async (
  prevState: CreateAssetFormState,
  formData: FormData
): Promise<CreateAssetFormState> => {
  const user = await getSessionUser();

  if (!user) {
    return { message: 'Unauthenticated user.', success: false };
  }

  const validatedFields = await CreateAssetSchema.safeParseAsync({
    title: formData.get('title'),
    url: formData.get('url'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation error.',
      success: false,
    };
  }

  const { title, url } = validatedFields.data;

  try {
    await assetRepository.create({ userId: user.id, title, url });
    revalidatePath('/library');
    return { message: 'Asset created successfully.', success: true };
  } catch (error) {
    console.error('Error creating asset:', error);
    return { message: 'Error creating asset.', success: false };
  }
};
