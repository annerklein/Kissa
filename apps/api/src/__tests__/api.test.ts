import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../app.js';
import { prisma } from '../db/client.js';
import { FastifyInstance } from 'fastify';

describe('API Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('health check works', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toHaveProperty('status', 'ok');
  });

  describe('Bean & Bag Management', () => {
    it('bean recipes are preserved across bags', async () => {
      // 1. Create a roaster
      const roasterRes = await app.inject({
        method: 'POST',
        url: '/api/roasters',
        payload: { name: 'Preservation Roaster' },
      });
      const roaster = JSON.parse(roasterRes.body);

      // 2. Create a bean
      const beanRes = await app.inject({
        method: 'POST',
        url: '/api/beans',
        payload: {
          roasterId: roaster.id,
          name: 'Preservation Bean',
          roastLevel: 'MEDIUM',
        },
      });
      const bean = JSON.parse(beanRes.body);

      // 3. Set recipe for bean
      const methodRes = await app.inject({ method: 'GET', url: '/api/methods' });
      const methods = JSON.parse(methodRes.body);
      const v60Method = methods.find((m: any) => m.name === 'v60');

      await app.inject({
        method: 'PATCH',
        url: `/api/beans/${bean.id}/recipes/${v60Method.id}`,
        payload: {
          grinderTarget: 45,
          recipeOverrides: { dose: 20, waterTemp: 98 },
        },
      });

      // 4. Add a bag
      const bagRes = await app.inject({
        method: 'POST',
        url: `/api/beans/${bean.id}/bags`,
        payload: { roastDate: new Date().toISOString(), isAvailable: true },
      });
      const bag = JSON.parse(bagRes.body);

      // 5. Verify brew screen uses the bean recipe
      const screenRes = await app.inject({
        method: 'GET',
        url: `/api/brews/screen?bagId=${bag.id}&methodId=${v60Method.id}`,
      });
      const screen = JSON.parse(screenRes.body);

      expect(screen.scaledRecipe.grindSize).toBe(45);
      expect(screen.scaledRecipe.gramsPerServing).toBe(20);
      expect(screen.scaledRecipe.waterTemp).toBe(98);
    });

    it('updates global grinder setting when starting a brew', async () => {
      const roasterRes = await app.inject({ method: 'POST', url: '/api/roasters', payload: { name: 'Grinder Roaster' } });
      const roaster = JSON.parse(roasterRes.body);
      const beanRes = await app.inject({ method: 'POST', url: '/api/beans', payload: { roasterId: roaster.id, name: 'Grinder Bean' } });
      const bean = JSON.parse(beanRes.body);
      const bagRes = await app.inject({ method: 'POST', url: `/api/beans/${bean.id}/bags`, payload: { roastDate: new Date() } });
      const bag = JSON.parse(bagRes.body);
      const v60Method = (await app.inject({ method: 'GET', url: '/api/methods' }).then(r => JSON.parse(r.body))).find((m: any) => m.name === 'v60');

      // Start a brew
      await app.inject({
        method: 'POST',
        url: '/api/brews',
        payload: {
          bagId: bag.id,
          methodId: v60Method.id,
          parameters: { grindSize: 33 },
        },
      });

      // Verify global grinder setting updated
      const gRes = await app.inject({ method: 'GET', url: '/api/grinder' });
      expect(JSON.parse(gRes.body).currentSetting).toBe(33);
    });

    it('Moka Pot brew screen does not include water amount in scaled recipe', async () => {
      const roasterRes = await app.inject({ method: 'POST', url: '/api/roasters', payload: { name: 'Moka Roaster' } });
      const roaster = JSON.parse(roasterRes.body);
      const beanRes = await app.inject({ method: 'POST', url: '/api/beans', payload: { roasterId: roaster.id, name: 'Moka Bean' } });
      const bean = JSON.parse(beanRes.body);
      const bagRes = await app.inject({ method: 'POST', url: `/api/beans/${bean.id}/bags`, payload: { roastDate: new Date() } });
      const bag = JSON.parse(bagRes.body);
      const mokaMethod = (await app.inject({ method: 'GET', url: '/api/methods' }).then(r => JSON.parse(r.body))).find((m: any) => m.name === 'moka');

      const screenRes = await app.inject({
        method: 'GET',
        url: `/api/brews/screen?bagId=${bag.id}&methodId=${mokaMethod.id}`,
      });
      const screen = JSON.parse(screenRes.body);

      expect(screen.method.scalingRules.scalesWater).toBe(false);
      expect(screen.scaledRecipe.water).toBeUndefined();
    });
  });
});
