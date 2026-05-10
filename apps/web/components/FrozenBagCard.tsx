'use client';

import { computeTotalFrozenDays, computeEffectiveDaysOffRoast } from '@kissa/shared';
import { CountryFlag } from './CountryFlag';

interface FrozenBag {
  id: string;
  roastDate: string;
  frozenAt?: string | null;
  totalFrozenDays?: number;
  frozenGrams?: number | null;
  bean: {
    id: string;
    name: string;
    originCountry?: string;
    roaster: {
      name: string;
    };
  };
}

interface FrozenBagCardProps {
  bag: FrozenBag;
  onUnfreeze: (bagId: string) => void;
  isUnfreezing?: boolean;
}

export function FrozenBagCard({ bag, onUnfreeze, isUnfreezing }: FrozenBagCardProps) {
  const frozenDays = computeTotalFrozenDays(0, bag.frozenAt);
  const effectiveDaysOff = computeEffectiveDaysOffRoast(
    new Date(bag.roastDate),
    bag.totalFrozenDays || 0,
    bag.frozenAt,
  );

  return (
    <div className="flex items-center gap-3 p-3 bg-cyan-50/50 border border-cyan-100 rounded-xl">
      {/* Frozen icon */}
      <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
        <span className="text-lg">❄</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-coffee-800 truncate">
          {bag.bean.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-coffee-500">
          <span>{bag.bean.roaster.name}</span>
          {bag.bean.originCountry && (
            <>
              <span>·</span>
              <CountryFlag country={bag.bean.originCountry} size="sm" showName={false} />
            </>
          )}
        </div>
        <p className="text-[11px] text-cyan-600 mt-0.5">
          Frozen {frozenDays}d · {effectiveDaysOff}d effective off roast
        </p>
      </div>

      {/* Thaw button */}
      <button
        onClick={() => onUnfreeze(bag.id)}
        disabled={isUnfreezing}
        className="px-3 py-1.5 text-xs font-semibold text-cyan-700 bg-cyan-100 hover:bg-cyan-200 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
      >
        {isUnfreezing ? '...' : '🔥 Thaw'}
      </button>
    </div>
  );
}
