import type { ReactNode } from 'react';

import { Asset } from '@/lib/domain/types';

export type CreateAssetFormState = {
  errors?: {
    title?: string[];
    url?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export type AssetWithFavorite = Asset & { isFavorite: boolean };

export type CreateAssetModalProps = {
  onClose: () => void;
};

export type ModalContainerProps = {
  onClose: () => void;
  children: ReactNode;
  title: string;
};

export type AssetFormFieldsProps = {
  state: CreateAssetFormState;
};

export type AssetGridProps = {
  assets: AssetWithFavorite[];
};

export type AssetCardProps = {
  asset: AssetWithFavorite;
};
