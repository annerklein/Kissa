import { prisma } from '../db/client.js';
// Define the preferred order for methods
const METHOD_ORDER = ['v60', 'moka', 'espresso', 'french_press'];
export async function methodsRoutes(server) {
    // GET /api/methods
    server.get('/methods', async () => {
        const methods = await prisma.method.findMany({
            where: { isActive: true },
        });
        // Sort by our defined order
        return methods.sort((a, b) => {
            const orderA = METHOD_ORDER.indexOf(a.name);
            const orderB = METHOD_ORDER.indexOf(b.name);
            // If not in the order list, put at the end
            return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
        });
    });
    // GET /api/methods/:id
    server.get('/methods/:id', async (request, reply) => {
        const { id } = request.params;
        const method = await prisma.method.findUnique({
            where: { id },
        });
        if (!method) {
            return reply.status(404).send({
                error: 'NotFound',
                message: 'Method not found',
            });
        }
        // Parse JSON fields
        return {
            ...method,
            scalingRules: method.scalingRules ? JSON.parse(method.scalingRules) : null,
            defaultParams: method.defaultParams ? JSON.parse(method.defaultParams) : null,
            steps: method.steps ? JSON.parse(method.steps) : null,
        };
    });
    // GET /api/methods/name/:name
    server.get('/methods/name/:name', async (request, reply) => {
        const { name } = request.params;
        const method = await prisma.method.findUnique({
            where: { name },
        });
        if (!method) {
            return reply.status(404).send({
                error: 'NotFound',
                message: 'Method not found',
            });
        }
        return {
            ...method,
            scalingRules: method.scalingRules ? JSON.parse(method.scalingRules) : null,
            defaultParams: method.defaultParams ? JSON.parse(method.defaultParams) : null,
            steps: method.steps ? JSON.parse(method.steps) : null,
        };
    });
}
//# sourceMappingURL=methods.js.map