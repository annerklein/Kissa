import { prisma } from '../db/client.js';
import { OnboardingDataSchema } from '@kissa/shared';
export async function onboardingRoutes(server) {
    // POST /api/onboarding
    server.post('/onboarding', async (request, reply) => {
        const body = OnboardingDataSchema.safeParse(request.body);
        if (!body.success) {
            return reply.status(400).send({
                error: 'ValidationError',
                message: body.error.message,
            });
        }
        const { settings, grinder, beans } = body.data;
        // Use a transaction to create everything
        await prisma.$transaction(async (tx) => {
            // Create/update settings
            await tx.settings.upsert({
                where: { id: 'default' },
                update: {
                    defaultServings: settings.defaultServings,
                    gramsPerServing: settings.gramsPerServing,
                },
                create: {
                    id: 'default',
                    defaultServings: settings.defaultServings,
                    gramsPerServing: settings.gramsPerServing,
                },
            });
            // Create/update grinder state
            await tx.grinderState.upsert({
                where: { id: 'default' },
                update: {
                    grinderModel: grinder.model,
                    currentSetting: grinder.currentSetting,
                },
                create: {
                    id: 'default',
                    grinderModel: grinder.model,
                    currentSetting: grinder.currentSetting,
                },
            });
            // Create beans with roasters and bags
            for (const beanData of beans) {
                // Find or create roaster
                let roaster = await tx.roaster.findFirst({
                    where: { name: beanData.roasterName },
                });
                if (!roaster) {
                    roaster = await tx.roaster.create({
                        data: { name: beanData.roasterName },
                    });
                }
                // Create bean
                const bean = await tx.bean.create({
                    data: {
                        roasterId: roaster.id,
                        name: beanData.name,
                        originCountry: beanData.originCountry,
                        originRegion: beanData.originRegion,
                        roastLevel: beanData.roastLevel || 'MEDIUM',
                        tastingNotesExpected: beanData.tastingNotesExpected
                            ? JSON.stringify(beanData.tastingNotesExpected)
                            : null,
                    },
                });
                // Create bag
                await tx.bag.create({
                    data: {
                        beanId: bean.id,
                        roastDate: beanData.bag.roastDate,
                        isAvailable: beanData.bag.isAvailable,
                        status: 'OPEN',
                    },
                });
            }
        });
        return { success: true };
    });
    // GET /api/onboarding/status
    server.get('/onboarding/status', async () => {
        const [settings, grinder, beans] = await Promise.all([
            prisma.settings.findFirst(),
            prisma.grinderState.findFirst(),
            prisma.bean.count(),
        ]);
        const isComplete = !!(settings && grinder && beans > 0);
        return {
            isComplete,
            hasSettings: !!settings,
            hasGrinder: !!grinder,
            beanCount: beans,
        };
    });
}
//# sourceMappingURL=onboarding.js.map