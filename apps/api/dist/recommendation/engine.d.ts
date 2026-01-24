import type { RatingSliders, BrewParameters, Suggestion } from '@kissa/shared';
export interface SuggestionInput {
    method: 'v60' | 'moka';
    sliders: RatingSliders;
    drawdownTime?: number;
    parameters: BrewParameters;
    previousBrews: Array<{
        ratingSliders: RatingSliders | null;
        parameters: BrewParameters | null;
    }>;
}
/**
 * Generate brewing suggestions based on rating sliders and brew parameters
 * This is V1 - rule-based heuristics
 */
export declare function generateSuggestion(input: SuggestionInput): Suggestion;
//# sourceMappingURL=engine.d.ts.map