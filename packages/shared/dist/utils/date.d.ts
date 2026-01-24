/**
 * Date formatting utilities
 */
/**
 * Format roast date for display
 * Shows "Today", "Yesterday", or date
 */
export declare function formatRoastDate(date: Date): string;
/**
 * Calculate days since roast
 */
export declare function daysSinceRoast(roastDate: Date): number;
/**
 * Get freshness indicator based on days since roast
 */
export declare function getFreshnessIndicator(roastDate: Date): 'resting' | 'peak' | 'fading' | 'stale';
/**
 * Format relative time for last brewed
 */
export declare function formatLastBrewed(date: Date): string;
//# sourceMappingURL=date.d.ts.map