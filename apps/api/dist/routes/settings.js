import { prisma } from '../db/client.js';
import { SettingsUpdateSchema } from '@kissa/shared';
export async function settingsRoutes(server) {
    // GET /api/settings
    server.get('/settings', async () => {
        let settings = await prisma.settings.findFirst();
        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    id: 'default',
                    defaultServings: 2,
                    gramsPerServing: 15,
                },
            });
        }
        return settings;
    });
    // PATCH /api/settings
    server.patch('/settings', async (request, reply) => {
        const body = SettingsUpdateSchema.safeParse(request.body);
        if (!body.success) {
            return reply.status(400).send({
                error: 'ValidationError',
                message: body.error.message,
            });
        }
        let settings = await prisma.settings.findFirst();
        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    id: 'default',
                    ...body.data,
                },
            });
        }
        else {
            settings = await prisma.settings.update({
                where: { id: settings.id },
                data: body.data,
            });
        }
        return settings;
    });
}
//# sourceMappingURL=settings.js.map