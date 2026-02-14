'use client';

import { useState } from 'react';

interface AddBagModalProps {
  onClose: () => void;
  onSubmit: (data: { roastDate: Date; isAvailable: boolean; status?: string; isFrozenBag?: boolean; frozenAt?: Date }) => void;
  isSubmitting: boolean;
  defaultFrozen?: boolean;
}

export function AddBagModal({ onClose, onSubmit, isSubmitting, defaultFrozen = false }: AddBagModalProps) {
  const [roastDate, setRoastDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isAvailable, setIsAvailable] = useState(!defaultFrozen);
  const [isFrozen, setIsFrozen] = useState(defaultFrozen);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFrozen) {
      onSubmit({
        roastDate: new Date(roastDate),
        isAvailable: false,
        status: 'FROZEN',
        isFrozenBag: true,
        frozenAt: new Date(),
      });
    } else {
      onSubmit({
        roastDate: new Date(roastDate),
        isAvailable,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-xl font-bold mb-4">
          {isFrozen ? '❄ Freeze Bag' : 'Add New Bag'}
        </h2>

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

          {/* Mode toggle: Regular or Frozen */}
          <div className="mb-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setIsFrozen(false); setIsAvailable(true); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  !isFrozen
                    ? 'bg-coffee-800 text-white shadow-sm'
                    : 'bg-coffee-100 text-coffee-600 hover:bg-coffee-200'
                }`}
              >
                Regular Bag
              </button>
              <button
                type="button"
                onClick={() => { setIsFrozen(true); setIsAvailable(false); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isFrozen
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                }`}
              >
                ❄ Freeze
              </button>
            </div>
          </div>

          {isFrozen ? (
            <div className="mb-6 p-3 bg-cyan-50 rounded-lg border border-cyan-100">
              <p className="text-sm text-cyan-700">
                This bag will be created as frozen. It won&apos;t appear in your rotation until you unfreeze it.
                The days-off-roast clock pauses while frozen.
              </p>
              <p className="text-xs text-cyan-500 mt-2">
                Frozen bags don&apos;t count as separate purchases in statistics.
              </p>
            </div>
          ) : (
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
          )}

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
              className={`flex-1 py-3 rounded-lg font-semibold disabled:opacity-50 shadow-md transition-colors ${
                isFrozen
                  ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                  : 'btn-primary'
              }`}
            >
              {isSubmitting ? (isFrozen ? 'Freezing...' : 'Adding...') : (isFrozen ? '❄ Freeze Bag' : 'Add Bag')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
