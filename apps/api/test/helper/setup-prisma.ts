import { PrismaClient, PrismaPg } from '@live-pool/database';
import path from 'path';
import { execSync } from 'child_process';

export async function setupPrisma(databaseUrl: string) {
  const prismaDir = path.resolve(__dirname, '../../../../packages/database/');

  execSync(
    `pnpm dlx prisma db push --config="${path.join(prismaDir, 'prisma.config.ts')}"`,
    {
      cwd: path.dirname(prismaDir),
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl },
    },
  );

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
    }),
  });

  await prisma.$connect();

  return prisma;
}
