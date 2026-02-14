import { describe, it, expect } from 'vitest';
import {
  TASTING_NOTE_CATEGORIES,
  ALL_TASTING_NOTES,
  getNoteCategory,
  searchTastingNotes,
} from '../constants/tasting-notes.js';

// ===========================================================================
// TASTING_NOTE_CATEGORIES
// ===========================================================================
describe('TASTING_NOTE_CATEGORIES', () => {
  it('has the expected categories', () => {
    const expected = ['fruity', 'sweet', 'nutty', 'floral', 'spicy', 'earthy', 'herbal', 'other'];
    expect(Object.keys(TASTING_NOTE_CATEGORIES)).toEqual(expected);
  });

  it('each category has at least one note', () => {
    for (const [category, notes] of Object.entries(TASTING_NOTE_CATEGORIES)) {
      expect(notes.length).toBeGreaterThan(0);
    }
  });

  it('no duplicate notes across categories', () => {
    const allNotes = Object.values(TASTING_NOTE_CATEGORIES).flat();
    const uniqueNotes = new Set(allNotes);
    expect(uniqueNotes.size).toBe(allNotes.length);
  });
});

// ===========================================================================
// ALL_TASTING_NOTES
// ===========================================================================
describe('ALL_TASTING_NOTES', () => {
  it('is a flat array of all notes from all categories', () => {
    const manualFlat = Object.values(TASTING_NOTE_CATEGORIES).flat();
    expect(ALL_TASTING_NOTES).toEqual(manualFlat);
  });

  it('contains well-known coffee tasting notes', () => {
    expect(ALL_TASTING_NOTES).toContain('cherry');
    expect(ALL_TASTING_NOTES).toContain('chocolate');
    expect(ALL_TASTING_NOTES).toContain('caramel');
    expect(ALL_TASTING_NOTES).toContain('jasmine');
    expect(ALL_TASTING_NOTES).toContain('cinnamon');
  });
});

// ===========================================================================
// getNoteCategory
// ===========================================================================
describe('getNoteCategory', () => {
  it('returns the correct category for known notes', () => {
    expect(getNoteCategory('cherry')).toBe('fruity');
    expect(getNoteCategory('chocolate')).toBe('sweet');
    expect(getNoteCategory('almond')).toBe('nutty');
    expect(getNoteCategory('jasmine')).toBe('floral');
    expect(getNoteCategory('cinnamon')).toBe('spicy');
    expect(getNoteCategory('tobacco')).toBe('earthy');
    expect(getNoteCategory('tea-like')).toBe('herbal');
    expect(getNoteCategory('wine')).toBe('other');
  });

  it('returns null for unknown notes', () => {
    expect(getNoteCategory('rubber')).toBeNull();
    expect(getNoteCategory('')).toBeNull();
    expect(getNoteCategory('nonexistent')).toBeNull();
  });

  it('is case-insensitive', () => {
    expect(getNoteCategory('Cherry')).toBe('fruity');
    expect(getNoteCategory('CHOCOLATE')).toBe('sweet');
  });
});

// ===========================================================================
// searchTastingNotes
// ===========================================================================
describe('searchTastingNotes', () => {
  it('finds notes matching partial query', () => {
    const results = searchTastingNotes('choc');
    expect(results).toContain('chocolate');
    expect(results).toContain('dark chocolate');
    expect(results).toContain('milk chocolate');
  });

  it('is case-insensitive', () => {
    const results = searchTastingNotes('CHERRY');
    expect(results).toContain('cherry');
  });

  it('returns empty array for no matches', () => {
    const results = searchTastingNotes('xyznonexistent');
    expect(results).toEqual([]);
  });

  it('returns all notes for empty query', () => {
    const results = searchTastingNotes('');
    expect(results).toEqual(ALL_TASTING_NOTES);
  });

  it('finds notes across categories', () => {
    const results = searchTastingNotes('nut');
    // Should find: walnut, peanut, hazelnut, coconut, nutmeg
    expect(results.length).toBeGreaterThan(0);
    for (const note of results) {
      expect(note.toLowerCase()).toContain('nut');
    }
  });
});
