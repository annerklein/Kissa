/**
 * Date formatting utilities
 */

/**
 * Format roast date for display
 * Shows "Today", "Yesterday", or date
 * Optionally accounts for frozen days to show effective days off roast.
 */
export function formatRoastDate(date: Date, frozenDaysOffset?: number): string {
  const now = new Date();
  const roastDate = new Date(date);

  // Reset time to compare dates only
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const roast = new Date(roastDate.getFullYear(), roastDate.getMonth(), roastDate.getDate());

  let diffDays = Math.floor((today.getTime() - roast.getTime()) / (1000 * 60 * 60 * 24));

  // Subtract frozen days to get effective days off roast
  if (frozenDaysOffset && frozenDaysOffset > 0) {
    diffDays = Math.max(0, diffDays - frozenDaysOffset);
  }

  if (diffDays === 0) return 'Roasted today';
  if (diffDays === 1) return 'Roasted yesterday';
  if (diffDays < 7) return `${diffDays} days off roast`;
  if (diffDays < 14) return '1 week off roast';
  if (diffDays < 21) return '2 weeks off roast';
  if (diffDays < 28) return '3 weeks off roast';

  return roastDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate days since roast
 */
export function daysSinceRoast(roastDate: Date): number {
  const now = new Date();
  const roast = new Date(roastDate);
  return Math.floor((now.getTime() - roast.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Compute effective days off roast, accounting for time spent frozen.
 * Freezing pauses the aging clock, so frozen days are subtracted.
 *
 * @param roastDate - The original roast date
 * @param totalFrozenDays - Accumulated frozen days from past freeze/thaw cycles
 * @param frozenAt - When the current freeze started (null if not currently frozen)
 * @returns The effective number of days off roast
 */
export function computeEffectiveDaysOffRoast(
  roastDate: Date,
  totalFrozenDays: number = 0,
  frozenAt?: Date | string | null,
): number {
  const now = new Date();
  const roast = new Date(roastDate);

  // Reset time to compare dates only
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const roastDay = new Date(roast.getFullYear(), roast.getMonth(), roast.getDate());

  const totalDays = Math.floor((today.getTime() - roastDay.getTime()) / (1000 * 60 * 60 * 24));

  let frozenDays = totalFrozenDays;
  if (frozenAt) {
    const frozenDate = new Date(frozenAt);
    const frozenDay = new Date(frozenDate.getFullYear(), frozenDate.getMonth(), frozenDate.getDate());
    frozenDays += Math.floor((today.getTime() - frozenDay.getTime()) / (1000 * 60 * 60 * 24));
  }

  return Math.max(0, totalDays - frozenDays);
}

/**
 * Compute total frozen days including any currently ongoing freeze.
 */
export function computeTotalFrozenDays(
  totalFrozenDays: number = 0,
  frozenAt?: Date | string | null,
): number {
  let frozenDays = totalFrozenDays;
  if (frozenAt) {
    const now = new Date();
    const frozenDate = new Date(frozenAt);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const frozenDay = new Date(frozenDate.getFullYear(), frozenDate.getMonth(), frozenDate.getDate());
    frozenDays += Math.floor((today.getTime() - frozenDay.getTime()) / (1000 * 60 * 60 * 24));
  }
  return frozenDays;
}

/**
 * Get freshness indicator based on days since roast
 */
export function getFreshnessIndicator(
  roastDate: Date
): 'resting' | 'peak' | 'fading' | 'stale' {
  const days = daysSinceRoast(roastDate);

  if (days < 3) return 'resting';
  if (days < 21) return 'peak';
  if (days < 35) return 'fading';
  return 'stale';
}

/**
 * Format relative time for last brewed
 */
export function formatLastBrewed(date: Date): string {
  const now = new Date();
  const brewed = new Date(date);
  const diffMs = now.getTime() - brewed.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return brewed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
