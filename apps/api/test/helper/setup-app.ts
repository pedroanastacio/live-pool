import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Test } from '@nestjs/testing';
import { App } from 'supertest/types';
import { PrismaService } from '@live-pool/database';
import { setupPrisma } from './index';
import { AppModule } from '../../src/app.module';

export interface TestApp {
  app: INestApplication<App>;
  prisma: PrismaService;
  container: StartedPostgreSqlContainer;
}

const POSTGRES_IMAGE = 'postgres:18';

async function setupApp(module: typeof AppModule): Promise<TestApp> {
  const container = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
  const databaseUrl = container.getConnectionUri();

  const testPrisma = await setupPrisma(databaseUrl);

  const moduleRef = await Test.createTestingModule({
    imports: [module],
  })
    .overrideProvider(PrismaService)
    .useValue(testPrisma)
    .compile();

  const app = moduleRef.createNestApplication<INestApplication<App>>();
  const prisma = moduleRef.get(PrismaService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  return { app, prisma, container };
}

async function teardownApp(testApp: TestApp): Promise<void> {
  await testApp.prisma.$disconnect();
  await testApp.app.close();
  await testApp.container.stop();
}

export { setupApp, teardownApp };
