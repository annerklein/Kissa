import Fastify from 'fastify';
import cors from '@fastify/cors';
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
export async function buildApp(opts = {}) {
    const server = Fastify(opts);
    // Register CORS
    await server.register(cors, {
        origin: true,
        credentials: true,
    });
    // Health check
    server.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
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
    return server;
}
//# sourceMappingURL=app.js.map