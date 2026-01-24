'use client';

interface TastingNotesComparisonProps {
  expected: string[];
  actual: Record<string, number>;
}

export function TastingNotesComparison({
  expected,
  actual,
}: TastingNotesComparisonProps) {
  const sortedActual = Object.entries(actual).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...Object.values(actual), 1);

  return (
    <div className="card mb-4">
      <h3 className="text-sm font-medium text-coffee-500 mb-4">
        Tasting Notes Comparison
      </h3>

      {/* Expected */}
      <div className="mb-4">
        <p className="text-xs text-coffee-400 mb-2">Roaster says:</p>
        <div className="flex flex-wrap gap-2">
          {expected.map((note) => (
            <span
              key={note}
              className={`px-2 py-1 rounded-full text-sm ${
                actual[note]
                  ? 'bg-green-100 text-green-700'
                  : 'bg-coffee-100 text-coffee-500'
              }`}
            >
              {note}
              {actual[note] && <span className="ml-1">✓</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Actual */}
      <div>
        <p className="text-xs text-coffee-400 mb-2">You've tasted:</p>
        <div className="space-y-2">
          {sortedActual.slice(0, 8).map(([note, count]) => (
            <div key={note} className="flex items-center gap-3">
              <span className="w-24 text-sm truncate">{note}</span>
              <div className="flex-1 h-4 bg-coffee-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-coffee-600 rounded-full"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-sm text-coffee-500 w-8 text-right">
                {count}×
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
