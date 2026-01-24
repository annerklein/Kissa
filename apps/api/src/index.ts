import { buildApp } from './app.js';
import { prisma } from './db/client.js';

const server = await buildApp({
  logger: true,
});

// Graceful shutdown
const shutdown = async () => {
  await prisma.$disconnect();
  await server.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    console.log(`Server running at http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
