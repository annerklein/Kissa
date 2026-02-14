'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001');

type Period = 'all' | 'year' | '90d' | '30d';

interface StatsData {
  period: string;
  totalBrews: number;
  avgScore: number | null;
  bestScore: number | null;
  bestScoreBean: { beanId: string; beanName: string; roasterName: string } | null;
  uniqueBeans: number;
  uniqueRoasters: number;
  methodBreakdown: Array<{
    methodName: string;
    displayName: string;
    brewCount: number;
    avgScore: number | null;
  }>;
  topBeans: Array<{
    beanId: string;
    beanName: string;
    roasterName: string;
    brewCount: number;
    avgScore: number;
  }>;
  avgSliders: {
    balance: number | null;
    sweetness: number | null;
    clarity: number | null;
    body: number | null;
    finish: number | null;
  };
  topTastingNotes: Array<{
    note: string;
    count: number;
  }>;
  brewActivity: Array<{
    label: string;
    count: number;
    avgScore: number | null;
  }>;
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'year', label: 'This Year' },
  { value: '90d', label: '90 Days' },
  { value: '30d', label: '30 Days' },
];

async function fetchStats(period: Period): Promise<StatsData> {
  const res = await fetch(`${API_URL}/api/analytics/stats?period=${period}`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

function formatScore(score: number | null): string {
  if (score === null) return '—';
  return score.toFixed(1);
}

export function BrewStats() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('all');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics-stats', period],
    queryFn: () => fetchStats(period),
  });

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-coffee-500 animate-pulse">Crunching numbers...</div>
      </div>
    );
  }

  const maxBrewCount = Math.max(...stats.brewActivity.map((a) => a.count), 1);
  const maxMethodCount = Math.max(...stats.methodBreakdown.map((m) => m.brewCount), 1);

  return (
    <div>
      {/* Period Filter */}
      <div className="flex gap-2 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${
              period === opt.value
                ? 'bg-gradient-to-br from-coffee-800 to-coffee-900 text-white shadow-lg'
                : 'bg-coffee-100 text-coffee-600 hover:bg-coffee-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {stats.totalBrews === 0 ? (
        <div className="card text-center py-12 animate-fade-in">
          <p className="text-4xl mb-3">☕</p>
          <p className="text-coffee-600 font-medium">No brews in this period</p>
          <p className="text-coffee-400 text-sm mt-1">Start brewing to see your stats!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <SummaryCard label="Total Brews" value={stats.totalBrews.toString()} icon="☕" />
            <SummaryCard label="Avg Score" value={formatScore(stats.avgScore)} icon="⭐" />
            <SummaryCard
              label="Best Score"
              value={formatScore(stats.bestScore)}
              icon="🏆"
              subtitle={stats.bestScoreBean ? stats.bestScoreBean.beanName : undefined}
            />
            <SummaryCard label="Beans Tried" value={stats.uniqueBeans.toString()} icon="🫘" />
          </div>

          {/* Brew Activity Chart */}
          {stats.brewActivity.length > 0 && (
            <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="section-title">
                <span>📊</span>
                Brew Activity
              </h3>
              <div className="flex items-stretch gap-[2px] h-24 mt-2">
                {stats.brewActivity.map((entry, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col justify-end group relative"
                  >
                    <div
                      className="w-full rounded-t-sm bg-gradient-to-t from-coffee-700 to-coffee-500 transition-all duration-300 group-hover:from-coffee-800 group-hover:to-coffee-600 min-h-[2px]"
                      style={{
                        height: `${Math.max((entry.count / maxBrewCount) * 100, entry.count > 0 ? 8 : 2)}%`,
                      }}
                      title={`${entry.label}: ${entry.count} brews`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-coffee-400">{stats.brewActivity[0]?.label}</span>
                <span className="text-[10px] text-coffee-400">{stats.brewActivity[stats.brewActivity.length - 1]?.label}</span>
              </div>
            </div>
          )}

          {/* Method Breakdown */}
          {stats.methodBreakdown.length > 0 && (
            <div className="card animate-slide-up" style={{ animationDelay: '0.25s' }}>
              <h3 className="section-title">
                <span>🔧</span>
                By Method
              </h3>
              <div className="space-y-3">
                {stats.methodBreakdown.map((method) => (
                  <div key={method.methodName}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-coffee-800">{method.displayName}</span>
                      <span className="text-xs text-coffee-500">
                        {method.brewCount} brews · {formatScore(method.avgScore)} avg
                      </span>
                    </div>
                    <div className="h-2 bg-coffee-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-coffee-600 to-coffee-800 rounded-full transition-all duration-500"
                        style={{ width: `${(method.brewCount / maxMethodCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Average Rating Sliders */}
          {stats.avgSliders.balance !== null && (
            <div className="card animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="section-title">
                <span>📈</span>
                Avg Rating Profile
              </h3>
              <div className="space-y-3">
                {(Object.entries(stats.avgSliders) as [string, number | null][]).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-coffee-700 capitalize">{key}</span>
                      <span className="text-xs font-semibold text-coffee-800">{value !== null ? value.toFixed(1) : '—'}</span>
                    </div>
                    <div className="h-2 bg-coffee-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: value !== null ? `${(value / 10) * 100}%` : '0%',
                          background: value !== null
                            ? value >= 7 ? 'linear-gradient(to right, #059669, #10b981)'
                            : value >= 5 ? 'linear-gradient(to right, #d97706, #f59e0b)'
                            : 'linear-gradient(to right, #dc2626, #ef4444)'
                            : undefined,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Beans */}
          {stats.topBeans.length > 0 && (
            <div className="card animate-slide-up" style={{ animationDelay: '0.35s' }}>
              <h3 className="section-title">
                <span>🏅</span>
                Top Beans
              </h3>
              <div className="space-y-2">
                {stats.topBeans.map((bean, i) => (
                  <button
                    key={bean.beanId}
                    onClick={() => router.push(`/beans/${bean.beanId}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-coffee-50/50 hover:bg-coffee-100/80 transition-all duration-200 text-left hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span className="text-lg font-display font-bold text-coffee-400 w-6 text-center">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-coffee-800 truncate">{bean.beanName}</p>
                      <p className="text-xs text-coffee-500 truncate">{bean.roasterName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-coffee-800">{bean.avgScore.toFixed(1)}</p>
                      <p className="text-[10px] text-coffee-400">{bean.brewCount} brews</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Top Tasting Notes */}
          {stats.topTastingNotes.length > 0 && (
            <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="section-title">
                <span>👅</span>
                Top Tasting Notes
              </h3>
              <div className="flex flex-wrap gap-2">
                {stats.topTastingNotes.map((note) => (
                  <span
                    key={note.note}
                    className="badge bg-coffee-100 text-coffee-700 text-sm"
                  >
                    {note.note}
                    <span className="ml-1 text-coffee-400 font-normal">×{note.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon, subtitle }: { label: string; value: string; icon: string; subtitle?: string }) {
  return (
    <div className="card-flat text-center">
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-2xl font-display font-bold text-coffee-800">{value}</p>
      <p className="text-xs text-coffee-500 mt-0.5">{label}</p>
      {subtitle && (
        <p className="text-[10px] text-coffee-400 mt-0.5 truncate px-1">{subtitle}</p>
      )}
    </div>
  );
}
