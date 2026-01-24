'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001');

async function fetchRoasters() {
  const res = await fetch(`${API_URL}/api/roasters`);
  if (!res.ok) throw new Error('Failed to fetch roasters');
  return res.json();
}

async function fetchMethods() {
  const res = await fetch(`${API_URL}/api/methods`);
  if (!res.ok) throw new Error('Failed to fetch methods');
  return res.json();
}

async function createRoaster(name: string) {
  const res = await fetch(`${API_URL}/api/roasters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create roaster');
  return res.json();
}

async function createBean(data: any) {
  const res = await fetch(`${API_URL}/api/beans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create bean');
  return res.json();
}

interface MethodRecipe {
  methodId: string;
  grinderTarget: number;
  dose?: number;
  water?: number;
  waterTemp?: number;
  ratio?: number;
  extractionTime?: number;
  steepTime?: number;
}

export default function NewBeanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [roasterId, setRoasterId] = useState('');
  const [newRoasterName, setNewRoasterName] = useState('');
  const [name, setName] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [originRegion, setOriginRegion] = useState('');
  const [process, setProcess] = useState('');
  const [varietal, setVarietal] = useState('');
  const [roastLevel, setRoastLevel] = useState('MEDIUM');
  const [tastingNotes, setTastingNotes] = useState('');

  // Brew method recipes
  const [methodRecipes, setMethodRecipes] = useState<MethodRecipe[]>([]);

  // Also add a bag
  const [roastDate, setRoastDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const { data: roasters } = useQuery({
    queryKey: ['roasters'],
    queryFn: fetchRoasters,
  });

  const { data: methods } = useQuery({
    queryKey: ['methods'],
    queryFn: fetchMethods,
  });

  const toggleMethod = (methodId: string, methodName: string) => {
    setMethodRecipes((prev) => {
      const exists = prev.find((r) => r.methodId === methodId);
      if (exists) {
        return prev.filter((r) => r.methodId !== methodId);
      }
      const defaults = getDefaultRecipe(methodName);
      return [...prev, { ...defaults, methodId }];
    });
  };

  const updateMethodRecipe = (methodId: string, updates: Partial<MethodRecipe>) => {
    setMethodRecipes((prev) =>
      prev.map((r) => (r.methodId === methodId ? { ...r, ...updates } : r))
    );
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      let finalRoasterId = roasterId;

      // Create new roaster if needed
      if (!roasterId && newRoasterName) {
        const newRoaster = await createRoaster(newRoasterName);
        finalRoasterId = newRoaster.id;
      }

      // Create bean
      const bean = await createBean({
        roasterId: finalRoasterId,
        name,
        originCountry: originCountry || undefined,
        originRegion: originRegion || undefined,
        process: process || undefined,
        varietal: varietal || undefined,
        roastLevel,
        tastingNotesExpected: tastingNotes
          ? tastingNotes.split(',').map((n) => n.trim())
          : undefined,
      });

      // Add recipes to bean
      for (const recipe of methodRecipes) {
        const { methodId, grinderTarget, ...recipeOverrides } = recipe;
        await fetch(`${API_URL}/api/beans/${bean.id}/recipes/${methodId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grinderTarget,
            recipeOverrides: Object.keys(recipeOverrides).length > 0 ? recipeOverrides : undefined,
          }),
        });
      }

      // Add bag
      if (roastDate) {
        await fetch(`${API_URL}/api/beans/${bean.id}/bags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roastDate: new Date(roastDate),
            isAvailable: true,
          }),
        });
      }

      return bean;
    },
    onSuccess: (bean) => {
      queryClient.invalidateQueries({ queryKey: ['beans'] });
      router.push(`/beans/${bean.id}`);
    },
  });

  // Default recipe values for each method
  const getDefaultRecipe = (methodName: string): Omit<MethodRecipe, 'methodId'> => {
    const defaults: Record<string, Omit<MethodRecipe, 'methodId'>> = {
      v60: { grinderTarget: 40, dose: 15, water: 240, waterTemp: 96 },
      moka: { grinderTarget: 35, dose: 18 },
      espresso: { grinderTarget: 14, dose: 18, ratio: 2, waterTemp: 93, extractionTime: 28 },
      french_press: { grinderTarget: 60, dose: 30, water: 450, waterTemp: 96, steepTime: 240 },
    };
    return defaults[methodName] || { grinderTarget: 40 };
  };

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto pb-24">
      <header className="mb-6">
        <button onClick={() => router.back()} className="text-coffee-500 mb-2">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-coffee-900">Add New Bean</h1>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
        className="space-y-4"
      >
        {/* Roaster */}
        <div className="card">
          <label className="block text-sm text-coffee-500 mb-2">Roaster *</label>
          {roasters?.length > 0 ? (
            <>
              <select
                value={roasterId}
                onChange={(e) => {
                  setRoasterId(e.target.value);
                  if (e.target.value) setNewRoasterName('');
                }}
                className="w-full px-4 py-2 border border-coffee-200 rounded-lg mb-2"
              >
                <option value="">Select or add new...</option>
                {roasters.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {!roasterId && (
                <input
                  type="text"
                  value={newRoasterName}
                  onChange={(e) => setNewRoasterName(e.target.value)}
                  placeholder="New roaster name"
                  className="w-full px-4 py-2 border border-coffee-200 rounded-lg"
                />
              )}
            </>
          ) : (
            <input
              type="text"
              value={newRoasterName}
              onChange={(e) => setNewRoasterName(e.target.value)}
              placeholder="Roaster name"
              required
              className="w-full px-4 py-2 border border-coffee-200 rounded-lg"
            />
          )}
        </div>

        {/* Bean name */}
        <div className="card">
          <label className="block text-sm text-coffee-500 mb-2">Bean Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Red Brick"
            required
            className="w-full px-4 py-2 border border-coffee-200 rounded-lg"
          />
        </div>

        {/* Origin */}
        <div className="card">
          <label className="block text-sm text-coffee-500 mb-2">Origin</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              placeholder="Country"
              className="px-4 py-2 border border-coffee-200 rounded-lg"
            />
            <input
              type="text"
              value={originRegion}
              onChange={(e) => setOriginRegion(e.target.value)}
              placeholder="Region"
              className="px-4 py-2 border border-coffee-200 rounded-lg"
            />
          </div>
        </div>

        {/* Process & Varietal */}
        <div className="card">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-coffee-500 mb-2">Process</label>
              <select
                value={process}
                onChange={(e) => setProcess(e.target.value)}
                className="w-full px-4 py-2 border border-coffee-200 rounded-lg"
              >
                <option value="">Select...</option>
                <option value="washed">Washed</option>
                <option value="natural">Natural</option>
                <option value="honey">Honey</option>
                <option value="anaerobic">Anaerobic</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-coffee-500 mb-2">Varietal</label>
              <input
                type="text"
                value={varietal}
                onChange={(e) => setVarietal(e.target.value)}
                placeholder="e.g., Bourbon"
                className="w-full px-4 py-2 border border-coffee-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Roast Level */}
        <div className="card">
          <label className="block text-sm text-coffee-500 mb-2">Roast Level</label>
          <div className="flex gap-2">
            {['LIGHT', 'MEDIUM_LIGHT', 'MEDIUM', 'MEDIUM_DARK', 'DARK'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setRoastLevel(level)}
                className={`flex-1 py-2 rounded-lg text-xs ${
                  roastLevel === level
                    ? 'bg-coffee-900 text-white'
                    : 'bg-coffee-100 text-coffee-700'
                }`}
              >
                {level.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tasting Notes */}
        <div className="card">
          <label className="block text-sm text-coffee-500 mb-2">
            Expected Tasting Notes
          </label>
          <input
            type="text"
            value={tastingNotes}
            onChange={(e) => setTastingNotes(e.target.value)}
            placeholder="chocolate, cherry, citrus (comma-separated)"
            className="w-full px-4 py-2 border border-coffee-200 rounded-lg"
          />
        </div>

        {/* Bag */}
        <div className="card">
          <label className="block text-sm text-coffee-500 mb-2">
            First Bag - Roast Date
          </label>
          <input
            type="date"
            value={roastDate}
            onChange={(e) => setRoastDate(e.target.value)}
            className="w-full px-4 py-2 border border-coffee-200 rounded-lg"
          />
        </div>

        {/* Brew Methods with Recipe Controls */}
        <div className="card">
          <label className="block text-sm text-coffee-500 mb-3">
            Brew Methods & Recipes *
          </label>
          <p className="text-xs text-coffee-400 mb-4">
            Select methods and customize the recipe for this bean.
          </p>
          
          <div className="space-y-3">
            {methods?.map((method: any) => {
              const recipe = methodRecipes.find((r) => r.methodId === method.id);
              const isSelected = !!recipe;
              
              return (
                <div
                  key={method.id}
                  className={`rounded-xl border-2 transition-all overflow-hidden ${
                    isSelected
                      ? 'border-coffee-600 bg-coffee-50'
                      : 'border-coffee-100 bg-white hover:border-coffee-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleMethod(method.id, method.name)}
                    className="w-full p-4 flex items-center gap-3"
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                        isSelected ? 'bg-coffee-700 text-white' : 'bg-coffee-100 text-coffee-400'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </div>
                    <span className={`font-semibold ${isSelected ? 'text-coffee-800' : 'text-coffee-500'}`}>
                      {method.displayName}
                    </span>
                    {isSelected && <span className="ml-auto text-xs text-coffee-500">Tap to remove</span>}
                  </button>
                  
                  {/* Recipe editor */}
                  {isSelected && recipe && (
                    <div className="px-4 pb-4 border-t border-coffee-200 bg-white">
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block text-xs text-coffee-500 mb-1">Grind (clicks)</label>
                          <input
                            type="number"
                            value={recipe.grinderTarget}
                            onChange={(e) => updateMethodRecipe(method.id, { grinderTarget: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 text-center font-bold border border-coffee-200 rounded-lg"
                            min={1} max={100}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-coffee-500 mb-1">Dose (g)</label>
                          <input
                            type="number"
                            value={recipe.dose || ''}
                            onChange={(e) => updateMethodRecipe(method.id, { dose: parseFloat(e.target.value) || undefined })}
                            className="w-full px-3 py-2 text-center border border-coffee-200 rounded-lg"
                            min={1} step={0.5}
                          />
                        </div>
                        {['v60', 'french_press'].includes(method.name) && (
                          <div>
                            <label className="block text-xs text-coffee-500 mb-1">Water (g)</label>
                            <input
                              type="number"
                              value={recipe.water || ''}
                              onChange={(e) => updateMethodRecipe(method.id, { water: parseFloat(e.target.value) || undefined })}
                              className="w-full px-3 py-2 text-center border border-coffee-200 rounded-lg"
                              min={1}
                            />
                          </div>
                        )}
                        {['espresso', 'french_press'].includes(method.name) && (
                          <div>
                            <label className="block text-xs text-coffee-500 mb-1">Ratio (1:X)</label>
                            <input
                              type="number"
                              value={recipe.ratio || ''}
                              onChange={(e) => updateMethodRecipe(method.id, { ratio: parseFloat(e.target.value) || undefined })}
                              className="w-full px-3 py-2 text-center border border-coffee-200 rounded-lg"
                              min={1} max={20} step={0.5}
                            />
                          </div>
                        )}
                        {method.name !== 'moka' && (
                          <div>
                            <label className="block text-xs text-coffee-500 mb-1">Water Temp (°C)</label>
                            <input
                              type="number"
                              value={recipe.waterTemp || ''}
                              onChange={(e) => updateMethodRecipe(method.id, { waterTemp: parseInt(e.target.value) || undefined })}
                              className="w-full px-3 py-2 text-center border border-coffee-200 rounded-lg"
                              min={80} max={100}
                            />
                          </div>
                        )}
                        {method.name === 'espresso' && (
                          <div>
                            <label className="block text-xs text-coffee-500 mb-1">Extraction (s)</label>
                            <input
                              type="number"
                              value={recipe.extractionTime || ''}
                              onChange={(e) => updateMethodRecipe(method.id, { extractionTime: parseInt(e.target.value) || undefined })}
                              className="w-full px-3 py-2 text-center border border-coffee-200 rounded-lg"
                              min={15} max={60}
                            />
                          </div>
                        )}
                        {method.name === 'french_press' && (
                          <div>
                            <label className="block text-xs text-coffee-500 mb-1">Steep (s)</label>
                            <input
                              type="number"
                              value={recipe.steepTime || ''}
                              onChange={(e) => updateMethodRecipe(method.id, { steepTime: parseInt(e.target.value) || undefined })}
                              className="w-full px-3 py-2 text-center border border-coffee-200 rounded-lg"
                              min={60} max={600} step={30}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {methodRecipes.length === 0 && (
            <p className="text-sm text-amber-600 mt-3 flex items-center gap-2">
              <span>⚠️</span>
              Select at least one brew method to add this bean to your rotation
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={createMutation.isPending || (!roasterId && !newRoasterName) || !name || methodRecipes.length === 0}
          className="w-full btn-primary py-3 font-semibold"
        >
          {createMutation.isPending ? 'Creating...' : 'Create Bean'}
        </button>
      </form>
    </main>
  );
}
