'use client';

import Link from 'next/link';
import { formatRoastDate } from '@kissa/shared';
import { CountryFlag } from './CountryFlag';

interface AvailableBag {
  id: string;
  roastDate: string;
  bean: {
    id: string;
    name: string;
    originCountry?: string;
    originRegion?: string;
    roaster: {
      name: string;
    };
  };
  lastBrew?: {
    brewedAt: string;
    computedScore: number | null;
  };
  grinderDelta?: {
    direction: 'finer' | 'coarser' | 'none';
    clicks: number;
  };
}

interface AvailableBeanCardProps {
  bag: AvailableBag;
  methodId?: string;
}

export function AvailableBeanCard({ bag, methodId }: AvailableBeanCardProps) {
  const { bean, roastDate, lastBrew, grinderDelta } = bag;

  return (
    <Link
      href={`/brew?bagId=${bag.id}&methodId=${methodId}`}
      className="card group block hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
    >
      <div className="flex justify-between items-start gap-4">
        {/* Left: Bean info */}
        <div className="flex-1 min-w-0">
          {/* Roaster */}
          <p className="text-sm text-coffee-500 font-medium truncate">
            {bean.roaster.name}
          </p>
          
          {/* Bean name */}
          <h3 className="font-display font-bold text-xl text-coffee-900 truncate group-hover:text-gradient transition-colors">
            {bean.name}
          </h3>
          
          {/* Origin & Roast date */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {bean.originCountry && (
              <span className="badge-primary">
                <CountryFlag 
                  country={bean.originCountry} 
                  size="sm" 
                  showName={true}
                />
                {bean.originRegion && `, ${bean.originRegion}`}
              </span>
            )}
            <span className="badge bg-coffee-100 text-coffee-600">
              {formatRoastDate(new Date(roastDate))}
            </span>
          </div>
        </div>

        {/* Right: Score & Delta */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Last score */}
          {lastBrew?.computedScore !== null && lastBrew?.computedScore !== undefined && (
            <div className="text-right">
              <p className="text-xs text-coffee-400 uppercase tracking-wide">Last</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-coffee-800">
                  {lastBrew.computedScore.toFixed(1)}
                </span>
                <span className="text-xs text-coffee-400">/10</span>
              </div>
            </div>
          )}

          {/* Grinder delta badge */}
          {grinderDelta && grinderDelta.direction !== 'none' && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                grinderDelta.direction === 'finer'
                  ? 'bg-gradient-to-r from-sky-100 to-blue-100 text-blue-700'
                  : 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700'
              }`}
            >
              <span className="text-lg">
                {grinderDelta.direction === 'finer' ? '⬇️' : '⬆️'}
              </span>
              <span>
                {grinderDelta.direction === 'finer' ? '−' : '+'}
                {grinderDelta.clicks}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover arrow indicator */}
      <div className="mt-3 pt-3 border-t border-coffee-100/50 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-coffee-400 text-sm flex items-center gap-1">
          Brew now <span className="group-hover:translate-x-1 transition-transform">→</span>
        </span>
      </div>
    </Link>
  );
}
