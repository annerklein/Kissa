import type { RatingSliders } from '../types/schemas.js';
export declare const SLIDER_WEIGHTS: {
    readonly balance: 0.25;
    readonly sweetness: 0.25;
    readonly clarity: 0.2;
    readonly body: 0.15;
    readonly finish: 0.15;
};
/**
 * Compute a smart score from rating sliders
 * Balance is centered (5 = optimal), others are higher = better
 * @param sliders - Rating sliders from user input
 * @returns Score from 0-10
 */
export declare function computeSmartScore(sliders: RatingSliders): number;
/**
 * Compute a "best" score for ranking beans
 * Includes a confidence factor based on number of brews
 * @param scores - Array of computed scores from brews
 * @returns Best score with confidence adjustment
 */
export declare function computeBestScore(scores: number[]): number;
/**
 * Get a human-readable interpretation of the balance slider
 */
export declare function interpretBalance(balance: number): 'sour' | 'balanced' | 'bitter';
/**
 * Get overall extraction assessment based on sliders
 */
export declare function getExtractionAssessment(sliders: RatingSliders): {
    extraction: 'under' | 'good' | 'over';
    confidence: number;
};
//# sourceMappingURL=index.d.ts.map