'use client';

import { useState } from 'react';

interface ServingsControlProps {
  servings: number;
  gramsPerServing: number;
  onServingsChange: (value: number) => void;
  onGramsChange: (value: number) => void;
}

export function ServingsControl({
  servings,
  gramsPerServing,
  onServingsChange,
  onGramsChange,
}: ServingsControlProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalDose = servings * gramsPerServing;

  return (
    <div className="card mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="section-title mb-0">
          <span>⚖️</span>
          Dose
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-2xl font-bold text-coffee-800">{totalDose}g</span>
            <p className="text-xs text-coffee-400">{servings} × {gramsPerServing}g</p>
          </div>
          <span className={`text-coffee-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}>
            ▼
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-coffee-100 space-y-6 animate-slide-up">
          {/* Servings */}
          <div>
            <label className="text-sm text-coffee-500 font-medium block mb-3">
              Number of servings
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => onServingsChange(Math.max(1, servings - 1))}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-coffee-100 to-coffee-200 text-coffee-700 font-bold text-xl hover:shadow-md transition-all active:scale-95"
              >
                −
              </button>
              <span className="text-4xl font-bold text-coffee-800 w-16 text-center">{servings}</span>
              <button
                onClick={() => onServingsChange(Math.min(8, servings + 1))}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-coffee-100 to-coffee-200 text-coffee-700 font-bold text-xl hover:shadow-md transition-all active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Grams per serving */}
          <div>
            <label className="text-sm text-coffee-500 font-medium block mb-3">
              Grams per serving
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[12, 15, 18, 20].map((g) => (
                <button
                  key={g}
                  onClick={() => onGramsChange(g)}
                  className={`py-3 rounded-xl font-semibold transition-all ${
                    gramsPerServing === g
                      ? 'bg-gradient-to-br from-coffee-800 to-coffee-900 text-white shadow-lg'
                      : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'
                  }`}
                >
                  {g}g
                </button>
              ))}
            </div>
          </div>

          {/* Total summary */}
          <div className="bg-gradient-to-br from-coffee-50 to-coffee-100 rounded-xl p-4 text-center">
            <p className="text-coffee-500 text-sm">Total dose</p>
            <p className="text-3xl font-bold text-coffee-800">{totalDose}g</p>
          </div>
        </div>
      )}
    </div>
  );
}
