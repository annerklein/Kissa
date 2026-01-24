/**
 * Grinder delta calculation utilities
 */
/**
 * Compute the grinder adjustment needed to go from current setting to target
 * @param currentSetting - Current grinder setting
 * @param targetSetting - Target grinder setting for the bag/method
 * @returns Delta information with direction and clicks
 */
export function computeGrinderDelta(currentSetting, targetSetting) {
    const diff = targetSetting - currentSetting;
    if (Math.abs(diff) < 0.5) {
        return {
            direction: 'none',
            clicks: 0,
            description: 'No change needed',
        };
    }
    const clicks = Math.round(Math.abs(diff));
    if (diff > 0) {
        return {
            direction: 'coarser',
            clicks,
            description: `Move ${clicks} click${clicks === 1 ? '' : 's'} coarser`,
        };
    }
    return {
        direction: 'finer',
        clicks,
        description: `Move ${clicks} click${clicks === 1 ? '' : 's'} finer`,
    };
}
/**
 * Format grinder setting for display
 * @param setting - Numeric grinder setting
 * @returns Formatted string
 */
export function formatGrinderSetting(setting) {
    // Round to 1 decimal place
    return setting.toFixed(1);
}
/**
 * Format delta for compact display (e.g., "+3" or "-2")
 */
export function formatDeltaCompact(delta) {
    if (delta.direction === 'none')
        return '0';
    const sign = delta.direction === 'coarser' ? '+' : '-';
    return `${sign}${delta.clicks}`;
}
//# sourceMappingURL=grinder.js.map