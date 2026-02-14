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

    // Get available bags (non-frozen)
    const bags = await prisma.bag.findMany({
      where: { isAvailable: true, status: { not: 'FROZEN' } },
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

    // Get frozen bags separately
    const frozenBagsRaw = await prisma.bag.findMany({
      where: { status: 'FROZEN' },
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

    // Filter and transform available bags
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

    // Transform frozen bags (no recipe filter — show all frozen bags)
    const frozenBags = frozenBagsRaw.map((bag) => {
      const lastBrew = bag.brewLogs[0];
      return {
        ...bag,
        lastBrew: lastBrew
          ? { brewedAt: lastBrew.brewedAt, computedScore: lastBrew.computedScore }
          : undefined,
        grinderDelta: undefined,
      };
    });

    return {
      bags: bagsWithDelta,
      frozenBags,
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

    // Get current bag to check status transitions
    const currentBag = await prisma.bag.findUnique({ where: { id } });
    if (!currentBag) {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Bag not found',
      });
    }

    const updateData: Record<string, any> = { ...body.data };

    // Handle freeze transition: any status -> FROZEN
    if (body.data.status === 'FROZEN' && currentBag.status !== 'FROZEN') {
      updateData.frozenAt = new Date();
      updateData.isAvailable = false;
    }

    // Handle unfreeze transition: FROZEN -> OPEN (thaw)
    if (body.data.status && body.data.status !== 'FROZEN' && currentBag.status === 'FROZEN') {
      // Calculate days spent in this freeze cycle
      if (currentBag.frozenAt) {
        const now = new Date();
        const frozenDate = new Date(currentBag.frozenAt);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const frozenDay = new Date(frozenDate.getFullYear(), frozenDate.getMonth(), frozenDate.getDate());
        const frozenDays = Math.floor((today.getTime() - frozenDay.getTime()) / (1000 * 60 * 60 * 24));
        updateData.totalFrozenDays = currentBag.totalFrozenDays + frozenDays;
      }
      updateData.frozenAt = null;
      // When unfreezing, default to OPEN and available
      if (body.data.status === 'OPEN' || !body.data.status) {
        updateData.status = 'OPEN';
        updateData.isAvailable = true;
        updateData.openedDate = new Date();
      }
    }

    try {
      const bag = await prisma.bag.update({
        where: { id },
        data: updateData,
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
