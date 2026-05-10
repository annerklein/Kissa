'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import React from 'react';
import { RatingSlider } from '../../components/RatingSlider';
import { TastingNotesInput } from '../../components/TastingNotesInput';
import { SuggestionCard } from '../../components/SuggestionCard';
import { Logo } from '../../components/Logo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001');

async function fetchBrew(id: string) {
  const res = await fetch(`${API_URL}/api/brews/${id}`);
  if (!res.ok) throw new Error('Failed to fetch brew');
  return res.json();
}

async function submitRating(id: string, data: any) {
  const res = await fetch(`${API_URL}/api/brews/${id}/rating`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit rating');
  return res.json();
}

async function applySuggestion(id: string, applyTo: 'bag' | 'next') {
  const res = await fetch(`${API_URL}/api/brews/${id}/apply-suggestion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applyTo }),
  });
  if (!res.ok) throw new Error('Failed to apply suggestion');
  return res.json();
}

export default function RatePage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" animate />
          <p className="text-coffee-500 animate-pulse">Loading...</p>
        </div>
      </div>
    }>
      <RatePageContent />
    </React.Suspense>
  );
}

function RatePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const brewId = searchParams.get('brewId');

  const [sliders, setSliders] = useState({
    balance: 5,
    sweetness: 5,
    clarity: 5,
    body: 5,
    finish: 5,
  });
  const [drawdownTime, setDrawdownTime] = useState<number | undefined>();
  const [tastingNotes, setTastingNotes] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [ratingResult, setRatingResult] = useState<any>(null);

  const { data: brew, isLoading, error } = useQuery({
    queryKey: ['brew', brewId],
    queryFn: () => fetchBrew(brewId!),
    enabled: !!brewId,
  });

  const ratingMutation = useMutation({
    mutationFn: (data: any) => submitRating(brewId!, data),
    onSuccess: (result) => {
      setRatingResult(result);
    },
  });

  const suggestionMutation = useMutation({
    mutationFn: (applyTo: 'bag' | 'next') => applySuggestion(brewId!, applyTo),
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.push('/');
    },
  });

  if (!brewId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center">
          <p className="text-coffee-600">Missing brew ID</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" animate />
          <p className="text-coffee-500 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !brew) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center">
          <p className="text-red-600">Error loading brew</p>
        </div>
      </div>
    );
  }

  const isV60 = brew.method?.name === 'v60';
  const expectedNotes = brew.bag?.bean?.tastingNotesExpected
    ? JSON.parse(brew.bag.bean.tastingNotesExpected)
    : [];

  const handleSubmitRating = () => {
    ratingMutation.mutate({
      ratingSliders: sliders,
      drawdownTime: isV60 ? drawdownTime : undefined,
      tastingNotesActual: tastingNotes.length > 0 ? tastingNotes : undefined,
      notes: notes || undefined,
    });
  };

  // Show score and suggestion after rating
  if (ratingResult) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-coffee-50 via-white to-coffee-100 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          {/* Score display */}
          <div className="card-highlight text-center py-12 mb-6 animate-scale-in">
            <p className="text-coffee-300 text-sm uppercase tracking-wide mb-2">Your Score</p>
            <div className="relative inline-block">
              <span className="text-7xl font-bold text-white">
                {ratingResult.computedScore.toFixed(1)}
              </span>
              <span className="text-2xl text-coffee-300 ml-1">/10</span>
            </div>
            <div className="mt-4 flex justify-center gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < Math.round(ratingResult.computedScore)
                      ? 'bg-white'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Suggestion */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <SuggestionCard
              suggestion={ratingResult.suggestion}
              onApplyToBag={() => suggestionMutation.mutate('bag')}
              onApplyToNext={() => suggestionMutation.mutate('next')}
              onIgnore={() => router.push('/')}
              isApplying={suggestionMutation.isPending}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-coffee-50 via-white to-coffee-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-coffee-800 to-coffee-900 text-white px-4 pt-5 sm:pt-6 pb-6 sm:pb-8 rounded-b-3xl shadow-xl">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          <div className="mb-4 sm:mb-6">
            <Logo size="sm" />
          </div>
          <div>
            <p className="text-coffee-300 text-xs sm:text-sm">{brew.bag?.bean?.roaster?.name}</p>
            <h1 className="text-2xl sm:text-3xl font-display font-bold mt-1">Rate your brew</h1>
            <p className="text-coffee-300 mt-1.5 sm:mt-2 font-medium text-sm sm:text-base truncate max-w-[250px] sm:max-w-none">{brew.bag?.bean?.name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 -mt-4 pb-36">
        {/* Drawdown time (V60 only) */}
        {isV60 && (
          <div className="card mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label className="section-title mb-3">
              <span>⏱️</span>
              Drawdown time
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={drawdownTime || ''}
                onChange={(e) => setDrawdownTime(parseInt(e.target.value) || undefined)}
                placeholder="180"
                className="input-field text-center text-xl font-bold"
              />
              <span className="text-coffee-500">seconds</span>
            </div>
            <p className="text-xs text-coffee-400 mt-2">Target: 2:30 - 3:30</p>
          </div>
        )}

        {/* Rating sliders */}
        <div className="card mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="section-title mb-6">
            <span>🎯</span>
            How does it taste?
          </h3>
          
          <RatingSlider
            label="Balance"
            icon="⚖️"
            value={sliders.balance}
            onChange={(v) => setSliders({ ...sliders, balance: v })}
            leftLabel="Sour"
            rightLabel="Bitter"
            centerLabel="Balanced"
          />
          
          <RatingSlider
            label="Sweetness"
            icon="🍯"
            value={sliders.sweetness}
            onChange={(v) => setSliders({ ...sliders, sweetness: v })}
            leftLabel="Low"
            rightLabel="High"
          />
          
          <RatingSlider
            label="Clarity"
            icon="✨"
            value={sliders.clarity}
            onChange={(v) => setSliders({ ...sliders, clarity: v })}
            leftLabel="Muddy"
            rightLabel="Clean"
          />
          
          <RatingSlider
            label="Body"
            icon="💪"
            value={sliders.body}
            onChange={(v) => setSliders({ ...sliders, body: v })}
            leftLabel="Light"
            rightLabel="Heavy"
          />
          
          <RatingSlider
            label="Finish"
            icon="🌟"
            value={sliders.finish}
            onChange={(v) => setSliders({ ...sliders, finish: v })}
            leftLabel="Short"
            rightLabel="Long"
          />
        </div>

        {/* Tasting notes */}
        <div className="card mb-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="section-title mb-2">
            <span>👅</span>
            Tasting notes
            <span className="text-xs text-coffee-400 font-normal ml-2">(optional)</span>
          </h3>
          {expectedNotes.length > 0 && (
            <p className="text-xs text-coffee-400 mb-4 flex items-center gap-1">
              <span>📋</span>
              Roaster says: {expectedNotes.join(', ')}
            </p>
          )}
          <TastingNotesInput
            selected={tastingNotes}
            onChange={setTastingNotes}
          />
        </div>

        {/* Notes */}
        <div className="card mb-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <label className="section-title mb-3">
            <span>📝</span>
            Notes
            <span className="text-xs text-coffee-400 font-normal ml-2">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional observations..."
            rows={3}
            className="input-field resize-none"
          />
        </div>
      </div>

      {/* Submit button */}
      <div className="floating-action">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmitRating}
            disabled={ratingMutation.isPending}
            className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2"
          >
            {ratingMutation.isPending ? (
              <>
                <span className="animate-spin">⏳</span>
                Rating...
              </>
            ) : (
              <>
                <span>⭐</span>
                Submit Rating
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
