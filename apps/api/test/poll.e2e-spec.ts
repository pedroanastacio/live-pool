/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import request from 'supertest';
import { AppModule } from '../src/modules/app/app.module';
import { Poll, PollStatus } from '@live-pool/database';
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

describe('Polls E2E', () => {
  const baseUrl = '/polls';

  describe('POST /polls', () => {
    it('should create a new poll', async () => {
      const response = await request(testApp.app.getHttpServer())
        .post(baseUrl)
        .send(mockPoll)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', mockPoll.title);
      expect(response.body).toHaveProperty('description', mockPoll.description);
      expect(response.body).toHaveProperty('expiresAt', mockPoll.expiresAt);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe(PollStatus.ACTIVE);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).toHaveProperty('options');
      expect(Array.isArray(response.body.options)).toBe(true);
      expect(response.body.options).toHaveLength(2);
    });

    it('should return 400 for invalid payload', async () => {
      await request(testApp.app.getHttpServer())
        .post(baseUrl)
        .send({ title: '' })
        .expect(400);
    });

    it('should return 400 when creating poll without title', async () => {
      const payload = { ...mockPoll, title: '' };
      const response = await request(testApp.app.getHttpServer())
        .post(baseUrl)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it('should return 400 when creating poll with less than 2 options', async () => {
      const payload = {
        ...mockPoll,
        options: [{ description: 'Option 1', orderIndex: 0 }],
      };
      const response = await request(testApp.app.getHttpServer())
        .post(baseUrl)
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /polls', () => {
    it('should return all polls', async () => {
      await request(testApp.app.getHttpServer()).post(baseUrl).send(mockPoll);

      const response = await request(testApp.app.getHttpServer())
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
      expect(response.body[0]).toHaveProperty('expiresAt', mockPoll.expiresAt);
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
      const { body: poll } = await request(testApp.app.getHttpServer())
        .post(baseUrl)
        .send(mockPoll);

      const response = await request(testApp.app.getHttpServer())
        .get(`${baseUrl}/${poll.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', mockPoll.title);
      expect(response.body).toHaveProperty('description', mockPoll.description);
      expect(response.body).toHaveProperty('expiresAt', mockPoll.expiresAt);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe(PollStatus.ACTIVE);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).toHaveProperty('options');
      expect(Array.isArray(response.body.options)).toBe(true);
      expect(response.body.options).toHaveLength(2);
    });

    it('should return 404 for non-existent poll', async () => {
      await request(testApp.app.getHttpServer())
        .get(`${baseUrl}/non-existent`)
        .expect(404);
    });
  });

  describe('PATCH /polls/:id', () => {
    it('should update a poll', async () => {
      const { body: poll } = await request(testApp.app.getHttpServer())
        .post(baseUrl)
        .send(mockPoll);

      const response = await request(testApp.app.getHttpServer())
        .patch(`${baseUrl}/${poll.id}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.id).toBe(poll.id);
      expect(response.body.title).toBe('Updated Title');
    });

    it('should return 404 for non-existent poll', async () => {
      await request(testApp.app.getHttpServer())
        .patch(`${baseUrl}/non-existent`)
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });

  describe('DELETE /polls/:id', () => {
    it('should delete a poll', async () => {
      const { body: poll } = await request(testApp.app.getHttpServer())
        .post(baseUrl)
        .send(mockPoll);

      const response = await request(testApp.app.getHttpServer())
        .delete(`${baseUrl}/${poll.id}`)
        .expect(200);

      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 for non-existent poll', async () => {
      await request(testApp.app.getHttpServer())
        .delete(`${baseUrl}/non-existent`)
        .expect(404);
    });
  });

  describe('GET /polls - filters', () => {
    beforeEach(async () => {
      const app = testApp.app.getHttpServer();

      await request(app)
        .post(baseUrl)
        .send({
          title: 'Active Poll',
          description: 'This poll is active',
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          options: [
            { description: 'Option 1', orderIndex: 0 },
            { description: 'Option 2', orderIndex: 1 },
          ],
        });

      const closedRes = await request(app)
        .post(baseUrl)
        .send({
          title: 'Closed Poll',
          description: 'This poll is closed',
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          options: [
            { description: 'Option A', orderIndex: 0 },
            { description: 'Option B', orderIndex: 1 },
          ],
        });

      await request(app)
        .patch(`${baseUrl}/${closedRes.body.id}`)
        .send({ status: PollStatus.CLOSED });

      const cancelledRes = await request(app)
        .post(baseUrl)
        .send({
          title: 'Cancelled Poll',
          description: 'This poll is cancelled',
          expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          options: [
            { description: 'Choice 1', orderIndex: 0 },
            { description: 'Choice 2', orderIndex: 1 },
          ],
        });

      await request(app)
        .patch(`${baseUrl}/${cancelledRes.body.id}`)
        .send({ status: PollStatus.CANCELLED });

      const exactDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      await request(app)
        .post(baseUrl)
        .send({
          title: 'Exact Date Poll',
          description: 'Expires on exact date',
          expiresAt: exactDate.toISOString(),
          options: [
            { description: 'Choice 1', orderIndex: 0 },
            { description: 'Choice 2', orderIndex: 1 },
          ],
        });
    });

    describe('search filter', () => {
      it('should filter polls by search term in title', async () => {
        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?search=Active`)
          .expect(200);

        const polls = response.body as Poll[];
        expect(polls.length).toBeGreaterThan(0);
        expect(polls[0].title).toContain('Active');
      });

      it('should filter polls by search term in description', async () => {
        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?search=closed`)
          .expect(200);

        const polls = response.body as Poll[];
        expect(polls.length).toBeGreaterThan(0);
        expect(polls[0].description).toContain('closed');
      });

      it('should return empty array when no matches', async () => {
        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?search=nonexistent`)
          .expect(200);

        expect(response.body).toHaveLength(0);
      });
    });

    describe('status filter', () => {
      it('should filter polls by ACTIVE status', async () => {
        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?status=${PollStatus.ACTIVE}`)
          .expect(200);

        const polls = response.body;
        expect(polls.length).toBeGreaterThan(0);
        expect(polls.every((p) => p.status === PollStatus.ACTIVE)).toBe(true);
      });

      it('should filter polls by CLOSED status', async () => {
        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?status=${PollStatus.CLOSED}`)
          .expect(200);

        const polls = response.body;
        expect(polls.length).toBeGreaterThan(0);
        expect(polls.every((p) => p.status === PollStatus.CLOSED)).toBe(true);
      });

      it('should filter polls by CANCELLED status', async () => {
        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?status=${PollStatus.CANCELLED}`)
          .expect(200);

        const polls = response.body;
        expect(polls.length).toBeGreaterThan(0);
        expect(polls.every((p) => p.status === PollStatus.CANCELLED)).toBe(
          true,
        );
      });
    });

    describe('expiresBefore filter', () => {
      it('should filter polls expiring before given date', async () => {
        const pastDate = new Date().toISOString().split('T')[0];

        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?expiresBefore=${pastDate}`)
          .expect(200);

        const polls = response.body;
        expect(polls.length).toBeGreaterThan(0);
      });
    });

    describe('expiresAfter filter', () => {
      it('should filter polls expiring after given date', async () => {
        const futureDate = new Date().toISOString().split('T')[0];

        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?expiresAfter=${futureDate}`)
          .expect(200);

        const polls = response.body;
        expect(polls.length).toBeGreaterThan(0);
      });
    });

    describe('expiresAt exact date filter', () => {
      it('should filter polls expiring on exact date', async () => {
        const exactDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const exactDateStr = exactDate.toISOString().split('T')[0];

        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?expiresAt=${exactDateStr}`)
          .expect(200);

        const polls = response.body;
        expect(polls.length).toBeGreaterThan(0);
      });
    });

    describe('sortBy and order filters', () => {
      it('should sort by title ascending', async () => {
        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?sortBy=title&order=asc`)
          .expect(200);

        const polls = response.body as Poll[];
        const titles = polls.map((p) => p.title);
        const sortedTitles = [...titles].sort();
        expect(titles).toEqual(sortedTitles);
      });

      it('should sort by title descending', async () => {
        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?sortBy=title&order=desc`)
          .expect(200);

        const polls = response.body as Poll[];
        const titles = polls.map((p) => p.title);
        const sortedTitles = [...titles].sort().reverse();
        expect(titles).toEqual(sortedTitles);
      });

      it('should default sort by createdAt descending', async () => {
        const response = await request(testApp.app.getHttpServer())
          .get(baseUrl)
          .expect(200);

        const polls = response.body as Poll[];
        const createdAt = new Date(polls[0].createdAt).getTime();
        for (let i = 1; i < polls.length; i++) {
          const nextCreatedAt = new Date(polls[i].createdAt).getTime();
          expect(createdAt).toBeGreaterThanOrEqual(nextCreatedAt);
        }
      });
    });

    describe('filter validation', () => {
      it('should return 400 for invalid status', async () => {
        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?status=INVALID`)
          .expect(400);

        expect(response.body.message).toBeInstanceOf(Array);
        expect(response.body.message[0]).toContain('status');
      });

      it('should return 400 for invalid sortBy', async () => {
        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?sortBy=invalidField`)
          .expect(400);

        expect(response.body.message).toBeInstanceOf(Array);
        expect(response.body.message[0]).toContain('sortBy');
      });

      it('should return 400 for invalid order', async () => {
        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?order=up`)
          .expect(400);

        expect(response.body.message).toBeInstanceOf(Array);
        expect(response.body.message[0]).toContain('order');
      });

      it('should return 400 for invalid date format', async () => {
        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?expiresBefore=not-a-date`)
          .expect(400);

        expect(response.body.message).toBeInstanceOf(Array);
        expect(response.body.message[0]).toContain('expiresBefore');
      });

      it('should return 400 for empty search string', async () => {
        const response = await request(testApp.app.getHttpServer())
          .get(`${baseUrl}?search=`)
          .expect(400);

        expect(response.body.message).toBeInstanceOf(Array);
        expect(response.body.message[0]).toContain('search');
      });
    });
  });
});
