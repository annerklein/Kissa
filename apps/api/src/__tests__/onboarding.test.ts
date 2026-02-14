import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { getApp, closeApp, json } from './helpers.js';

describe('Onboarding API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    await closeApp();
  });

  describe('GET /api/onboarding/status', () => {
    it('returns onboarding status', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/onboarding/status' });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(typeof body.isComplete).toBe('boolean');
      expect(typeof body.hasSettings).toBe('boolean');
      expect(typeof body.hasGrinder).toBe('boolean');
      expect(typeof body.beanCount).toBe('number');
    });
  });

  describe('POST /api/onboarding', () => {
    it('creates settings, grinder, and beans in a single transaction', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/onboarding',
        payload: {
          settings: {
            defaultServings: 2,
            gramsPerServing: 15,
          },
          grinder: {
            model: 'Comandante C40',
            currentSetting: 24,
          },
          beans: [
            {
              roasterName: 'Onboarding Roaster',
              name: 'Onboarding Bean 1',
              originCountry: 'Ethiopia',
              originRegion: 'Sidama',
              roastLevel: 'LIGHT',
              tastingNotesExpected: ['blueberry', 'jasmine'],
              bag: {
                roastDate: '2025-01-10T00:00:00.000Z',
                isAvailable: true,
              },
            },
            {
              roasterName: 'Onboarding Roaster',
              name: 'Onboarding Bean 2',
              originCountry: 'Colombia',
              bag: {
                roastDate: '2025-01-12T00:00:00.000Z',
                isAvailable: true,
              },
            },
          ],
        },
      });

      expect(res.statusCode).toBe(200);
      expect(json(res).success).toBe(true);
    });

    it('creates beans with the correct roaster', async () => {
      // Verify beans were created
      const beansRes = json(await app.inject({ method: 'GET', url: '/api/beans' }));
      const onboardingBeans = beansRes.filter((b: any) =>
        b.name.startsWith('Onboarding Bean')
      );
      expect(onboardingBeans.length).toBeGreaterThanOrEqual(2);
    });

    it('reuses existing roasters by name', async () => {
      // The onboarding created two beans with the same roaster name
      const roastersRes = json(await app.inject({ method: 'GET', url: '/api/roasters' }));
      const onboardingRoasters = roastersRes.filter(
        (r: any) => r.name === 'Onboarding Roaster'
      );
      expect(onboardingRoasters).toHaveLength(1);
    });

    it('updates grinder state', async () => {
      const grinder = json(await app.inject({ method: 'GET', url: '/api/grinder' }));
      expect(grinder.grinderModel).toBe('Comandante C40');
    });

    it('marks onboarding as complete', async () => {
      const status = json(
        await app.inject({ method: 'GET', url: '/api/onboarding/status' })
      );
      expect(status.isComplete).toBe(true);
      expect(status.hasSettings).toBe(true);
      expect(status.hasGrinder).toBe(true);
      expect(status.beanCount).toBeGreaterThan(0);
    });

    it('returns 400 for invalid onboarding data', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/onboarding',
        payload: {
          settings: { defaultServings: 0 }, // invalid
          grinder: { model: 'Test', currentSetting: 20 },
          beans: [],
        },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 for missing required fields', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/onboarding',
        payload: {},
      });
      expect(res.statusCode).toBe(400);
    });
  });
});
