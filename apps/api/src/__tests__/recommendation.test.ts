import { describe, it, expect } from 'vitest';
import { generateSuggestion } from '../recommendation/engine.js';
import type { SuggestionInput } from '../recommendation/engine.js';
import type { RatingSliders } from '@kissa/shared';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeInput(overrides: Partial<SuggestionInput> = {}): SuggestionInput {
  return {
    method: 'v60',
    sliders: {
      balance: 5,
      sweetness: 7,
      clarity: 7,
      body: 7,
      finish: 7,
    },
    drawdownTime: 180,
    parameters: { grindSize: 20, waterTemp: 96 },
    previousBrews: [],
    ...overrides,
  };
}

function withSliders(
  sliders: Partial<RatingSliders>,
  overrides: Partial<SuggestionInput> = {}
): SuggestionInput {
  return makeInput({
    sliders: {
      balance: 5,
      sweetness: 7,
      clarity: 7,
      body: 7,
      finish: 7,
      ...sliders,
    },
    ...overrides,
  });
}

// ===========================================================================
// V60 Suggestions
// ===========================================================================
describe('V60 Suggestion Engine', () => {
  describe('under-extraction', () => {
    it('suggests finer grind for sour + short drawdown', () => {
      const suggestion = generateSuggestion(
        withSliders(
          { balance: 2, sweetness: 3 },
          { drawdownTime: 120 } // Short drawdown
        )
      );
      expect(suggestion.primary.variable).toBe('grind');
      expect(suggestion.primary.action.toLowerCase()).toContain('finer');
      expect(suggestion.secondary).toBeDefined();
      expect(suggestion.secondary!.variable).toBe('temperature');
    });

    it('suggests higher temp for sour + normal drawdown', () => {
      const suggestion = generateSuggestion(
        withSliders(
          { balance: 2, sweetness: 3 },
          { drawdownTime: 180 } // Normal drawdown
        )
      );
      expect(suggestion.primary.variable).toBe('temperature');
      expect(suggestion.primary.action.toLowerCase()).toContain('increase');
    });
  });

  describe('over-extraction', () => {
    it('suggests coarser grind for bitter + long drawdown', () => {
      const suggestion = generateSuggestion(
        withSliders(
          { balance: 9, finish: 3 },
          { drawdownTime: 250 } // Long drawdown
        )
      );
      expect(suggestion.primary.variable).toBe('grind');
      expect(suggestion.primary.action.toLowerCase()).toContain('coarser');
    });

    it('suggests lower temp for bitter + normal drawdown', () => {
      const suggestion = generateSuggestion(
        withSliders(
          { balance: 8, finish: 3 },
          { drawdownTime: 180 }
        )
      );
      expect(suggestion.primary.variable).toBe('temperature');
      expect(suggestion.primary.action.toLowerCase()).toContain('decrease');
    });
  });

  describe('good extraction', () => {
    it('suggests coarser grind for low clarity', () => {
      const suggestion = generateSuggestion(
        withSliders({ balance: 5, sweetness: 7, clarity: 3 })
      );
      expect(suggestion.primary.variable).toBe('grind');
      expect(suggestion.primary.action.toLowerCase()).toContain('coarser');
    });

    it('suggests tighter ratio for low body', () => {
      const suggestion = generateSuggestion(
        withSliders({ balance: 5, sweetness: 7, clarity: 7, body: 3 })
      );
      expect(suggestion.primary.variable).toBe('ratio');
      expect(suggestion.primary.action.toLowerCase()).toContain('ratio');
    });

    it('says keep settings when everything is great', () => {
      const suggestion = generateSuggestion(
        withSliders({
          balance: 5,
          sweetness: 8,
          clarity: 8,
          body: 7,
          finish: 8,
        })
      );
      expect(suggestion.primary.variable).toBe('none');
      expect(suggestion.primary.action.toLowerCase()).toContain('keep');
    });
  });

  describe('includes rationale', () => {
    it('every suggestion has a rationale', () => {
      const inputs = [
        withSliders({ balance: 2, sweetness: 3 }, { drawdownTime: 120 }),
        withSliders({ balance: 9, finish: 3 }, { drawdownTime: 250 }),
        withSliders({ balance: 5, sweetness: 8, clarity: 8, body: 7, finish: 8 }),
      ];

      for (const input of inputs) {
        const suggestion = generateSuggestion(input);
        expect(suggestion.primary.rationale).toBeTruthy();
        expect(suggestion.primary.rationale.length).toBeGreaterThan(10);
      }
    });
  });
});

// ===========================================================================
// Moka Suggestions
// ===========================================================================
describe('Moka Suggestion Engine', () => {
  describe('under-extraction', () => {
    it('suggests finer grind for sour taste', () => {
      const suggestion = generateSuggestion(
        withSliders(
          { balance: 2, sweetness: 3 },
          { method: 'moka' }
        )
      );
      expect(suggestion.primary.variable).toBe('grind');
      expect(suggestion.primary.action.toLowerCase()).toContain('finer');
      expect(suggestion.secondary).toBeDefined();
      expect(suggestion.secondary!.variable).toBe('heat');
    });
  });

  describe('over-extraction', () => {
    it('suggests removing from heat earlier', () => {
      const suggestion = generateSuggestion(
        withSliders(
          { balance: 8, finish: 3 },
          { method: 'moka' }
        )
      );
      expect(suggestion.primary.variable).toBe('heat');
      expect(suggestion.primary.action.toLowerCase()).toContain('remove');
      expect(suggestion.secondary!.variable).toBe('cooling');
    });
  });

  describe('bitter with mixed signals', () => {
    it('still suggests heat management for bitter balance even with OK finish', () => {
      // balance > 6 always maps to over-extraction in getExtractionAssessment,
      // so the over-extraction handler triggers regardless of finish value
      const suggestion = generateSuggestion(
        withSliders(
          { balance: 8, sweetness: 7, finish: 5 },
          { method: 'moka' }
        )
      );
      expect(suggestion.primary.variable).toBe('heat');
      expect(suggestion.primary.action.toLowerCase()).toContain('remove');
    });
  });

  describe('low body', () => {
    it('suggests filling the basket completely', () => {
      const suggestion = generateSuggestion(
        withSliders(
          { balance: 5, sweetness: 7, body: 3 },
          { method: 'moka' }
        )
      );
      expect(suggestion.primary.variable).toBe('dose');
      expect(suggestion.primary.action.toLowerCase()).toContain('basket');
    });
  });

  describe('good extraction', () => {
    it('says keep current technique', () => {
      const suggestion = generateSuggestion(
        withSliders(
          { balance: 5, sweetness: 8, clarity: 8, body: 7, finish: 8 },
          { method: 'moka' }
        )
      );
      expect(suggestion.primary.variable).toBe('none');
      expect(suggestion.primary.action.toLowerCase()).toContain('keep');
    });
  });
});
