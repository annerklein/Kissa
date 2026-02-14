import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { getApp, closeApp, json, createRoaster, createBean, createBag } from './helpers.js';

describe('Roasters API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    await closeApp();
  });

  describe('POST /api/roasters', () => {
    it('creates a roaster with just a name', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/roasters',
        payload: { name: 'Test Roaster Create' },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.id).toBeTruthy();
      expect(body.name).toBe('Test Roaster Create');
    });

    it('creates a roaster with all optional fields', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/roasters',
        payload: {
          name: 'Full Roaster',
          country: 'Norway',
          website: 'https://example.com',
          notes: 'Great roaster',
        },
      });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.country).toBe('Norway');
      expect(body.website).toBe('https://example.com');
      expect(body.notes).toBe('Great roaster');
    });

    it('returns 400 for empty name', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/roasters',
        payload: { name: '' },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 for missing name', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/roasters',
        payload: {},
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/roasters', () => {
    it('returns an array of roasters', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/roasters' });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(Array.isArray(body)).toBe(true);
    });

    it('includes recently created roasters', async () => {
      const roaster = await createRoaster(app, 'List Check Roaster');
      const res = json(await app.inject({ method: 'GET', url: '/api/roasters' }));
      const found = res.find((r: any) => r.id === roaster.id);
      expect(found).toBeTruthy();
      expect(found.name).toBe('List Check Roaster');
    });

    it('returns roasters sorted by name ascending (case-sensitive DB ordering)', async () => {
      // SQLite sorts case-sensitively (uppercase before lowercase)
      // We verify the DB-level ordering is consistent
      const res = json(await app.inject({ method: 'GET', url: '/api/roasters' }));
      const names = res.map((r: any) => r.name);
      // Prisma orderBy { name: 'asc' } uses SQLite's BINARY collation
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });
  });

  describe('GET /api/roasters/:id', () => {
    it('returns a roaster by ID with beans and bags', async () => {
      const roaster = await createRoaster(app, 'Get By ID Roaster');
      const bean = await createBean(app, roaster.id, 'Get By ID Bean');
      await createBag(app, bean.id);

      const res = await app.inject({ method: 'GET', url: `/api/roasters/${roaster.id}` });
      expect(res.statusCode).toBe(200);
      const body = json(res);
      expect(body.id).toBe(roaster.id);
      expect(body.beans).toHaveLength(1);
      expect(body.beans[0].bags).toHaveLength(1);
    });

    it('returns 404 for non-existent roaster', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/roasters/00000000-0000-0000-0000-000000000000',
      });
      expect(res.statusCode).toBe(404);
      expect(json(res).error).toBe('NotFound');
    });
  });

  describe('PATCH /api/roasters/:id', () => {
    it('updates roaster name', async () => {
      const roaster = await createRoaster(app, 'Before Update');
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/roasters/${roaster.id}`,
        payload: { name: 'After Update' },
      });
      expect(res.statusCode).toBe(200);
      expect(json(res).name).toBe('After Update');
    });

    it('partially updates roaster fields', async () => {
      const roaster = await createRoaster(app, 'Partial Update Roaster');
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/roasters/${roaster.id}`,
        payload: { country: 'Ethiopia' },
      });
      expect(res.statusCode).toBe(200);
      expect(json(res).country).toBe('Ethiopia');
      expect(json(res).name).toBe('Partial Update Roaster');
    });

    it('returns 404 for non-existent roaster', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/roasters/00000000-0000-0000-0000-000000000000',
        payload: { name: 'Nope' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/roasters/:id', () => {
    it('deletes a roaster', async () => {
      const roaster = await createRoaster(app, 'To Delete Roaster');
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/roasters/${roaster.id}`,
      });
      expect(res.statusCode).toBe(200);
      expect(json(res).success).toBe(true);

      // Verify it's gone
      const getRes = await app.inject({ method: 'GET', url: `/api/roasters/${roaster.id}` });
      expect(getRes.statusCode).toBe(404);
    });

    it('returns 404 for non-existent roaster', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/roasters/00000000-0000-0000-0000-000000000000',
      });
      expect(res.statusCode).toBe(404);
    });
  });
});
