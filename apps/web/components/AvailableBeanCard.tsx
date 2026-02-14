'use client';

import Link from 'next/link';
import { formatRoastDate, computeEffectiveDaysOffRoast, computeTotalFrozenDays } from '@kissa/shared';
import { CountryFlag } from './CountryFlag';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001');

type TubePos = 'LEFT' | 'MIDDLE' | 'RIGHT';

const TUBE_POSITIONS: TubePos[] = ['LEFT', 'MIDDLE', 'RIGHT'];
const positionLabels: Record<TubePos, string> = { LEFT: 'L', MIDDLE: 'M', RIGHT: 'R' };

interface AvailableBag {
  id: string;
  roastDate: string;
  tubePosition?: string | null;
  status?: string;
  frozenAt?: string | null;
  totalFrozenDays?: number;
  isFrozenBag?: boolean;
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
  onTubePositionChange?: (bagId: string, position: TubePos | null) => void;
}

export function AvailableBeanCard({ bag, methodId, onTubePositionChange }: AvailableBeanCardProps) {
  const { bean, roastDate, lastBrew, grinderDelta } = bag;

  // Compute effective days off roast accounting for freeze time
  const totalFrozenDays = bag.totalFrozenDays || 0;
  const allFrozenDays = computeTotalFrozenDays(totalFrozenDays, bag.frozenAt);

  return (
    <div className="card group hover:shadow-md transition-all duration-300">
      <Link
        href={`/brew?bagId=${bag.id}&methodId=${methodId}`}
        className="block"
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
                {formatRoastDate(new Date(roastDate), allFrozenDays > 0 ? allFrozenDays : undefined)}
              </span>
              {bag.isFrozenBag && (
                <span className="badge bg-cyan-50 text-cyan-600 text-[10px]">
                  was frozen
                </span>
              )}
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
      </Link>

      {/* Footer: Tube position + Brew link */}
      <div className="mt-3 pt-3 border-t border-coffee-100/50 flex items-center justify-between">
        {/* Tube position inline selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-coffee-400 uppercase tracking-wide mr-0.5">Tube</span>
          {TUBE_POSITIONS.map((pos) => {
            const isActive = bag.tubePosition === pos;
            return (
              <button
                key={pos}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onTubePositionChange) {
                    onTubePositionChange(bag.id, isActive ? null : pos);
                  }
                }}
                className={`w-7 h-7 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-white shadow-sm scale-110'
                    : 'bg-coffee-100 text-coffee-400 hover:bg-coffee-200 hover:text-coffee-600'
                }`}
              >
                {positionLabels[pos]}
              </button>
            );
          })}
        </div>

        {/* Brew link */}
        <Link
          href={`/brew?bagId=${bag.id}&methodId=${methodId}`}
          className="text-coffee-400 text-sm flex items-center gap-1 hover:text-coffee-600 transition-colors"
        >
          Brew now <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}
