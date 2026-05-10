'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { formatRoastDate } from '@kissa/shared';
import { Logo } from '../../components/Logo';
import { CountryFlag } from '../../components/CountryFlag';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001');

async function fetchBeans() {
  const res = await fetch(`${API_URL}/api/beans`);
  if (!res.ok) throw new Error('Failed to fetch beans');
  return res.json();
}

export default function BeansPage() {
  const router = useRouter();

  const { data: beans, isLoading, error } = useQuery({
    queryKey: ['beans'],
    queryFn: fetchBeans,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" animate />
          <p className="text-coffee-500 animate-pulse">Loading beans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center">
          <p className="text-red-600">Error loading beans</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-3 sm:px-4 pt-4 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <header className="mb-6 sm:mb-8 animate-fade-in flex flex-col items-center text-center">
        <div className="mb-4 sm:mb-6">
          <Logo size="md" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gradient">Your Beans</h1>
          <p className="text-coffee-600 mt-1 text-sm sm:text-base">{beans?.length || 0} coffee{beans?.length !== 1 ? 's' : ''} tracked</p>
          <div className="mt-3 sm:mt-4">
            <Link href="/beans/new" className="btn-primary inline-block">
              + Add Bean
            </Link>
          </div>
        </div>
      </header>

      {beans?.length === 0 ? (
        <div className="card text-center py-12 animate-slide-up">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
            <span className="text-4xl">🫘</span>
          </div>
          <p className="text-coffee-600 mb-2 font-medium">No beans yet</p>
          <p className="text-coffee-400 text-sm mb-6">Start tracking your coffee journey</p>
          <Link href="/beans/new" className="btn-primary inline-block">
            Add your first bean
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {beans?.map((bean: any, index: number) => (
            <button
              key={bean.id}
              onClick={() => router.push(`/beans/${bean.id}`)}
              className="card w-full text-left hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-coffee-500 font-medium truncate">
                    {bean.roaster?.name}
                  </p>
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
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-coffee-500">
                    {bean.bags?.length || 0} bag{bean.bags?.length !== 1 ? 's' : ''}
                  </p>
                  {bean.bags?.[0] && (
                    <p className="text-xs text-coffee-400 mt-1">
                      {formatRoastDate(new Date(bean.bags[0].roastDate))}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
