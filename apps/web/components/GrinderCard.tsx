'use client';

import { computeGrinderDelta } from '@kissa/shared';

interface GrinderCardProps {
  current: number;
  target: number;
  onApply: (newSetting: number) => void;
  isApplying: boolean;
}

export function GrinderCard({ current, target, onApply, isApplying }: GrinderCardProps) {
  const delta = computeGrinderDelta(current, target);
  const needsAdjustment = delta.direction !== 'none';

  return (
    <div className="card mb-4">
      <h3 className="section-title mb-4">
        <span>⚙️</span>
        Grinder
      </h3>
      
      <div className="flex items-center justify-between gap-2">
        {/* Current and Target display */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-coffee-400 uppercase tracking-wide mb-1">Current</p>
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold text-coffee-700">{current}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl text-coffee-300">→</span>
          </div>
          
          <div className="text-center">
            <p className="text-[10px] sm:text-xs text-coffee-400 uppercase tracking-wide mb-1">Target</p>
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center ${
              needsAdjustment 
                ? 'bg-gradient-to-br from-coffee-700 to-coffee-900 text-white shadow-lg' 
                : 'bg-gradient-to-br from-emerald-100 to-emerald-200'
            }`}>
              <span className="text-xl sm:text-2xl font-bold">{target}</span>
            </div>
          </div>
        </div>

        {/* Action area */}
        <div className="text-right flex-shrink-0">
          {needsAdjustment ? (
            <div>
              <p className={`text-sm sm:text-lg font-bold mb-2 ${
                delta.direction === 'finer' ? 'text-blue-600' : 'text-orange-600'
              }`}>
                {delta.direction === 'finer' ? '⬇️' : '⬆️'} {delta.clicks} {delta.direction}
              </p>
              <button
                onClick={() => onApply(target)}
                disabled={isApplying}
                className="btn-secondary text-xs sm:text-sm"
              >
                {isApplying ? 'Applying...' : '✓ Applied'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm sm:text-base">
              <span className="text-lg sm:text-xl">✓</span>
              <span>Ready!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
