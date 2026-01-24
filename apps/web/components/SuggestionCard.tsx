'use client';

interface Suggestion {
  primary: {
    variable: string;
    action: string;
    rationale: string;
  };
  secondary?: {
    variable: string;
    action: string;
    rationale: string;
  };
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  onApplyToBag: () => void;
  onApplyToNext: () => void;
  onIgnore: () => void;
  isApplying: boolean;
}

export function SuggestionCard({
  suggestion,
  onApplyToBag,
  onApplyToNext,
  onIgnore,
  isApplying,
}: SuggestionCardProps) {
  const isNoChange = suggestion.primary.variable === 'none';

  return (
    <div className={`card ${isNoChange ? 'card-highlight' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
          isNoChange 
            ? 'bg-white/20' 
            : 'bg-gradient-to-br from-amber-100 to-orange-100'
        }`}>
          {isNoChange ? '🎉' : '💡'}
        </div>
        <h3 className={`text-lg font-semibold ${
          isNoChange ? 'text-white' : 'text-coffee-800'
        }`}>
          {isNoChange ? 'Great brew!' : 'Suggestion for next time'}
        </h3>
      </div>

      {/* Primary suggestion */}
      <div className={`p-4 rounded-xl mb-4 ${
        isNoChange 
          ? 'bg-white/10' 
          : 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'
      }`}>
        <p className={`text-lg font-semibold ${
          isNoChange ? 'text-white' : 'text-coffee-900'
        }`}>
          {suggestion.primary.action}
        </p>
        <p className={`text-sm mt-2 ${
          isNoChange ? 'text-white/80' : 'text-coffee-600'
        }`}>
          {suggestion.primary.rationale}
        </p>
      </div>

      {/* Secondary suggestion */}
      {suggestion.secondary && (
        <div className="pl-4 border-l-2 border-coffee-200 mb-4">
          <p className="font-medium text-coffee-700">
            Also consider: {suggestion.secondary.action}
          </p>
          <p className="text-sm text-coffee-500 mt-1">
            {suggestion.secondary.rationale}
          </p>
        </div>
      )}

      {/* Actions */}
      {!isNoChange ? (
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={onApplyToBag}
            disabled={isApplying}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <span>✨</span>
            Apply to this bag's recipe
          </button>
          <button
            onClick={onApplyToNext}
            disabled={isApplying}
            className="btn-secondary w-full"
          >
            Apply for next brew only
          </button>
          <button
            onClick={onIgnore}
            disabled={isApplying}
            className="btn-ghost w-full text-coffee-500"
          >
            Skip for now
          </button>
        </div>
      ) : (
        <button
          onClick={onIgnore}
          className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all mt-4"
        >
          Continue
        </button>
      )}
    </div>
  );
}
