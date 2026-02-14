/**
 * Shared test utilities for API integration tests
 */
import { buildApp } from '../app.js';
import { prisma } from '../db/client.js';
import type { FastifyInstance } from 'fastify';

let _app: FastifyInstance | null = null;

/**
 * Get or create a shared Fastify app instance.
 * All test suites share a single app to keep DB state consistent for
 * integration testing while avoiding startup overhead.
 */
export async function getApp(): Promise<FastifyInstance> {
  if (!_app) {
    _app = await buildApp();
  }
  return _app;
}

export async function closeApp(): Promise<void> {
  if (_app) {
    await _app.close();
    _app = null;
  }
  await prisma.$disconnect();
}

/** Parse JSON response body */
export function json(response: { body: string }) {
  return JSON.parse(response.body);
}

/** Shorthand to create a roaster and return the parsed body */
export async function createRoaster(
  app: FastifyInstance,
  name: string,
  extra: Record<string, unknown> = {}
) {
  const res = await app.inject({
    method: 'POST',
    url: '/api/roasters',
    payload: { name, ...extra },
  });
  return json(res);
}

/** Shorthand to create a bean and return the parsed body */
export async function createBean(
  app: FastifyInstance,
  roasterId: string,
  name: string,
  extra: Record<string, unknown> = {}
) {
  const res = await app.inject({
    method: 'POST',
    url: '/api/beans',
    payload: { roasterId, name, ...extra },
  });
  return json(res);
}

/** Shorthand to create a bag for a bean */
export async function createBag(
  app: FastifyInstance,
  beanId: string,
  extra: Record<string, unknown> = {}
) {
  const res = await app.inject({
    method: 'POST',
    url: `/api/beans/${beanId}/bags`,
    payload: { roastDate: new Date().toISOString(), isAvailable: true, ...extra },
  });
  return json(res);
}

/** Get the V60 method */
export async function getV60Method(app: FastifyInstance) {
  const res = await app.inject({ method: 'GET', url: '/api/methods' });
  const methods = json(res);
  return methods.find((m: any) => m.name === 'v60');
}

/** Get the Moka method */
export async function getMokaMethod(app: FastifyInstance) {
  const res = await app.inject({ method: 'GET', url: '/api/methods' });
  const methods = json(res);
  return methods.find((m: any) => m.name === 'moka');
}

/** Get any method by name */
export async function getMethodByName(app: FastifyInstance, name: string) {
  const res = await app.inject({ method: 'GET', url: '/api/methods' });
  const methods = json(res);
  return methods.find((m: any) => m.name === name);
}

/** Create a complete brew setup (roaster + bean + bag + method) and return all IDs */
export async function createBrewSetup(app: FastifyInstance, prefix: string) {
  const roaster = await createRoaster(app, `${prefix} Roaster`);
  const bean = await createBean(app, roaster.id, `${prefix} Bean`);
  const bag = await createBag(app, bean.id);
  const v60 = await getV60Method(app);
  const moka = await getMokaMethod(app);
  return { roaster, bean, bag, v60, moka };
}
