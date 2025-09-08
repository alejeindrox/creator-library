'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getSessionUser, clearSessionCookie } from '@/lib/auth.server';
import { assetRepository } from '@/lib/adapters/prisma-adapter';
import type { Asset } from '@/lib/domain/types';

export type AssetWithFavorite = Asset & { isFavorite: boolean };

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
