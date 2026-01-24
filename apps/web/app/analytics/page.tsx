'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorldMap } from '../../components/WorldMap';
import { CountryList } from '../../components/CountryList';
import { BeanRankingList } from '../../components/BeanRankingList';
import { Logo } from '../../components/Logo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001');

async function fetchMapData(availableOnly: boolean) {
  const url = availableOnly
    ? `${API_URL}/api/analytics/map?availableOnly=true`
    : `${API_URL}/api/analytics/map`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch map data');
  return res.json();
}

async function fetchCountryData(code: string) {
  const res = await fetch(`${API_URL}/api/analytics/country/${code}`);
  if (!res.ok) throw new Error('Failed to fetch country data');
  return res.json();
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const { data: mapData, isLoading: mapLoading } = useQuery({
    queryKey: ['analytics-map', availableOnly],
    queryFn: () => fetchMapData(availableOnly),
  });

  const { data: countryData, isLoading: countryLoading } = useQuery({
    queryKey: ['analytics-country', selectedCountry],
    queryFn: () => fetchCountryData(selectedCountry!),
    enabled: !!selectedCountry,
  });

  if (mapLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" animate />
          <p className="text-coffee-500 animate-pulse">Exploring the world...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto pb-28">
      {/* Header */}
      <header className="mb-8 animate-fade-in flex flex-col items-center text-center">
        <div className="mb-6">
          <Logo size="md" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient">Coffee Map</h1>
          <p className="text-coffee-600 mt-1">Explore your coffee origins</p>
        </div>
      </header>

      {/* Filters */}
      <div className="flex gap-2 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <button
          onClick={() => setAvailableOnly(false)}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            !availableOnly
              ? 'bg-gradient-to-br from-coffee-800 to-coffee-900 text-white shadow-lg'
              : 'bg-coffee-100 text-coffee-600 hover:bg-coffee-200'
          }`}
        >
          All-time
        </button>
        <button
          onClick={() => setAvailableOnly(true)}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            availableOnly
              ? 'bg-gradient-to-br from-coffee-800 to-coffee-900 text-white shadow-lg'
              : 'bg-coffee-100 text-coffee-600 hover:bg-coffee-200'
          }`}
        >
          In rotation
        </button>
      </div>

      {/* Map */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <WorldMap
          data={mapData || []}
          onCountryClick={(code) => setSelectedCountry(code)}
          selectedCountry={selectedCountry}
        />
      </div>

      {/* Country list or drilldown */}
      {selectedCountry ? (
        <div className="mt-6 animate-slide-up">
          <button
            onClick={() => setSelectedCountry(null)}
            className="btn-ghost mb-4 flex items-center gap-1"
          >
            <span>←</span> Back to all countries
          </button>

          {countryLoading ? (
            <div className="card text-center py-8">
              <div className="text-coffee-500 animate-pulse">Loading...</div>
            </div>
          ) : countryData ? (
            <div>
              <h2 className="text-2xl font-display font-bold text-coffee-800 mb-4">
                {countryData.countryName}
              </h2>
              {countryData.regions.map((region: any) => (
                <div key={region.regionName} className="mb-6">
                  <h3 className="section-title">
                    <span>📍</span>
                    {region.regionName}
                  </h3>
                  <BeanRankingList
                    beans={region.beans}
                    onBeanClick={(id) => router.push(`/beans/${id}`)}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="section-title">
            <span>🌍</span>
            Countries
          </h2>
          <CountryList
            data={mapData || []}
            onCountryClick={(code) => setSelectedCountry(code)}
          />
        </div>
      )}
    </main>
  );
}
