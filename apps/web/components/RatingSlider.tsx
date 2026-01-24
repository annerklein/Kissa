'use client';

interface RatingSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
  centerLabel?: string;
  icon?: string;
}

export function RatingSlider({
  label,
  value,
  onChange,
  leftLabel,
  rightLabel,
  centerLabel,
  icon,
}: RatingSliderProps) {
  const percentage = ((value - 1) / 9) * 100;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-coffee-700 flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold text-coffee-800">{value}</span>
          <span className="text-sm text-coffee-400">/10</span>
        </div>
      </div>
      
      {/* Custom slider track */}
      <div className="relative h-3 bg-gradient-to-r from-coffee-200 via-coffee-300 to-coffee-200 rounded-full">
        {/* Progress fill */}
        <div 
          className="absolute h-full rounded-full bg-gradient-to-r from-coffee-600 to-coffee-700 transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Slider input */}
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {/* Custom thumb */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-coffee-600 pointer-events-none transition-all duration-150"
          style={{ left: `calc(${percentage}% - 12px)` }}
        />
      </div>
      
      <div className="flex justify-between mt-2">
        <span className="text-xs text-coffee-400">{leftLabel}</span>
        {centerLabel && (
          <span className="text-xs text-coffee-500 font-medium">{centerLabel}</span>
        )}
        <span className="text-xs text-coffee-400">{rightLabel}</span>
      </div>
    </div>
  );
}
