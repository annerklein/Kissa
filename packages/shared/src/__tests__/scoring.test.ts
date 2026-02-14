import { describe, it, expect } from 'vitest';
import {
  computeSmartScore,
  computeBestScore,
  interpretBalance,
  getExtractionAssessment,
  SLIDER_WEIGHTS,
} from '../scoring/index.js';
import type { RatingSliders } from '../types/schemas.js';

// ---------------------------------------------------------------------------
// Helper – builds a full RatingSliders object with sensible defaults
// ---------------------------------------------------------------------------
function sliders(overrides: Partial<RatingSliders> = {}): RatingSliders {
  return {
    balance: 5,
    sweetness: 7,
    clarity: 7,
    body: 7,
    finish: 7,
    ...overrides,
  };
}

// ===========================================================================
// computeSmartScore
// ===========================================================================
describe('computeSmartScore', () => {
  it('returns a perfect 10 when all sliders are maxed with balanced taste', () => {
    const score = computeSmartScore(sliders({
      balance: 5,
      sweetness: 10,
      clarity: 10,
      body: 10,
      finish: 10,
    }));
    expect(score).toBe(10);
  });

  it('returns a low score when everything is at minimum', () => {
    const score = computeSmartScore(sliders({
      balance: 1,
      sweetness: 1,
      clarity: 1,
      body: 1,
      finish: 1,
    }));
    expect(score).toBeLessThan(2);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('penalises extreme balance (too sour = 1)', () => {
    const balanced = computeSmartScore(sliders({ balance: 5 }));
    const sour = computeSmartScore(sliders({ balance: 1 }));
    expect(balanced).toBeGreaterThan(sour);
  });

  it('penalises extreme balance (too bitter = 10)', () => {
    const balanced = computeSmartScore(sliders({ balance: 5 }));
    const bitter = computeSmartScore(sliders({ balance: 10 }));
    expect(balanced).toBeGreaterThan(bitter);
  });

  it('is symmetric around balance = 5', () => {
    const sour = computeSmartScore(sliders({ balance: 3 }));
    const bitter = computeSmartScore(sliders({ balance: 7 }));
    expect(sour).toBeCloseTo(bitter, 5);
  });

  it('clamps to [0, 10]', () => {
    const score = computeSmartScore(sliders({
      balance: 5,
      sweetness: 10,
      clarity: 10,
      body: 10,
      finish: 10,
    }));
    expect(score).toBeLessThanOrEqual(10);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('weights sum to 1.0', () => {
    const total = Object.values(SLIDER_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1.0, 5);
  });

  it('higher sweetness yields a higher score, other things equal', () => {
    const low = computeSmartScore(sliders({ sweetness: 3 }));
    const high = computeSmartScore(sliders({ sweetness: 9 }));
    expect(high).toBeGreaterThan(low);
  });

  it('higher clarity yields a higher score', () => {
    const low = computeSmartScore(sliders({ clarity: 2 }));
    const high = computeSmartScore(sliders({ clarity: 9 }));
    expect(high).toBeGreaterThan(low);
  });

  it('higher body yields a higher score', () => {
    const low = computeSmartScore(sliders({ body: 2 }));
    const high = computeSmartScore(sliders({ body: 9 }));
    expect(high).toBeGreaterThan(low);
  });

  it('higher finish yields a higher score', () => {
    const low = computeSmartScore(sliders({ finish: 2 }));
    const high = computeSmartScore(sliders({ finish: 9 }));
    expect(high).toBeGreaterThan(low);
  });

  it('returns a number (never NaN)', () => {
    const result = computeSmartScore(sliders());
    expect(typeof result).toBe('number');
    expect(Number.isNaN(result)).toBe(false);
  });
});

// ===========================================================================
// computeBestScore
// ===========================================================================
describe('computeBestScore', () => {
  it('returns 0 for empty scores array', () => {
    expect(computeBestScore([])).toBe(0);
  });

  it('applies confidence penalty for a single brew', () => {
    const scores = [8];
    const result = computeBestScore(scores);
    // confidence = 1/3 => factor = 0.7 + 0.3 * (1/3) = 0.8
    expect(result).toBeCloseTo(8 * 0.8, 5);
  });

  it('applies partial confidence for two brews', () => {
    const scores = [8, 8];
    const result = computeBestScore(scores);
    // confidence = 2/3 => factor = 0.7 + 0.3 * (2/3) = 0.9
    expect(result).toBeCloseTo(8 * 0.9, 5);
  });

  it('reaches full confidence at 3+ brews', () => {
    const scores = [8, 8, 8];
    const result = computeBestScore(scores);
    // confidence = 1 => factor = 1.0
    expect(result).toBeCloseTo(8, 5);
  });

  it('averages scores correctly', () => {
    const scores = [6, 8, 10];
    const avg = 8;
    const result = computeBestScore(scores);
    expect(result).toBeCloseTo(avg * 1.0, 5);
  });

  it('more brews beyond 3 do not change confidence factor', () => {
    const scores = [7, 7, 7, 7, 7];
    const result = computeBestScore(scores);
    expect(result).toBeCloseTo(7, 5);
  });
});

// ===========================================================================
// interpretBalance
// ===========================================================================
describe('interpretBalance', () => {
  it('returns "sour" for values < 4', () => {
    expect(interpretBalance(1)).toBe('sour');
    expect(interpretBalance(2)).toBe('sour');
    expect(interpretBalance(3)).toBe('sour');
  });

  it('returns "balanced" for values 4-6', () => {
    expect(interpretBalance(4)).toBe('balanced');
    expect(interpretBalance(5)).toBe('balanced');
    expect(interpretBalance(6)).toBe('balanced');
  });

  it('returns "bitter" for values > 6', () => {
    expect(interpretBalance(7)).toBe('bitter');
    expect(interpretBalance(8)).toBe('bitter');
    expect(interpretBalance(9)).toBe('bitter');
    expect(interpretBalance(10)).toBe('bitter');
  });
});

// ===========================================================================
// getExtractionAssessment
// ===========================================================================
describe('getExtractionAssessment', () => {
  it('detects under-extraction (sour + low sweetness)', () => {
    const result = getExtractionAssessment(sliders({ balance: 2, sweetness: 3 }));
    expect(result.extraction).toBe('under');
    expect(result.confidence).toBe(0.8);
  });

  it('detects over-extraction (bitter + low finish)', () => {
    const result = getExtractionAssessment(sliders({ balance: 8, finish: 3 }));
    expect(result.extraction).toBe('over');
    expect(result.confidence).toBe(0.8);
  });

  it('detects good extraction (balanced + high sweetness)', () => {
    const result = getExtractionAssessment(sliders({ balance: 5, sweetness: 8 }));
    expect(result.extraction).toBe('good');
    expect(result.confidence).toBe(0.9);
  });

  it('returns lower confidence for mixed signals (sour but high sweetness)', () => {
    const result = getExtractionAssessment(sliders({ balance: 2, sweetness: 8 }));
    expect(result.extraction).toBe('under');
    expect(result.confidence).toBe(0.5);
  });

  it('returns lower confidence for mixed signals (bitter but high finish)', () => {
    const result = getExtractionAssessment(sliders({ balance: 8, finish: 7 }));
    expect(result.extraction).toBe('over');
    expect(result.confidence).toBe(0.5);
  });

  it('returns good with low confidence for balanced but low sweetness', () => {
    const result = getExtractionAssessment(sliders({ balance: 5, sweetness: 4 }));
    expect(result.extraction).toBe('good');
    expect(result.confidence).toBe(0.5);
  });
});
