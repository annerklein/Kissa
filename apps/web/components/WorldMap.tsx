'use client';

import { useState } from 'react';
import { CountryFlag } from './CountryFlag';

interface MapDataPoint {
  countryCode: string;
  countryName: string;
  count: number;
  avgScore: number | null;
}

interface WorldMapProps {
  data: MapDataPoint[];
  onCountryClick: (code: string) => void;
  selectedCountry: string | null;
}

// Coffee-producing countries with positions (percentage based on natural earth projection)
const COUNTRY_POSITIONS: Record<string, { x: number; y: number; name: string }> = {
  // Africa
  Ethiopia: { x: 54, y: 52, name: 'Ethiopia' },
  Kenya: { x: 53, y: 56, name: 'Kenya' },
  Rwanda: { x: 50, y: 57, name: 'Rwanda' },
  Burundi: { x: 50, y: 58, name: 'Burundi' },
  Tanzania: { x: 52, y: 60, name: 'Tanzania' },
  Uganda: { x: 50, y: 54, name: 'Uganda' },
  DRC: { x: 47, y: 56, name: 'DRC' },
  
  // Central America
  Guatemala: { x: 18, y: 48, name: 'Guatemala' },
  Honduras: { x: 19, y: 49, name: 'Honduras' },
  'El Salvador': { x: 18, y: 50, name: 'El Salvador' },
  Nicaragua: { x: 19, y: 51, name: 'Nicaragua' },
  'Costa Rica': { x: 19, y: 53, name: 'Costa Rica' },
  Panama: { x: 21, y: 54, name: 'Panama' },
  Mexico: { x: 15, y: 44, name: 'Mexico' },
  Jamaica: { x: 22, y: 46, name: 'Jamaica' },
  
  // South America
  Colombia: { x: 23, y: 55, name: 'Colombia' },
  Brazil: { x: 30, y: 65, name: 'Brazil' },
  Peru: { x: 22, y: 60, name: 'Peru' },
  Ecuador: { x: 21, y: 56, name: 'Ecuador' },
  Bolivia: { x: 27, y: 64, name: 'Bolivia' },
  
  // Asia
  Indonesia: { x: 77, y: 58, name: 'Indonesia' },
  Vietnam: { x: 75, y: 48, name: 'Vietnam' },
  India: { x: 68, y: 47, name: 'India' },
  'Papua New Guinea': { x: 85, y: 60, name: 'Papua New Guinea' },
  Thailand: { x: 73, y: 48, name: 'Thailand' },
  Myanmar: { x: 72, y: 45, name: 'Myanmar' },
  Philippines: { x: 80, y: 48, name: 'Philippines' },
  
  // Middle East
  Yemen: { x: 58, y: 48, name: 'Yemen' },
};

function MapContent({ 
  data, 
  onCountryClick, 
  selectedCountry, 
  isFullscreen = false 
}: WorldMapProps & { isFullscreen?: boolean }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const dataByCountry = data.reduce((acc, d) => {
    acc[d.countryCode] = d;
    acc[d.countryName] = d;
    return acc;
  }, {} as Record<string, MapDataPoint>);

  const markerBaseSize = isFullscreen ? 14 : 10;
  const markerScaleSize = isFullscreen ? 20 : 14;

  return (
    <div className="relative w-full h-full">
      {/* Map SVG */}
      <svg 
        viewBox="0 0 100 56" 
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f0f7ff" />
            <stop offset="100%" stopColor="#e6f0fa" />
          </linearGradient>
          <linearGradient id="landGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4c4b0" />
            <stop offset="100%" stopColor="#c8b8a4" />
          </linearGradient>
        </defs>
        
        {/* Ocean */}
        <rect x="0" y="0" width="100" height="56" fill="url(#oceanGradient)" />
        
        {/* Coffee belt subtle highlight */}
        <rect x="0" y="40" width="100" height="14" fill="rgba(180, 140, 100, 0.06)" />
        
        {/* Continents - cleaner stylized shapes */}
        <g fill="url(#landGradient)" stroke="#b8a896" strokeWidth="0.2">
          {/* North America */}
          <path d="M5,10 C8,6 15,5 22,7 C26,8 28,12 27,18 C26,24 24,28 20,32 C18,34 16,33 14,30 C12,26 10,22 8,18 C6,14 5,12 5,10 Z" />
          
          {/* Central America */}
          <path d="M15,33 C17,32 19,34 20,38 C21,42 20,46 18,48 C16,46 15,42 15,38 C15,36 15,34 15,33 Z" />
          
          {/* South America */}
          <path d="M19,49 C23,47 27,48 30,52 C33,58 34,66 32,72 C30,76 26,78 22,75 C20,72 19,66 19,60 C19,55 19,51 19,49 Z" />
          
          {/* Europe */}
          <path d="M44,8 C48,6 54,7 56,10 C57,14 55,16 51,17 C48,17 45,15 44,12 C44,10 44,9 44,8 Z" />
          
          {/* Africa */}
          <path d="M43,22 C48,20 54,21 58,26 C61,32 62,42 58,50 C54,56 48,58 44,54 C41,50 40,42 41,34 C42,28 42,24 43,22 Z" />
          
          {/* Asia */}
          <path d="M56,6 C68,4 82,5 90,10 C94,14 94,20 90,26 C84,32 76,34 68,32 C62,30 58,24 56,18 C55,12 55,8 56,6 Z" />
          
          {/* India */}
          <path d="M64,32 C68,30 72,32 74,38 C75,44 73,50 68,52 C64,50 62,44 63,38 C63,35 63,33 64,32 Z" />
          
          {/* Southeast Asia */}
          <path d="M72,34 C76,32 80,34 82,40 C82,46 79,50 75,48 C72,46 71,40 72,34 Z" />
          
          {/* Indonesia */}
          <path d="M74,52 C78,51 84,52 88,54 C88,56 84,58 78,57 C74,56 73,54 74,52 Z" />
          
          {/* Australia */}
          <path d="M78,62 C84,60 92,62 94,68 C94,74 90,78 84,77 C78,76 76,70 78,62 Z" />
        </g>
        
        {/* Tropic lines - subtle */}
        <line x1="0" y1="40" x2="100" y2="40" stroke="#a09080" strokeWidth="0.15" strokeDasharray="1,1" opacity="0.4" />
        <line x1="0" y1="54" x2="100" y2="54" stroke="#a09080" strokeWidth="0.15" strokeDasharray="1,1" opacity="0.4" />
      </svg>

      {/* Country markers */}
      {Object.entries(COUNTRY_POSITIONS).map(([country, pos]) => {
        const countryData = dataByCountry[country];
        if (!countryData) return null;

        const size = markerBaseSize + (countryData.count / maxCount) * markerScaleSize;
        const isSelected = selectedCountry === country;

        return (
          <button
            key={country}
            onClick={(e) => {
              e.stopPropagation();
              onCountryClick(country);
            }}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 flex items-center justify-center ${
              isSelected
                ? 'z-20 scale-110'
                : 'hover:scale-125 hover:z-10'
            }`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: size,
              height: size,
              background: countryData.avgScore !== null
                ? `linear-gradient(135deg, hsl(${30 + countryData.avgScore * 5}, 70%, 50%) 0%, hsl(${25 + countryData.avgScore * 5}, 80%, 35%) 100%)`
                : 'linear-gradient(135deg, #c4956a 0%, #8b6342 100%)',
              boxShadow: isSelected 
                ? '0 0 0 3px #fff, 0 0 0 5px #8b6342, 0 4px 12px rgba(0,0,0,0.3)' 
                : '0 2px 8px rgba(0,0,0,0.25)',
            }}
          >
            {size > 18 && (
              <span className="text-white text-[9px] font-bold drop-shadow">{countryData.count}</span>
            )}
          </button>
        );
      })}

      {/* Selected country info */}
      {selectedCountry && dataByCountry[selectedCountry] && (
        <div className={`absolute bg-white rounded-xl shadow-lg border border-coffee-200 ${
          isFullscreen ? 'top-4 left-4 px-4 py-3' : 'top-2 left-2 px-3 py-2'
        }`}>
          <div className="flex items-center gap-2">
            <CountryFlag country={selectedCountry} size="sm" showName={false} />
            <div>
              <p className={`font-bold text-coffee-900 ${isFullscreen ? 'text-base' : 'text-sm'}`}>
                {selectedCountry}
              </p>
              <p className="text-xs text-coffee-500">
                {dataByCountry[selectedCountry].count} bean{dataByCountry[selectedCountry].count !== 1 ? 's' : ''}
                {dataByCountry[selectedCountry].avgScore && 
                  ` · ${dataByCountry[selectedCountry].avgScore!.toFixed(1)}★`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function WorldMap({ data, onCountryClick, selectedCountry }: WorldMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (data.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
          <span className="text-4xl">🌍</span>
        </div>
        <p className="text-coffee-600 mb-2 font-medium">No origins yet</p>
        <p className="text-coffee-400 text-sm">Add beans with origin countries to see them on the map</p>
      </div>
    );
  }

  return (
    <>
      {/* Compact map card */}
      <div 
        onClick={() => setIsFullscreen(true)}
        className="card overflow-hidden p-0 cursor-pointer group"
      >
        <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden">
          <MapContent 
            data={data} 
            onCountryClick={(code) => {
              onCountryClick(code);
            }} 
            selectedCountry={selectedCountry}
          />
          
          {/* Expand button */}
          <div className="absolute bottom-2 right-2 bg-coffee-800/80 backdrop-blur-sm text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 group-hover:bg-coffee-900 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Expand
          </div>
        </div>
      </div>

      {/* Fullscreen view */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-gradient-to-b from-stone-100 to-stone-200"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-md border-b border-coffee-200 px-4 py-3 safe-area-pt">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div>
                <h2 className="font-display font-bold text-coffee-900 text-lg">Your Coffee Origins</h2>
                <p className="text-sm text-coffee-500">{data.length} countries explored</p>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="w-10 h-10 rounded-full bg-coffee-100 hover:bg-coffee-200 flex items-center justify-center text-coffee-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Map */}
          <div 
            className="absolute inset-0 pt-16 pb-16"
            onClick={(e) => e.stopPropagation()}
          >
            <MapContent 
              data={data} 
              onCountryClick={onCountryClick}
              selectedCountry={selectedCountry}
              isFullscreen
            />
          </div>

          {/* Legend */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-md border-t border-coffee-200 px-4 py-3 safe-area-pb">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #c4956a 0%, #8b6342 100%)' }}></div>
                  <span className="text-coffee-600">Coffee origin</span>
                </div>
                <div className="flex items-center gap-2 text-coffee-400">
                  <span className="text-xs">Tap marker for details</span>
                </div>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="text-sm text-coffee-600 hover:text-coffee-800 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
