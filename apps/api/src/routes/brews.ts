import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client.js';
import { BrewLogCreateSchema, BrewLogRatingSchema, computeSmartScore } from '@kissa/shared';
import { generateSuggestion } from '../recommendation/engine.js';

export async function brewsRoutes(server: FastifyInstance) {
  // GET /api/brews
  server.get('/brews', async (request) => {
    const { bagId } = request.query as { bagId?: string };

    const where = bagId ? { bagId } : {};

    return prisma.brewLog.findMany({
      where,
      include: {
        bag: {
          include: {
            bean: {
              include: { roaster: true },
            },
          },
        },
        method: true,
      },
      orderBy: { brewedAt: 'desc' },
    });
  });

  // GET /api/brews/screen (for brew screen data)
  server.get('/brews/screen', async (request, reply) => {
    const { bagId, methodId } = request.query as { bagId: string; methodId: string };

    if (!bagId || !methodId) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: 'bagId and methodId are required',
      });
    }

    const [bag, method, grinder, settings] = await Promise.all([
      prisma.bag.findUnique({
        where: { id: bagId },
        include: {
          bean: {
            include: { 
              roaster: true,
              recipes: {
                where: { methodId }
              }
            },
          },
        },
      }),
      prisma.method.findUnique({ where: { id: methodId } }),
      prisma.grinderState.findFirst(),
      prisma.settings.findFirst(),
    ]);

    if (!bag || !method) {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Bag or method not found',
      });
    }

    const recipeRecord = bag.bean.recipes[0] || null;
    const defaultParams = method.defaultParams ? JSON.parse(method.defaultParams) : {};
    const steps = method.steps ? JSON.parse(method.steps) : [];
    const scalingRules = method.scalingRules ? JSON.parse(method.scalingRules) : { scalesPours: true, scalesDose: true, scalesWater: true };
    
    // Merge recipe overrides from bean-level recipe
    const recipeOverrides = recipeRecord?.recipeOverrides ? 
      (typeof recipeRecord.recipeOverrides === 'string' ? JSON.parse(recipeRecord.recipeOverrides) : recipeRecord.recipeOverrides) : {};
    
    const recipe = {
      ...defaultParams,
      ...recipeOverrides,
    };

    // Calculate scaled recipe
    const defaultServings = settings?.defaultServings || 2;
    const defaultGramsPerServing = recipe.dose || settings?.gramsPerServing || 15;
    const dose = defaultServings * defaultGramsPerServing;
    
    // Use recipe ratio if water scaling is enabled, otherwise calculate it if water/dose provided
    let ratio = recipe.ratio;
    let water = undefined;
    
    if (scalingRules.scalesWater) {
      if (!ratio && recipe.water && recipe.dose) {
        ratio = recipe.water / recipe.dose;
      }
      ratio = ratio || 16;
      water = dose * ratio;
    } else {
      ratio = undefined;
      water = undefined;
    }

    return {
      bag,
      method: {
        ...method,
        scalingRules,
        defaultParams,
        steps,
      },
      recipe: recipeRecord,
      currentGrinderSetting: grinder?.currentSetting || 20,
      scaledRecipe: {
        dose,
        water,
        ratio,
        gramsPerServing: defaultGramsPerServing,
        grindSize: recipeRecord?.grinderTarget || recipe.grindSize || 20,
        waterTemp: recipe.waterTemp,
        steps: steps.map((step: { waterRatio?: number; [key: string]: unknown }) => ({
          ...step,
          waterAmount: step.waterRatio && ratio ? (step.waterRatio / ratio) * (water || 0) : undefined,
        })),
      },
    };
  });

  // GET /api/brews/:id
  server.get('/brews/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const brew = await prisma.brewLog.findUnique({
      where: { id },
      include: {
        bag: {
          include: {
            bean: {
              include: { roaster: true },
            },
          },
        },
        method: true,
      },
    });

    if (!brew) {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Brew not found',
      });
    }

    return brew;
  });

  // POST /api/brews
  server.post('/brews', async (request, reply) => {
    const body = BrewLogCreateSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: body.error.message,
      });
    }

    const { parameters, ...rest } = body.data;

    // Update grinder setting to match the recipe's grind size
    if (parameters?.grindSize) {
      let grinder = await prisma.grinderState.findFirst();
      if (grinder) {
        await prisma.grinderState.update({
          where: { id: grinder.id },
          data: { currentSetting: parameters.grindSize },
        });
      } else {
        await prisma.grinderState.create({
          data: {
            id: 'default',
            grinderModel: 'Comandante C40',
            currentSetting: parameters.grindSize,
          },
        });
      }
    }

    const brew = await prisma.brewLog.create({
      data: {
        ...rest,
        parameters: parameters ? JSON.stringify(parameters) : null,
      },
      include: {
        bag: {
          include: {
            bean: {
              include: { roaster: true },
            },
          },
        },
        method: true,
      },
    });

    return brew;
  });

  // PATCH /api/brews/:id
  server.patch('/brews/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = BrewLogCreateSchema.partial().safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: body.error.message,
      });
    }

    const { parameters, ...rest } = body.data;

    try {
      const brew = await prisma.brewLog.update({
        where: { id },
        data: {
          ...rest,
          ...(parameters && { parameters: JSON.stringify(parameters) }),
        },
      });

      return brew;
    } catch {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Brew not found',
      });
    }
  });

  // PATCH /api/brews/:id/rating
  server.patch('/brews/:id/rating', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = BrewLogRatingSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: body.error.message,
      });
    }

    // Get the brew with previous brews for context
    const brew = await prisma.brewLog.findUnique({
      where: { id },
      include: {
        method: true,
        bag: {
          include: {
            brewLogs: {
              where: { id: { not: id } },
              orderBy: { brewedAt: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    if (!brew) {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Brew not found',
      });
    }

    // Calculate score
    const computedScore = computeSmartScore(body.data.ratingSliders);

    // Generate suggestion
    const suggestion = generateSuggestion({
      method: brew.method.name as 'v60' | 'moka',
      sliders: body.data.ratingSliders,
      drawdownTime: body.data.drawdownTime,
      parameters: brew.parameters ? JSON.parse(brew.parameters) : {},
      previousBrews: brew.bag.brewLogs.map((b) => ({
        ...b,
        ratingSliders: b.ratingSliders ? JSON.parse(b.ratingSliders) : null,
        parameters: b.parameters ? JSON.parse(b.parameters) : null,
      })),
    });

    // Update the brew
    const updatedBrew = await prisma.brewLog.update({
      where: { id },
      data: {
        ratingSliders: JSON.stringify(body.data.ratingSliders),
        drawdownTime: body.data.drawdownTime,
        tastingNotesActual: body.data.tastingNotesActual
          ? JSON.stringify(body.data.tastingNotesActual)
          : null,
        notes: body.data.notes,
        computedScore,
        suggestionShown: JSON.stringify(suggestion),
      },
    });

    return {
      brew: updatedBrew,
      computedScore,
      suggestion,
    };
  });

  // POST /api/brews/:id/apply-suggestion
  server.post('/brews/:id/apply-suggestion', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { applyTo } = request.body as { applyTo: 'bag' | 'next' };

    const brew = await prisma.brewLog.findUnique({
      where: { id },
      include: { 
        method: true,
        bag: {
          include: {
            bean: true
          }
        }
      },
    });

    if (!brew || !brew.suggestionShown) {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Brew or suggestion not found',
      });
    }

    // Mark suggestion as accepted
    await prisma.brewLog.update({
      where: { id },
      data: { suggestionAccepted: true },
    });

    // If applying to bean, update the bean's recipe
    if (applyTo === 'bag') {
      const suggestion = JSON.parse(brew.suggestionShown);

      // Apply grind changes to bean recipe
      if (suggestion.primary?.variable === 'grind') {
        const currentRecipe = await prisma.beanMethodRecipe.findUnique({
          where: {
            beanId_methodId: { beanId: brew.bag.beanId, methodId: brew.methodId },
          },
        });

        if (currentRecipe?.grinderTarget) {
          const adjustment = suggestion.primary.action.includes('finer') ? -1 : 1;
          await prisma.beanMethodRecipe.update({
            where: { id: currentRecipe.id },
            data: { grinderTarget: currentRecipe.grinderTarget + adjustment },
          });
        }
      }
    }

    return { success: true, appliedTo: applyTo };
  });

  // DELETE /api/brews/:id
  server.delete('/brews/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await prisma.brewLog.delete({ where: { id } });
      return { success: true };
    } catch {
      return reply.status(404).send({
        error: 'NotFound',
        message: 'Brew not found',
      });
    }
  });
}
