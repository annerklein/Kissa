'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '../../components/Logo';
import { CountryFlag } from '../../components/CountryFlag';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001');

interface Roaster {
  id: string;
  name: string;
  country?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  notes?: string | null;
  beans?: any[];
}

async function fetchRoasters() {
  const res = await fetch(`${API_URL}/api/roasters`);
  if (!res.ok) throw new Error('Failed to fetch roasters');
  return res.json();
}

async function deleteRoaster(id: string) {
  const res = await fetch(`${API_URL}/api/roasters/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete roaster');
  return res.json();
}

async function updateRoaster(id: string, data: Partial<Roaster>) {
  const res = await fetch(`${API_URL}/api/roasters/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update roaster');
  return res.json();
}

async function createRoaster(data: Partial<Roaster>) {
  const res = await fetch(`${API_URL}/api/roasters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create roaster');
  return res.json();
}

export default function RoastersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingRoaster, setEditingRoaster] = useState<Roaster | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Roaster | null>(null);

  const { data: roasters, isLoading } = useQuery({
    queryKey: ['roasters'],
    queryFn: fetchRoasters,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRoaster(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roasters'] });
      setConfirmDelete(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Roaster> }) => updateRoaster(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roasters'] });
      setEditingRoaster(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Roaster>) => createRoaster(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roasters'] });
      setShowAddModal(false);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" animate />
          <p className="text-coffee-500 animate-pulse">Loading roasters...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto pb-28">
      {/* Header */}
      <header className="mb-6 animate-fade-in flex flex-col items-center text-center">
        <div className="mb-4">
          <Logo size="md" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">Roasters</h1>
          <p className="text-coffee-600 mt-1">{roasters?.length || 0} roasters</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary mt-4"
          >
            + Add Roaster
          </button>
        </div>
      </header>

      {/* Roasters List */}
      {roasters?.length === 0 ? (
        <div className="card text-center py-12 animate-slide-up">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
            <span className="text-4xl">🏭</span>
          </div>
          <p className="text-coffee-600 mb-2 font-medium">No roasters yet</p>
          <p className="text-coffee-400 text-sm mb-6">Add your first roaster to start tracking</p>
        </div>
      ) : (
        <div className="space-y-3">
          {roasters?.map((roaster: Roaster, index: number) => (
            <div
              key={roaster.id}
              className="card animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {roaster.logoUrl ? (
                    <img src={roaster.logoUrl} alt={roaster.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">☕</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-lg text-coffee-900 truncate">
                    {roaster.name}
                  </h3>
                  
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
                        onClick={(e) => e.stopPropagation()}
                      >
                        🌐 Website
                      </a>
                    )}
                  </div>

                  {roaster.notes && (
                    <p className="text-sm text-coffee-500 mt-2 line-clamp-2">{roaster.notes}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditingRoaster(roaster)}
                    className="p-2 text-coffee-500 hover:bg-coffee-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setConfirmDelete(roaster)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Modal */}
      {(editingRoaster || showAddModal) && (
        <RoasterModal
          roaster={editingRoaster}
          onClose={() => {
            setEditingRoaster(null);
            setShowAddModal(false);
          }}
          onSave={(data) => {
            if (editingRoaster) {
              updateMutation.mutate({ id: editingRoaster.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isSaving={updateMutation.isPending || createMutation.isPending}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Roaster?"
        message={`This will permanently delete "${confirmDelete?.name}" and all associated beans. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
        isLoading={deleteMutation.isPending}
      />
    </main>
  );
}

interface RoasterModalProps {
  roaster: Roaster | null;
  onClose: () => void;
  onSave: (data: Partial<Roaster>) => void;
  isSaving: boolean;
}

function RoasterModal({ roaster, onClose, onSave, isSaving }: RoasterModalProps) {
  const [name, setName] = useState(roaster?.name || '');
  const [country, setCountry] = useState(roaster?.country || '');
  const [website, setWebsite] = useState(roaster?.website || '');
  const [logoUrl, setLogoUrl] = useState(roaster?.logoUrl || '');
  const [notes, setNotes] = useState(roaster?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      country: country || null,
      website: website || null,
      logoUrl: logoUrl || null,
      notes: notes || null,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-coffee-900 mb-4">
          {roaster ? 'Edit Roaster' : 'Add New Roaster'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm text-coffee-500 mb-2">Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">☕</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="btn-secondary text-sm cursor-pointer inline-block"
                >
                  Upload Logo
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="ml-2 text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-coffee-500 mb-2">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Roaster name"
              required
              className="w-full px-4 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-400"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm text-coffee-500 mb-2">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g., USA, Israel, Ethiopia"
              className="w-full px-4 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-400"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm text-coffee-500 mb-2">Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-coffee-500 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this roaster..."
              rows={3}
              className="w-full px-4 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold bg-coffee-100 text-coffee-700 hover:bg-coffee-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex-1 py-3 rounded-xl font-semibold bg-coffee-800 text-white hover:bg-coffee-900 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : roaster ? 'Save Changes' : 'Add Roaster'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
