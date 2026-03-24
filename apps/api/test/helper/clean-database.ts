import { PrismaClient } from '@live-pool/database';

async function cleanDatabase(prisma: PrismaClient) {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  await prisma.$executeRaw`SET CONSTRAINTS ALL DEFERRED;`;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(
          `TRUNCATE TABLE "public"."${tablename}" RESTART IDENTITY CASCADE;`,
        );
      } catch {
        // Skip if table doesn't exist or has issues
      }
    }
  }
}

export { cleanDatabase };
