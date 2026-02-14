import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { getApp, closeApp, json } from './helpers.js';

describe('Methods API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    await closeApp();
  });

  describe('GET /api/methods', () => {
    it('returns an array of active methods', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/methods' });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(4);
    });

    it('returns methods in the expected order (v60, moka, espresso, french_press)', async () => {
      const body = json(await app.inject({ method: 'GET', url: '/api/methods' }));
      const names = body.map((m: any) => m.name);
      expect(names.indexOf('v60')).toBeLessThan(names.indexOf('moka'));
      expect(names.indexOf('moka')).toBeLessThan(names.indexOf('espresso'));
      expect(names.indexOf('espresso')).toBeLessThan(names.indexOf('french_press'));
    });

    it('each method has required fields', async () => {
      const body = json(await app.inject({ method: 'GET', url: '/api/methods' }));
      for (const method of body) {
        expect(method.id).toBeTruthy();
        expect(method.name).toBeTruthy();
        expect(method.displayName).toBeTruthy();
        expect(typeof method.isActive).toBe('boolean');
      }
    });
  });

  describe('GET /api/methods/:id', () => {
    it('returns a method by ID with parsed JSON fields', async () => {
      const methods = json(await app.inject({ method: 'GET', url: '/api/methods' }));
      const v60 = methods.find((m: any) => m.name === 'v60');

      const res = await app.inject({ method: 'GET', url: `/api/methods/${v60.id}` });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.id).toBe(v60.id);
      expect(body.name).toBe('v60');
      // JSON fields should be parsed objects
      expect(typeof body.scalingRules).toBe('object');
      expect(typeof body.defaultParams).toBe('object');
      expect(Array.isArray(body.steps)).toBe(true);
    });

    it('v60 scalingRules include scalesWater: true', async () => {
      const methods = json(await app.inject({ method: 'GET', url: '/api/methods' }));
      const v60 = methods.find((m: any) => m.name === 'v60');
      const body = json(await app.inject({ method: 'GET', url: `/api/methods/${v60.id}` }));
      expect(body.scalingRules.scalesWater).toBe(true);
    });

    it('moka scalingRules have scalesWater: false', async () => {
      const methods = json(await app.inject({ method: 'GET', url: '/api/methods' }));
      const moka = methods.find((m: any) => m.name === 'moka');
      const body = json(await app.inject({ method: 'GET', url: `/api/methods/${moka.id}` }));
      expect(body.scalingRules.scalesWater).toBe(false);
    });

    it('returns 404 for non-existent method', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/methods/00000000-0000-0000-0000-000000000000',
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/methods/name/:name', () => {
    it('returns method by name', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/methods/name/v60' });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.name).toBe('v60');
      expect(body.displayName).toBe('V60');
    });

    it('returns moka method by name', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/methods/name/moka' });
      expect(res.statusCode).toBe(200);
      expect(json(res).name).toBe('moka');
    });

    it('returns 404 for unknown method name', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/methods/name/aeropress' });
      expect(res.statusCode).toBe(404);
    });
  });
});
