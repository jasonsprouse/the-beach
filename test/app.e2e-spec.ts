import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/npe/sessions', () => {
    it('/last-completed (GET) should return 404 if no sessions are completed', () => {
      return request(app.getHttpServer())
        .get('/npe/sessions/last-completed')
        .expect(200)
        .expect({ success: false, message: 'No completed sessions found.' });
    });

    it('/simulate (POST) should create and complete a session', async () => {
      const response = await request(app.getHttpServer())
        .post('/npe/sessions/simulate')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Simulated session created and completed.');
    });

    it('/last-completed (GET) should return the last completed session', async () => {
      await request(app.getHttpServer())
        .post('/npe/sessions/simulate')
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/npe/sessions/last-completed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.session).toBeDefined();
      expect(response.body.session.status).toBe('completed');
    });
  });
});
