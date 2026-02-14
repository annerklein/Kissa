/**
 * Legacy integration test file.
 * 
 * Comprehensive tests are now split across domain-specific files:
 * - health.test.ts
 * - settings.test.ts
 * - grinder.test.ts
 * - roasters.test.ts
 * - beans.test.ts
 * - bags.test.ts
 * - methods.test.ts
 * - brews.test.ts
 * - analytics.test.ts
 * - onboarding.test.ts
 * - recommendation.test.ts
 *
 * This file is kept as a smoke test for the most critical cross-cutting workflows.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { getApp, closeApp, json, createRoaster, createBean, createBag, getV60Method } from './helpers.js';

describe('Cross-cutting Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    await closeApp();
  });

  it('full brew workflow: create roaster → bean → bag → brew → rate → get analytics', async () => {
    // 1. Create roaster
    const roaster = await createRoaster(app, 'Workflow Roaster');
    expect(roaster.id).toBeTruthy();

    // 2. Create bean
    const bean = await createBean(app, roaster.id, 'Workflow Bean', {
      originCountry: 'KE',
      originRegion: 'Nyeri',
      roastLevel: 'LIGHT',
      tastingNotesExpected: ['blackberry', 'lemon'],
    });
    expect(bean.id).toBeTruthy();

    // 3. Get V60 method and set recipe
    const v60 = await getV60Method(app);
    await app.inject({
      method: 'PATCH',
      url: `/api/beans/${bean.id}/recipes/${v60.id}`,
      payload: { grinderTarget: 24, recipeOverrides: { waterTemp: 96, dose: 15 } },
    });

    // 4. Create bag
    const bag = await createBag(app, bean.id);
    expect(bag.beanId).toBe(bean.id);

    // 5. Get brew screen
    const screen = json(
      await app.inject({
        method: 'GET',
        url: `/api/brews/screen?bagId=${bag.id}&methodId=${v60.id}`,
      })
    );
    expect(screen.scaledRecipe.grindSize).toBe(24);
    expect(screen.scaledRecipe.waterTemp).toBe(96);
    expect(screen.scaledRecipe.water).toBeGreaterThan(0);

    // 6. Start brew
    const brew = json(
      await app.inject({
        method: 'POST',
        url: '/api/brews',
        payload: {
          bagId: bag.id,
          methodId: v60.id,
          parameters: { grindSize: 24, waterTemp: 96, dose: screen.scaledRecipe.dose },
        },
      })
    );
    expect(brew.id).toBeTruthy();

    // 7. Rate brew
    const rating = json(
      await app.inject({
        method: 'PATCH',
        url: `/api/brews/${brew.id}/rating`,
        payload: {
          ratingSliders: { balance: 5, sweetness: 8, clarity: 8, body: 7, finish: 7 },
          drawdownTime: 185,
          tastingNotesActual: ['blackberry', 'citrus'],
        },
      })
    );
    expect(rating.computedScore).toBeGreaterThan(5);
    expect(rating.suggestion).toBeDefined();

    // 8. Verify analytics reflect the brew
    const mapData = json(await app.inject({ method: 'GET', url: '/api/analytics/map' }));
    const kenya = mapData.find((d: any) => d.countryCode === 'KE');
    expect(kenya).toBeDefined();
    expect(kenya.avgScore).toBeGreaterThan(0);

    // 9. Verify bean profile shows tasting notes comparison
    const profile = json(await app.inject({ method: 'GET', url: `/api/beans/${bean.id}` }));
    expect(profile.tastingNotesComparison.expected).toEqual(['blackberry', 'lemon']);
    expect(profile.tastingNotesComparison.actual['blackberry']).toBe(1);
    expect(profile.tastingNotesComparison.actual['citrus']).toBe(1);
  });

  it('available-beans correctly filters by method recipe and shows grinder delta', async () => {
    const roaster = await createRoaster(app, 'Filter Test Roaster');
    const v60 = await getV60Method(app);

    // Bean WITH recipe
    const beanWithRecipe = await createBean(app, roaster.id, 'Has Recipe');
    await app.inject({
      method: 'PATCH',
      url: `/api/beans/${beanWithRecipe.id}/recipes/${v60.id}`,
      payload: { grinderTarget: 28 },
    });
    await createBag(app, beanWithRecipe.id, { isAvailable: true });

    // Bean WITHOUT recipe
    const beanNoRecipe = await createBean(app, roaster.id, 'No Recipe');
    await createBag(app, beanNoRecipe.id, { isAvailable: true });

    const available = json(
      await app.inject({
        method: 'GET',
        url: `/api/available-beans?methodId=${v60.id}`,
      })
    );

    const withRecipeBag = available.bags.find((b: any) => b.bean.id === beanWithRecipe.id);
    const noRecipeBag = available.bags.find((b: any) => b.bean.id === beanNoRecipe.id);

    expect(withRecipeBag).toBeDefined();
    expect(withRecipeBag.grinderDelta).toBeDefined();
    expect(noRecipeBag).toBeUndefined();
  });
});
