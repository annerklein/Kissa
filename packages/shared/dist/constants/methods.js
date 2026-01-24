// Method constants and default configurations
export const DEFAULT_METHODS = {
    v60: {
        name: 'v60',
        displayName: 'V60',
        scalingRules: {
            scalesPours: true,
            scalesDose: true,
            scalesWater: true,
        },
        defaultParams: {
            ratio: 16,
            waterTemp: 96,
            grindSize: 20,
            bloomRatio: 2,
            bloomTime: 45,
        },
        steps: [
            { name: 'Bloom', waterRatio: 2, duration: 45, notes: 'Gentle circular pour, swirl' },
            { name: 'First pour', waterRatio: 6, duration: 30, notes: 'Slow circular pour to 60%' },
            { name: 'Second pour', waterRatio: 8, duration: 30, notes: 'Continue to target weight' },
            { name: 'Drawdown', duration: 60, notes: 'Wait for complete drawdown' },
        ],
    },
    moka: {
        name: 'moka',
        displayName: 'Moka Pot',
        scalingRules: {
            scalesPours: false,
            scalesDose: true,
            scalesWater: false,
        },
        defaultParams: {
            grindSize: 15,
            preheatedWater: true,
            heatLevel: 'medium-low',
        },
        steps: [
            { name: 'Prep', notes: 'Fill bottom with hot water to valve, add grounds' },
            { name: 'Heat', notes: 'Medium-low heat, lid open' },
            { name: 'Watch', notes: 'When coffee starts flowing, reduce heat' },
            { name: 'Stop', notes: 'Remove from heat when sputtering starts' },
            { name: 'Cool', notes: 'Run cold water on bottom to stop extraction' },
        ],
    },
    espresso: {
        name: 'espresso',
        displayName: 'Espresso',
        scalingRules: {
            scalesPours: false,
            scalesDose: true,
            scalesWater: true,
        },
        defaultParams: {
            ratio: 2,
            dose: 18,
            yield: 36,
            grindSize: 8,
            waterTemp: 93,
            extractionTime: 28,
        },
        steps: [
            { name: 'Grind', notes: 'Grind fresh, distribute evenly in portafilter' },
            { name: 'Tamp', notes: 'Level tamp with consistent pressure' },
            { name: 'Extract', notes: 'Pull shot, aim for 25-30 seconds' },
            { name: 'Evaluate', notes: 'Check flow rate and color' },
        ],
    },
    french_press: {
        name: 'french_press',
        displayName: 'French Press',
        scalingRules: {
            scalesPours: false,
            scalesDose: true,
            scalesWater: true,
        },
        defaultParams: {
            ratio: 15,
            waterTemp: 96,
            grindSize: 28,
            steepTime: 240,
        },
        steps: [
            { name: 'Add coffee', notes: 'Add coarse ground coffee to carafe' },
            { name: 'Bloom', duration: 30, notes: 'Add small amount of water, stir gently' },
            { name: 'Fill', notes: 'Add remaining water, place lid without pressing' },
            { name: 'Steep', duration: 240, notes: 'Wait 4 minutes total' },
            { name: 'Press', notes: 'Press plunger slowly and steadily' },
            { name: 'Serve', notes: 'Pour immediately to avoid over-extraction' },
        ],
    },
};
// Method order for display
export const METHOD_ORDER = ['v60', 'moka', 'espresso', 'french_press'];
// V60 scaling: scale all pours proportionally
export function scaleV60Recipe(baseRecipe, scaleFactor) {
    const dose = baseRecipe.dose * scaleFactor;
    const water = dose * baseRecipe.ratio;
    const steps = baseRecipe.steps.map((step) => ({
        ...step,
        waterAmount: step.waterRatio ? (step.waterRatio / baseRecipe.ratio) * water : undefined,
    }));
    return { dose, water, steps };
}
// Moka scaling: scale dose only, keep technique steps unchanged
export function scaleMokaRecipe(baseRecipe, scaleFactor) {
    return {
        dose: baseRecipe.dose * scaleFactor,
        steps: baseRecipe.steps, // Steps unchanged
    };
}
//# sourceMappingURL=methods.js.map