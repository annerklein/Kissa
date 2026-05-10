'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { formatRoastDate, formatLastBrewed } from '@kissa/shared';
import { TastingNotesComparison } from '../../../components/TastingNotesComparison';
import { BagCard } from '../../../components/BagCard';
import { AddBagModal } from '../../../components/AddBagModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { CountryFlag } from '../../../components/CountryFlag';
import { TubePositionPicker } from '../../../components/TubePositionIndicator';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001');

async function fetchBean(id: string) {
  const res = await fetch(`${API_URL}/api/beans/${id}`);
  if (!res.ok) throw new Error('Failed to fetch bean');
  return res.json();
}

async function addBag(beanId: string, data: any) {
  // Create the bag - recipes are now on the bean, no inheritance needed per bag
  const res = await fetch(`${API_URL}/api/beans/${beanId}/bags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add bag');
  return res.json();
}

interface RecipeOverrides {
  dose?: number;
  water?: number;
  waterTemp?: number;
  ratio?: number;
  extractionTime?: number;
  steepTime?: number;
}

async function updateBeanRecipe(beanId: string, methodId: string, grinderTarget: number, recipeOverrides?: RecipeOverrides) {
  const res = await fetch(`${API_URL}/api/beans/${beanId}/recipes/${methodId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grinderTarget,
      recipeOverrides: recipeOverrides && Object.keys(recipeOverrides).length > 0 ? recipeOverrides : undefined,
    }),
  });
  if (!res.ok) throw new Error('Failed to update recipe');
  return res.json();
}

async function deleteBeanRecipe(beanId: string, methodId: string) {
  const res = await fetch(`${API_URL}/api/beans/${beanId}/recipes/${methodId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete recipe');
  return res.json();
}

async function fetchMethods() {
  const res = await fetch(`${API_URL}/api/methods`);
  if (!res.ok) throw new Error('Failed to fetch methods');
  return res.json();
}

async function deleteBean(id: string) {
  const res = await fetch(`${API_URL}/api/beans/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete bean');
  return res.json();
}

async function deleteBag(id: string) {
  const res = await fetch(`${API_URL}/api/bags/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete bag');
  return res.json();
}

async function markBagFinished(id: string) {
  const res = await fetch(`${API_URL}/api/bags/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'FINISHED', isAvailable: false }),
  });
  if (!res.ok) throw new Error('Failed to mark bag as finished');
  return res.json();
}

async function freezeBag(id: string) {
  const res = await fetch(`${API_URL}/api/bags/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'FROZEN' }),
  });
  if (!res.ok) throw new Error('Failed to freeze bag');
  return res.json();
}

async function freezeBagPartial(id: string, grams: number) {
  const res = await fetch(`${API_URL}/api/bags/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ frozenGrams: grams }),
  });
  if (!res.ok) throw new Error('Failed to freeze portion');
  return res.json();
}

async function thawBagFull(id: string) {
  const res = await fetch(`${API_URL}/api/bags/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'OPEN' }),
  });
  if (!res.ok) throw new Error('Failed to thaw bag');
  return res.json();
}

async function thawBagKeepPortion(id: string, keepGrams: number) {
  const res = await fetch(`${API_URL}/api/bags/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'OPEN', frozenGrams: keepGrams }),
  });
  if (!res.ok) throw new Error('Failed to thaw portion');
  return res.json();
}

async function clearFrozenPortion(id: string) {
  const res = await fetch(`${API_URL}/api/bags/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ frozenGrams: null }),
  });
  if (!res.ok) throw new Error('Failed to clear frozen portion');
  return res.json();
}

async function updateBagTubePosition(id: string, tubePosition: string | null) {
  const res = await fetch(`${API_URL}/api/bags/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tubePosition }),
  });
  if (!res.ok) throw new Error('Failed to update bag tube position');
  return res.json();
}

async function deleteBrew(id: string) {
  const res = await fetch(`${API_URL}/api/brews/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete brew');
  return res.json();
}

type ConfirmState = {
  type: 'deleteBean' | 'deleteBag' | 'finishBag' | 'deleteBrew' | 'freezeBag' | 'unfreezeBag' | 'thawPortion' | null;
  targetId?: string;
  targetName?: string;
};

async function updateBean(id: string, data: any) {
  const res = await fetch(`${API_URL}/api/beans/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update bean');
  return res.json();
}

export default function BeanProfilePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const beanId = params.id as string;
  const [showAddBag, setShowAddBag] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>({ type: null });
  const [expandedBagId, setExpandedBagId] = useState<string | null>(null);
  const [isEditingRecipes, setIsEditingRecipes] = useState(false);
  const [expandedMethodId, setExpandedMethodId] = useState<string | null>(null);
  const [isEditingBean, setIsEditingBean] = useState(false);
  const [freezeModalBagId, setFreezeModalBagId] = useState<string | null>(null);
  const [freezeMode, setFreezeMode] = useState<'full' | 'portion'>('full');
  const [portionGrams, setPortionGrams] = useState<number>(100);
  const [thawModalBagId, setThawModalBagId] = useState<string | null>(null);
  const [thawMode, setThawMode] = useState<'full' | 'portion'>('full');
  const [thawKeepGrams, setThawKeepGrams] = useState<number>(100);
  
  // Edit bean form state
  const [editName, setEditName] = useState('');
  const [editOriginCountry, setEditOriginCountry] = useState('');
  const [editOriginRegion, setEditOriginRegion] = useState('');
  const [editProcess, setEditProcess] = useState('');
  const [editVarietal, setEditVarietal] = useState('');
  const [editRoastLevel, setEditRoastLevel] = useState('MEDIUM');
  const [editTastingNotes, setEditTastingNotes] = useState('');

  const { data: bean, isLoading, error } = useQuery({
    queryKey: ['bean', beanId],
    queryFn: () => fetchBean(beanId),
    enabled: !!beanId,
  });

  const { data: methods } = useQuery({
    queryKey: ['methods'],
    queryFn: fetchMethods,
  });

  const addBagMutation = useMutation({
    mutationFn: (data: any) => addBag(beanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bean', beanId] });
      setShowAddBag(false);
    },
  });

  const deleteBeanMutation = useMutation({
    mutationFn: () => deleteBean(beanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beans'] });
      router.push('/beans');
    },
  });

  const deleteBagMutation = useMutation({
    mutationFn: (bagId: string) => deleteBag(bagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bean', beanId] });
      setConfirmState({ type: null });
    },
  });

  const finishBagMutation = useMutation({
    mutationFn: (bagId: string) => markBagFinished(bagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bean', beanId] });
      setConfirmState({ type: null });
    },
  });

  const deleteBrewMutation = useMutation({
    mutationFn: (brewId: string) => deleteBrew(brewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bean', beanId] });
      setConfirmState({ type: null });
    },
  });

  const freezeBagMutation = useMutation({
    mutationFn: (bagId: string) => freezeBag(bagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bean', beanId] });
      queryClient.invalidateQueries({ queryKey: ['available-beans'] });
      setConfirmState({ type: null });
    },
  });

  const thawFullMutation = useMutation({
    mutationFn: (bagId: string) => thawBagFull(bagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bean', beanId] });
      queryClient.invalidateQueries({ queryKey: ['available-beans'] });
      setThawModalBagId(null);
    },
  });

  const thawKeepPortionMutation = useMutation({
    mutationFn: ({ bagId, keepGrams }: { bagId: string; keepGrams: number }) => thawBagKeepPortion(bagId, keepGrams),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bean', beanId] });
      queryClient.invalidateQueries({ queryKey: ['available-beans'] });
      setThawModalBagId(null);
    },
  });

  const clearPortionMutation = useMutation({
    mutationFn: (bagId: string) => clearFrozenPortion(bagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bean', beanId] });
      queryClient.invalidateQueries({ queryKey: ['available-beans'] });
      setConfirmState({ type: null });
    },
  });

  const freezePartialMutation = useMutation({
    mutationFn: ({ bagId, grams }: { bagId: string; grams: number }) => freezeBagPartial(bagId, grams),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bean', beanId] });
      queryClient.invalidateQueries({ queryKey: ['available-beans'] });
      setFreezeModalBagId(null);
    },
  });

  const updateTubePositionMutation = useMutation({
    mutationFn: ({ bagId, tubePosition }: { bagId: string; tubePosition: string | null }) =>
      updateBagTubePosition(bagId, tubePosition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bean', beanId] });
      queryClient.invalidateQueries({ queryKey: ['available-beans'] });
    },
  });

  const updateRecipeMutation = useMutation({
    mutationFn: ({ beanId, methodId, grinderTarget, recipeOverrides }: { beanId: string; methodId: string; grinderTarget: number; recipeOverrides?: RecipeOverrides }) =>
      updateBeanRecipe(beanId, methodId, grinderTarget, recipeOverrides),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bean', beanId] });
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: ({ beanId, methodId }: { beanId: string; methodId: string }) =>
      deleteBeanRecipe(beanId, methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bean', beanId] });
    },
  });

  const updateBeanMutation = useMutation({
    mutationFn: (data: any) => updateBean(beanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bean', beanId] });
      queryClient.invalidateQueries({ queryKey: ['beans'] });
      setIsEditingBean(false);
    },
  });

  const startEditingBean = () => {
    if (bean) {
      setEditName(bean.name || '');
      setEditOriginCountry(bean.originCountry || '');
      setEditOriginRegion(bean.originRegion || '');
      setEditProcess(bean.process || '');
      setEditVarietal(bean.varietal || '');
      setEditRoastLevel(bean.roastLevel || 'MEDIUM');
      const notes = bean.tastingNotesExpected ? JSON.parse(bean.tastingNotesExpected) : [];
      setEditTastingNotes(notes.join(', '));
      setIsEditingBean(true);
    }
  };

  const saveBean = () => {
    updateBeanMutation.mutate({
      name: editName,
      originCountry: editOriginCountry || null,
      originRegion: editOriginRegion || null,
      process: editProcess || null,
      varietal: editVarietal || null,
      roastLevel: editRoastLevel,
      tastingNotesExpected: editTastingNotes
        ? editTastingNotes.split(',').map((n) => n.trim())
        : null,
    });
  };

  const handleConfirm = () => {
    if (!confirmState.type) return;
    
    switch (confirmState.type) {
      case 'deleteBean':
        deleteBeanMutation.mutate();
        break;
      case 'deleteBag':
        if (confirmState.targetId) deleteBagMutation.mutate(confirmState.targetId);
        break;
      case 'finishBag':
        if (confirmState.targetId) finishBagMutation.mutate(confirmState.targetId);
        break;
      case 'deleteBrew':
        if (confirmState.targetId) deleteBrewMutation.mutate(confirmState.targetId);
        break;
      case 'freezeBag':
        if (confirmState.targetId) freezeBagMutation.mutate(confirmState.targetId);
        break;
      case 'unfreezeBag':
        if (confirmState.targetId) thawFullMutation.mutate(confirmState.targetId);
        break;
      case 'thawPortion':
        if (confirmState.targetId) clearPortionMutation.mutate(confirmState.targetId);
        break;
    }
  };

  const isConfirmLoading = 
    deleteBeanMutation.isPending || 
    deleteBagMutation.isPending || 
    finishBagMutation.isPending || 
    deleteBrewMutation.isPending ||
    freezeBagMutation.isPending ||
    thawFullMutation.isPending ||
    clearPortionMutation.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-coffee-600">Loading...</div>
      </div>
    );
  }

  if (error || !bean) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error loading bean</div>
      </div>
    );
  }

  const expectedNotes = bean.tastingNotesExpected
    ? JSON.parse(bean.tastingNotesExpected)
    : [];

  return (
    <main className="min-h-screen px-3 sm:px-4 pt-4 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <header className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => router.back()}
              className="text-coffee-500 mb-2"
            >
              ← Back
            </button>
            <p className="text-sm text-coffee-500">{bean.roaster.name}</p>
            <h1 className="text-2xl font-bold text-coffee-900">{bean.name}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={startEditingBean}
              className="px-3 py-2 text-sm font-medium text-coffee-600 bg-coffee-100 hover:bg-coffee-200 rounded-lg transition-colors"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => setConfirmState({ type: 'deleteBean' })}
              className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              🗑 Delete
            </button>
          </div>
        </div>
      </header>

      {/* Metadata */}
      <div className="card mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {bean.originCountry && (
            <div>
              <p className="text-coffee-400">Origin</p>
              <div className="font-medium flex items-center gap-1">
                <CountryFlag country={bean.originCountry} size="sm" showName={true} />
                {bean.originRegion && `, ${bean.originRegion}`}
              </div>
            </div>
          )}
          {bean.process && (
            <div>
              <p className="text-coffee-400">Process</p>
              <p className="font-medium capitalize">{bean.process}</p>
            </div>
          )}
          {bean.varietal && (
            <div>
              <p className="text-coffee-400">Varietal</p>
              <p className="font-medium">{bean.varietal}</p>
            </div>
          )}
          <div>
            <p className="text-coffee-400">Roast Level</p>
            <p className="font-medium capitalize">
              {bean.roastLevel ? bean.roastLevel.replace('_', ' ').toLowerCase() : 'medium'}
            </p>
          </div>
        </div>

        {expectedNotes && expectedNotes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-coffee-100">
            <p className="text-coffee-400 text-sm mb-2">Expected tasting notes</p>
            <div className="flex flex-wrap gap-2">
              {expectedNotes.map((note: string) => (
                <span
                  key={note}
                  className="px-2 py-1 bg-coffee-100 text-coffee-700 rounded-full text-sm"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tasting Notes Comparison */}
      {bean.tastingNotesComparison?.actual &&
        Object.keys(bean.tastingNotesComparison.actual).length > 0 && (
          <TastingNotesComparison
            expected={bean.tastingNotesComparison.expected || []}
            actual={bean.tastingNotesComparison.actual}
          />
        )}

      {/* Bean-Level Recipes Editor */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Brew Method Recipes</h2>
          <button
            onClick={() => setIsEditingRecipes(!isEditingRecipes)}
            className="text-sm font-medium text-coffee-600 hover:text-coffee-800 flex items-center gap-1"
          >
            ⚙️ {isEditingRecipes ? 'Hide' : 'Edit'} Recipes
          </button>
        </div>

        {isEditingRecipes && methods && (
          <div className="bg-coffee-50 rounded-xl p-4 space-y-3 mb-4 border border-coffee-100">
            <p className="text-sm text-coffee-500 mb-2">These recipes apply to all bags of this bean.</p>
            {methods.map((method: any) => {
              const existingRecipe = bean.recipes?.find((r: any) => r.methodId === method.id);
              const hasRecipe = !!existingRecipe;
              const isExpanded = expandedMethodId === `bean-${method.id}`;
              const recipeOverrides = existingRecipe?.recipeOverrides ? 
                (typeof existingRecipe.recipeOverrides === 'string' ? JSON.parse(existingRecipe.recipeOverrides) : existingRecipe.recipeOverrides) : {};
              
              return (
                <div
                  key={method.id}
                  className={`rounded-lg border transition-all overflow-hidden ${
                    hasRecipe
                      ? 'border-coffee-400 bg-white shadow-sm'
                      : 'border-coffee-200 bg-coffee-50 opacity-60'
                  }`}
                >
                  <div className="p-3 flex items-center justify-between">
                    <span className={`text-sm font-medium ${hasRecipe ? 'text-coffee-800' : 'text-coffee-500'}`}>
                      {method.displayName}
                    </span>
                    
                    {hasRecipe ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedMethodId(isExpanded ? null : `bean-${method.id}`)}
                          className="text-xs text-coffee-600 hover:text-coffee-800"
                        >
                          {isExpanded ? 'Collapse ▲' : 'Edit Recipe ▼'}
                        </button>
                        <button
                          onClick={() => {
                            deleteRecipeMutation.mutate({ beanId: bean.id, methodId: method.id });
                          }}
                          className="ml-2 text-red-500 hover:text-red-700 text-xs"
                          title="Remove this method from this bean"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          const defaults: Record<string, { grind: number; dose?: number; water?: number; waterTemp?: number; ratio?: number; extractionTime?: number; steepTime?: number }> = {
                            v60: { grind: 40, dose: 15, water: 240, waterTemp: 96 },
                            moka: { grind: 35, dose: 18 },
                            espresso: { grind: 14, dose: 18, ratio: 2, waterTemp: 93, extractionTime: 28 },
                            french_press: { grind: 60, dose: 30, water: 450, waterTemp: 96, steepTime: 240 },
                          };
                          const d = defaults[method.name] || { grind: 20 };
                          updateRecipeMutation.mutate({
                            beanId: bean.id,
                            methodId: method.id,
                            grinderTarget: d.grind,
                            recipeOverrides: { dose: d.dose, water: d.water, waterTemp: d.waterTemp, ratio: d.ratio, extractionTime: d.extractionTime, steepTime: d.steepTime },
                          });
                          setExpandedMethodId(`bean-${method.id}`);
                        }}
                        className="text-xs text-coffee-600 hover:text-coffee-800 font-medium"
                      >
                        + Enable
                      </button>
                    )}
                  </div>
                  
                  {/* Expanded Recipe Editor */}
                  {hasRecipe && isExpanded && (
                    <div className="px-3 pb-3 border-t border-coffee-200 bg-coffee-50">
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div>
                          <label className="block text-[10px] text-coffee-500 mb-0.5">Grind (clicks)</label>
                          <input
                            type="number"
                            defaultValue={existingRecipe.grinderTarget || 20}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value) || 20;
                              updateRecipeMutation.mutate({
                                beanId: bean.id,
                                methodId: method.id,
                                grinderTarget: value,
                                recipeOverrides,
                              });
                            }}
                            className="w-full px-2 py-1 text-sm text-center font-bold border border-coffee-200 rounded"
                            min={1} max={100}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-coffee-500 mb-0.5">Dose (g)</label>
                          <input
                            type="number"
                            defaultValue={recipeOverrides.dose || ''}
                            onBlur={(e) => {
                              const value = parseFloat(e.target.value) || undefined;
                              updateRecipeMutation.mutate({
                                beanId: bean.id,
                                methodId: method.id,
                                grinderTarget: existingRecipe.grinderTarget || 20,
                                recipeOverrides: { ...recipeOverrides, dose: value },
                              });
                            }}
                            className="w-full px-2 py-1 text-sm text-center border border-coffee-200 rounded"
                            min={1} step={0.5}
                          />
                        </div>
                        {['v60', 'french_press'].includes(method.name) && (
                          <div>
                            <label className="block text-[10px] text-coffee-500 mb-0.5">Water (g)</label>
                            <input
                              type="number"
                              defaultValue={recipeOverrides.water || ''}
                              onBlur={(e) => {
                                const value = parseFloat(e.target.value) || undefined;
                                updateRecipeMutation.mutate({
                                  beanId: bean.id,
                                  methodId: method.id,
                                  grinderTarget: existingRecipe.grinderTarget || 20,
                                  recipeOverrides: { ...recipeOverrides, water: value },
                                });
                              }}
                              className="w-full px-2 py-1 text-sm text-center border border-coffee-200 rounded"
                              min={1}
                            />
                          </div>
                        )}
                        {['espresso', 'french_press'].includes(method.name) && (
                          <div>
                            <label className="block text-[10px] text-coffee-500 mb-0.5">Ratio (1:X)</label>
                            <input
                              type="number"
                              defaultValue={recipeOverrides.ratio || ''}
                              onBlur={(e) => {
                                const value = parseFloat(e.target.value) || undefined;
                                updateRecipeMutation.mutate({
                                  beanId: bean.id,
                                  methodId: method.id,
                                  grinderTarget: existingRecipe.grinderTarget || 20,
                                  recipeOverrides: { ...recipeOverrides, ratio: value },
                                });
                              }}
                              className="w-full px-2 py-1 text-sm text-center border border-coffee-200 rounded"
                              min={1} max={20} step={0.5}
                            />
                          </div>
                        )}
                        {method.name !== 'moka' && (
                          <div>
                            <label className="block text-[10px] text-coffee-500 mb-0.5">Temp (°C)</label>
                            <input
                              type="number"
                              defaultValue={recipeOverrides.waterTemp || ''}
                              onBlur={(e) => {
                                const value = parseInt(e.target.value) || undefined;
                                updateRecipeMutation.mutate({
                                  beanId: bean.id,
                                  methodId: method.id,
                                  grinderTarget: existingRecipe.grinderTarget || 20,
                                  recipeOverrides: { ...recipeOverrides, waterTemp: value },
                                });
                              }}
                              className="w-full px-2 py-1 text-sm text-center border border-coffee-200 rounded"
                              min={80} max={100}
                            />
                          </div>
                        )}
                        {method.name === 'espresso' && (
                          <div>
                            <label className="block text-[10px] text-coffee-500 mb-0.5">Time (s)</label>
                            <input
                              type="number"
                              defaultValue={recipeOverrides.extractionTime || ''}
                              onBlur={(e) => {
                                const value = parseInt(e.target.value) || undefined;
                                updateRecipeMutation.mutate({
                                  beanId: bean.id,
                                  methodId: method.id,
                                  grinderTarget: existingRecipe.grinderTarget || 20,
                                  recipeOverrides: { ...recipeOverrides, extractionTime: value },
                                });
                              }}
                              className="w-full px-2 py-1 text-sm text-center border border-coffee-200 rounded"
                              min={15} max={60}
                            />
                          </div>
                        )}
                        {method.name === 'french_press' && (
                          <div>
                            <label className="block text-[10px] text-coffee-500 mb-0.5">Steep (s)</label>
                            <input
                              type="number"
                              defaultValue={recipeOverrides.steepTime || ''}
                              onBlur={(e) => {
                                const value = parseInt(e.target.value) || undefined;
                                updateRecipeMutation.mutate({
                                  beanId: bean.id,
                                  methodId: method.id,
                                  grinderTarget: existingRecipe.grinderTarget || 20,
                                  recipeOverrides: { ...recipeOverrides, steepTime: value },
                                });
                              }}
                              className="w-full px-2 py-1 text-sm text-center border border-coffee-200 rounded"
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
        )}
      </section>

      {/* Bags */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Bags</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddBag(true)}
              className="btn-secondary text-sm"
            >
              + Add bag
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {(bean.bags || []).map((bag: any) => (
            <div key={bag.id}>
              <BagCard
                bag={bag}
                onSelect={() => setExpandedBagId(expandedBagId === bag.id ? null : bag.id)}
                showActions={expandedBagId === bag.id}
                onMarkFinished={() => setConfirmState({ 
                  type: 'finishBag', 
                  targetId: bag.id,
                  targetName: formatRoastDate(new Date(bag.roastDate))
                })}
                onFreeze={() => {
                  setFreezeModalBagId(bag.id);
                  setFreezeMode('full');
                  setPortionGrams(bag.bagSizeGrams ? Math.round(bag.bagSizeGrams / 2) : 100);
                }}
                onUnfreeze={() => {
                  setThawModalBagId(bag.id);
                  setThawMode('full');
                  setThawKeepGrams(bag.bagSizeGrams ? Math.round(bag.bagSizeGrams / 2) : 100);
                }}
                onThawPortion={() => setConfirmState({
                  type: 'thawPortion',
                  targetId: bag.id,
                  targetName: formatRoastDate(new Date(bag.roastDate))
                })}
                onDelete={() => setConfirmState({ 
                  type: 'deleteBag', 
                  targetId: bag.id,
                  targetName: formatRoastDate(new Date(bag.roastDate))
                })}
              />
              
              {/* Expanded bag content */}
              {expandedBagId === bag.id && (
                <div className="ml-4 mt-2 space-y-4">
                  {/* Tube position picker for open bags */}
                  {bag.status === 'OPEN' && (
                    <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100">
                      <TubePositionPicker
                        value={bag.tubePosition as 'LEFT' | 'MIDDLE' | 'RIGHT' | null | undefined}
                        onChange={(pos) => updateTubePositionMutation.mutate({ bagId: bag.id, tubePosition: pos })}
                        disabled={updateTubePositionMutation.isPending}
                      />
                    </div>
                  )}

                  {/* Brew history */}
                  {(bag.brewLogs || []).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-coffee-600 mb-2">Brew History</p>
                      {bag.brewLogs.map((brew: any) => (
                        <div
                          key={brew.id}
                          className="bg-coffee-50 rounded-lg p-3 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-sm font-medium text-coffee-800">
                              {new Date(brew.brewedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {brew.computedScore && (
                              <p className="text-xs text-coffee-500">
                                Score: {brew.computedScore.toFixed(1)}/10
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => setConfirmState({
                              type: 'deleteBrew',
                              targetId: brew.id,
                              targetName: new Date(brew.brewedAt).toLocaleDateString()
                            })}
                            className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 rounded transition-colors"
                          >
                            🗑
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Add Bag Modal */}
      {showAddBag && (
        <AddBagModal
          onClose={() => setShowAddBag(false)}
          onSubmit={(data) => addBagMutation.mutate(data)}
          isSubmitting={addBagMutation.isPending}
        />
      )}

      {/* Edit Bean Modal */}
      {isEditingBean && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Bean</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-coffee-500 mb-1">Bean Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-coffee-200 rounded-lg"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-coffee-500 mb-1">Country</label>
                  <input
                    type="text"
                    value={editOriginCountry}
                    onChange={(e) => setEditOriginCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-coffee-500 mb-1">Region</label>
                  <input
                    type="text"
                    value={editOriginRegion}
                    onChange={(e) => setEditOriginRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-coffee-500 mb-1">Process</label>
                  <select
                    value={editProcess}
                    onChange={(e) => setEditProcess(e.target.value)}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg"
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
                  <label className="block text-sm text-coffee-500 mb-1">Varietal</label>
                  <input
                    type="text"
                    value={editVarietal}
                    onChange={(e) => setEditVarietal(e.target.value)}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-coffee-500 mb-1">Roast Level</label>
                <div className="flex gap-1">
                  {['LIGHT', 'MEDIUM_LIGHT', 'MEDIUM', 'MEDIUM_DARK', 'DARK'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setEditRoastLevel(level)}
                      className={`flex-1 py-2 rounded-lg text-[10px] ${
                        editRoastLevel === level
                          ? 'bg-coffee-900 text-white'
                          : 'bg-coffee-100 text-coffee-700'
                      }`}
                    >
                      {level.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-coffee-500 mb-1">Tasting Notes</label>
                <input
                  type="text"
                  value={editTastingNotes}
                  onChange={(e) => setEditTastingNotes(e.target.value)}
                  placeholder="chocolate, cherry, citrus"
                  className="w-full px-3 py-2 border border-coffee-200 rounded-lg"
                />
                <p className="text-xs text-coffee-400 mt-1">Comma-separated</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditingBean(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={saveBean}
                disabled={updateBeanMutation.isPending || !editName}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {updateBeanMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Freeze Modal */}
      {freezeModalBagId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-coffee-900 mb-1 text-center">
              ❄ Freeze
            </h3>
            <p className="text-sm text-coffee-500 text-center mb-4">
              {bean.name}
            </p>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFreezeMode('full')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  freezeMode === 'full'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                }`}
              >
                Full Freeze
              </button>
              <button
                onClick={() => setFreezeMode('portion')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  freezeMode === 'portion'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                }`}
              >
                Freeze Portion
              </button>
            </div>

            {freezeMode === 'full' ? (
              <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100 mb-4">
                <p className="text-sm text-cyan-700">
                  The entire bag will be frozen and removed from your rotation. Days-off-roast pauses while frozen.
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                  <p className="text-sm text-cyan-700">
                    Freeze a portion while keeping this bag in your rotation. You can thaw it later.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-coffee-500 mb-1">Portion to freeze (grams)</label>
                  <input
                    type="number"
                    value={portionGrams}
                    onChange={(e) => setPortionGrams(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    className="w-full px-4 py-2 border border-coffee-200 rounded-lg text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setFreezeModalBagId(null)}
                className="flex-1 py-3 rounded-xl font-semibold bg-coffee-100 text-coffee-700 hover:bg-coffee-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (freezeMode === 'full') {
                    freezeBagMutation.mutate(freezeModalBagId);
                    setFreezeModalBagId(null);
                  } else {
                    freezePartialMutation.mutate({ bagId: freezeModalBagId, grams: portionGrams });
                  }
                }}
                disabled={freezeBagMutation.isPending || freezePartialMutation.isPending}
                className="flex-1 py-3 rounded-xl font-semibold bg-cyan-600 text-white hover:bg-cyan-700 transition-colors disabled:opacity-50"
              >
                {(freezeBagMutation.isPending || freezePartialMutation.isPending) ? 'Freezing...' : '❄ Freeze'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmState.type === 'deleteBean'}
        title="Delete Bean?"
        message={`This will permanently delete "${bean.name}" and all its bags and brew history. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState({ type: null })}
        isLoading={isConfirmLoading}
      />

      <ConfirmDialog
        isOpen={confirmState.type === 'deleteBag'}
        title="Delete Bag?"
        message={`This will permanently delete this bag (roasted ${confirmState.targetName}) and all its brew history. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState({ type: null })}
        isLoading={isConfirmLoading}
      />

      <ConfirmDialog
        isOpen={confirmState.type === 'finishBag'}
        title="Mark Bag as Finished?"
        message={`This will mark this bag (roasted ${confirmState.targetName}) as finished and remove it from your rotation. You can still view it in the bean history.`}
        confirmLabel="Mark Finished"
        variant="warning"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState({ type: null })}
        isLoading={isConfirmLoading}
      />

      <ConfirmDialog
        isOpen={confirmState.type === 'deleteBrew'}
        title="Delete Brew?"
        message={`This will permanently delete this brew from ${confirmState.targetName}. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState({ type: null })}
        isLoading={isConfirmLoading}
      />

      <ConfirmDialog
        isOpen={confirmState.type === 'freezeBag'}
        title="Freeze Bag?"
        message={`This will freeze this bag (${confirmState.targetName}). The days-off-roast clock will pause while frozen and the bag will be removed from your rotation.`}
        confirmLabel="❄ Freeze"
        variant="warning"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState({ type: null })}
        isLoading={isConfirmLoading}
      />

      {/* Thaw Modal */}
      {thawModalBagId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-coffee-900 mb-1 text-center">
              🔥 Thaw
            </h3>
            <p className="text-sm text-coffee-500 text-center mb-4">
              {bean.name}
            </p>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setThawMode('full')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  thawMode === 'full'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Thaw All
              </button>
              <button
                onClick={() => setThawMode('portion')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  thawMode === 'portion'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Thaw Portion
              </button>
            </div>

            {thawMode === 'full' ? (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 mb-4">
                <p className="text-sm text-amber-700">
                  The entire bag will be thawed and added back to your rotation. Frozen time will be accounted for.
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-sm text-amber-700">
                    Thaw part of the bag. The rest stays frozen in storage.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-coffee-500 mb-1">Keep frozen (grams)</label>
                  <input
                    type="number"
                    value={thawKeepGrams}
                    onChange={(e) => setThawKeepGrams(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    className="w-full px-4 py-2 border border-coffee-200 rounded-lg text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setThawModalBagId(null)}
                className="flex-1 py-3 rounded-xl font-semibold bg-coffee-100 text-coffee-700 hover:bg-coffee-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (thawMode === 'full') {
                    thawFullMutation.mutate(thawModalBagId);
                  } else {
                    thawKeepPortionMutation.mutate({ bagId: thawModalBagId, keepGrams: thawKeepGrams });
                  }
                }}
                disabled={thawFullMutation.isPending || thawKeepPortionMutation.isPending}
                className="flex-1 py-3 rounded-xl font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {(thawFullMutation.isPending || thawKeepPortionMutation.isPending) ? 'Thawing...' : '🔥 Thaw'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmState.type === 'thawPortion'}
        title="Remove Frozen Portion?"
        message={`This will remove the frozen portion marker from this bag (${confirmState.targetName}).`}
        confirmLabel="🔥 Clear Portion"
        variant="warning"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState({ type: null })}
        isLoading={isConfirmLoading}
      />
    </main>
  );
}
