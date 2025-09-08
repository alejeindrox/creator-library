import { PrismaClient } from '@prisma/client';
import { IUserRepository, IAssetRepository } from '../ports';
import { User, Asset, Plan, CreateAssetData, Favorite, CreateFavoriteData } from '../domain/types';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user as User | null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user as User | null;
  }

  async updatePlan(userId: string, plan: Plan): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { plan },
    });
    return user as User;
  }

  async countAssets(userId: string): Promise<number> {
    return prisma.asset.count({ where: { userId } });
  }
}

export class PrismaAssetRepository implements IAssetRepository {
  async create(data: CreateAssetData): Promise<Asset> {
    const asset = await prisma.asset.create({ data });
    return asset as Asset;
  }

  async findAllForUser(userId: string): Promise<Asset[]> {
    const assets = await prisma.asset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return assets as Asset[];
  }

  async toggleFavorite(data: CreateFavoriteData): Promise<Favorite | null> {
    const existingFavorite = await prisma.favorite.findUnique({
      where: { userId_assetId: { userId: data.userId, assetId: data.assetId } },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: {
          userId_assetId: { userId: data.userId, assetId: data.assetId },
        },
      });
      return null;
    } else {
      const newFavorite = await prisma.favorite.create({ data });
      return newFavorite as Favorite;
    }
  }

  async findFavorite(userId: string, assetId: string): Promise<Favorite | null> {
    const favorite = await prisma.favorite.findUnique({
      where: { userId_assetId: { userId, assetId } },
    });
    return favorite as Favorite | null;
  }
}

export const userRepository = new PrismaUserRepository();
export const assetRepository = new PrismaAssetRepository();
