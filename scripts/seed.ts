import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting the seeding process...');

  await prisma.favorite.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany();

  const userBasic = await prisma.user.create({
    data: {
      email: 'basic@test.com',
      plan: 'basic',
    },
  });

  const userPro = await prisma.user.create({
    data: {
      email: 'pro@test.com',
      plan: 'pro',
    },
  });

  await prisma.asset.createMany({
    data: [
      {
        userId: userBasic.id,
        title: 'Basic Asset 1',
        url: 'https://picsum.photos/id/11/300/300',
      },
      {
        userId: userBasic.id,
        title: 'Basic Asset 2',
        url: 'https://picsum.photos/id/16/300/300',
      },
      {
        userId: userBasic.id,
        title: 'Basic Asset 3',
        url: 'https://picsum.photos/id/28/300/300',
      },
    ],
  });

  await prisma.asset.createMany({
    data: [
      {
        userId: userPro.id,
        title: 'Pro Asset 1',
        url: 'https://picsum.photos/id/237/300/300',
      },
      {
        userId: userPro.id,
        title: 'Pro Asset 2',
        url: 'https://picsum.photos/id/433/300/300',
      },
    ],
  });

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
