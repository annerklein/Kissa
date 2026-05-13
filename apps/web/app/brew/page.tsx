'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import React from 'react';
import { GrinderCard } from '../../components/GrinderCard';
import { ServingsControl } from '../../components/ServingsControl';
import { RecipeCard } from '../../components/RecipeCard';
import { Logo } from '../../components/Logo';
// Tube position is displayed inline in the hero header

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001');

async function fetchBrewScreen(bagId: string, methodId: string) {
  const res = await fetch(
    `${API_URL}/api/brews/screen?bagId=${bagId}&methodId=${methodId}`
  );
  if (!res.ok) throw new Error('Failed to fetch brew data');
  return res.json();
}

async function createBrew(data: { bagId: string; methodId: string; parameters?: any }) {
  const res = await fetch(`${API_URL}/api/brews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create brew');
  return res.json();
}

async function applyGrinder(newSetting: number) {
  const res = await fetch(`${API_URL}/api/grinder/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newSetting }),
  });
  if (!res.ok) throw new Error('Failed to apply grinder setting');
  return res.json();
}

const COFFEE_GIFS = [
  '/gifs/coffee-1.gif',
  '/gifs/coffee-2.gif',
  '/gifs/coffee-3.gif',
  '/gifs/coffee-4.gif',
  '/gifs/coffee-5.gif',
  '/gifs/coffee-6.gif',
  '/gifs/coffee-7.gif',
  '/gifs/coffee-8.gif',
  '/gifs/coffee-9.gif',
  '/gifs/coffee-10.gif',
];

function getRandomGif(): string {
  return COFFEE_GIFS[Math.floor(Math.random() * COFFEE_GIFS.length)];
}

export default function BrewPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" animate />
          <p className="text-coffee-500 animate-pulse">Preparing your brew...</p>
        </div>
      </div>
    }>
      <BrewPageContent />
    </React.Suspense>
  );
}

function BrewPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const bagId = searchParams.get('bagId');
  const methodId = searchParams.get('methodId');

  const [servings, setServings] = useState(1);
  const [gramsPerServing, setGramsPerServing] = useState(15);
  const [hasInitializedServings, setHasInitializedServings] = useState(false);
  const [brewingState, setBrewingState] = useState<{ gif: string; brewId?: string; action: 'rate' | 'log' } | null>(null);

  // Reset initialization when bag or method changes
  React.useEffect(() => {
    setHasInitializedServings(false);
  }, [bagId, methodId]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['brew-screen', bagId, methodId],
    queryFn: () => fetchBrewScreen(bagId!, methodId!),
    enabled: !!bagId && !!methodId,
  });

  const grinderMutation = useMutation({
    mutationFn: applyGrinder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brew-screen'] });
    },
  });

  const [lastAction, setLastAction] = useState<'rate' | 'log' | null>(null);

  const brewMutation = useMutation({
    mutationFn: createBrew,
  });

  if (!bagId || !methodId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center">
          <p className="text-coffee-600">Missing bag or method selection</p>
          <button onClick={() => router.push('/')} className="btn-secondary mt-4">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" animate />
          <p className="text-coffee-500 animate-pulse">Preparing your brew...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center">
          <p className="text-red-600 mb-4">Error loading brew data</p>
          <button onClick={() => router.push('/')} className="btn-secondary">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const { bag, method, recipe, currentGrinderSetting, scaledRecipe } = data;
  const targetSetting = recipe?.grinderTarget || scaledRecipe.grindSize || 20;

  // Set default servings based on method (1 for v60/moka, 2 for others)
  // and set gramsPerServing from scaled recipe
  if (!hasInitializedServings && method) {
    const defaultServings = ['v60', 'moka'].includes(method.name) ? 1 : 2;
    if (servings !== defaultServings) {
      setServings(defaultServings);
    }
    if (scaledRecipe.gramsPerServing) {
      setGramsPerServing(scaledRecipe.gramsPerServing);
    }
    setHasInitializedServings(true);
  }

  // Calculate scaled values
  const dose = servings * gramsPerServing;
  const water = scaledRecipe.ratio ? dose * scaledRecipe.ratio : 0;
  const scaleFactor = scaledRecipe.dose ? dose / scaledRecipe.dose : 1;

  const brewData = {
    bagId: bag.id,
    methodId: method.id,
    parameters: {
      dose,
      water: water || undefined,
      ratio: scaledRecipe.ratio,
      waterTemp: scaledRecipe.waterTemp,
      grindSize: targetSetting,
    },
  };

  const handleBrewAndRate = () => {
    setLastAction('rate');
    const gif = getRandomGif();
    brewMutation.mutate(brewData, {
      onSuccess: (brew) => {
        setBrewingState({ gif, brewId: brew.id, action: 'rate' });
      },
    });
  };

  const handleJustBrew = () => {
    setLastAction('log');
    const gif = getRandomGif();
    brewMutation.mutate(brewData, {
      onSuccess: () => {
        queryClient.invalidateQueries();
        setBrewingState({ gif, action: 'log' });
      },
    });
  };

  const handleBrewingScreenTap = () => {
    if (!brewingState) return;
    if (brewingState.action === 'rate' && brewingState.brewId) {
      router.push(`/rate?brewId=${brewingState.brewId}`);
    } else {
      router.push('/');
    }
  };

  if (brewingState) {
    return (
      <main
        onClick={handleBrewingScreenTap}
        className="min-h-screen bg-gradient-to-b from-coffee-900 via-coffee-800 to-coffee-900 flex flex-col items-center justify-center cursor-pointer select-none"
      >
        <div className="animate-scale-in flex flex-col items-center px-6 max-w-sm">
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brewingState.gif}
              alt="Brewing coffee..."
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-white text-2xl sm:text-3xl font-display font-bold text-center mb-2">
            Brewing...
          </h2>
          <p className="text-coffee-300 text-sm sm:text-base text-center">
            {brewingState.action === 'rate' ? 'Tap anywhere to rate your brew' : 'Tap anywhere when done'}
          </p>
          <div className="mt-6 animate-pulse-soft">
            <span className="text-4xl">☕</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-coffee-50 via-white to-coffee-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-coffee-800 to-coffee-900 text-white px-4 pt-5 sm:pt-6 pb-6 sm:pb-8 rounded-b-3xl shadow-xl">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <button
              onClick={() => router.back()}
              className="text-coffee-300 hover:text-white transition-colors flex items-center gap-1 text-sm"
            >
              <span>←</span> Back
            </button>
            <div className="flex-1 flex justify-center -ml-12">
              <Logo size="sm" />
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-coffee-300 text-xs sm:text-sm font-medium">{bag.bean.roaster.name}</p>
            <h1 className="text-2xl sm:text-3xl font-display font-bold mt-1 truncate px-2">{bag.bean.name}</h1>
            <div className="flex justify-center items-center gap-2 sm:gap-3 mt-2 sm:mt-3 flex-wrap">
              <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white/20 rounded-full text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm">
                {method.displayName}
              </span>
              {bag.tubePosition && (
                <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-amber-500/30 rounded-full text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm flex items-center gap-1">
                  <span className="text-amber-200">Tube:</span>
                  <span>{bag.tubePosition === 'LEFT' ? 'L' : bag.tubePosition === 'MIDDLE' ? 'M' : 'R'}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 -mt-4 pb-36">
        {/* Grinder Card */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <GrinderCard
            current={currentGrinderSetting}
            target={targetSetting}
            onApply={(newSetting) => grinderMutation.mutate(newSetting)}
            isApplying={grinderMutation.isPending}
          />
        </div>

        {/* Servings Control */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <ServingsControl
            servings={servings}
            gramsPerServing={gramsPerServing}
            onServingsChange={setServings}
            onGramsChange={setGramsPerServing}
          />
        </div>

        {/* Recipe Card */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <RecipeCard
            method={method}
            dose={dose}
            water={water}
            waterTemp={scaledRecipe.waterTemp}
            steps={scaledRecipe.steps}
            scaleFactor={scaleFactor}
          />
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="floating-action">
        <div className="max-w-2xl mx-auto space-y-2">
          <button
            onClick={handleBrewAndRate}
            disabled={brewMutation.isPending}
            className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2"
          >
            {brewMutation.isPending && lastAction === 'rate' ? (
              <>
                <span className="animate-spin">⏳</span>
                Starting...
              </>
            ) : (
              <>
                <span>☕</span>
                Brew & Rate
              </>
            )}
          </button>
          <button
            onClick={handleJustBrew}
            disabled={brewMutation.isPending}
            className="w-full py-3 text-sm font-medium text-coffee-500 hover:text-coffee-700 transition-colors flex items-center justify-center gap-1.5"
          >
            {brewMutation.isPending && lastAction === 'log' ? (
              <>
                <span className="animate-spin text-xs">⏳</span>
                Logging...
              </>
            ) : (
              'Just Brew — skip rating'
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
