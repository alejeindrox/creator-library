'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getSessionUser, clearSessionCookie } from '@/lib/auth.server';
import { assetRepository, userRepository } from '@/lib/adapters/prisma-adapter';
import { CreateAssetSchema } from '@/lib/schemas/asset-schema';
import type { CreateAssetFormState, AssetWithFavorite } from './types';
import type { Asset, Favorite, User } from '@/lib/domain/types';

const ensureAuthenticatedUser = async () => {
  const user = await getSessionUser();
  if (!user) {
    await clearSessionCookie();
    redirect('/login');
  }
  return user;
};

const fetchUserAssetsAndFavorites = async (userId: string) => {
  return Promise.all([assetRepository.findAllForUser(userId), assetRepository.findAllFavoritesForUser(userId)]);
};

const mapAssetsWithFavoriteStatus = (assets: Asset[], favorites: Favorite[]): AssetWithFavorite[] => {
  const favoriteAssetIds = new Set(favorites.map((fav) => fav.assetId));
  return assets.map((asset) => ({
    ...asset,
    isFavorite: favoriteAssetIds.has(asset.id),
  }));
};

const sortAssetsByFavoriteAndDate = (assets: AssetWithFavorite[]): AssetWithFavorite[] => {
  const sortedAssets = [...assets];
  sortedAssets.sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) {
      return -1;
    }
    if (!a.isFavorite && b.isFavorite) {
      return 1;
    }

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  return sortedAssets;
};

export const getLibraryAssets = async (): Promise<AssetWithFavorite[]> => {
  const user = await ensureAuthenticatedUser();
  const [assets, favorites] = await fetchUserAssetsAndFavorites(user.id);
  const assetsWithFavorite = mapAssetsWithFavoriteStatus(assets, favorites);
  const sortedAssets = sortAssetsByFavoriteAndDate(assetsWithFavorite);
  return sortedAssets;
};

export const toggleFavoriteAction = async (assetId: string) => {
  const user = await getSessionUser();

  if (!user) {
    throw new Error('Invalid user.');
  }

  await assetRepository.toggleFavorite({ userId: user.id, assetId });
  revalidatePath('/library');
};

const checkPlanLimit = async (user: User) => {
  if (user.plan === 'basic') {
    const assetCount = await userRepository.countAssets(user.id);
    if (assetCount >= 5) {
      redirect('/upgrade');
    }
  }
};

const validateAssetData = async (formData: FormData) => {
  const validatedFields = await CreateAssetSchema.safeParseAsync({
    title: formData.get('title'),
    url: formData.get('url'),
  });

  if (!validatedFields.success) {
    throw new Error('Validation error.');
  }

  return validatedFields.data;
};

export const createAssetAction = async (
  prevState: CreateAssetFormState,
  formData: FormData,
): Promise<CreateAssetFormState> => {
  const user = await ensureAuthenticatedUser();
  await checkPlanLimit(user);

  try {
    const { title, url } = await validateAssetData(formData);
    await assetRepository.create({ userId: user.id, title, url });
    revalidatePath('/library');
    return { message: 'Asset created successfully.', success: true };
  } catch (error) {
    console.error('Error creating asset:', error);
    return { message: 'Error creating asset.', success: false };
  }
};
