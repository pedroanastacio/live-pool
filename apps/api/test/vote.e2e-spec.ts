/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import request from 'supertest';
import { AppModule } from '../src/modules/app/app.module';
import { setupApp, teardownApp, TestApp, cleanDatabase } from './helper';
import { mockPoll } from './mocks/polls';

let testApp: TestApp;

beforeAll(async () => {
  testApp = await setupApp(AppModule);
}, 15000);

afterAll(async () => {
  await teardownApp(testApp);
});

beforeEach(async () => {
  await cleanDatabase(testApp.prisma);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Votes E2E', () => {
  const baseUrl = '/votes';

  describe('POST /votes', () => {
    it('should send a new vote to the queue', async () => {
      const { body: poll } = await request(testApp.app.getHttpServer())
        .post('/polls')
        .send(mockPoll);

      const response = await request(testApp.app.getHttpServer())
        .post(baseUrl)
        .send({
          pollId: poll.id,
          pollOptionId: poll.options[0].id,
          messageKey: poll.id,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Vote queued for processing');
    });

    it('should return 400 for invalid payload', async () => {
      await request(testApp.app.getHttpServer())
        .post(baseUrl)
        .send({
          pollId: 'id_teste',
          pollOptionId: 'id_teste',
          messageKey: 'key_teste',
        })
        .expect(400);
    });

    it('should return 404 when poll does not exist', async () => {
      const randomUuid = '92f3b262-addc-4c43-a9c8-3b2f2facf338';

      await request(testApp.app.getHttpServer())
        .post(baseUrl)
        .send({
          pollId: randomUuid,
          pollOptionId: randomUuid,
          messageKey: randomUuid,
        })
        .expect(404);
    });

    it('should return 400 when poll is CANCELLED', async () => {
      const { body: poll } = await request(testApp.app.getHttpServer())
        .post('/polls')
        .send(mockPoll);

      await request(testApp.app.getHttpServer())
        .patch(`/polls/${poll.id}`)
        .send({ status: 'CANCELLED' });

      await request(testApp.app.getHttpServer())
        .post(baseUrl)
        .send({
          pollId: poll.id,
          pollOptionId: poll.options[0].id,
          messageKey: poll.id,
        })
        .expect(400);
    });

    it('should return 400 when poll is CLOSED', async () => {
      const { body: poll } = await request(testApp.app.getHttpServer())
        .post('/polls')
        .send(mockPoll);

      await request(testApp.app.getHttpServer())
        .patch(`/polls/${poll.id}`)
        .send({ status: 'CLOSED' });

      await request(testApp.app.getHttpServer())
        .post(baseUrl)
        .send({
          pollId: poll.id,
          pollOptionId: poll.options[0].id,
          messageKey: poll.id,
        })
        .expect(400);
    });

    it('should return 400 when poll is expired', async () => {
      const expiredPoll = {
        ...mockPoll,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      };

      const { body: poll } = await request(testApp.app.getHttpServer())
        .post('/polls')
        .send(expiredPoll);

      await request(testApp.app.getHttpServer())
        .post(baseUrl)
        .send({
          pollId: poll.id,
          pollOptionId: poll.options[0].id,
          messageKey: poll.id,
        })
        .expect(400);
    });

    it('should return 400 when option does not belong to poll', async () => {
      const { body: poll1 } = await request(testApp.app.getHttpServer())
        .post('/polls')
        .send(mockPoll);

      const { body: poll2 } = await request(testApp.app.getHttpServer())
        .post('/polls')
        .send(mockPoll);

      await request(testApp.app.getHttpServer())
        .post(baseUrl)
        .send({
          pollId: poll1.id,
          pollOptionId: poll2.options[0].id,
          messageKey: poll1.id,
        })
        .expect(400);
    });
  });
});
