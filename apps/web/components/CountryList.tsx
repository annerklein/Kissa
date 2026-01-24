'use client';

interface MapDataPoint {
  countryCode: string;
  countryName: string;
  count: number;
  avgScore: number | null;
}

interface CountryListProps {
  data: MapDataPoint[];
  onCountryClick: (code: string) => void;
}

// Country flag emojis
const countryFlags: Record<string, string> = {
  Ethiopia: '🇪🇹',
  Kenya: '🇰🇪',
  Rwanda: '🇷🇼',
  Colombia: '🇨🇴',
  Brazil: '🇧🇷',
  Guatemala: '🇬🇹',
  'Costa Rica': '🇨🇷',
  Panama: '🇵🇦',
  Indonesia: '🇮🇩',
  Vietnam: '🇻🇳',
  Yemen: '🇾🇪',
  Peru: '🇵🇪',
  Honduras: '🇭🇳',
  'El Salvador': '🇸🇻',
  Nicaragua: '🇳🇮',
  Mexico: '🇲🇽',
  Jamaica: '🇯🇲',
  India: '🇮🇳',
  Tanzania: '🇹🇿',
  Burundi: '🇧🇮',
};

export function CountryList({ data, onCountryClick }: CountryListProps) {
  const sorted = [...data].sort((a, b) => b.count - a.count);

  if (sorted.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-coffee-500">No coffee origins recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((country, index) => (
        <button
          key={country.countryCode}
          onClick={() => onCountryClick(country.countryName)}
          className="card w-full flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center text-2xl">
            {countryFlags[country.countryName] || '🌍'}
          </div>
          <div className="flex-1 text-left">
            <span className="font-semibold text-coffee-800">{country.countryName}</span>
            <p className="text-sm text-coffee-500">
              {country.count} bean{country.count !== 1 ? 's' : ''}
            </p>
          </div>
          {country.avgScore !== null && (
            <div className="text-right">
              <span className="text-2xl font-bold text-coffee-800">
                {country.avgScore.toFixed(1)}
              </span>
              <p className="text-xs text-coffee-400">avg</p>
            </div>
          )}
          <span className="text-coffee-300">→</span>
        </button>
      ))}
    </div>
  );
}
