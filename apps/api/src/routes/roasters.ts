import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client.js';
import { RoasterCreateSchema } from '@kissa/shared';

export async function roastersRoutes(server: FastifyInstance) {
  // GET /api/roasters
  server.get('/roasters', async () => {
    return prisma.roaster.findMany({
      orderBy: { name: 'asc' },
    });
  });

  // GET /api/roasters/:id
  server.get('/roasters/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const roaster = await prisma.roaster.findUnique({
      where: { id },
      include: {
        beans: {
          include: {
            bags: true,
          },
        },
      },
    });

    if (!roaster) {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Roaster not found',
      });
    }

    return roaster;
  });

  // POST /api/roasters
  server.post('/roasters', async (request, reply) => {
    const body = RoasterCreateSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: body.error.message,
      });
    }

    const roaster = await prisma.roaster.create({
      data: body.data,
    });

    return roaster;
  });

  // PATCH /api/roasters/:id
  server.patch('/roasters/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = RoasterCreateSchema.partial().safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: body.error.message,
      });
    }

    try {
      const roaster = await prisma.roaster.update({
        where: { id },
        data: body.data,
      });

      return roaster;
    } catch {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Roaster not found',
      });
    }
  });

  // DELETE /api/roasters/:id
  server.delete('/roasters/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await prisma.roaster.delete({ where: { id } });
      return { success: true };
    } catch {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Roaster not found',
      });
    }
  });
}
