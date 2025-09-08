export enum Plan {
  BASIC = 'basic',
  PRO = 'pro',
}

export interface User {
  id: string;
  email: string;
  plan: Plan;
  createdAt: Date;
}

export interface Asset {
  id: string;
  userId: string;
  title: string;
  url: string;
  createdAt: Date;
}

export interface Favorite {
  userId: string;
  assetId: string;
  createdAt: Date;
}

export type CreateAssetData = Omit<Asset, 'id' | 'createdAt'>;
export type CreateFavoriteData = Omit<Favorite, 'createdAt'>;
