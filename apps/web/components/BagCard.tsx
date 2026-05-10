'use client';

import { formatRoastDate, computeEffectiveDaysOffRoast, computeTotalFrozenDays } from '@kissa/shared';
import { TubePositionIndicator } from './TubePositionIndicator';

interface BagCardProps {
  bag: {
    id: string;
    roastDate: string;
    status: string;
    isAvailable: boolean;
    tubePosition?: string | null;
    frozenAt?: string | null;
    totalFrozenDays?: number;
    isFrozenBag?: boolean;
    frozenGrams?: number | null;
    brewLogs: Array<{
      brewedAt: string;
      computedScore: number | null;
    }>;
  };
  onSelect: () => void;
  onMarkFinished?: () => void;
  onDelete?: () => void;
  onFreeze?: () => void;
  onUnfreeze?: () => void;
  onThawPortion?: () => void;
  showActions?: boolean;
}

const statusColors: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-700',
  FINISHED: 'bg-gray-100 text-gray-500',
  FROZEN: 'bg-cyan-100 text-cyan-700',
};

export function BagCard({ bag, onSelect, onMarkFinished, onDelete, onFreeze, onUnfreeze, onThawPortion, showActions = false }: BagCardProps) {
  const brewLogs = bag.brewLogs || [];
  const brewCount = brewLogs.length;
  const avgScore =
    brewCount > 0
      ? brewLogs
          .filter((b) => b.computedScore !== null)
          .reduce((sum, b) => sum + (b.computedScore || 0), 0) / brewCount
      : null;

  const isFrozen = bag.status === 'FROZEN';
  const totalFrozenDays = bag.totalFrozenDays || 0;
  const allFrozenDays = computeTotalFrozenDays(totalFrozenDays, bag.frozenAt);
  const effectiveDaysOffRoast = computeEffectiveDaysOffRoast(
    new Date(bag.roastDate),
    totalFrozenDays,
    bag.frozenAt,
  );

  return (
    <button
      onClick={onSelect}
      className={`card w-full text-left hover:shadow-md transition-shadow ${
        isFrozen ? 'border-l-4 border-l-cyan-400' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">
              {formatRoastDate(new Date(bag.roastDate), allFrozenDays > 0 ? allFrozenDays : undefined)}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                statusColors[bag.status] || statusColors.OPEN
              }`}
            >
              {isFrozen ? '❄ frozen' : bag.status.toLowerCase()}
            </span>
            {bag.isFrozenBag && !isFrozen && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-50 text-cyan-500">
                was frozen
              </span>
            )}
          </div>

          {/* Show freeze info */}
          {isFrozen && bag.frozenAt && (
            <p className="text-xs text-cyan-600 mt-1">
              Frozen for {computeTotalFrozenDays(0, bag.frozenAt)} day{computeTotalFrozenDays(0, bag.frozenAt) !== 1 ? 's' : ''} · since {new Date(bag.frozenAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}

          {/* Show effective days off roast when there's been freeze time */}
          {!isFrozen && allFrozenDays > 0 && (
            <p className="text-xs text-coffee-400 mt-1">
              {effectiveDaysOffRoast} effective days off roast (frozen {allFrozenDays}d)
            </p>
          )}

          {/* Show frozen portion indicator */}
          {!isFrozen && bag.frozenGrams && bag.frozenGrams > 0 && (
            <p className="text-xs text-cyan-600 mt-1">
              ❄ {bag.frozenGrams}g frozen portion
            </p>
          )}
        </div>

        <div className="text-right">
          {avgScore !== null && (
            <p className="text-lg font-semibold">{avgScore.toFixed(1)}</p>
          )}
          <p className="text-xs text-coffee-400">
            {brewCount} brew{brewCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Rotation status & Tube position */}
      {(bag.isAvailable || (bag.status === 'OPEN' && bag.tubePosition)) && (
        <div className="mt-3 flex items-center gap-2">
          {bag.isAvailable && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-coffee-100 text-coffee-600">
              in rotation
            </span>
          )}
          {bag.status === 'OPEN' && bag.tubePosition && (
            <TubePositionIndicator position={bag.tubePosition as 'LEFT' | 'MIDDLE' | 'RIGHT'} />
          )}
        </div>
      )}

      {/* Action buttons */}
      {showActions && (
        <div className="mt-4 pt-3 border-t border-coffee-100 flex gap-2 flex-wrap">
          {/* Thaw button (full freeze) */}
          {isFrozen && onUnfreeze && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnfreeze();
              }}
              className="flex-1 px-3 py-2 text-sm font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
            >
              🔥 Thaw
            </button>
          )}
          {/* Thaw portion button */}
          {!isFrozen && bag.frozenGrams && bag.frozenGrams > 0 && onThawPortion && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onThawPortion();
              }}
              className="flex-1 px-3 py-2 text-sm font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
            >
              🔥 Thaw Portion
            </button>
          )}
          {/* Freeze button */}
          {!isFrozen && bag.status !== 'FINISHED' && onFreeze && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFreeze();
              }}
              className="flex-1 px-3 py-2 text-sm font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
            >
              ❄ Freeze
            </button>
          )}
          {bag.status !== 'FINISHED' && !isFrozen && onMarkFinished && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkFinished();
              }}
              className="flex-1 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
            >
              ✓ Mark Finished
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              🗑 Delete
            </button>
          )}
        </div>
      )}
    </button>
  );
}
