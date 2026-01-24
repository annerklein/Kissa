'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '../../components/Logo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001');

interface BeanInput {
  roasterName: string;
  name: string;
  originCountry: string;
  roastLevel: string;
  tastingNotesExpected: string[];
  bag: {
    roastDate: Date;
    isAvailable: boolean;
  };
}

async function submitOnboarding(data: {
  settings: { defaultServings: number; gramsPerServing: number };
  grinder: { model: string; currentSetting: number };
  beans: BeanInput[];
}) {
  const res = await fetch(`${API_URL}/api/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit onboarding');
  return res.json();
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Settings
  const [servings, setServings] = useState(2);
  const [gramsPerServing, setGramsPerServing] = useState(15);

  // Grinder
  const [grinderModel, setGrinderModel] = useState('Comandante C40');
  const [grinderSetting, setGrinderSetting] = useState(20);

  // Beans
  const [beans, setBeans] = useState<BeanInput[]>([
    {
      roasterName: '',
      name: '',
      originCountry: '',
      roastLevel: 'MEDIUM',
      tastingNotesExpected: [],
      bag: {
        roastDate: new Date(),
        isAvailable: true,
      },
    },
  ]);

  const mutation = useMutation({
    mutationFn: submitOnboarding,
    onSuccess: () => {
      router.push('/');
    },
  });

  const steps = [
    { title: 'Welcome', icon: '☕' },
    { title: 'Household', icon: '🏠' },
    { title: 'Grinder', icon: '⚙️' },
    { title: 'First Bean', icon: '🫘' },
    { title: 'Ready!', icon: '🎉' },
  ];

  const updateBean = (index: number, updates: Partial<BeanInput>) => {
    setBeans((prev) =>
      prev.map((b, i) => (i === index ? { ...b, ...updates } : b))
    );
  };

  const handleSubmit = () => {
    mutation.mutate({
      settings: { defaultServings: servings, gramsPerServing },
      grinder: { model: grinderModel, currentSetting: grinderSetting },
      beans: beans.filter((b) => b.roasterName && b.name),
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-coffee-50 via-white to-coffee-100 flex flex-col p-4 max-w-md mx-auto">
      {/* Progress */}
      <div className="flex gap-1.5 mb-8 mt-4">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= step 
                ? 'bg-gradient-to-r from-coffee-700 to-coffee-900' 
                : 'bg-coffee-200'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 animate-fade-in" key={step}>
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center py-8">
            <Logo size="xl" />
            <h1 className="text-4xl font-display font-bold text-gradient mt-6 mb-4">
              Welcome to Kissa
            </h1>
            <p className="text-coffee-600 text-lg mb-8">
              Your personal coffee brewing companion
            </p>
            <div className="card-flat p-6">
              <p className="text-coffee-500">
                Let's get you set up in under a minute. We'll configure your preferences and add your first coffee.
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Household */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">{steps[1].icon}</span>
              <h2 className="text-2xl font-display font-bold text-gradient">{steps[1].title}</h2>
              <p className="text-coffee-500 mt-2">Default brewing preferences</p>
            </div>

            <div className="card mb-4">
              <label className="section-title mb-4">
                <span>👥</span>
                Default servings
              </label>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-coffee-100 to-coffee-200 text-coffee-700 font-bold text-2xl hover:shadow-md transition-all active:scale-95"
                >
                  −
                </button>
                <span className="text-5xl font-bold text-coffee-800 w-16 text-center">{servings}</span>
                <button
                  onClick={() => setServings(Math.min(8, servings + 1))}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-coffee-100 to-coffee-200 text-coffee-700 font-bold text-2xl hover:shadow-md transition-all active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            <div className="card">
              <label className="section-title mb-4">
                <span>⚖️</span>
                Grams per serving
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[12, 15, 18, 20].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGramsPerServing(g)}
                    className={`py-4 rounded-xl font-bold text-lg transition-all ${
                      gramsPerServing === g
                        ? 'bg-gradient-to-br from-coffee-800 to-coffee-900 text-white shadow-lg'
                        : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'
                    }`}
                  >
                    {g}g
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Grinder */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">{steps[2].icon}</span>
              <h2 className="text-2xl font-display font-bold text-gradient">{steps[2].title}</h2>
              <p className="text-coffee-500 mt-2">Your grinder setup</p>
            </div>

            <div className="card mb-4">
              <label className="section-title mb-3">
                <span>🔧</span>
                Grinder model
              </label>
              <select
                value={grinderModel}
                onChange={(e) => setGrinderModel(e.target.value)}
                className="input-field"
              >
                <option value="Comandante C40">Comandante C40</option>
                <option value="Comandante C40 + Red Clix">Comandante C40 + Red Clix</option>
                <option value="1Zpresso JX">1Zpresso JX</option>
                <option value="1Zpresso JX Pro">1Zpresso JX Pro</option>
                <option value="Timemore C2">Timemore C2</option>
                <option value="Baratza Encore">Baratza Encore</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="card">
              <label className="section-title mb-3">
                <span>🎚️</span>
                Current setting
              </label>
              <input
                type="number"
                value={grinderSetting}
                onChange={(e) => setGrinderSetting(Number(e.target.value))}
                className="input-field text-center text-3xl font-bold"
              />
              <p className="text-xs text-coffee-400 mt-3 text-center">
                Where your grinder is set right now
              </p>
            </div>
          </div>
        )}

        {/* Step 3: First Bean */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">{steps[3].icon}</span>
              <h2 className="text-2xl font-display font-bold text-gradient">{steps[3].title}</h2>
              <p className="text-coffee-500 mt-2">Add your first coffee</p>
            </div>

            {beans.map((bean, index) => (
              <div key={index} className="card mb-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-coffee-500 font-medium mb-2 block">
                      Roaster name *
                    </label>
                    <input
                      type="text"
                      value={bean.roasterName}
                      onChange={(e) => updateBean(index, { roasterName: e.target.value })}
                      placeholder="e.g., Square Mile"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-coffee-500 font-medium mb-2 block">
                      Bean name *
                    </label>
                    <input
                      type="text"
                      value={bean.name}
                      onChange={(e) => updateBean(index, { name: e.target.value })}
                      placeholder="e.g., Red Brick"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-coffee-500 font-medium mb-2 block">
                      Origin country
                    </label>
                    <input
                      type="text"
                      value={bean.originCountry}
                      onChange={(e) => updateBean(index, { originCountry: e.target.value })}
                      placeholder="e.g., Ethiopia"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-coffee-500 font-medium mb-2 block">
                      Roast date
                    </label>
                    <input
                      type="date"
                      value={bean.bag.roastDate.toISOString().split('T')[0]}
                      onChange={(e) =>
                        updateBean(index, {
                          bag: { ...bean.bag, roastDate: new Date(e.target.value) },
                        })
                      }
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() =>
                setBeans([
                  ...beans,
                  {
                    roasterName: '',
                    name: '',
                    originCountry: '',
                    roastLevel: 'MEDIUM',
                    tastingNotesExpected: [],
                    bag: { roastDate: new Date(), isAvailable: true },
                  },
                ])
              }
              className="btn-secondary w-full"
            >
              + Add another bean
            </button>
          </div>
        )}

        {/* Step 4: Ready */}
        {step === 4 && (
          <div className="text-center py-8">
            <span className="text-7xl mb-6 block animate-scale-in">{steps[4].icon}</span>
            <h2 className="text-3xl font-display font-bold text-gradient mb-4">You're all set!</h2>
            <p className="text-coffee-600 text-lg mb-8">
              Time to brew your first cup with Kissa
            </p>

            <div className="card text-left">
              <h3 className="font-semibold mb-4 text-coffee-800">Your setup:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-coffee-600">
                  <span className="text-xl">☕</span>
                  <span>{servings} servings × {gramsPerServing}g = {servings * gramsPerServing}g default dose</span>
                </div>
                <div className="flex items-center gap-3 text-coffee-600">
                  <span className="text-xl">⚙️</span>
                  <span>{grinderModel} at setting {grinderSetting}</span>
                </div>
                <div className="flex items-center gap-3 text-coffee-600">
                  <span className="text-xl">🫘</span>
                  <span>{beans.filter((b) => b.name).length} bean(s) ready to brew</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-8 pb-4">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1">
            ← Back
          </button>
        )}
        {step < steps.length - 1 ? (
          <button onClick={() => setStep(step + 1)} className="btn-primary flex-1">
            Continue →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <span className="animate-spin">⏳</span>
                Setting up...
              </>
            ) : (
              <>
                <span>☕</span>
                Start Brewing
              </>
            )}
          </button>
        )}
      </div>
    </main>
  );
}
