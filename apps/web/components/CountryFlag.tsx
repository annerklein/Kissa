'use client';

// Country name to ISO 3166-1 alpha-2 code mapping for coffee-producing countries
const countryCodeMap: Record<string, string> = {
  // Africa
  'ethiopia': 'ET',
  'kenya': 'KE',
  'rwanda': 'RW',
  'burundi': 'BI',
  'tanzania': 'TZ',
  'uganda': 'UG',
  'democratic republic of congo': 'CD',
  'drc': 'CD',
  'congo': 'CD',
  'malawi': 'MW',
  'zambia': 'ZM',
  'cameroon': 'CM',
  
  // Central & South America
  'colombia': 'CO',
  'brazil': 'BR',
  'guatemala': 'GT',
  'costa rica': 'CR',
  'panama': 'PA',
  'honduras': 'HN',
  'el salvador': 'SV',
  'nicaragua': 'NI',
  'mexico': 'MX',
  'peru': 'PE',
  'bolivia': 'BO',
  'ecuador': 'EC',
  'jamaica': 'JM',
  'haiti': 'HT',
  'dominican republic': 'DO',
  'puerto rico': 'PR',
  
  // Asia & Pacific
  'indonesia': 'ID',
  'vietnam': 'VN',
  'india': 'IN',
  'papua new guinea': 'PG',
  'png': 'PG',
  'myanmar': 'MM',
  'burma': 'MM',
  'thailand': 'TH',
  'philippines': 'PH',
  'laos': 'LA',
  'china': 'CN',
  'taiwan': 'TW',
  'nepal': 'NP',
  
  // Middle East
  'yemen': 'YE',
  
  // Oceania
  'hawaii': 'US',
  'australia': 'AU',
};

function getCountryCode(countryName: string): string | null {
  if (!countryName) return null;
  const normalized = countryName.toLowerCase().trim();
  return countryCodeMap[normalized] || null;
}

interface CountryFlagProps {
  country: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const sizeClasses = {
  sm: 'w-5 h-4',
  md: 'w-6 h-5',
  lg: 'w-8 h-6',
};

export function CountryFlag({ country, size = 'md', showName = true }: CountryFlagProps) {
  const code = getCountryCode(country);
  
  if (!code) {
    // Fallback to text with pin emoji
    return (
      <span className="inline-flex items-center gap-1">
        <span>📍</span>
        {showName && <span>{country}</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <img
        src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
        srcSet={`https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`}
        alt={`${country} flag`}
        className={`${sizeClasses[size]} object-cover rounded-sm shadow-sm`}
      />
      {showName && <span>{country}</span>}
    </span>
  );
}
