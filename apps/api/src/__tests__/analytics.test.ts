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
  getMokaMethod,
} from './helpers.js';
import { prisma } from '../db/client.js';

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

  describe('GET /api/analytics/stats', () => {
    // Additional brews are created in beforeAll above (1 Ethiopia brew with rating)

    it('returns correct response shape', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/analytics/stats' });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.period).toBe('all');
      expect(typeof body.totalBrews).toBe('number');
      expect(typeof body.ratedBrews).toBe('number');
      expect(typeof body.uniqueBeans).toBe('number');
      expect(typeof body.uniqueRoasters).toBe('number');
      expect(Array.isArray(body.methodBreakdown)).toBe(true);
      expect(Array.isArray(body.topBeans)).toBe(true);
      expect(body.avgSliders).toBeDefined();
      expect(Array.isArray(body.topTastingNotes)).toBe(true);
      expect(Array.isArray(body.brewActivity)).toBe(true);
    });

    it('counts brews and unique beans/roasters', async () => {
      const body = json(await app.inject({ method: 'GET', url: '/api/analytics/stats' }));
      expect(body.totalBrews).toBeGreaterThanOrEqual(1);
      expect(body.uniqueBeans).toBeGreaterThanOrEqual(1);
      expect(body.uniqueRoasters).toBeGreaterThanOrEqual(1);
    });

    it('computes average and best scores from rated brews', async () => {
      const body = json(await app.inject({ method: 'GET', url: '/api/analytics/stats' }));
      // The beforeAll created a rated brew, so scores should exist
      expect(body.avgScore).not.toBeNull();
      expect(body.bestScore).not.toBeNull();
      expect(body.avgScore).toBeGreaterThan(0);
      expect(body.bestScore).toBeGreaterThanOrEqual(body.avgScore);
    });

    it('returns method breakdown with brew counts', async () => {
      const body = json(await app.inject({ method: 'GET', url: '/api/analytics/stats' }));
      expect(body.methodBreakdown.length).toBeGreaterThanOrEqual(1);
      for (const method of body.methodBreakdown) {
        expect(method.methodName).toBeDefined();
        expect(method.displayName).toBeDefined();
        expect(typeof method.brewCount).toBe('number');
        expect(method.brewCount).toBeGreaterThanOrEqual(1);
      }
    });

    it('returns average slider values', async () => {
      const body = json(await app.inject({ method: 'GET', url: '/api/analytics/stats' }));
      // We have a rated brew, so sliders should not be null
      expect(body.avgSliders.balance).not.toBeNull();
      expect(body.avgSliders.sweetness).not.toBeNull();
      expect(body.avgSliders.clarity).not.toBeNull();
      expect(body.avgSliders.body).not.toBeNull();
      expect(body.avgSliders.finish).not.toBeNull();
    });

    it('supports period=30d filter', async () => {
      const body = json(await app.inject({ method: 'GET', url: '/api/analytics/stats?period=30d' }));
      expect(body.period).toBe('30d');
      // Brews created in beforeAll are recent, so they should appear
      expect(body.totalBrews).toBeGreaterThanOrEqual(1);
    });

    it('supports period=90d filter', async () => {
      const body = json(await app.inject({ method: 'GET', url: '/api/analytics/stats?period=90d' }));
      expect(body.period).toBe('90d');
      expect(body.totalBrews).toBeGreaterThanOrEqual(1);
    });

    it('supports period=year filter', async () => {
      const body = json(await app.inject({ method: 'GET', url: '/api/analytics/stats?period=year' }));
      expect(body.period).toBe('year');
      expect(body.totalBrews).toBeGreaterThanOrEqual(1);
    });

    it('includes brew activity data', async () => {
      const body = json(await app.inject({ method: 'GET', url: '/api/analytics/stats' }));
      // All-time uses monthly buckets; at least one bucket should have brews
      expect(body.brewActivity.length).toBeGreaterThanOrEqual(1);
      const hasBrews = body.brewActivity.some((a: any) => a.count > 0);
      expect(hasBrews).toBe(true);
    });

    it('returns correct stats with multiple methods', async () => {
      // Create a brew with moka method to test method breakdown
      const statsRoaster = await createRoaster(app, 'Stats Multi-Method Roaster');
      const statsBean = await createBean(app, statsRoaster.id, 'Stats Multi-Method Bean');
      const statsBag = await createBag(app, statsBean.id);
      const moka = await getMokaMethod(app);

      const brew = json(
        await app.inject({
          method: 'POST',
          url: '/api/brews',
          payload: { bagId: statsBag.id, methodId: moka.id, parameters: { grindSize: 10 } },
        })
      );

      await app.inject({
        method: 'PATCH',
        url: `/api/brews/${brew.id}/rating`,
        payload: {
          ratingSliders: { balance: 6, sweetness: 7, clarity: 6, body: 8, finish: 7 },
          tastingNotesActual: ['chocolate', 'nutty'],
        },
      });

      const body = json(await app.inject({ method: 'GET', url: '/api/analytics/stats' }));

      // Should have at least 2 methods in breakdown
      expect(body.methodBreakdown.length).toBeGreaterThanOrEqual(2);

      // Check tasting notes aggregation
      if (body.topTastingNotes.length > 0) {
        for (const note of body.topTastingNotes) {
          expect(note.note).toBeDefined();
          expect(typeof note.count).toBe('number');
          expect(note.count).toBeGreaterThanOrEqual(1);
        }
      }
    });

    it('ratedBrews counts only brews with scores, unrated brews count in totalBrews only', async () => {
      const unratedRoaster = await createRoaster(app, 'Unrated Roaster');
      const unratedBean = await createBean(app, unratedRoaster.id, 'Unrated Bean', {
        originCountry: 'BR',
      });
      const unratedBag = await createBag(app, unratedBean.id);
      const v60 = await getV60Method(app);

      const before = json(await app.inject({ method: 'GET', url: '/api/analytics/stats' }));

      // Create a brew WITHOUT rating (simulates "Just Brew")
      await app.inject({
        method: 'POST',
        url: '/api/brews',
        payload: { bagId: unratedBag.id, methodId: v60.id, parameters: { grindSize: 20 } },
      });

      const after = json(await app.inject({ method: 'GET', url: '/api/analytics/stats' }));

      expect(after.totalBrews).toBe(before.totalBrews + 1);
      expect(after.ratedBrews).toBe(before.ratedBrews);
      expect(after.ratedBrews).toBeLessThanOrEqual(after.totalBrews);
    });

    it('period filter excludes brews outside the date range', async () => {
      // Create a brew via the API, then backdate it using Prisma directly
      const filterRoaster = await createRoaster(app, 'Date Filter Roaster');
      const filterBean = await createBean(app, filterRoaster.id, 'Date Filter Bean');
      const filterBag = await createBag(app, filterBean.id);
      const v60 = await getV60Method(app);

      const oldBrew = json(
        await app.inject({
          method: 'POST',
          url: '/api/brews',
          payload: { bagId: filterBag.id, methodId: v60.id, parameters: { grindSize: 25 } },
        })
      );

      // Rate the old brew so it has a score
      await app.inject({
        method: 'PATCH',
        url: `/api/brews/${oldBrew.id}/rating`,
        payload: {
          ratingSliders: { balance: 9, sweetness: 9, clarity: 9, body: 9, finish: 9 },
        },
      });

      // Backdate brewedAt to 6 months ago using Prisma directly
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      await prisma.brewLog.update({
        where: { id: oldBrew.id },
        data: { brewedAt: sixMonthsAgo },
      });

      // Also create a recent brew on the same bag for comparison
      const recentBrew = json(
        await app.inject({
          method: 'POST',
          url: '/api/brews',
          payload: { bagId: filterBag.id, methodId: v60.id, parameters: { grindSize: 24 } },
        })
      );
      await app.inject({
        method: 'PATCH',
        url: `/api/brews/${recentBrew.id}/rating`,
        payload: {
          ratingSliders: { balance: 4, sweetness: 4, clarity: 4, body: 4, finish: 4 },
        },
      });

      // All-time should include BOTH brews
      const allBody = json(await app.inject({ method: 'GET', url: '/api/analytics/stats?period=all' }));

      // 30d should include only the recent brew, NOT the 6-month-old one
      const monthBody = json(await app.inject({ method: 'GET', url: '/api/analytics/stats?period=30d' }));

      // The 30d total must be strictly less than all-time total
      // (the old brew is excluded)
      expect(monthBody.totalBrews).toBeLessThan(allBody.totalBrews);

      // 90d should also exclude the 6-month-old brew
      const quarterBody = json(await app.inject({ method: 'GET', url: '/api/analytics/stats?period=90d' }));
      expect(quarterBody.totalBrews).toBeLessThan(allBody.totalBrews);
    });
  });
});
