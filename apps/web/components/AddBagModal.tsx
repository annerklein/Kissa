'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001');

interface AddBagModalProps {
  onClose: () => void;
  onSubmit: (data: { roastDate: Date; isAvailable: boolean }) => void;
  isSubmitting: boolean;
}

export function AddBagModal({ onClose, onSubmit, isSubmitting }: AddBagModalProps) {
  const [roastDate, setRoastDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isAvailable, setIsAvailable] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      roastDate: new Date(roastDate),
      isAvailable,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Add New Bag</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-coffee-500 mb-2">
              Roast Date *
            </label>
            <input
              type="date"
              value={roastDate}
              onChange={(e) => setRoastDate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-400"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-coffee-600 focus:ring-coffee-500"
              />
              <span className="text-sm text-coffee-700 font-medium">Add to available rotation</span>
            </label>
            <p className="text-[10px] text-coffee-400 mt-1 ml-6 leading-tight">
              Brew methods and recipes are now bean properties and will be automatically applied.
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary py-3 disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? 'Adding...' : 'Add Bag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
