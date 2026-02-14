import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { getApp, closeApp, json } from './helpers.js';

describe('Health Check', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getApp();
  });

  afterAll(async () => {
    await closeApp();
  });

  it('GET /health returns 200 with status ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = json(res);
    expect(body.status).toBe('ok');
  });

  it('GET /health includes a timestamp', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    const body = json(res);
    expect(body.timestamp).toBeTruthy();
    // Should be a valid ISO date
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  it('GET /health includes database connectivity info', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    const body = json(res);
    expect(body.database).toBeDefined();
    expect(body.database.connected).toBe(true);
    expect(typeof body.database.methodCount).toBe('number');
  });

  it('GET /health reports method count >= 4', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    const body = json(res);
    expect(body.database.methodCount).toBeGreaterThanOrEqual(4);
    expect(body.database.recipesAvailable).toBe(true);
  });
});
