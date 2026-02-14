import { FastifyInstance } from 'fastify';
import { createReadStream, existsSync } from 'fs';
import { stat } from 'fs/promises';
import path from 'path';
import { prisma } from '../db/client.js';

/**
 * Hidden backup route — not exposed in the UI.
 * Serves the SQLite database file as a downloadable backup.
 *
 * Usage:  GET /internal/backup/db
 */
export async function backupRoutes(server: FastifyInstance) {
  server.get('/backup/db', async (_request, reply) => {
    try {
      // Resolve the DB file path from DATABASE_URL
      const dbUrl = process.env.DATABASE_URL || 'file:./data/kissa.db';
      let dbRelativePath = dbUrl.replace(/^file:/, '');

      // Resolve relative paths against the API working directory
      const dbPath = path.isAbsolute(dbRelativePath)
        ? dbRelativePath
        : path.resolve(process.cwd(), dbRelativePath);

      if (!existsSync(dbPath)) {
        return reply.status(404).send({ error: 'Database file not found', path: dbPath });
      }

      // Checkpoint WAL to ensure the main DB file is up to date
      try {
        await prisma.$executeRawUnsafe('PRAGMA wal_checkpoint(TRUNCATE)');
      } catch {
        // Non-fatal: DB might not be in WAL mode
      }

      const fileStat = await stat(dbPath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `kissa-backup-${timestamp}.db`;

      reply.header('Content-Type', 'application/x-sqlite3');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      reply.header('Content-Length', fileStat.size);

      return reply.send(createReadStream(dbPath));
    } catch (error) {
      return reply.status(500).send({
        error: 'Backup failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
