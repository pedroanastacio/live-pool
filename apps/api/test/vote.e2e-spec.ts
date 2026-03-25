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
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Vote queued for processing');
    });

    it('should return 400 for invalid payload', async () => {
      await request(testApp.app.getHttpServer())
        .post(baseUrl)
        .send({ pollId: 'id_teste', pollOptionId: 'id_teste' })
        .expect(400);
    });
  });
});
