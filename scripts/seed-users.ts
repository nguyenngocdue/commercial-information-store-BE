import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const buildUsers = (count: number) => {
  return Array.from({ length: count }, (_, index) => {
    const seq = index + 1;
    const suffix = seq.toString().padStart(3, '0');

    return {
      fullName: `User ${suffix}`,
      phone: `0900000${suffix}`,
      email: `user${suffix}@example.com`,
      address: `Address ${suffix}`,
      notes: `Seeded user ${suffix}`,
    };
  });
};

const main = async () => {
  const users = buildUsers(100);
  const result = await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`Inserted ${result.count} users`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
