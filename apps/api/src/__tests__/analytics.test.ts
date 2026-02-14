import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import {
  getApp,
  closeApp,
  json,
  createRoaster,
  createBean,
  createBag,
  getV60Method,
} from './helpers.js';

describe('Analytics API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getApp();

    // Seed some data with known countries/regions for analytics
    const roaster = await createRoaster(app, 'Analytics Roaster');
    const v60 = await getV60Method(app);

    // Ethiopia / Yirgacheffe
    const ethiopiaBean = await createBean(app, roaster.id, 'Analytics Ethiopia Bean', {
      originCountry: 'ET',
      originRegion: 'Yirgacheffe',
    });
    const ethBag = await createBag(app, ethiopiaBean.id);

    // Create a brew with rating to populate scores
    const brew = json(
      await app.inject({
        method: 'POST',
        url: '/api/brews',
        payload: { bagId: ethBag.id, methodId: v60.id, parameters: { grindSize: 22 } },
      })
    );
    await app.inject({
      method: 'PATCH',
      url: `/api/brews/${brew.id}/rating`,
      payload: {
        ratingSliders: {
          balance: 5,
          sweetness: 8,
          clarity: 8,
          body: 7,
          finish: 7,
        },
      },
    });

    // Colombia / Huila
    const colombiaBean = await createBean(app, roaster.id, 'Analytics Colombia Bean', {
      originCountry: 'CO',
      originRegion: 'Huila',
    });
    await createBag(app, colombiaBean.id);
  });

  afterAll(async () => {
    await closeApp();
  });

  describe('GET /api/analytics/map', () => {
    it('returns an array of country data points', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/analytics/map' });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(Array.isArray(body)).toBe(true);
    });

    it('includes countries with beans', async () => {
      const body = json(await app.inject({ method: 'GET', url: '/api/analytics/map' }));
      const et = body.find((d: any) => d.countryCode === 'ET');
      expect(et).toBeDefined();
      expect(et.count).toBeGreaterThanOrEqual(1);
    });

    it('includes average score for countries with brews', async () => {
      const body = json(await app.inject({ method: 'GET', url: '/api/analytics/map' }));
      const et = body.find((d: any) => d.countryCode === 'ET');
      expect(et).toBeDefined();
      expect(et.avgScore).toBeGreaterThan(0);
    });

    it('returns null avgScore for countries with no brews', async () => {
      const body = json(await app.inject({ method: 'GET', url: '/api/analytics/map' }));
      const co = body.find((d: any) => d.countryCode === 'CO');
      if (co) {
        expect(co.avgScore).toBeNull();
      }
    });

    it('respects availableOnly filter', async () => {
      const res1 = json(await app.inject({ method: 'GET', url: '/api/analytics/map' }));
      const res2 = json(
        await app.inject({ method: 'GET', url: '/api/analytics/map?availableOnly=true' })
      );
      // Available only should include fewer or equal results
      expect(res2.length).toBeLessThanOrEqual(res1.length);
    });
  });

  describe('GET /api/analytics/country/:code', () => {
    it('returns country data with regions', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/analytics/country/ET' });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.countryCode).toBe('ET');
      expect(body.regions).toBeDefined();
      expect(Array.isArray(body.regions)).toBe(true);
    });

    it('includes bean rankings within regions', async () => {
      const body = json(
        await app.inject({ method: 'GET', url: '/api/analytics/country/ET' })
      );
      const yirgacheffe = body.regions.find((r: any) => r.regionName === 'Yirgacheffe');
      expect(yirgacheffe).toBeDefined();
      expect(yirgacheffe.beans.length).toBeGreaterThanOrEqual(1);
      expect(yirgacheffe.beans[0].bean).toBeDefined();
      expect(typeof yirgacheffe.beans[0].brewCount).toBe('number');
      expect(typeof yirgacheffe.beans[0].bestScore).toBe('number');
    });

    it('returns empty regions for unknown country', async () => {
      const body = json(
        await app.inject({ method: 'GET', url: '/api/analytics/country/XX' })
      );
      expect(body.countryCode).toBe('XX');
      expect(body.regions).toHaveLength(0);
    });
  });

  describe('GET /api/analytics/region/:code', () => {
    it('returns region data for a country code (no sub-region)', async () => {
      // The :code param captures a single path segment, so we query by country only
      const res = await app.inject({
        method: 'GET',
        url: '/api/analytics/region/ET',
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.countryCode).toBe('ET');
      expect(body.beans.length).toBeGreaterThanOrEqual(1);
    });

    it('bean rankings include scores and counts', async () => {
      const body = json(
        await app.inject({
          method: 'GET',
          url: '/api/analytics/region/ET',
        })
      );
      for (const ranking of body.beans) {
        expect(ranking.bean).toBeDefined();
        expect(typeof ranking.brewCount).toBe('number');
        expect(typeof ranking.bestScore).toBe('number');
      }
    });

    it('returns empty beans for unknown country', async () => {
      const body = json(
        await app.inject({
          method: 'GET',
          url: '/api/analytics/region/ZZ',
        })
      );
      expect(body.beans).toHaveLength(0);
    });
  });
});
