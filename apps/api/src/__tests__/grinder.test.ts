import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { getApp, closeApp, json } from './helpers.js';

describe('Grinder API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    await closeApp();
  });

  describe('GET /api/grinder', () => {
    it('returns grinder state (creates default if none exist)', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/grinder' });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.id).toBeTruthy();
      expect(typeof body.grinderModel).toBe('string');
      expect(typeof body.currentSetting).toBe('number');
    });
  });

  describe('POST /api/grinder/apply', () => {
    it('applies a new grinder setting', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/grinder/apply',
        payload: { newSetting: 25 },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.currentSetting).toBe(25);
    });

    it('persists the new setting on GET', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/grinder/apply',
        payload: { newSetting: 30 },
      });
      const res = json(await app.inject({ method: 'GET', url: '/api/grinder' }));
      expect(res.currentSetting).toBe(30);
    });

    it('returns 400 for missing newSetting', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/grinder/apply',
        payload: {},
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 for out-of-range setting', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/grinder/apply',
        payload: { newSetting: 100 },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PATCH /api/grinder', () => {
    it('updates the grinder model', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/grinder',
        payload: { grinderModel: 'Timemore C3' },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.grinderModel).toBe('Timemore C3');
    });

    it('returns 400 when grinderModel is missing', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/grinder',
        payload: {},
      });
      expect(res.statusCode).toBe(400);
    });

    it('persists the model update', async () => {
      await app.inject({
        method: 'PATCH',
        url: '/api/grinder',
        payload: { grinderModel: '1Zpresso JX-Pro' },
      });
      const res = json(await app.inject({ method: 'GET', url: '/api/grinder' }));
      expect(res.grinderModel).toBe('1Zpresso JX-Pro');
    });
  });
});
