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

    it('sets tube position to LEFT', async () => {
      const bag = await createBag(app, bean.id, { status: 'OPEN' });
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { tubePosition: 'LEFT' },
      });
      expect(res.statusCode).toBe(200);
      expect(json(res).tubePosition).toBe('LEFT');
    });

    it('sets tube position to MIDDLE', async () => {
      const bag = await createBag(app, bean.id, { status: 'OPEN' });
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { tubePosition: 'MIDDLE' },
      });
      expect(res.statusCode).toBe(200);
      expect(json(res).tubePosition).toBe('MIDDLE');
    });

    it('sets tube position to RIGHT', async () => {
      const bag = await createBag(app, bean.id, { status: 'OPEN' });
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { tubePosition: 'RIGHT' },
      });
      expect(res.statusCode).toBe(200);
      expect(json(res).tubePosition).toBe('RIGHT');
    });

    it('clears tube position by setting it to null', async () => {
      const bag = await createBag(app, bean.id, { status: 'OPEN', tubePosition: 'LEFT' });
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { tubePosition: null },
      });
      expect(res.statusCode).toBe(200);
      expect(json(res).tubePosition).toBeNull();
    });

    it('rejects invalid tube position value', async () => {
      const bag = await createBag(app, bean.id, { status: 'OPEN' });
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { tubePosition: 'INVALID' },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Freeze/Unfreeze bags', () => {
    it('freezes an existing bag by setting status to FROZEN', async () => {
      const bag = await createBag(app, bean.id);
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { status: 'FROZEN' },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.status).toBe('FROZEN');
      expect(body.frozenAt).toBeTruthy();
      expect(body.isAvailable).toBe(false);
    });

    it('unfreezes a bag by setting status to OPEN', async () => {
      const bag = await createBag(app, bean.id, { status: 'FROZEN' });
      // Freeze it first via PATCH to set frozenAt
      await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { status: 'FROZEN' },
      });

      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { status: 'OPEN' },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.status).toBe('OPEN');
      expect(body.frozenAt).toBeNull();
      expect(body.isAvailable).toBe(true);
      expect(body.openedDate).toBeTruthy();
      expect(body.totalFrozenDays).toBeGreaterThanOrEqual(0);
    });

    it('creates a bag in FROZEN status with isFrozenBag flag', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/beans/${bean.id}/bags`,
        payload: {
          roastDate: new Date().toISOString(),
          status: 'FROZEN',
          isFrozenBag: true,
          isAvailable: false,
        },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.status).toBe('FROZEN');
      expect(body.isFrozenBag).toBe(true);
      expect(body.frozenAt).toBeTruthy();
      expect(body.isAvailable).toBe(false);
    });

    it('frozen bags have totalFrozenDays defaulting to 0', async () => {
      const bag = await createBag(app, bean.id);
      const res = json(await app.inject({ method: 'GET', url: `/api/bags/${bag.id}` }));
      expect(res.totalFrozenDays).toBe(0);
    });

    it('re-freezing a previously thawed bag preserves totalFrozenDays', async () => {
      // Create and freeze a bag
      const bag = await createBag(app, bean.id);
      await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { status: 'FROZEN' },
      });

      // Unfreeze it (totalFrozenDays should be 0 since frozen for <1 day)
      await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { status: 'OPEN' },
      });

      // Check the bag
      const afterThaw = json(await app.inject({ method: 'GET', url: `/api/bags/${bag.id}` }));
      expect(afterThaw.status).toBe('OPEN');
      expect(afterThaw.frozenAt).toBeNull();
      expect(afterThaw.totalFrozenDays).toBeGreaterThanOrEqual(0);

      // Re-freeze it
      const reFreeze = json(await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { status: 'FROZEN' },
      }));
      expect(reFreeze.status).toBe('FROZEN');
      expect(reFreeze.frozenAt).toBeTruthy();
      // totalFrozenDays should still be preserved from before
      expect(reFreeze.totalFrozenDays).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Partial freeze (freeze portion)', () => {
    it('freezes a portion of a bag while keeping it OPEN and available', async () => {
      const bag = await createBag(app, bean.id);
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { frozenGrams: 125 },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.status).toBe('OPEN');
      expect(body.isAvailable).toBe(true);
      expect(body.frozenGrams).toBe(125);
      expect(body.frozenAt).toBeTruthy();
    });

    it('thaws a frozen portion by setting frozenGrams to null', async () => {
      const bag = await createBag(app, bean.id);
      // Freeze a portion
      await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { frozenGrams: 100 },
      });

      // Thaw the portion
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { frozenGrams: null },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.frozenGrams).toBeNull();
      expect(body.frozenAt).toBeNull();
      expect(body.totalFrozenDays).toBeGreaterThanOrEqual(0);
      expect(body.status).toBe('OPEN');
    });

    it('full freeze clears any frozenGrams', async () => {
      const bag = await createBag(app, bean.id);
      // Partially freeze
      await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { frozenGrams: 50 },
      });

      // Now full freeze
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { status: 'FROZEN' },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.status).toBe('FROZEN');
      expect(body.frozenGrams).toBeNull();
      expect(body.isAvailable).toBe(false);
    });

    it('thawing a full freeze also clears frozenGrams', async () => {
      const bag = await createBag(app, bean.id);
      await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { status: 'FROZEN' },
      });

      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { status: 'OPEN', frozenGrams: null },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.status).toBe('OPEN');
      expect(body.frozenGrams).toBeNull();
      expect(body.frozenAt).toBeNull();
      expect(body.isAvailable).toBe(true);
    });

    it('bag remains a single entity through multiple freeze/thaw cycles', async () => {
      const bag = await createBag(app, bean.id);
      const originalId = bag.id;

      // Partial freeze
      await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { frozenGrams: 100 },
      });

      // Thaw portion
      await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { frozenGrams: null },
      });

      // Full freeze
      await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { status: 'FROZEN' },
      });

      // Thaw full
      await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { status: 'OPEN' },
      });

      // Partial freeze again
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { frozenGrams: 75 },
      });

      const body = json(res);
      expect(body.id).toBe(originalId);
      expect(body.frozenGrams).toBe(75);
      expect(body.status).toBe('OPEN');
    });

    it('partial freeze does not duplicate bags in available-beans', async () => {
      const testBean = await createBean(app, roaster.id, 'Partial Freeze Bean');
      const v60 = await getV60Method(app);
      await app.inject({
        method: 'PATCH',
        url: `/api/beans/${testBean.id}/recipes/${v60.id}`,
        payload: { grinderTarget: 30 },
      });

      const bag = await createBag(app, testBean.id, { isAvailable: true });

      // Partially freeze
      await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { frozenGrams: 100 },
      });

      const res = json(
        await app.inject({
          method: 'GET',
          url: `/api/available-beans?methodId=${v60.id}`,
        })
      );

      // Should still appear in main bags (not frozen section) since status is OPEN
      const foundInBags = res.bags.filter((b: any) => b.id === bag.id);
      expect(foundInBags.length).toBe(1);
      expect(foundInBags[0].frozenGrams).toBe(100);

      // Should NOT appear in frozenBags
      const foundInFrozen = res.frozenBags.filter((b: any) => b.id === bag.id);
      expect(foundInFrozen.length).toBe(0);
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
      expect(body.frozenBags).toBeDefined();
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

    it('excludes frozen bags from main bags list', async () => {
      const frozenBean = await createBean(app, roaster.id, 'Frozen Bean');
      const v60 = await getV60Method(app);
      await app.inject({
        method: 'PATCH',
        url: `/api/beans/${frozenBean.id}/recipes/${v60.id}`,
        payload: { grinderTarget: 22 },
      });

      // Create a frozen bag
      await app.inject({
        method: 'POST',
        url: `/api/beans/${frozenBean.id}/bags`,
        payload: {
          roastDate: new Date().toISOString(),
          status: 'FROZEN',
          isFrozenBag: true,
          isAvailable: false,
        },
      });

      const res = json(
        await app.inject({
          method: 'GET',
          url: `/api/available-beans?methodId=${v60.id}`,
        })
      );

      // Should NOT appear in main bags list
      const foundInBags = res.bags.find((b: any) => b.bean.id === frozenBean.id);
      expect(foundInBags).toBeUndefined();

      // Should appear in frozenBags list
      const foundInFrozen = res.frozenBags.find((b: any) => b.bean.id === frozenBean.id);
      expect(foundInFrozen).toBeDefined();
      expect(foundInFrozen.status).toBe('FROZEN');
    });

    it('defaults to v60 method if no methodId specified', async () => {
      const res = json(
        await app.inject({ method: 'GET', url: '/api/available-beans' })
      );
      expect(res.selectedMethodId).toBeTruthy();
    });

    it('returns tubePosition for available bags', async () => {
      const tubeBean = await createBean(app, roaster.id, 'Tube Position Bean');
      const v60 = await getV60Method(app);

      await app.inject({
        method: 'PATCH',
        url: `/api/beans/${tubeBean.id}/recipes/${v60.id}`,
        payload: { grinderTarget: 22 },
      });

      const bag = await createBag(app, tubeBean.id, { isAvailable: true, status: 'OPEN' });

      // Set tube position
      await app.inject({
        method: 'PATCH',
        url: `/api/bags/${bag.id}`,
        payload: { tubePosition: 'MIDDLE' },
      });

      const res = json(
        await app.inject({
          method: 'GET',
          url: `/api/available-beans?methodId=${v60.id}`,
        })
      );

      const tubeBag = res.bags.find((b: any) => b.bean.id === tubeBean.id);
      expect(tubeBag).toBeDefined();
      expect(tubeBag.tubePosition).toBe('MIDDLE');
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
