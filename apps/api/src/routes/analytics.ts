import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client.js';
import { computeBestScore } from '@kissa/shared';

export async function analyticsRoutes(server: FastifyInstance) {
  // GET /api/analytics/map
  server.get('/analytics/map', async (request) => {
    const { availableOnly } = request.query as { availableOnly?: string };

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
    const countryMap = new Map<string, {
      count: number;
      scores: number[];
    }>();

    for (const bean of beans) {
      if (!bean.originCountry) continue;

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
    const { code } = request.params as { code: string };

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
    const regionMap = new Map<string, typeof beans>();

    for (const bean of beans) {
      const region = bean.originRegion || 'Unknown';
      const current = regionMap.get(region) || [];
      current.push(bean);
      regionMap.set(region, current);
    }

    // Transform to response format
    const regions = Array.from(regionMap.entries()).map(([regionName, regionBeans]) => {
      const beanRankings = regionBeans.map((bean) => {
        const scores = bean.bags.flatMap((bag) =>
          bag.brewLogs
            .map((b) => b.computedScore)
            .filter((s): s is number => s !== null)
        );

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

  // GET /api/analytics/stats?period=all|year|90d|30d
  server.get('/analytics/stats', async (request) => {
    const { period } = request.query as { period?: string };

    // Compute cutoff date based on period
    let cutoffDate: Date | null = null;
    const now = new Date();
    switch (period) {
      case 'year': {
        cutoffDate = new Date(now.getFullYear(), 0, 1); // Jan 1 of current year
        break;
      }
      case '90d': {
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      }
      case '30d': {
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      }
      default:
        // 'all' or unspecified — no filter
        break;
    }

    const where = cutoffDate ? { brewedAt: { gte: cutoffDate } } : {};

    const brews = await prisma.brewLog.findMany({
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
      orderBy: { brewedAt: 'asc' },
    });

    // --- Summary ---
    const scores = brews
      .map((b) => b.computedScore)
      .filter((s): s is number => s !== null);
    const totalBrews = brews.length;
    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null;
    const bestScore = scores.length > 0 ? Math.max(...scores) : null;

    // Find the bean that achieved the best score
    let bestScoreBean: { beanId: string; beanName: string; roasterName: string } | null = null;
    if (bestScore !== null) {
      const bestBrew = brews.find((b) => b.computedScore === bestScore);
      if (bestBrew) {
        bestScoreBean = {
          beanId: bestBrew.bag.beanId,
          beanName: bestBrew.bag.bean.name,
          roasterName: bestBrew.bag.bean.roaster?.name || 'Unknown',
        };
      }
    }

    const beanIdSet = new Set<string>();
    const roasterIdSet = new Set<string>();
    for (const brew of brews) {
      beanIdSet.add(brew.bag.beanId);
      if (brew.bag.bean.roaster) {
        roasterIdSet.add(brew.bag.bean.roaster.id);
      }
    }
    const uniqueBeans = beanIdSet.size;
    const uniqueRoasters = roasterIdSet.size;

    // --- Method Breakdown ---
    const methodMap = new Map<string, { name: string; displayName: string; scores: number[] }>();
    for (const brew of brews) {
      const key = brew.method.id;
      const current = methodMap.get(key) || {
        name: brew.method.name,
        displayName: brew.method.displayName,
        scores: [],
      };
      if (brew.computedScore !== null) {
        current.scores.push(brew.computedScore);
      } else {
        // Count unrated brews too — push nothing but ensure entry exists
      }
      if (!methodMap.has(key)) methodMap.set(key, current);
    }
    // We need total brew count per method, not just scored ones
    const methodBrewCounts = new Map<string, number>();
    for (const brew of brews) {
      methodBrewCounts.set(brew.method.id, (methodBrewCounts.get(brew.method.id) || 0) + 1);
    }
    const methodBreakdown = Array.from(methodMap.entries()).map(([id, data]) => ({
      methodName: data.name,
      displayName: data.displayName,
      brewCount: methodBrewCounts.get(id) || 0,
      avgScore: data.scores.length > 0
        ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
        : null,
    }));
    // Sort by brew count descending
    methodBreakdown.sort((a, b) => b.brewCount - a.brewCount);

    // --- Top Beans ---
    const beanMap = new Map<string, { name: string; roasterName: string; scores: number[] }>();
    for (const brew of brews) {
      const beanId = brew.bag.beanId;
      const current = beanMap.get(beanId) || {
        name: brew.bag.bean.name,
        roasterName: brew.bag.bean.roaster?.name || 'Unknown',
        scores: [],
      };
      if (brew.computedScore !== null) {
        current.scores.push(brew.computedScore);
      }
      if (!beanMap.has(beanId)) beanMap.set(beanId, current);
    }
    const topBeans = Array.from(beanMap.entries())
      .filter(([, data]) => data.scores.length >= 2)
      .map(([beanId, data]) => ({
        beanId,
        beanName: data.name,
        roasterName: data.roasterName,
        brewCount: data.scores.length,
        avgScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    // --- Average Rating Sliders ---
    const sliderTotals = { balance: 0, sweetness: 0, clarity: 0, body: 0, finish: 0 };
    let sliderCount = 0;
    for (const brew of brews) {
      if (brew.ratingSliders) {
        try {
          const sliders = JSON.parse(brew.ratingSliders);
          if (sliders.balance !== undefined) {
            sliderTotals.balance += sliders.balance;
            sliderTotals.sweetness += sliders.sweetness;
            sliderTotals.clarity += sliders.clarity;
            sliderTotals.body += sliders.body;
            sliderTotals.finish += sliders.finish;
            sliderCount++;
          }
        } catch {
          // skip malformed JSON
        }
      }
    }
    const avgSliders = sliderCount > 0
      ? {
          balance: sliderTotals.balance / sliderCount,
          sweetness: sliderTotals.sweetness / sliderCount,
          clarity: sliderTotals.clarity / sliderCount,
          body: sliderTotals.body / sliderCount,
          finish: sliderTotals.finish / sliderCount,
        }
      : { balance: null, sweetness: null, clarity: null, body: null, finish: null };

    // --- Top Tasting Notes ---
    const noteMap = new Map<string, number>();
    for (const brew of brews) {
      if (brew.tastingNotesActual) {
        try {
          const notes: string[] = JSON.parse(brew.tastingNotesActual);
          for (const note of notes) {
            noteMap.set(note, (noteMap.get(note) || 0) + 1);
          }
        } catch {
          // skip malformed JSON
        }
      }
    }
    const topTastingNotes = Array.from(noteMap.entries())
      .map(([note, count]) => ({ note, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // --- Brew Activity ---
    // For 30d: group by day (last 30 days)
    // For 90d/year: group by week
    // For all: group by month
    const brewActivity: Array<{ label: string; count: number; avgScore: number | null }> = [];

    if (period === '30d') {
      // Group by day for last 30 days
      const dayMap = new Map<string, { count: number; scores: number[] }>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = `${d.getMonth() + 1}/${d.getDate()}`;
        dayMap.set(key, { count: 0, scores: [] });
      }
      for (const brew of brews) {
        const d = new Date(brew.brewedAt);
        const key = `${d.getMonth() + 1}/${d.getDate()}`;
        const entry = dayMap.get(key);
        if (entry) {
          entry.count++;
          if (brew.computedScore !== null) entry.scores.push(brew.computedScore);
        }
      }
      for (const [label, data] of dayMap) {
        brewActivity.push({
          label,
          count: data.count,
          avgScore: data.scores.length > 0
            ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
            : null,
        });
      }
    } else if (period === '90d' || period === 'year') {
      // Group by week
      const weekMap = new Map<string, { count: number; scores: number[] }>();
      const startDate = cutoffDate || new Date(0);
      // Generate week buckets
      const msPerWeek = 7 * 24 * 60 * 60 * 1000;
      const weeksCount = Math.ceil((now.getTime() - startDate.getTime()) / msPerWeek);
      for (let i = 0; i < weeksCount; i++) {
        const weekStart = new Date(startDate.getTime() + i * msPerWeek);
        const key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
        weekMap.set(key, { count: 0, scores: [] });
      }
      for (const brew of brews) {
        const brewTime = new Date(brew.brewedAt).getTime();
        const weekIdx = Math.floor((brewTime - startDate.getTime()) / msPerWeek);
        const weekStart = new Date(startDate.getTime() + weekIdx * msPerWeek);
        const key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
        const entry = weekMap.get(key);
        if (entry) {
          entry.count++;
          if (brew.computedScore !== null) entry.scores.push(brew.computedScore);
        }
      }
      for (const [label, data] of weekMap) {
        brewActivity.push({
          label,
          count: data.count,
          avgScore: data.scores.length > 0
            ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
            : null,
        });
      }
    } else {
      // All time: group by month
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthMap = new Map<string, { count: number; scores: number[] }>();
      for (const brew of brews) {
        const d = new Date(brew.brewedAt);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        const current = monthMap.get(key) || { count: 0, scores: [] };
        current.count++;
        if (brew.computedScore !== null) current.scores.push(brew.computedScore);
        if (!monthMap.has(key)) monthMap.set(key, current);
      }
      for (const [label, data] of monthMap) {
        brewActivity.push({
          label,
          count: data.count,
          avgScore: data.scores.length > 0
            ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
            : null,
        });
      }
    }

    return {
      period: period || 'all',
      totalBrews,
      ratedBrews: scores.length,
      avgScore,
      bestScore,
      bestScoreBean,
      uniqueBeans,
      uniqueRoasters,
      methodBreakdown,
      topBeans,
      avgSliders,
      topTastingNotes,
      brewActivity,
    };
  });

  // GET /api/analytics/region/:code (format: country/region)
  server.get('/analytics/region/:code', async (request) => {
    const { code } = request.params as { code: string };
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
      const scores = bean.bags.flatMap((bag) =>
        bag.brewLogs
          .map((b) => b.computedScore)
          .filter((s): s is number => s !== null)
      );

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
