import type { FC } from 'react';

import { AssetCard } from './AssetCard';
import type { AssetGridProps } from '../types';


export const AssetGrid: FC<AssetGridProps> = ({ assets }) => (
  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {assets.map((asset) => (
      <AssetCard key={asset.id} asset={asset} />
    ))}
  </div>
);
