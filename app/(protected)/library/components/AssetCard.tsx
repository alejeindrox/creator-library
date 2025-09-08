'use client';

import type { FC } from 'react';
import { useOptimistic } from 'react';
import Image from 'next/image';
import { HeartIcon } from '@heroicons/react/24/solid';

import { toggleFavoriteAction } from '../actions';
import type { AssetWithFavorite } from '../actions';

type AssetCardProps = {
  asset: AssetWithFavorite;
};

export const AssetCard: FC<AssetCardProps> = ({ asset }) => {
  const [optimisticFavorite, toggleOptimisticFavorite] = useOptimistic(
    asset.isFavorite,
    (state) => !state
  );

  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-48 w-full">
        <Image
          src={asset.url}
          alt={asset.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex items-center justify-between p-4">
        <h2 className="truncate pr-2 text-lg font-bold text-slate-800">{asset.title}</h2>
        <form
          action={async () => {
            toggleOptimisticFavorite(null);
            await toggleFavoriteAction(asset.id);
          }}
        >
          <button type="submit" className="rounded-full p-1.5 transition-colors hover:bg-slate-100">
            <HeartIcon className={`h-6 w-6 ${optimisticFavorite ? 'text-red-500' : 'text-gray-300'}`} />
          </button>
        </form>
      </div>
    </div>
  );
};

