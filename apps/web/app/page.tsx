'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MethodPicker } from '../components/MethodPicker';
import { AvailableBeanCard } from '../components/AvailableBeanCard';
import { FrozenBagCard } from '../components/FrozenBagCard';
import { Logo } from '../components/Logo';
import { useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001');

async function updateBagTubePosition(bagId: string, tubePosition: string | null) {
  const res = await fetch(`${API_URL}/api/bags/${bagId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tubePosition }),
  });
  if (!res.ok) throw new Error('Failed to update tube position');
  return res.json();
}

async function updateGrinderSetting(newSetting: number) {
  const res = await fetch(`${API_URL}/api/grinder/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newSetting }),
  });
  if (!res.ok) throw new Error('Failed to update grinder');
  return res.json();
}

async function unfreezeBag(bagId: string) {
  const res = await fetch(`${API_URL}/api/bags/${bagId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'OPEN' }),
  });
  if (!res.ok) throw new Error('Failed to unfreeze bag');
  return res.json();
}

async function fetchAvailableBeans(methodId?: string) {
  const url = methodId
    ? `${API_URL}/api/available-beans?methodId=${methodId}`
    : `${API_URL}/api/available-beans`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch available beans');
  return res.json();
}

async function fetchMethods() {
  const res = await fetch(`${API_URL}/api/methods`);
  if (!res.ok) throw new Error('Failed to fetch methods');
  return res.json();
}

export default function HomePage() {
  const queryClient = useQueryClient();
  const [selectedMethodId, setSelectedMethodId] = useState<string | undefined>();
  const [showGrindModal, setShowGrindModal] = useState(false);
  const [tempGrindSetting, setTempGrindSetting] = useState<number>(20);
  const [showFrozen, setShowFrozen] = useState(false);

  const { data: methods, isLoading: methodsLoading } = useQuery({
    queryKey: ['methods'],
    queryFn: fetchMethods,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['available-beans', selectedMethodId],
    queryFn: () => fetchAvailableBeans(selectedMethodId),
  });

  const grindMutation = useMutation({
    mutationFn: updateGrinderSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-beans'] });
      setShowGrindModal(false);
    },
  });

  const tubePositionMutation = useMutation({
    mutationFn: ({ bagId, tubePosition }: { bagId: string; tubePosition: string | null }) =>
      updateBagTubePosition(bagId, tubePosition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-beans'] });
    },
  });

  const unfreezeMutation = useMutation({
    mutationFn: unfreezeBag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-beans'] });
    },
  });

  const openGrindModal = () => {
    setTempGrindSetting(data?.currentGrinderSetting || 20);
    setShowGrindModal(true);
  };

  if (methodsLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" animate />
          <p className="text-coffee-500 animate-pulse">Loading your coffee...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center">
          <p className="text-red-600 mb-4">Unable to connect to server</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-secondary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const frozenBags = data?.frozenBags || [];

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto pb-28">
      {/* Header with Logo */}
      <header className="mb-4 animate-fade-in flex justify-center">
        <Logo size="md" />
      </header>

      {/* Method Picker */}
      <section className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="section-title">
          <span className="text-xl">☕</span>
          Brewing Method
        </h2>
        <MethodPicker
          methods={methods || []}
          selectedId={selectedMethodId || data?.selectedMethodId}
          onSelect={setSelectedMethodId}
        />
      </section>

      {/* Grinder Status - Clickable to adjust */}
      {data?.currentGrinderSetting && (
        <button 
          onClick={openGrindModal}
          className="card-flat mb-6 flex items-center gap-3 w-full text-left animate-slide-up hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coffee-200 to-coffee-300 flex items-center justify-center">
            <span className="text-2xl">⚙️</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-coffee-500">Current grind setting</p>
            <p className="font-bold text-xl text-coffee-800">{data.currentGrinderSetting} clicks</p>
          </div>
          <span className="text-coffee-400 text-sm">Tap to adjust →</span>
        </button>
      )}

      {/* Available Beans */}
      <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">
            <span className="text-xl">🫘</span>
            Your Rotation
          </h2>
          <Link href="/beans/new" className="btn-ghost text-sm">
            + Add
          </Link>
        </div>
        
        {data?.bags?.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
              <span className="text-4xl">🫘</span>
            </div>
            <p className="text-coffee-600 mb-2 font-medium">No beans in your rotation</p>
            <p className="text-coffee-400 text-sm mb-6">Add your first coffee to get started</p>
            <Link href="/beans/new" className="btn-primary inline-block">
              Add your first bean
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.bags?.map((bag: any, index: number) => (
              <div 
                key={bag.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <AvailableBeanCard
                  bag={bag}
                  methodId={selectedMethodId || data?.selectedMethodId}
                  onTubePositionChange={(bagId, position) => 
                    tubePositionMutation.mutate({ bagId, tubePosition: position })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Frozen Bags Section */}
      {frozenBags.length > 0 && (
        <section className="mt-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={() => setShowFrozen(!showFrozen)}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <h2 className="section-title mb-0">
              <span className="text-xl">❄</span>
              Frozen ({frozenBags.length})
            </h2>
            <span className={`text-coffee-400 text-sm transition-transform ${showFrozen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showFrozen && (
            <div className="space-y-2 mt-2">
              {frozenBags.map((bag: any) => (
                <FrozenBagCard
                  key={bag.id}
                  bag={bag}
                  onUnfreeze={(bagId) => unfreezeMutation.mutate(bagId)}
                  isUnfreezing={unfreezeMutation.isPending}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Grind Setting Modal */}
      {showGrindModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-coffee-900 mb-4 text-center">
              Adjust Grind Setting
            </h3>
            
            <div className="flex items-center justify-center gap-6 mb-6">
              <button
                onClick={() => setTempGrindSetting((s) => Math.max(1, s - 1))}
                className="w-14 h-14 rounded-full bg-coffee-100 hover:bg-coffee-200 text-coffee-800 font-bold text-2xl transition-colors"
              >
                −
              </button>
              <div className="text-center">
                <p className="text-5xl font-bold text-coffee-900">{tempGrindSetting}</p>
                <p className="text-sm text-coffee-500 mt-1">clicks</p>
              </div>
              <button
                onClick={() => setTempGrindSetting((s) => Math.min(99, s + 1))}
                className="w-14 h-14 rounded-full bg-coffee-100 hover:bg-coffee-200 text-coffee-800 font-bold text-2xl transition-colors"
              >
                +
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGrindModal(false)}
                className="flex-1 py-3 rounded-xl font-semibold bg-coffee-100 text-coffee-700 hover:bg-coffee-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => grindMutation.mutate(tempGrindSetting)}
                disabled={grindMutation.isPending}
                className="flex-1 py-3 rounded-xl font-semibold bg-coffee-800 text-white hover:bg-coffee-900 transition-colors disabled:opacity-50"
              >
                {grindMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
