import { prisma } from '../db/client.js';
import { computeBestScore } from '@kissa/shared';
export async function analyticsRoutes(server) {
    // GET /api/analytics/map
    server.get('/analytics/map', async (request) => {
        const { availableOnly } = request.query;
        const beans = await prisma.bean.findMany({
            where: availableOnly === 'true'
                ? { bags: { some: { isAvailable: true } } }
                : {},
            include: {
                bags: {
                    include: {
                        brewLogs: {
                            select: { computedScore: true },
                        },
                    },
                },
            },
        });
        // Group by country
        const countryMap = new Map();
        for (const bean of beans) {
            if (!bean.originCountry)
                continue;
            const country = bean.originCountry;
            const current = countryMap.get(country) || { count: 0, scores: [] };
            current.count += 1;
            for (const bag of bean.bags) {
                for (const brew of bag.brewLogs) {
                    if (brew.computedScore !== null) {
                        current.scores.push(brew.computedScore);
                    }
                }
            }
            countryMap.set(country, current);
        }
        // Transform to response format
        const mapData = Array.from(countryMap.entries()).map(([countryCode, data]) => ({
            countryCode,
            countryName: countryCode, // Could add a country name lookup
            count: data.count,
            avgScore: data.scores.length > 0
                ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
                : null,
        }));
        return mapData;
    });
    // GET /api/analytics/country/:code
    server.get('/analytics/country/:code', async (request) => {
        const { code } = request.params;
        const beans = await prisma.bean.findMany({
            where: { originCountry: code },
            include: {
                roaster: true,
                bags: {
                    include: {
                        brewLogs: {
                            select: { computedScore: true },
                        },
                    },
                },
            },
        });
        // Group by region
        const regionMap = new Map();
        for (const bean of beans) {
            const region = bean.originRegion || 'Unknown';
            const current = regionMap.get(region) || [];
            current.push(bean);
            regionMap.set(region, current);
        }
        // Transform to response format
        const regions = Array.from(regionMap.entries()).map(([regionName, regionBeans]) => {
            const beanRankings = regionBeans.map((bean) => {
                const scores = bean.bags.flatMap((bag) => bag.brewLogs
                    .map((b) => b.computedScore)
                    .filter((s) => s !== null));
                return {
                    bean: {
                        ...bean,
                        bags: undefined, // Don't include full bags
                    },
                    brewCount: scores.length,
                    avgScore: scores.length > 0
                        ? scores.reduce((a, b) => a + b, 0) / scores.length
                        : null,
                    bestScore: computeBestScore(scores),
                };
            });
            // Sort by best score
            beanRankings.sort((a, b) => b.bestScore - a.bestScore);
            return {
                regionName,
                beans: beanRankings,
            };
        });
        return {
            countryCode: code,
            countryName: code,
            regions,
        };
    });
    // GET /api/analytics/region/:code (format: country/region)
    server.get('/analytics/region/:code', async (request) => {
        const { code } = request.params;
        const [countryCode, regionName] = code.split('/');
        const beans = await prisma.bean.findMany({
            where: {
                originCountry: countryCode,
                originRegion: regionName || undefined,
            },
            include: {
                roaster: true,
                bags: {
                    include: {
                        brewLogs: {
                            select: { computedScore: true },
                        },
                    },
                },
            },
        });
        const beanRankings = beans.map((bean) => {
            const scores = bean.bags.flatMap((bag) => bag.brewLogs
                .map((b) => b.computedScore)
                .filter((s) => s !== null));
            return {
                bean: {
                    ...bean,
                    bags: undefined,
                },
                brewCount: scores.length,
                avgScore: scores.length > 0
                    ? scores.reduce((a, b) => a + b, 0) / scores.length
                    : null,
                bestScore: computeBestScore(scores),
            };
        });
        beanRankings.sort((a, b) => b.bestScore - a.bestScore);
        return {
            countryCode,
            regionName: regionName || 'All',
            beans: beanRankings,
        };
    });
}
//# sourceMappingURL=analytics.js.map