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

describe('Beans API', () => {
  let app: FastifyInstance;
  let roaster: any;

  beforeAll(async () => {
    app = await getApp();
    roaster = await createRoaster(app, 'Beans Test Roaster');
  });

  afterAll(async () => {
    await closeApp();
  });

  describe('POST /api/beans', () => {
    it('creates a bean with required fields', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/beans',
        payload: { roasterId: roaster.id, name: 'Ethiopia Yirgacheffe' },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.id).toBeTruthy();
      expect(body.name).toBe('Ethiopia Yirgacheffe');
      expect(body.roasterId).toBe(roaster.id);
      expect(body.roaster).toBeDefined();
    });

    it('creates a bean with all optional fields', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/beans',
        payload: {
          roasterId: roaster.id,
          name: 'Full Bean',
          originCountry: 'Ethiopia',
          originRegion: 'Yirgacheffe',
          varietal: 'Heirloom',
          process: 'Washed',
          roastLevel: 'LIGHT',
          tastingNotesExpected: ['cherry', 'jasmine', 'lemon'],
        },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.originCountry).toBe('Ethiopia');
      expect(body.originRegion).toBe('Yirgacheffe');
      expect(body.varietal).toBe('Heirloom');
      expect(body.process).toBe('Washed');
      expect(body.roastLevel).toBe('LIGHT');
    });

    it('defaults roastLevel to MEDIUM', async () => {
      const bean = await createBean(app, roaster.id, 'Default Roast Bean');
      expect(bean.roastLevel).toBe('MEDIUM');
    });

    it('returns 400 for missing roasterId', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/beans',
        payload: { name: 'No Roaster' },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 for invalid roastLevel', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/beans',
        payload: { roasterId: roaster.id, name: 'Bad Level', roastLevel: 'ULTRA_DARK' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/beans', () => {
    it('returns an array of beans with roaster and bags', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/beans' });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0].roaster).toBeDefined();
        expect(body[0].bags).toBeDefined();
      }
    });
  });

  describe('GET /api/beans/:id', () => {
    it('returns bean profile with tasting notes comparison', async () => {
      const bean = await createBean(app, roaster.id, 'Profile Bean', {
        tastingNotesExpected: ['cherry', 'chocolate'],
      });

      const res = await app.inject({ method: 'GET', url: `/api/beans/${bean.id}` });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.id).toBe(bean.id);
      expect(body.roaster).toBeDefined();
      expect(body.bags).toBeDefined();
      expect(body.recipes).toBeDefined();
      expect(body.tastingNotesComparison).toBeDefined();
      expect(body.tastingNotesComparison.expected).toEqual(['cherry', 'chocolate']);
      expect(body.tastingNotesComparison.actual).toEqual({});
    });

    it('returns 404 for non-existent bean', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/beans/00000000-0000-0000-0000-000000000000',
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/beans/:id', () => {
    it('updates bean name', async () => {
      const bean = await createBean(app, roaster.id, 'Old Bean Name');
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/beans/${bean.id}`,
        payload: { name: 'New Bean Name' },
      });
      expect(res.statusCode).toBe(200);
      expect(json(res).name).toBe('New Bean Name');
    });

    it('updates roast level', async () => {
      const bean = await createBean(app, roaster.id, 'Roast Level Bean');
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/beans/${bean.id}`,
        payload: { roastLevel: 'DARK' },
      });
      expect(res.statusCode).toBe(200);
      expect(json(res).roastLevel).toBe('DARK');
    });

    it('returns 404 for non-existent bean', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/beans/00000000-0000-0000-0000-000000000000',
        payload: { name: 'Ghost' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/beans/:id', () => {
    it('deletes a bean', async () => {
      const bean = await createBean(app, roaster.id, 'To Delete Bean');
      const res = await app.inject({ method: 'DELETE', url: `/api/beans/${bean.id}` });
      expect(res.statusCode).toBe(200);
      expect(json(res).success).toBe(true);

      const getRes = await app.inject({ method: 'GET', url: `/api/beans/${bean.id}` });
      expect(getRes.statusCode).toBe(404);
    });

    it('returns 404 for non-existent bean', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/beans/00000000-0000-0000-0000-000000000000',
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/beans/:id/bags', () => {
    it('adds a bag to a bean', async () => {
      const bean = await createBean(app, roaster.id, 'Bag Parent Bean');
      const res = await app.inject({
        method: 'POST',
        url: `/api/beans/${bean.id}/bags`,
        payload: {
          roastDate: '2025-01-15T00:00:00.000Z',
          isAvailable: true,
          bagSizeGrams: 250,
        },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.beanId).toBe(bean.id);
      expect(body.bagSizeGrams).toBe(250);
      expect(body.isAvailable).toBe(true);
    });

    it('adds multiple bags to the same bean', async () => {
      const bean = await createBean(app, roaster.id, 'Multi Bag Bean');
      await createBag(app, bean.id);
      await createBag(app, bean.id);

      const beanRes = json(await app.inject({ method: 'GET', url: `/api/beans/${bean.id}` }));
      expect(beanRes.bags).toHaveLength(2);
    });
  });

  describe('Bean Recipes (PATCH/DELETE /api/beans/:id/recipes/:methodId)', () => {
    it('creates a recipe for a bean-method combination', async () => {
      const bean = await createBean(app, roaster.id, 'Recipe Bean');
      const v60 = await getV60Method(app);

      const res = await app.inject({
        method: 'PATCH',
        url: `/api/beans/${bean.id}/recipes/${v60.id}`,
        payload: {
          grinderTarget: 22,
          recipeOverrides: { waterTemp: 97, dose: 18 },
        },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.beanId).toBe(bean.id);
      expect(body.methodId).toBe(v60.id);
      expect(body.grinderTarget).toBe(22);
    });

    it('upserts recipe (updates existing)', async () => {
      const bean = await createBean(app, roaster.id, 'Upsert Recipe Bean');
      const v60 = await getV60Method(app);

      // Create
      await app.inject({
        method: 'PATCH',
        url: `/api/beans/${bean.id}/recipes/${v60.id}`,
        payload: { grinderTarget: 20 },
      });

      // Update
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/beans/${bean.id}/recipes/${v60.id}`,
        payload: { grinderTarget: 25 },
      });
      expect(json(res).grinderTarget).toBe(25);
    });

    it('supports multiple recipes for different methods', async () => {
      const bean = await createBean(app, roaster.id, 'Multi Recipe Bean');
      const v60 = await getV60Method(app);
      const moka = await getMokaMethod(app);

      await app.inject({
        method: 'PATCH',
        url: `/api/beans/${bean.id}/recipes/${v60.id}`,
        payload: { grinderTarget: 22 },
      });
      await app.inject({
        method: 'PATCH',
        url: `/api/beans/${bean.id}/recipes/${moka.id}`,
        payload: { grinderTarget: 12 },
      });

      const beanRes = json(await app.inject({ method: 'GET', url: `/api/beans/${bean.id}` }));
      expect(beanRes.recipes).toHaveLength(2);
    });

    it('deletes a recipe', async () => {
      const bean = await createBean(app, roaster.id, 'Delete Recipe Bean');
      const v60 = await getV60Method(app);

      await app.inject({
        method: 'PATCH',
        url: `/api/beans/${bean.id}/recipes/${v60.id}`,
        payload: { grinderTarget: 22 },
      });

      const res = await app.inject({
        method: 'DELETE',
        url: `/api/beans/${bean.id}/recipes/${v60.id}`,
      });
      expect(res.statusCode).toBe(200);
      expect(json(res).success).toBe(true);
    });

    it('bean recipes are preserved across bags', async () => {
      const bean = await createBean(app, roaster.id, 'Preserve Recipe Bean');
      const v60 = await getV60Method(app);

      // Set recipe at bean level
      await app.inject({
        method: 'PATCH',
        url: `/api/beans/${bean.id}/recipes/${v60.id}`,
        payload: { grinderTarget: 45, recipeOverrides: { dose: 20, waterTemp: 98 } },
      });

      // Add first bag
      const bag1 = await createBag(app, bean.id);
      const screen1 = json(
        await app.inject({
          method: 'GET',
          url: `/api/brews/screen?bagId=${bag1.id}&methodId=${v60.id}`,
        })
      );
      expect(screen1.scaledRecipe.grindSize).toBe(45);

      // Add second bag — recipe should still be available
      const bag2 = await createBag(app, bean.id);
      const screen2 = json(
        await app.inject({
          method: 'GET',
          url: `/api/brews/screen?bagId=${bag2.id}&methodId=${v60.id}`,
        })
      );
      expect(screen2.scaledRecipe.grindSize).toBe(45);
      expect(screen2.scaledRecipe.waterTemp).toBe(98);
    });
  });
});
