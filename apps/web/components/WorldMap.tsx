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

// ---------------------------------------------------------------------------
// Equirectangular projection — shared by continents, markers, and tropic lines
// ---------------------------------------------------------------------------
const MAP_W = 200;
const MAP_H = 110;

function project(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng + 180) / 360) * MAP_W,
    y: ((90 - lat) / 180) * MAP_H,
  };
}

// Helper: convert an array of [lat, lng] pairs into an SVG points string
function toPoints(coords: [number, number][]): string {
  return coords
    .map(([lat, lng]) => {
      const { x, y } = project(lat, lng);
      return `${x},${y}`;
    })
    .join(' ');
}

// ---------------------------------------------------------------------------
// Real lat/lng for coffee-producing countries (centroid of growing regions)
// ---------------------------------------------------------------------------
const COUNTRY_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  // Africa
  Ethiopia:       { lat: 9.0,   lng: 38.7,  name: 'Ethiopia' },
  Kenya:          { lat: -0.02, lng: 37.9,  name: 'Kenya' },
  Rwanda:         { lat: -1.9,  lng: 29.9,  name: 'Rwanda' },
  Burundi:        { lat: -3.4,  lng: 29.9,  name: 'Burundi' },
  Tanzania:       { lat: -6.4,  lng: 34.9,  name: 'Tanzania' },
  Uganda:         { lat: 1.4,   lng: 32.3,  name: 'Uganda' },
  DRC:            { lat: -4.0,  lng: 21.8,  name: 'DRC' },
  Malawi:         { lat: -13.3, lng: 34.3,  name: 'Malawi' },
  Zambia:         { lat: -15.4, lng: 28.3,  name: 'Zambia' },
  Cameroon:       { lat: 5.95,  lng: 10.15, name: 'Cameroon' },

  // Central America
  Guatemala:      { lat: 14.6,  lng: -90.5, name: 'Guatemala' },
  Honduras:       { lat: 14.1,  lng: -87.2, name: 'Honduras' },
  'El Salvador':  { lat: 13.7,  lng: -89.2, name: 'El Salvador' },
  Nicaragua:      { lat: 12.9,  lng: -85.2, name: 'Nicaragua' },
  'Costa Rica':   { lat: 10.0,  lng: -84.0, name: 'Costa Rica' },
  Panama:         { lat: 9.0,   lng: -79.5, name: 'Panama' },
  Mexico:         { lat: 17.0,  lng: -96.7, name: 'Mexico' },
  Jamaica:        { lat: 18.1,  lng: -77.3, name: 'Jamaica' },

  // South America
  Colombia:       { lat: 4.6,   lng: -74.1, name: 'Colombia' },
  Brazil:         { lat: -14.2, lng: -51.9, name: 'Brazil' },
  Peru:           { lat: -9.2,  lng: -75.0, name: 'Peru' },
  Ecuador:        { lat: -1.8,  lng: -78.2, name: 'Ecuador' },
  Bolivia:        { lat: -16.3, lng: -68.1, name: 'Bolivia' },

  // Asia
  Indonesia:      { lat: -5.0,  lng: 120.0, name: 'Indonesia' },
  Vietnam:        { lat: 14.1,  lng: 108.3, name: 'Vietnam' },
  India:          { lat: 12.0,  lng: 76.0,  name: 'India' },
  'Papua New Guinea': { lat: -6.3, lng: 147.2, name: 'Papua New Guinea' },
  Thailand:       { lat: 18.8,  lng: 99.0,  name: 'Thailand' },
  Myanmar:        { lat: 21.9,  lng: 96.0,  name: 'Myanmar' },
  Philippines:    { lat: 14.6,  lng: 121.0, name: 'Philippines' },
  Laos:           { lat: 19.9,  lng: 102.5, name: 'Laos' },
  China:          { lat: 23.0,  lng: 101.0, name: 'China' },

  // Middle East
  Yemen:          { lat: 15.6,  lng: 48.5,  name: 'Yemen' },

  // Oceania
  Hawaii:         { lat: 19.9,  lng: -155.5, name: 'Hawaii' },
};

// ---------------------------------------------------------------------------
// Simplified continent outlines as [lat, lng] polygons
// ---------------------------------------------------------------------------
const CONTINENTS: { name: string; points: [number, number][] }[] = [
  {
    name: 'North America',
    points: [
      [60, -140], [64, -170], [72, -165], [71, -155],
      [65, -168], [60, -150], [60, -138], [68, -135],
      [72, -125], [72, -85], [69, -65], [62, -74],
      [54, -56], [47, -53], [44, -59], [44, -66],
      [42, -70], [30, -82], [29, -90], [26, -82],
      [25, -80], [30, -84], [29, -95], [26, -97],
      [22, -98], [18, -105], [20, -106], [24, -110],
      [31, -113], [32, -117], [39, -124], [49, -127],
      [55, -131], [58, -137], [60, -140],
    ],
  },
  {
    name: 'Central America',
    points: [
      [18, -105], [22, -98], [21, -87], [18, -88],
      [16, -90], [15, -84], [12, -84], [10, -84],
      [8, -82], [8, -77], [10, -76], [8, -77],
      [8, -82], [10, -84], [12, -84], [15, -84],
      [16, -90], [18, -92], [18, -105],
    ],
  },
  {
    name: 'South America',
    points: [
      [12, -72], [10, -76], [8, -77], [7, -77],
      [5, -77], [2, -80], [-2, -80], [-5, -81],
      [-6, -77], [-14, -77], [-18, -71], [-23, -70],
      [-28, -71], [-40, -66], [-46, -68], [-52, -70],
      [-56, -68], [-56, -64], [-52, -68], [-46, -66],
      [-40, -62], [-34, -54], [-33, -52], [-24, -46],
      [-22, -41], [-13, -39], [-8, -35], [-2, -44],
      [0, -50], [5, -52], [7, -60], [8, -62],
      [11, -72], [12, -72],
    ],
  },
  {
    name: 'Europe',
    points: [
      [36, -10], [38, -3], [43, -2], [44, 0],
      [46, 2], [48, -5], [49, 2], [51, 4],
      [54, 8], [56, 8], [58, 12], [56, 14],
      [55, 18], [60, 20], [64, 20], [65, 25],
      [70, 28], [70, 40], [62, 40], [56, 38],
      [48, 40], [47, 37], [42, 36], [40, 26],
      [38, 24], [40, 23], [36, 23], [38, 20],
      [37, 15], [41, 14], [39, 9], [37, -2],
      [36, -6], [36, -10],
    ],
  },
  {
    name: 'Africa',
    points: [
      [37, -10], [36, -6], [36, 0], [37, 10],
      [33, 10], [31, 32], [30, 33], [22, 37],
      [12, 44], [11, 50], [2, 51], [-1, 42],
      [-12, 44], [-15, 41], [-25, 35], [-27, 33],
      [-34, 26], [-35, 20], [-30, 17], [-22, 14],
      [-17, 12], [-12, 14], [-5, 12], [0, 10],
      [5, 1], [5, -5], [3, -10], [5, -9],
      [7, -14], [11, -16], [15, -17], [20, -17],
      [26, -14], [28, -10], [32, -8], [36, -6],
      [37, -10],
    ],
  },
  {
    name: 'Arabian Peninsula',
    points: [
      [30, 33], [31, 36], [29, 36], [28, 44],
      [22, 37], [21, 41], [20, 45], [18, 52],
      [16, 53], [12, 44], [13, 48], [15, 52],
      [22, 59], [25, 57], [26, 56], [28, 51],
      [30, 48], [30, 40], [30, 33],
    ],
  },
  {
    name: 'India',
    points: [
      [35, 74], [28, 68], [24, 69], [21, 73],
      [16, 73], [10, 76], [8, 77], [12, 80],
      [17, 82], [22, 88], [26, 90], [28, 97],
      [22, 97], [16, 98], [12, 93], [6, 81],
      [8, 77], [10, 76], [16, 73], [21, 73],
      [24, 69], [28, 68], [35, 74],
    ],
  },
  {
    name: 'East Asia',
    points: [
      [70, 40], [72, 60], [72, 100], [68, 110],
      [64, 120], [64, 140], [55, 135], [50, 140],
      [46, 135], [42, 132], [38, 128], [35, 127],
      [32, 122], [28, 120], [22, 108], [22, 100],
      [22, 97], [26, 90], [28, 97], [28, 97],
      [35, 74], [38, 68], [42, 54], [48, 40],
      [56, 38], [62, 40], [70, 40],
    ],
  },
  {
    name: 'Southeast Asia',
    points: [
      [22, 100], [20, 100], [18, 102], [14, 100],
      [10, 99], [7, 100], [2, 103], [1, 104],
      [-2, 106], [-8, 114], [-8, 116], [-7, 110],
      [-3, 108], [0, 105], [2, 103], [7, 100],
      [10, 99], [14, 100], [18, 102], [20, 100],
      [22, 108], [22, 100],
    ],
  },
  {
    name: 'Indonesia Sumatra-Java',
    points: [
      [6, 95], [2, 99], [-1, 104], [-6, 106],
      [-7, 107], [-8, 112], [-8, 114],
      [-7, 116], [-4, 114], [-6, 106],
      [-1, 104], [2, 99], [6, 95],
    ],
  },
  {
    name: 'Indonesia East',
    points: [
      [-1, 120], [-2, 125], [-4, 128], [-8, 127],
      [-9, 125], [-8, 120], [-5, 118], [-1, 120],
    ],
  },
  {
    name: 'Papua New Guinea',
    points: [
      [-2, 141], [-6, 141], [-8, 143], [-10, 148],
      [-8, 152], [-6, 156], [-4, 153], [-2, 147],
      [-1, 141], [-2, 141],
    ],
  },
  {
    name: 'Australia',
    points: [
      [-12, 130], [-14, 127], [-22, 114], [-32, 116],
      [-35, 118], [-35, 138], [-38, 145], [-38, 148],
      [-34, 152], [-28, 154], [-24, 152], [-19, 146],
      [-16, 146], [-12, 142], [-12, 137], [-15, 133],
      [-12, 130],
    ],
  },
];

// ---------------------------------------------------------------------------
// Coffee belt (tropics)
// ---------------------------------------------------------------------------
const TROPIC_CANCER_Y = project(23.4, 0).y;
const TROPIC_CAPRICORN_Y = project(-23.4, 0).y;

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------
function markerColor(avgScore: number | null): string {
  if (avgScore !== null) {
    const h = 30 + avgScore * 5;
    return `hsl(${h}, 70%, 45%)`;
  }
  return '#8b6342';
}

function markerColorLight(avgScore: number | null): string {
  if (avgScore !== null) {
    const h = 30 + avgScore * 5;
    return `hsl(${h}, 65%, 55%)`;
  }
  return '#c4956a';
}

// ---------------------------------------------------------------------------
// MapContent — renders inside both compact and fullscreen views
// ---------------------------------------------------------------------------
function MapContent({
  data,
  onCountryClick,
  selectedCountry,
  isFullscreen = false,
}: WorldMapProps & { isFullscreen?: boolean }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const dataByCountry = data.reduce(
    (acc, d) => {
      acc[d.countryCode] = d;
      acc[d.countryName] = d;
      return acc;
    },
    {} as Record<string, MapDataPoint>,
  );

  const baseR = isFullscreen ? 2.2 : 1.8;
  const scaleR = isFullscreen ? 3.0 : 2.2;

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="wm-ocean" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f0f7ff" />
            <stop offset="100%" stopColor="#e6f0fa" />
          </linearGradient>
          <linearGradient id="wm-land" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4c4b0" />
            <stop offset="100%" stopColor="#c8b8a4" />
          </linearGradient>
        </defs>

        {/* Ocean background */}
        <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#wm-ocean)" />

        {/* Coffee belt highlight between tropics */}
        <rect
          x="0"
          y={TROPIC_CANCER_Y}
          width={MAP_W}
          height={TROPIC_CAPRICORN_Y - TROPIC_CANCER_Y}
          fill="rgba(180, 140, 100, 0.07)"
        />

        {/* Continent outlines — same projection as markers */}
        <g fill="url(#wm-land)" stroke="#b8a896" strokeWidth="0.3" strokeLinejoin="round">
          {CONTINENTS.map((c) => (
            <polygon key={c.name} points={toPoints(c.points)} />
          ))}
        </g>

        {/* Tropic lines */}
        <line
          x1="0" y1={TROPIC_CANCER_Y}
          x2={MAP_W} y2={TROPIC_CANCER_Y}
          stroke="#a09080" strokeWidth="0.2" strokeDasharray="2,2" opacity="0.35"
        />
        <line
          x1="0" y1={TROPIC_CAPRICORN_Y}
          x2={MAP_W} y2={TROPIC_CAPRICORN_Y}
          stroke="#a09080" strokeWidth="0.2" strokeDasharray="2,2" opacity="0.35"
        />

        {/* Country markers — inside the SVG, same coordinate space */}
        {Object.entries(COUNTRY_COORDS).map(([country, coords]) => {
          const countryData = dataByCountry[country];
          if (!countryData) return null;

          const { x, y } = project(coords.lat, coords.lng);
          const r = baseR + (countryData.count / maxCount) * scaleR;
          const isSelected = selectedCountry === country;

          return (
            <g
              key={country}
              onClick={(e) => {
                e.stopPropagation();
                onCountryClick(country);
              }}
              style={{ cursor: 'pointer' }}
            >
              {/* Selection ring */}
              {isSelected && (
                <circle
                  cx={x} cy={y} r={r + 1.6}
                  fill="none"
                  stroke="#8b6342"
                  strokeWidth="0.6"
                />
              )}
              {isSelected && (
                <circle
                  cx={x} cy={y} r={r + 1.0}
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              )}
              {/* Shadow */}
              <circle
                cx={x} cy={y + 0.3} r={r}
                fill="rgba(0,0,0,0.15)"
              />
              {/* Marker */}
              <circle
                cx={x} cy={y} r={r}
                fill={markerColor(countryData.avgScore)}
                stroke={markerColorLight(countryData.avgScore)}
                strokeWidth="0.4"
              />
              {/* Count label (only when marker is big enough) */}
              {r > 3.2 && (
                <text
                  x={x} y={y + 0.8}
                  textAnchor="middle"
                  fontSize="2.4"
                  fontWeight="bold"
                  fill="white"
                  style={{ pointerEvents: 'none' }}
                >
                  {countryData.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Selected country info overlay (HTML, positioned in corner) */}
      {selectedCountry && dataByCountry[selectedCountry] && (
        <div
          className={`absolute bg-white rounded-xl shadow-lg border border-coffee-200 ${
            isFullscreen ? 'top-4 left-4 px-4 py-3' : 'top-2 left-2 px-3 py-2'
          }`}
        >
          <div className="flex items-center gap-2">
            <CountryFlag country={selectedCountry} size="sm" showName={false} />
            <div>
              <p
                className={`font-bold text-coffee-900 ${
                  isFullscreen ? 'text-base' : 'text-sm'
                }`}
              >
                {selectedCountry}
              </p>
              <p className="text-xs text-coffee-500">
                {dataByCountry[selectedCountry].count} bean
                {dataByCountry[selectedCountry].count !== 1 ? 's' : ''}
                {dataByCountry[selectedCountry].avgScore &&
                  ` · ${dataByCountry[selectedCountry].avgScore!.toFixed(1)}★`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exported WorldMap with compact + fullscreen modes
// ---------------------------------------------------------------------------
export function WorldMap({ data, onCountryClick, selectedCountry }: WorldMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (data.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
          <span className="text-4xl">🌍</span>
        </div>
        <p className="text-coffee-600 mb-2 font-medium">No origins yet</p>
        <p className="text-coffee-400 text-sm">
          Add beans with origin countries to see them on the map
        </p>
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
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
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
                <h2 className="font-display font-bold text-coffee-900 text-lg">
                  Your Coffee Origins
                </h2>
                <p className="text-sm text-coffee-500">
                  {data.length} countries explored
                </p>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="w-10 h-10 rounded-full bg-coffee-100 hover:bg-coffee-200 flex items-center justify-center text-coffee-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
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
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      background:
                        'linear-gradient(135deg, #c4956a 0%, #8b6342 100%)',
                    }}
                  ></div>
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
