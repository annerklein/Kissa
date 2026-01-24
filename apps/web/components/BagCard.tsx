'use client';

import { formatRoastDate } from '@kissa/shared';

interface BagCardProps {
  bag: {
    id: string;
    roastDate: string;
    status: string;
    isAvailable: boolean;
    brewLogs: Array<{
      brewedAt: string;
      computedScore: number | null;
    }>;
  };
  onSelect: () => void;
  onMarkFinished?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const statusColors = {
  UNOPENED: 'bg-blue-100 text-blue-700',
  OPEN: 'bg-green-100 text-green-700',
  FINISHED: 'bg-gray-100 text-gray-500',
};

export function BagCard({ bag, onSelect, onMarkFinished, onDelete, showActions = false }: BagCardProps) {
  const brewLogs = bag.brewLogs || [];
  const brewCount = brewLogs.length;
  const avgScore =
    brewCount > 0
      ? brewLogs
          .filter((b) => b.computedScore !== null)
          .reduce((sum, b) => sum + (b.computedScore || 0), 0) / brewCount
      : null;

  return (
    <button
      onClick={onSelect}
      className="card w-full text-left hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">
              {formatRoastDate(new Date(bag.roastDate))}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                statusColors[bag.status as keyof typeof statusColors]
              }`}
            >
              {bag.status.toLowerCase()}
            </span>
          </div>

          {/* No longer showing targets on bag card as they are bean properties now */}
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

      {/* Rotation status */}
      {bag.isAvailable && (
        <div className="mt-3">
          <span className="px-2 py-0.5 rounded-full text-xs bg-coffee-100 text-coffee-600">
            in rotation
          </span>
        </div>
      )}

      {/* Action buttons */}
      {showActions && (
        <div className="mt-4 pt-3 border-t border-coffee-100 flex gap-2">
          {bag.status !== 'FINISHED' && onMarkFinished && (
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
