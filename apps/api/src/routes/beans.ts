import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client.js';
import { BeanCreateSchema, BagCreateSchema } from '@kissa/shared';

export async function beansRoutes(server: FastifyInstance) {
  // GET /api/beans
  server.get('/beans', async () => {
    return prisma.bean.findMany({
      include: {
        roaster: true,
        bags: {
          orderBy: { roastDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  // GET /api/beans/:id (full profile)
  server.get('/beans/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const bean = await prisma.bean.findUnique({
      where: { id },
      include: {
        roaster: true,
        recipes: {
          include: { method: true },
        },
        bags: {
          include: {
            brewLogs: {
              orderBy: { brewedAt: 'desc' },
            },
          },
          orderBy: { roastDate: 'desc' },
        },
      },
    });

    if (!bean) {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Bean not found',
      });
    }

    // Calculate tasting notes comparison
    const allBrews = bean.bags.flatMap((bag) => bag.brewLogs);
    const actualNotesCount: Record<string, number> = {};

    for (const brew of allBrews) {
      if (brew.tastingNotesActual) {
        const notes = JSON.parse(brew.tastingNotesActual) as string[];
        for (const note of notes) {
          actualNotesCount[note] = (actualNotesCount[note] || 0) + 1;
        }
      }
    }

    const expectedNotes = bean.tastingNotesExpected
      ? (JSON.parse(bean.tastingNotesExpected) as string[])
      : [];

    return {
      ...bean,
      tastingNotesComparison: {
        expected: expectedNotes,
        actual: actualNotesCount,
      },
    };
  });

  // POST /api/beans
  server.post('/beans', async (request, reply) => {
    const body = BeanCreateSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: body.error.message,
      });
    }

    const { tastingNotesExpected, ...rest } = body.data;

    const bean = await prisma.bean.create({
      data: {
        ...rest,
        tastingNotesExpected: tastingNotesExpected
          ? JSON.stringify(tastingNotesExpected)
          : null,
      },
      include: { roaster: true },
    });

    return bean;
  });

  // PATCH /api/beans/:id
  server.patch('/beans/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = BeanCreateSchema.partial().safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: body.error.message,
      });
    }

    const { tastingNotesExpected, ...rest } = body.data;

    try {
      const bean = await prisma.bean.update({
        where: { id },
        data: {
          ...rest,
          ...(tastingNotesExpected !== undefined && {
            tastingNotesExpected: tastingNotesExpected
              ? JSON.stringify(tastingNotesExpected)
              : null,
          }),
        },
        include: { roaster: true },
      });

      return bean;
    } catch {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Bean not found',
      });
    }
  });

  // DELETE /api/beans/:id
  server.delete('/beans/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await prisma.bean.delete({ where: { id } });
      return { success: true };
    } catch {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Bean not found',
      });
    }
  });

  // POST /api/beans/:id/bags
  server.post('/beans/:id/bags', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = BagCreateSchema.omit({ beanId: true }).safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: body.error.message,
      });
    }

    // Build bag data - handle frozen bag creation
    const bagData: Record<string, any> = {
      beanId: id,
      ...body.data,
    };

    // Initialize remainingGrams from bagSizeGrams if provided
    if (bagData.bagSizeGrams && bagData.remainingGrams === undefined) {
      bagData.remainingGrams = bagData.bagSizeGrams;
    }

    // If creating a frozen bag, set frozenAt automatically
    if (bagData.status === 'FROZEN') {
      bagData.frozenAt = bagData.frozenAt || new Date();
      bagData.isAvailable = false;
    }

    // Create the bag - recipes are now on the bean, no inheritance needed per bag
    const bag = await prisma.bag.create({
      data: bagData as any,
    });

    return bag;
  });

  // PATCH /api/beans/:id/recipes/:methodId
  server.patch('/beans/:id/recipes/:methodId', async (request, reply) => {
    const { id: beanId, methodId } = request.params as { id: string; methodId: string };
    const { grinderTarget, recipeOverrides } = request.body as any;

    const recipe = await prisma.beanMethodRecipe.upsert({
      where: {
        beanId_methodId: { beanId, methodId },
      },
      update: {
        grinderTarget,
        recipeOverrides: recipeOverrides ? JSON.stringify(recipeOverrides) : undefined,
      },
      create: {
        beanId,
        methodId,
        grinderTarget,
        recipeOverrides: recipeOverrides ? JSON.stringify(recipeOverrides) : undefined,
      },
    });

    return recipe;
  });

  // DELETE /api/beans/:id/recipes/:methodId
  server.delete('/beans/:id/recipes/:methodId', async (request, reply) => {
    const { id: beanId, methodId } = request.params as { id: string; methodId: string };

    await prisma.beanMethodRecipe.delete({
      where: {
        beanId_methodId: { beanId, methodId },
      },
    });

    return { success: true };
  });
}
