'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatRoastDate } from '@kissa/shared';
import { Logo } from '../../../components/Logo';
import { CountryFlag } from '../../../components/CountryFlag';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001');

async function fetchRoaster(id: string) {
  const res = await fetch(`${API_URL}/api/roasters/${id}`);
  if (!res.ok) throw new Error('Failed to fetch roaster');
  return res.json();
}

interface Bean {
  id: string;
  name: string;
  originCountry?: string | null;
  originRegion?: string | null;
  process?: string | null;
  varietal?: string | null;
  roastLevel?: string | null;
  tastingNotesExpected?: string | null;
  bags?: {
    id: string;
    status: string;
    roastDate: string;
    isAvailable: boolean;
  }[];
}

interface RoasterDetail {
  id: string;
  name: string;
  country?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  notes?: string | null;
  beans: Bean[];
}

export default function RoasterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roasterId = params.id as string;

  const { data: roaster, isLoading, error } = useQuery<RoasterDetail>({
    queryKey: ['roaster', roasterId],
    queryFn: () => fetchRoaster(roasterId),
    enabled: !!roasterId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" animate />
          <p className="text-coffee-500 animate-pulse">Loading roaster...</p>
        </div>
      </div>
    );
  }

  if (error || !roaster) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center">
          <p className="text-red-600 mb-4">Error loading roaster</p>
          <button onClick={() => router.push('/roasters')} className="btn-secondary">
            Back to Roasters
          </button>
        </div>
      </div>
    );
  }

  const openBagsCount = roaster.beans.reduce(
    (sum, bean) => sum + (bean.bags?.filter((b) => b.status === 'OPEN').length || 0),
    0
  );

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto pb-28">
      {/* Header */}
      <header className="mb-6 animate-fade-in">
        <button
          onClick={() => router.push('/roasters')}
          className="text-coffee-500 mb-3 hover:text-coffee-700 transition-colors"
        >
          ← Back to Roasters
        </button>

        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm p-2">
            {roaster.logoUrl ? (
              <img src={roaster.logoUrl} alt={roaster.name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-3xl">☕</span>
            )}
          </div>

          {/* Roaster Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-display font-bold text-gradient truncate">
              {roaster.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {roaster.country && (
                <span className="badge-primary text-xs">
                  <CountryFlag country={roaster.country} size="sm" showName={true} />
                </span>
              )}
              {roaster.website && (
                <a
                  href={roaster.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="badge bg-blue-100 text-blue-700 text-xs hover:bg-blue-200 transition-colors"
                >
                  🌐 Website
                </a>
              )}
            </div>
            {roaster.notes && (
              <p className="text-sm text-coffee-500 mt-2">{roaster.notes}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <div className="card flex-1 text-center py-3">
            <p className="text-2xl font-display font-bold text-coffee-800">{roaster.beans.length}</p>
            <p className="text-xs text-coffee-500">Bean{roaster.beans.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="card flex-1 text-center py-3">
            <p className="text-2xl font-display font-bold text-coffee-800">{openBagsCount}</p>
            <p className="text-xs text-coffee-500">Open Bag{openBagsCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </header>

      {/* Beans List */}
      <section>
        <h2 className="text-lg font-semibold text-coffee-800 mb-3">
          Beans from {roaster.name}
        </h2>

        {roaster.beans.length === 0 ? (
          <div className="card text-center py-12 animate-slide-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
              <span className="text-3xl">🫘</span>
            </div>
            <p className="text-coffee-600 mb-2 font-medium">No beans yet</p>
            <p className="text-coffee-400 text-sm mb-4">This roaster doesn't have any beans tracked</p>
            <Link href="/beans/new" className="btn-primary inline-block">
              + Add Bean
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {roaster.beans.map((bean, index) => {
              const expectedNotes = bean.tastingNotesExpected
                ? JSON.parse(bean.tastingNotesExpected)
                : [];
              const activeBags = bean.bags?.filter((b) => b.status !== 'FINISHED') || [];
              const latestBag = bean.bags?.[0];

              return (
                <Link
                  key={bean.id}
                  href={`/beans/${bean.id}`}
                  className="card block hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-xl text-coffee-900 truncate">
                        {bean.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {bean.originCountry && (
                          <span className="badge-primary">
                            <CountryFlag country={bean.originCountry} size="sm" showName={true} />
                          </span>
                        )}
                        {bean.process && (
                          <span className="badge bg-purple-100 text-purple-700">
                            {bean.process}
                          </span>
                        )}
                        {bean.roastLevel && (
                          <span className="badge bg-amber-100 text-amber-700">
                            {bean.roastLevel.replace('_', ' ').toLowerCase()}
                          </span>
                        )}
                      </div>

                      {expectedNotes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {expectedNotes.slice(0, 4).map((note: string) => (
                            <span
                              key={note}
                              className="px-2 py-0.5 bg-coffee-50 text-coffee-500 rounded-full text-xs"
                            >
                              {note}
                            </span>
                          ))}
                          {expectedNotes.length > 4 && (
                            <span className="text-xs text-coffee-400">+{expectedNotes.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-coffee-500">
                        {bean.bags?.length || 0} bag{(bean.bags?.length || 0) !== 1 ? 's' : ''}
                      </p>
                      {activeBags.length > 0 && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          {activeBags.length} active
                        </p>
                      )}
                      {latestBag && (
                        <p className="text-xs text-coffee-400 mt-1">
                          {formatRoastDate(new Date(latestBag.roastDate))}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
