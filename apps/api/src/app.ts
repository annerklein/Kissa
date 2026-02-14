import Fastify from 'fastify';
import cors from '@fastify/cors';
import { prisma } from './db/client.js';

// Import routes
import { settingsRoutes } from './routes/settings.js';
import { grinderRoutes } from './routes/grinder.js';
import { roastersRoutes } from './routes/roasters.js';
import { beansRoutes } from './routes/beans.js';
import { bagsRoutes } from './routes/bags.js';
import { methodsRoutes } from './routes/methods.js';
import { brewsRoutes } from './routes/brews.js';
import { analyticsRoutes } from './routes/analytics.js';
import { onboardingRoutes } from './routes/onboarding.js';
import { backupRoutes } from './routes/backup.js';

export async function buildApp(opts = {}) {
  const server = Fastify(opts);

  // Register CORS
  await server.register(cors, {
    origin: true,
    credentials: true,
  });

  // Health check with database status
  server.get('/health', async () => {
    try {
      // Check database connectivity and get method count
      const methodCount = await prisma.method.count();
      const hasSettings = await prisma.settings.findFirst() !== null;
      const hasGrinder = await prisma.grinderState.findFirst() !== null;
      
      return { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          methodCount,
          hasSettings,
          hasGrinder,
          recipesAvailable: methodCount >= 4, // Should have v60, moka, espresso, french_press
        }
      };
    } catch (error) {
      return { 
        status: 'degraded', 
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown database error'
        }
      };
    }
  });

  // Register routes
  await server.register(settingsRoutes, { prefix: '/api' });
  await server.register(grinderRoutes, { prefix: '/api' });
  await server.register(roastersRoutes, { prefix: '/api' });
  await server.register(beansRoutes, { prefix: '/api' });
  await server.register(bagsRoutes, { prefix: '/api' });
  await server.register(methodsRoutes, { prefix: '/api' });
  await server.register(brewsRoutes, { prefix: '/api' });
  await server.register(analyticsRoutes, { prefix: '/api' });
  await server.register(onboardingRoutes, { prefix: '/api' });

  // Hidden backup route — not listed in UI, accessible only via direct API call
  await server.register(backupRoutes, { prefix: '/internal' });

  return server;
}
