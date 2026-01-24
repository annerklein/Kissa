import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client.js';
import { BagUpdateSchema, computeGrinderDelta } from '@kissa/shared';

export async function bagsRoutes(server: FastifyInstance) {
  // GET /api/bags
  server.get('/bags', async () => {
    return prisma.bag.findMany({
      include: {
        bean: {
          include: { 
            roaster: true,
            recipes: true
          },
        },
      },
      orderBy: { roastDate: 'desc' },
    });
  });

  // GET /api/available-beans
  server.get('/available-beans', async (request) => {
    const { methodId } = request.query as { methodId?: string };

    // Get current grinder state
    let grinder = await prisma.grinderState.findFirst();
    if (!grinder) {
      grinder = await prisma.grinderState.create({
        data: { id: 'default', grinderModel: 'Comandante C40', currentSetting: 20 },
      });
    }

    // Get default method if not specified
    let selectedMethodId = methodId;
    if (!selectedMethodId) {
      const defaultMethod = await prisma.method.findFirst({
        where: { name: 'v60' },
      });
      selectedMethodId = defaultMethod?.id;
    }

    // Get available bags
    const bags = await prisma.bag.findMany({
      where: { isAvailable: true },
      include: {
        bean: {
          include: { 
            roaster: true,
            recipes: true
          },
        },
        brewLogs: {
          orderBy: { brewedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { roastDate: 'desc' },
    });

    // Filter and transform - only include bags that have a recipe for the selected method on the bean
    const bagsWithDelta = bags
      .filter((bag) => {
        const hasRecipe = bag.bean.recipes.some((r) => r.methodId === selectedMethodId);
        return hasRecipe;
      })
      .map((bag) => {
        const recipe = bag.bean.recipes.find((r) => r.methodId === selectedMethodId);
        const lastBrew = bag.brewLogs[0];

        let grinderDelta = undefined;
        if (recipe?.grinderTarget) {
          grinderDelta = computeGrinderDelta(
            grinder!.currentSetting,
            recipe.grinderTarget
          );
        }

        return {
          ...bag,
          lastBrew: lastBrew
            ? { brewedAt: lastBrew.brewedAt, computedScore: lastBrew.computedScore }
            : undefined,
          grinderDelta,
        };
      });

    return {
      bags: bagsWithDelta,
      currentGrinderSetting: grinder.currentSetting,
      selectedMethodId,
    };
  });

  // GET /api/bags/:id
  server.get('/bags/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const bag = await prisma.bag.findUnique({
      where: { id },
      include: {
        bean: {
          include: { 
            roaster: true,
            recipes: true
          },
        },
        brewLogs: {
          orderBy: { brewedAt: 'desc' },
        },
      },
    });

    if (!bag) {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Bag not found',
      });
    }

    return bag;
  });

  // PATCH /api/bags/:id
  server.patch('/bags/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = BagUpdateSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: body.error.message,
      });
    }

    try {
      const bag = await prisma.bag.update({
        where: { id },
        data: body.data,
        include: {
          bean: {
            include: { roaster: true },
          },
        },
      });

      return bag;
    } catch {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Bag not found',
      });
    }
  });

  // DELETE /api/bags/:id
  server.delete('/bags/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await prisma.bag.delete({ where: { id } });
      return { success: true };
    } catch {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Bag not found',
      });
    }
  });
}
