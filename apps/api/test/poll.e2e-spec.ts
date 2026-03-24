/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PollStatus, PrismaService } from '@live-pool/database';
import { cleanDatabase, setupPrisma } from './helper';
import { mockPoll } from './mocks/polls';

let container: StartedPostgreSqlContainer;
let app: INestApplication<App>;
let prisma: PrismaService;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:18').start();
  const databaseUrl = container.getConnectionUri();

  const testPrisma = await setupPrisma(databaseUrl);

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(testPrisma)
    .compile();

  app = moduleRef.createNestApplication();
  prisma = moduleRef.get(PrismaService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
}, 15000);

afterAll(async () => {
  await prisma.$disconnect();
  await app.close();
  await container.stop();
});

beforeEach(async () => {
  await cleanDatabase(prisma);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Polls E2E', () => {
  const baseUrl = '/polls';

  describe('POST /polls', () => {
    it('should create a new poll', async () => {
      const response = await request(app.getHttpServer())
        .post(baseUrl)
        .send(mockPoll)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', mockPoll.title);
      expect(response.body).toHaveProperty('description', mockPoll.description);
      expect(response.body).toHaveProperty('expires_at', mockPoll.expires_at);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe(PollStatus.ACTIVE);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).toHaveProperty('options');
      expect(Array.isArray(response.body.options)).toBe(true);
      expect(response.body.options).toHaveLength(2);
    });

    it('should return 400 for invalid payload', async () => {
      await request(app.getHttpServer())
        .post(baseUrl)
        .send({ title: '' })
        .expect(400);
    });

    it('should return 400 when creating poll without title', async () => {
      const payload = { ...mockPoll, title: '' };
      const response = await request(app.getHttpServer())
        .post(baseUrl)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it('should return 400 when creating poll with less than 2 options', async () => {
      const payload = {
        ...mockPoll,
        options: [{ description: 'Option 1', order_index: 0 }],
      };
      const response = await request(app.getHttpServer())
        .post(baseUrl)
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /polls', () => {
    it('should return all polls', async () => {
      await request(app.getHttpServer()).post(baseUrl).send(mockPoll);

      const response = await request(app.getHttpServer())
        .get(baseUrl)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title', mockPoll.title);
      expect(response.body[0]).toHaveProperty(
        'description',
        mockPoll.description,
      );
      expect(response.body[0]).toHaveProperty(
        'expires_at',
        mockPoll.expires_at,
      );
      expect(response.body[0]).toHaveProperty('status');
      expect(response.body[0].status).toBe(PollStatus.ACTIVE);
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('updatedAt');
      expect(response.body[0]).toHaveProperty('options');
      expect(Array.isArray(response.body[0].options)).toBe(true);
      expect(response.body[0].options).toHaveLength(2);
    });
  });

  describe('GET /polls/:id', () => {
    it('should return a poll by id', async () => {
      const { body: poll } = await request(app.getHttpServer())
        .post(baseUrl)
        .send(mockPoll);

      const response = await request(app.getHttpServer())
        .get(`${baseUrl}/${poll.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', mockPoll.title);
      expect(response.body).toHaveProperty('description', mockPoll.description);
      expect(response.body).toHaveProperty('expires_at', mockPoll.expires_at);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe(PollStatus.ACTIVE);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).toHaveProperty('options');
      expect(Array.isArray(response.body.options)).toBe(true);
      expect(response.body.options).toHaveLength(2);
    });

    it('should return 404 for non-existent poll', async () => {
      await request(app.getHttpServer())
        .get(`${baseUrl}/non-existent`)
        .expect(404);
    });
  });

  describe('PATCH /polls/:id', () => {
    it('should update a poll', async () => {
      const { body: poll } = await request(app.getHttpServer())
        .post(baseUrl)
        .send(mockPoll);

      const response = await request(app.getHttpServer())
        .patch(`${baseUrl}/${poll.id}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.id).toBe(poll.id);
      expect(response.body.title).toBe('Updated Title');
    });

    it('should return 404 for non-existent poll', async () => {
      await request(app.getHttpServer())
        .patch(`${baseUrl}/non-existent`)
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });

  describe('DELETE /polls/:id', () => {
    it('should delete a poll', async () => {
      const { body: poll } = await request(app.getHttpServer())
        .post(baseUrl)
        .send(mockPoll);

      const response = await request(app.getHttpServer())
        .delete(`${baseUrl}/${poll.id}`)
        .expect(200);

      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 for non-existent poll', async () => {
      await request(app.getHttpServer())
        .delete(`${baseUrl}/non-existent`)
        .expect(404);
    });
  });
});
