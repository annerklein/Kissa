import { prisma } from '../db/client.js';
import { GrinderApplySchema } from '@kissa/shared';
export async function grinderRoutes(server) {
    // GET /api/grinder
    server.get('/grinder', async () => {
        let grinder = await prisma.grinderState.findFirst();
        if (!grinder) {
            grinder = await prisma.grinderState.create({
                data: {
                    id: 'default',
                    grinderModel: 'Comandante C40',
                    currentSetting: 20,
                },
            });
        }
        return grinder;
    });
    // POST /api/grinder/apply
    server.post('/grinder/apply', async (request, reply) => {
        const body = GrinderApplySchema.safeParse(request.body);
        if (!body.success) {
            return reply.status(400).send({
                error: 'ValidationError',
                message: body.error.message,
            });
        }
        let grinder = await prisma.grinderState.findFirst();
        if (!grinder) {
            grinder = await prisma.grinderState.create({
                data: {
                    id: 'default',
                    grinderModel: 'Comandante C40',
                    currentSetting: body.data.newSetting,
                },
            });
        }
        else {
            grinder = await prisma.grinderState.update({
                where: { id: grinder.id },
                data: { currentSetting: body.data.newSetting },
            });
        }
        return grinder;
    });
    // PATCH /api/grinder (update model)
    server.patch('/grinder', async (request, reply) => {
        const { grinderModel } = request.body;
        if (!grinderModel) {
            return reply.status(400).send({
                error: 'ValidationError',
                message: 'grinderModel is required',
            });
        }
        let grinder = await prisma.grinderState.findFirst();
        if (!grinder) {
            grinder = await prisma.grinderState.create({
                data: {
                    id: 'default',
                    grinderModel,
                    currentSetting: 20,
                },
            });
        }
        else {
            grinder = await prisma.grinderState.update({
                where: { id: grinder.id },
                data: { grinderModel },
            });
        }
        return grinder;
    });
}
//# sourceMappingURL=grinder.js.map