import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { createE2EApp } from './helpers/e2e-app';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    ({ app, dataSource } = await createE2EApp());
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('/api/v1/healthz (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/healthz')
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('ok');
        expect(body.checks?.db?.status).toBe('up');
      });
  });
});
