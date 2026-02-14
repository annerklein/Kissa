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

describe('Bags API', () => {
  let app: FastifyInstance;
  let roaster: any;
  let bean: any;

  beforeAll(async () => {
    app = await getApp();
    roaster = await createRoaster(app, 'Bags Test Roaster');
    bean = await createBean(app, roaster.id, 'Bags Test Bean');
  });

  afterAll(async () => {
    await closeApp();
  });

  describe('GET /api/bags', () => {
    it('returns an array of bags with bean and roaster info', async () => {
      await createBag(app, bean.id);
      const res = await app.inject({ method: 'GET', url: '/api/bags' });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0].bean).toBeDefined();
        expect(body[0].bean.roaster).toBeDefined();
      }
    });

    it('returns bags sorted by roastDate descending', async () => {
      const res = json(await app.inject({ method: 'GET', url: '/api/bags' }));
      for (let i = 1; i < res.length; i++) {
        expect(new Date(res[i - 1].roastDate).getTime())
          .toBeGreaterThanOrEqual(new Date(res[i].roastDate).getTime());
      }
    });
  });

  describe('GET /api/bags/:id', () => {
    it('returns a bag by ID with nested bean, roaster, recipes, and brew logs', async () => {
      const bag = await createBag(app, bean.id);
      const res = await app.inject({ method: 'GET', url: `/api/bags/${bag.id}` });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.id).toBe(bag.id);
      expect(body.bean).toBeDefined();
      expect(body.bean.roaster).toBeDefined();
      expect(body.brewLogs).toBeDefined();
    });

    it('returns 404 for non-existent bag', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/bags/00000000-0000-0000-0000-000000000000',
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/bags/:id', () => {
    it('updates bag status', async () => {
      const bag = await createBag(app, bean.id);
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { status: 'OPEN' },
      });
      expect(res.statusCode).toBe(200);
      expect(json(res).status).toBe('OPEN');
    });

    it('updates bag availability', async () => {
      const bag = await createBag(app, bean.id);
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { isAvailable: false },
      });
      expect(res.statusCode).toBe(200);
      expect(json(res).isAvailable).toBe(false);
    });

    it('updates notes', async () => {
      const bag = await createBag(app, bean.id);
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { notes: 'Great bag!' },
      });
      expect(res.statusCode).toBe(200);
      expect(json(res).notes).toBe('Great bag!');
    });

    it('returns 400 for invalid status', async () => {
      const bag = await createBag(app, bean.id);
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { status: 'INVALID_STATUS' },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 404 for non-existent bag', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/bags/00000000-0000-0000-0000-000000000000',
        payload: { status: 'OPEN' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/bags/:id', () => {
    it('deletes a bag', async () => {
      const bag = await createBag(app, bean.id);
      const res = await app.inject({ method: 'DELETE', url: `/api/bags/${bag.id}` });
      expect(res.statusCode).toBe(200);
      expect(json(res).success).toBe(true);

      const getRes = await app.inject({ method: 'GET', url: `/api/bags/${bag.id}` });
      expect(getRes.statusCode).toBe(404);
    });

    it('returns 404 for non-existent bag', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/bags/00000000-0000-0000-0000-000000000000',
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/available-beans', () => {
    it('returns available bags filtered by method with grinder delta', async () => {
      // Setup: create a bean with a recipe for v60, then make a bag available
      const testBean = await createBean(app, roaster.id, 'Available Bean');
      const v60 = await getV60Method(app);

      // Set recipe
      await app.inject({
        method: 'PATCH',
        url: `/api/beans/${testBean.id}/recipes/${v60.id}`,
        payload: { grinderTarget: 22 },
      });

      // Create available bag
      await createBag(app, testBean.id, { isAvailable: true });

      const res = await app.inject({
        method: 'GET',
        url: `/api/available-beans?methodId=${v60.id}`,
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.bags).toBeDefined();
      expect(body.currentGrinderSetting).toBeDefined();
      expect(body.selectedMethodId).toBe(v60.id);
    });

    it('only returns bags whose bean has a recipe for the selected method', async () => {
      const noRecipeBean = await createBean(app, roaster.id, 'No Recipe Bean');
      await createBag(app, noRecipeBean.id, { isAvailable: true });
      const v60 = await getV60Method(app);

      const res = json(
        await app.inject({
          method: 'GET',
          url: `/api/available-beans?methodId=${v60.id}`,
        })
      );

      // The bag for noRecipeBean should NOT appear (no recipe)
      const foundBag = res.bags.find((b: any) => b.bean.id === noRecipeBean.id);
      expect(foundBag).toBeUndefined();
    });

    it('excludes unavailable bags', async () => {
      const testBean2 = await createBean(app, roaster.id, 'Unavailable Bean');
      const v60 = await getV60Method(app);
      await app.inject({
        method: 'PATCH',
        url: `/api/beans/${testBean2.id}/recipes/${v60.id}`,
        payload: { grinderTarget: 22 },
      });
      await createBag(app, testBean2.id, { isAvailable: false });

      const res = json(
        await app.inject({
          method: 'GET',
          url: `/api/available-beans?methodId=${v60.id}`,
        })
      );

      const foundBag = res.bags.find((b: any) => b.bean.id === testBean2.id);
      expect(foundBag).toBeUndefined();
    });

    it('defaults to v60 method if no methodId specified', async () => {
      const res = json(
        await app.inject({ method: 'GET', url: '/api/available-beans' })
      );
      expect(res.selectedMethodId).toBeTruthy();
    });

    it('includes grinderDelta when recipe has a grinderTarget', async () => {
      const testBean3 = await createBean(app, roaster.id, 'Delta Bean');
      const v60 = await getV60Method(app);

      await app.inject({
        method: 'PATCH',
        url: `/api/beans/${testBean3.id}/recipes/${v60.id}`,
        payload: { grinderTarget: 40 },
      });
      await createBag(app, testBean3.id, { isAvailable: true });

      const res = json(
        await app.inject({
          method: 'GET',
          url: `/api/available-beans?methodId=${v60.id}`,
        })
      );

      const deltaBag = res.bags.find((b: any) => b.bean.id === testBean3.id);
      expect(deltaBag).toBeDefined();
      expect(deltaBag.grinderDelta).toBeDefined();
      expect(deltaBag.grinderDelta.direction).toBeTruthy();
    });
  });
});
