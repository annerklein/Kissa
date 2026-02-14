import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { getApp, closeApp, json } from './helpers.js';

describe('Settings API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    await closeApp();
  });

  describe('GET /api/settings', () => {
    it('returns settings (creates default if none exist)', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/settings' });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.id).toBeTruthy();
      expect(typeof body.defaultServings).toBe('number');
      expect(typeof body.gramsPerServing).toBe('number');
    });

    it('returns consistent settings on repeated calls', async () => {
      const res1 = json(await app.inject({ method: 'GET', url: '/api/settings' }));
      const res2 = json(await app.inject({ method: 'GET', url: '/api/settings' }));
      expect(res1.id).toBe(res2.id);
      expect(res1.defaultServings).toBe(res2.defaultServings);
    });
  });

  describe('PATCH /api/settings', () => {
    it('updates defaultServings', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/settings',
        payload: { defaultServings: 3 },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.defaultServings).toBe(3);
    });

    it('updates gramsPerServing', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/settings',
        payload: { gramsPerServing: 18 },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.gramsPerServing).toBe(18);
    });

    it('persists updates across GET calls', async () => {
      await app.inject({
        method: 'PATCH',
        url: '/api/settings',
        payload: { defaultServings: 4 },
      });
      const res = json(await app.inject({ method: 'GET', url: '/api/settings' }));
      expect(res.defaultServings).toBe(4);
    });

    it('returns 400 for invalid servings', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/settings',
        payload: { defaultServings: 0 },
      });
      expect(res.statusCode).toBe(400);
      const body = json(res);
      expect(body.error).toBe('ValidationError');
    });

    it('returns 400 for out-of-range gramsPerServing', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/settings',
        payload: { gramsPerServing: 100 },
      });
      expect(res.statusCode).toBe(400);
    });
  });
});
