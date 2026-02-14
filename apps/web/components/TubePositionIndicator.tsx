'use client';

type TubePosition = 'LEFT' | 'MIDDLE' | 'RIGHT';

const positionLabels: Record<TubePosition, string> = {
  LEFT: 'Left',
  MIDDLE: 'Middle',
  RIGHT: 'Right',
};

interface TubePositionIndicatorProps {
  position: TubePosition | null | undefined;
  size?: 'sm' | 'md';
}

/**
 * Read-only indicator showing where a bag sits on the tube.
 * Renders a compact 3-slot visual with the active position highlighted.
 */
export function TubePositionIndicator({ position, size = 'sm' }: TubePositionIndicatorProps) {
  if (!position) return null;

  const slotSize = size === 'sm' ? 'w-2.5 h-5' : 'w-3.5 h-7';
  const gap = size === 'sm' ? 'gap-0.5' : 'gap-1';
  const textSize = size === 'sm' ? 'text-[9px]' : 'text-xs';

  return (
    <div className="flex items-center gap-1.5" title={`Tube position: ${positionLabels[position]}`}>
      <div className={`flex items-end ${gap}`}>
        {(['LEFT', 'MIDDLE', 'RIGHT'] as TubePosition[]).map((slot) => (
          <div
            key={slot}
            className={`${slotSize} rounded-sm transition-colors ${
              slot === position
                ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-sm'
                : 'bg-coffee-200/60'
            }`}
          />
        ))}
      </div>
      <span className={`${textSize} font-medium text-coffee-500`}>
        {positionLabels[position]}
      </span>
    </div>
  );
}

interface TubePositionPickerProps {
  value: TubePosition | null | undefined;
  onChange: (position: TubePosition | null) => void;
  disabled?: boolean;
}

/**
 * Interactive picker for setting tube position on an open bag.
 * Shows 3 clickable slots (Left, Middle, Right) with clear labels.
 */
export function TubePositionPicker({ value, onChange, disabled = false }: TubePositionPickerProps) {
  return (
    <div>
      <label className="block text-sm text-coffee-500 mb-2">Tube Position</label>
      <div className="flex gap-2">
        {(['LEFT', 'MIDDLE', 'RIGHT'] as TubePosition[]).map((pos) => {
          const isActive = value === pos;
          return (
            <button
              key={pos}
              type="button"
              disabled={disabled}
              onClick={() => onChange(isActive ? null : pos)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all border ${
                isActive
                  ? 'bg-gradient-to-b from-amber-50 to-amber-100 border-amber-400 text-amber-800 shadow-sm'
                  : 'bg-coffee-50 border-coffee-200 text-coffee-500 hover:border-coffee-300 hover:bg-coffee-100'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-end gap-0.5">
                  {(['LEFT', 'MIDDLE', 'RIGHT'] as TubePosition[]).map((slot) => (
                    <div
                      key={slot}
                      className={`w-2 h-4 rounded-sm ${
                        slot === pos
                          ? isActive
                            ? 'bg-amber-500'
                            : 'bg-coffee-400'
                          : isActive
                            ? 'bg-amber-200'
                            : 'bg-coffee-200'
                      }`}
                    />
                  ))}
                </div>
                <span>{positionLabels[pos]}</span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-coffee-400 mt-1.5">
        Where this bag sits on your tube. Tap again to unset.
      </p>
    </div>
  );
}
