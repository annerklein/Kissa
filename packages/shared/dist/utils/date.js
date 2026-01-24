/**
 * Date formatting utilities
 */
/**
 * Format roast date for display
 * Shows "Today", "Yesterday", or date
 */
export function formatRoastDate(date) {
    const now = new Date();
    const roastDate = new Date(date);
    // Reset time to compare dates only
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const roast = new Date(roastDate.getFullYear(), roastDate.getMonth(), roastDate.getDate());
    const diffDays = Math.floor((today.getTime() - roast.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0)
        return 'Roasted today';
    if (diffDays === 1)
        return 'Roasted yesterday';
    if (diffDays < 7)
        return `${diffDays} days off roast`;
    if (diffDays < 14)
        return '1 week off roast';
    if (diffDays < 21)
        return '2 weeks off roast';
    if (diffDays < 28)
        return '3 weeks off roast';
    return roastDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}
/**
 * Calculate days since roast
 */
export function daysSinceRoast(roastDate) {
    const now = new Date();
    const roast = new Date(roastDate);
    return Math.floor((now.getTime() - roast.getTime()) / (1000 * 60 * 60 * 24));
}
/**
 * Get freshness indicator based on days since roast
 */
export function getFreshnessIndicator(roastDate) {
    const days = daysSinceRoast(roastDate);
    if (days < 3)
        return 'resting';
    if (days < 21)
        return 'peak';
    if (days < 35)
        return 'fading';
    return 'stale';
}
/**
 * Format relative time for last brewed
 */
export function formatLastBrewed(date) {
    const now = new Date();
    const brewed = new Date(date);
    const diffMs = now.getTime() - brewed.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 1)
        return 'Just now';
    if (diffMins < 60)
        return `${diffMins}m ago`;
    if (diffHours < 24)
        return `${diffHours}h ago`;
    if (diffDays === 1)
        return 'Yesterday';
    if (diffDays < 7)
        return `${diffDays} days ago`;
    return brewed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}
//# sourceMappingURL=date.js.map