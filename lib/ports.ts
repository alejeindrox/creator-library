import { Asset, CreateAssetData, User, Plan, Favorite, CreateFavoriteData } from './domain/types';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updatePlan(userId: string, plan: Plan): Promise<User>;
  countAssets(userId: string): Promise<number>;
}

export interface IAssetRepository {
  create(data: CreateAssetData): Promise<Asset>;
  findAllForUser(userId: string): Promise<Asset[]>;
  toggleFavorite(data: CreateFavoriteData): Promise<Favorite | null>;
  findFavorite(userId: string, assetId: string): Promise<Favorite | null>;
}
