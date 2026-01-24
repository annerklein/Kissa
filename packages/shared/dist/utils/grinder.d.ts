/**
 * Grinder delta calculation utilities
 */
export interface GrinderDelta {
    direction: 'finer' | 'coarser' | 'none';
    clicks: number;
    description: string;
}
/**
 * Compute the grinder adjustment needed to go from current setting to target
 * @param currentSetting - Current grinder setting
 * @param targetSetting - Target grinder setting for the bag/method
 * @returns Delta information with direction and clicks
 */
export declare function computeGrinderDelta(currentSetting: number, targetSetting: number): GrinderDelta;
/**
 * Format grinder setting for display
 * @param setting - Numeric grinder setting
 * @returns Formatted string
 */
export declare function formatGrinderSetting(setting: number): string;
/**
 * Format delta for compact display (e.g., "+3" or "-2")
 */
export declare function formatDeltaCompact(delta: GrinderDelta): string;
//# sourceMappingURL=grinder.d.ts.map