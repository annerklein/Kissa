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

describe('Brews API', () => {
  let app: FastifyInstance;
  let roaster: any;
  let bean: any;
  let bag: any;
  let v60: any;
  let moka: any;

  beforeAll(async () => {
    app = await getApp();
    roaster = await createRoaster(app, 'Brews Test Roaster');
    bean = await createBean(app, roaster.id, 'Brews Test Bean');
    bag = await createBag(app, bean.id);
    v60 = await getV60Method(app);
    moka = await getMokaMethod(app);
  });

  afterAll(async () => {
    await closeApp();
  });

  // ---------------------------------------------------------------------------
  // POST /api/brews
  // ---------------------------------------------------------------------------
  describe('POST /api/brews', () => {
    it('creates a brew log', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/brews',
        payload: {
          bagId: bag.id,
          methodId: v60.id,
          parameters: { grindSize: 22, waterTemp: 96, dose: 15 },
        },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.id).toBeTruthy();
      expect(body.bagId).toBe(bag.id);
      expect(body.methodId).toBe(v60.id);
      expect(body.bag).toBeDefined();
      expect(body.method).toBeDefined();
    });

    it('updates global grinder setting when brew includes grindSize', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/brews',
        payload: {
          bagId: bag.id,
          methodId: v60.id,
          parameters: { grindSize: 33 },
        },
      });

      const grinder = json(await app.inject({ method: 'GET', url: '/api/grinder' }));
      expect(grinder.currentSetting).toBe(33);
    });

    it('does not change grinder when no grindSize is provided', async () => {
      // Set grinder to known value
      await app.inject({
        method: 'POST',
        url: '/api/grinder/apply',
        payload: { newSetting: 40 },
      });

      await app.inject({
        method: 'POST',
        url: '/api/brews',
        payload: {
          bagId: bag.id,
          methodId: v60.id,
          parameters: { waterTemp: 96 },
        },
      });

      const grinder = json(await app.inject({ method: 'GET', url: '/api/grinder' }));
      expect(grinder.currentSetting).toBe(40);
    });

    it('returns 400 for missing required fields', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/brews',
        payload: { bagId: bag.id },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/brews
  // ---------------------------------------------------------------------------
  describe('GET /api/brews', () => {
    it('returns all brews', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/brews' });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(Array.isArray(body)).toBe(true);
    });

    it('filters brews by bagId', async () => {
      // Create a brew for a specific bag
      const testBag = await createBag(app, bean.id);
      await app.inject({
        method: 'POST',
        url: '/api/brews',
        payload: { bagId: testBag.id, methodId: v60.id },
      });

      const res = json(
        await app.inject({ method: 'GET', url: `/api/brews?bagId=${testBag.id}` })
      );
      expect(res.length).toBeGreaterThanOrEqual(1);
      for (const brew of res) {
        expect(brew.bagId).toBe(testBag.id);
      }
    });

    it('returns brews sorted by brewedAt descending', async () => {
      const res = json(await app.inject({ method: 'GET', url: '/api/brews' }));
      for (let i = 1; i < res.length; i++) {
        expect(new Date(res[i - 1].brewedAt).getTime())
          .toBeGreaterThanOrEqual(new Date(res[i].brewedAt).getTime());
      }
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/brews/:id
  // ---------------------------------------------------------------------------
  describe('GET /api/brews/:id', () => {
    it('returns a brew by ID with nested data', async () => {
      const brewRes = json(
        await app.inject({
          method: 'POST',
          url: '/api/brews',
          payload: { bagId: bag.id, methodId: v60.id },
        })
      );

      const res = await app.inject({ method: 'GET', url: `/api/brews/${brewRes.id}` });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.id).toBe(brewRes.id);
      expect(body.bag).toBeDefined();
      expect(body.method).toBeDefined();
    });

    it('returns 404 for non-existent brew', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/brews/00000000-0000-0000-0000-000000000000',
      });
      expect(res.statusCode).toBe(404);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/brews/screen
  // ---------------------------------------------------------------------------
  describe('GET /api/brews/screen', () => {
    it('returns brew screen data with scaled recipe', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/brews/screen?bagId=${bag.id}&methodId=${v60.id}`,
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.bag).toBeDefined();
      expect(body.method).toBeDefined();
      expect(body.scaledRecipe).toBeDefined();
      expect(typeof body.scaledRecipe.dose).toBe('number');
      expect(typeof body.currentGrinderSetting).toBe('number');
    });

    it('v60 brew screen includes water in scaled recipe', async () => {
      const body = json(
        await app.inject({
          method: 'GET',
          url: `/api/brews/screen?bagId=${bag.id}&methodId=${v60.id}`,
        })
      );
      expect(body.scaledRecipe.water).toBeDefined();
      expect(body.scaledRecipe.water).toBeGreaterThan(0);
      expect(body.scaledRecipe.ratio).toBeDefined();
    });

    it('moka brew screen does NOT include water in scaled recipe', async () => {
      const body = json(
        await app.inject({
          method: 'GET',
          url: `/api/brews/screen?bagId=${bag.id}&methodId=${moka.id}`,
        })
      );
      expect(body.method.scalingRules.scalesWater).toBe(false);
      expect(body.scaledRecipe.water).toBeUndefined();
    });

    it('uses bean recipe overrides when available', async () => {
      const recipeBean = await createBean(app, roaster.id, 'Brew Screen Recipe Bean');
      const recipeBag = await createBag(app, recipeBean.id);

      await app.inject({
        method: 'PATCH',
        url: `/api/beans/${recipeBean.id}/recipes/${v60.id}`,
        payload: { grinderTarget: 30, recipeOverrides: { waterTemp: 92 } },
      });

      const body = json(
        await app.inject({
          method: 'GET',
          url: `/api/brews/screen?bagId=${recipeBag.id}&methodId=${v60.id}`,
        })
      );
      expect(body.scaledRecipe.grindSize).toBe(30);
      expect(body.scaledRecipe.waterTemp).toBe(92);
    });

    it('returns 400 when bagId or methodId is missing', async () => {
      const res1 = await app.inject({
        method: 'GET',
        url: `/api/brews/screen?bagId=${bag.id}`,
      });
      expect(res1.statusCode).toBe(400);

      const res2 = await app.inject({
        method: 'GET',
        url: `/api/brews/screen?methodId=${v60.id}`,
      });
      expect(res2.statusCode).toBe(400);
    });

    it('returns 404 for non-existent bag or method', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/brews/screen?bagId=00000000-0000-0000-0000-000000000000&methodId=${v60.id}`,
      });
      expect(res.statusCode).toBe(404);
    });
  });

  // ---------------------------------------------------------------------------
  // PATCH /api/brews/:id
  // ---------------------------------------------------------------------------
  describe('PATCH /api/brews/:id', () => {
    it('updates brew notes', async () => {
      const brew = json(
        await app.inject({
          method: 'POST',
          url: '/api/brews',
          payload: { bagId: bag.id, methodId: v60.id },
        })
      );

      const res = await app.inject({
        method: 'PATCH',
        url: `/api/brews/${brew.id}`,
        payload: { notes: 'Nice brew!' },
      });
      expect(res.statusCode).toBe(200);
      expect(json(res).notes).toBe('Nice brew!');
    });

    it('returns 404 for non-existent brew', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/brews/00000000-0000-0000-0000-000000000000',
        payload: { notes: 'Ghost' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  // ---------------------------------------------------------------------------
  // PATCH /api/brews/:id/rating
  // ---------------------------------------------------------------------------
  describe('PATCH /api/brews/:id/rating', () => {
    it('submits a rating and receives computed score + suggestion', async () => {
      const brew = json(
        await app.inject({
          method: 'POST',
          url: '/api/brews',
          payload: {
            bagId: bag.id,
            methodId: v60.id,
            parameters: { grindSize: 22, waterTemp: 96 },
          },
        })
      );

      const res = await app.inject({
        method: 'PATCH',
        url: `/api/brews/${brew.id}/rating`,
        payload: {
          ratingSliders: {
            balance: 5,
            sweetness: 7,
            clarity: 8,
            body: 6,
            finish: 7,
          },
          drawdownTime: 180,
          tastingNotesActual: ['cherry', 'chocolate'],
          notes: 'Good balance',
        },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.computedScore).toBeDefined();
      expect(typeof body.computedScore).toBe('number');
      expect(body.computedScore).toBeGreaterThan(0);
      expect(body.computedScore).toBeLessThanOrEqual(10);
      expect(body.suggestion).toBeDefined();
      expect(body.suggestion.primary).toBeDefined();
      expect(body.suggestion.primary.variable).toBeTruthy();
      expect(body.suggestion.primary.action).toBeTruthy();
      expect(body.suggestion.primary.rationale).toBeTruthy();
    });

    it('generates under-extraction suggestion for sour rating', async () => {
      const brew = json(
        await app.inject({
          method: 'POST',
          url: '/api/brews',
          payload: {
            bagId: bag.id,
            methodId: v60.id,
            parameters: { grindSize: 22 },
          },
        })
      );

      const res = json(
        await app.inject({
          method: 'PATCH',
          url: `/api/brews/${brew.id}/rating`,
          payload: {
            ratingSliders: {
              balance: 2,
              sweetness: 3,
              clarity: 5,
              body: 5,
              finish: 4,
            },
            drawdownTime: 120,
          },
        })
      );
      // Should suggest going finer (under-extracted + short drawdown)
      expect(res.suggestion.primary.action.toLowerCase()).toContain('finer');
    });

    it('generates over-extraction suggestion for bitter rating', async () => {
      const brew = json(
        await app.inject({
          method: 'POST',
          url: '/api/brews',
          payload: {
            bagId: bag.id,
            methodId: v60.id,
            parameters: { grindSize: 22 },
          },
        })
      );

      const res = json(
        await app.inject({
          method: 'PATCH',
          url: `/api/brews/${brew.id}/rating`,
          payload: {
            ratingSliders: {
              balance: 9,
              sweetness: 4,
              clarity: 3,
              body: 7,
              finish: 3,
            },
            drawdownTime: 250,
          },
        })
      );
      // Should suggest going coarser (over-extracted + long drawdown)
      expect(res.suggestion.primary.action.toLowerCase()).toContain('coarser');
    });

    it('returns 400 for invalid rating sliders', async () => {
      const brew = json(
        await app.inject({
          method: 'POST',
          url: '/api/brews',
          payload: { bagId: bag.id, methodId: v60.id },
        })
      );

      const res = await app.inject({
        method: 'PATCH',
        url: `/api/brews/${brew.id}/rating`,
        payload: {
          ratingSliders: { balance: 15 }, // out of range
        },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 404 for non-existent brew', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/brews/00000000-0000-0000-0000-000000000000/rating',
        payload: {
          ratingSliders: {
            balance: 5,
            sweetness: 5,
            clarity: 5,
            body: 5,
            finish: 5,
          },
        },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /api/brews/:id/apply-suggestion
  // ---------------------------------------------------------------------------
  describe('POST /api/brews/:id/apply-suggestion', () => {
    it('marks suggestion as accepted', async () => {
      // Setup: create bean with recipe, brew, rate
      const sugBean = await createBean(app, roaster.id, 'Suggestion Bean');
      const sugBag = await createBag(app, sugBean.id);
      await app.inject({
        method: 'PATCH',
        url: `/api/beans/${sugBean.id}/recipes/${v60.id}`,
        payload: { grinderTarget: 22 },
      });

      const brew = json(
        await app.inject({
          method: 'POST',
          url: '/api/brews',
          payload: {
            bagId: sugBag.id,
            methodId: v60.id,
            parameters: { grindSize: 22 },
          },
        })
      );

      // Rate with under-extraction
      await app.inject({
        method: 'PATCH',
        url: `/api/brews/${brew.id}/rating`,
        payload: {
          ratingSliders: {
            balance: 2,
            sweetness: 3,
            clarity: 5,
            body: 5,
            finish: 5,
          },
          drawdownTime: 120,
        },
      });

      // Apply suggestion
      const res = await app.inject({
        method: 'POST',
        url: `/api/brews/${brew.id}/apply-suggestion`,
        payload: { applyTo: 'bag' },
      });
      expect(res.statusCode).toBe(200);
      expect(json(res).success).toBe(true);
      expect(json(res).appliedTo).toBe('bag');
    });

    it('returns 404 when brew has no suggestion', async () => {
      const brew = json(
        await app.inject({
          method: 'POST',
          url: '/api/brews',
          payload: { bagId: bag.id, methodId: v60.id },
        })
      );

      const res = await app.inject({
        method: 'POST',
        url: `/api/brews/${brew.id}/apply-suggestion`,
        payload: { applyTo: 'next' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  // ---------------------------------------------------------------------------
  // DELETE /api/brews/:id
  // ---------------------------------------------------------------------------
  describe('DELETE /api/brews/:id', () => {
    it('deletes a brew', async () => {
      const brew = json(
        await app.inject({
          method: 'POST',
          url: '/api/brews',
          payload: { bagId: bag.id, methodId: v60.id },
        })
      );

      const res = await app.inject({ method: 'DELETE', url: `/api/brews/${brew.id}` });
      expect(res.statusCode).toBe(200);
      expect(json(res).success).toBe(true);

      const getRes = await app.inject({ method: 'GET', url: `/api/brews/${brew.id}` });
      expect(getRes.statusCode).toBe(404);
    });

    it('returns 404 for non-existent brew', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/brews/00000000-0000-0000-0000-000000000000',
      });
      expect(res.statusCode).toBe(404);
    });
  });
});
