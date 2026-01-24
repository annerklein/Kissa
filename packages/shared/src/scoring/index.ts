import type { RatingSliders } from '../types/schemas.js';

// Smart score calculation weights
export const SLIDER_WEIGHTS = {
  balance: 0.25, // Most important - extraction accuracy
  sweetness: 0.25, // Key quality indicator
  clarity: 0.2, // Clean cup
  body: 0.15, // Mouthfeel
  finish: 0.15, // Aftertaste quality
} as const;

/**
 * Compute a smart score from rating sliders
 * Balance is centered (5 = optimal), others are higher = better
 * @param sliders - Rating sliders from user input
 * @returns Score from 0-10
 */
export function computeSmartScore(sliders: RatingSliders): number {
  // Balance is centered (5 = optimal, 1 = too sour, 10 = too bitter)
  // Convert to a 0-10 scale where 5 = 10 points, 1 or 10 = 2 points
  const balanceScore = 10 - Math.abs(sliders.balance - 5) * 2;

  const score =
    balanceScore * SLIDER_WEIGHTS.balance +
    sliders.sweetness * SLIDER_WEIGHTS.sweetness +
    sliders.clarity * SLIDER_WEIGHTS.clarity +
    sliders.body * SLIDER_WEIGHTS.body +
    sliders.finish * SLIDER_WEIGHTS.finish;

  // Clamp to 0-10
  return Math.max(0, Math.min(10, score));
}

/**
 * Compute a "best" score for ranking beans
 * Includes a confidence factor based on number of brews
 * @param scores - Array of computed scores from brews
 * @returns Best score with confidence adjustment
 */
export function computeBestScore(scores: number[]): number {
  if (scores.length === 0) return 0;

  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  
  // Confidence factor: max confidence at 3+ brews
  const confidence = Math.min(scores.length / 3, 1);
  
  // Slight boost for reproducibility (beans with more brews)
  return avgScore * (0.7 + 0.3 * confidence);
}

/**
 * Get a human-readable interpretation of the balance slider
 */
export function interpretBalance(balance: number): 'sour' | 'balanced' | 'bitter' {
  if (balance < 4) return 'sour';
  if (balance > 6) return 'bitter';
  return 'balanced';
}

/**
 * Get overall extraction assessment based on sliders
 */
export function getExtractionAssessment(sliders: RatingSliders): {
  extraction: 'under' | 'good' | 'over';
  confidence: number;
} {
  const balanceInterpretation = interpretBalance(sliders.balance);

  if (balanceInterpretation === 'sour' && sliders.sweetness < 5) {
    return { extraction: 'under', confidence: 0.8 };
  }

  if (balanceInterpretation === 'bitter' && sliders.finish < 5) {
    return { extraction: 'over', confidence: 0.8 };
  }

  if (balanceInterpretation === 'balanced' && sliders.sweetness >= 6) {
    return { extraction: 'good', confidence: 0.9 };
  }

  // Mixed signals - lower confidence
  return {
    extraction: balanceInterpretation === 'sour' ? 'under' : balanceInterpretation === 'bitter' ? 'over' : 'good',
    confidence: 0.5,
  };
}
