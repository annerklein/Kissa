'use client';

import { useState } from 'react';
import { TASTING_NOTE_CATEGORIES, searchTastingNotes } from '@kissa/shared';

interface TastingNotesInputProps {
  selected: string[];
  onChange: (notes: string[]) => void;
}

export function TastingNotesInput({ selected, onChange }: TastingNotesInputProps) {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  const toggleNote = (note: string) => {
    if (selected.includes(note)) {
      onChange(selected.filter((n) => n !== note));
    } else {
      onChange([...selected, note]);
    }
  };

  const addCustomNote = () => {
    if (search.trim() && !selected.includes(search.trim().toLowerCase())) {
      onChange([...selected, search.trim().toLowerCase()]);
      setSearch('');
    }
  };

  const filteredNotes = search ? searchTastingNotes(search) : [];
  const popularNotes = ['chocolate', 'cherry', 'citrus', 'caramel', 'nutty', 'floral', 'berry', 'honey'];

  return (
    <div>
      {/* Search input */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search or add custom note..."
          className="flex-1 px-3 py-2 border border-coffee-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-400"
          onKeyDown={(e) => e.key === 'Enter' && addCustomNote()}
        />
        {search && (
          <button
            onClick={addCustomNote}
            className="px-3 py-2 bg-coffee-100 rounded-lg text-sm"
          >
            Add
          </button>
        )}
      </div>

      {/* Search results */}
      {search && filteredNotes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {filteredNotes.slice(0, 8).map((note) => (
            <button
              key={note}
              onClick={() => {
                toggleNote(note);
                setSearch('');
              }}
              className={`px-3 py-1 rounded-full text-sm ${
                selected.includes(note)
                  ? 'bg-coffee-900 text-white'
                  : 'bg-coffee-100 text-coffee-700'
              }`}
            >
              {note}
            </button>
          ))}
        </div>
      )}

      {/* Selected notes */}
      {selected.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-coffee-400 mb-2">Selected:</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((note) => (
              <button
                key={note}
                onClick={() => toggleNote(note)}
                className="px-3 py-1 rounded-full text-sm bg-coffee-900 text-white flex items-center gap-1"
              >
                {note}
                <span className="text-coffee-300">×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular notes */}
      {!search && (
        <div>
          <p className="text-xs text-coffee-400 mb-2">Common notes:</p>
          <div className="flex flex-wrap gap-2">
            {popularNotes.map((note) => (
              <button
                key={note}
                onClick={() => toggleNote(note)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selected.includes(note)
                    ? 'bg-coffee-900 text-white'
                    : 'bg-coffee-100 text-coffee-700'
                }`}
              >
                {note}
              </button>
            ))}
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-3 py-1 rounded-full text-sm bg-coffee-50 text-coffee-500"
            >
              {showAll ? 'Less' : 'More...'}
            </button>
          </div>
        </div>
      )}

      {/* All categories */}
      {showAll && !search && (
        <div className="mt-4 space-y-3">
          {Object.entries(TASTING_NOTE_CATEGORIES).map(([category, notes]) => (
            <div key={category}>
              <p className="text-xs text-coffee-500 capitalize mb-2">{category}</p>
              <div className="flex flex-wrap gap-1">
                {notes.map((note) => (
                  <button
                    key={note}
                    onClick={() => toggleNote(note)}
                    className={`px-2 py-1 rounded-full text-xs ${
                      selected.includes(note)
                        ? 'bg-coffee-900 text-white'
                        : 'bg-coffee-50 text-coffee-600'
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
