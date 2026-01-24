export declare const DEFAULT_METHODS: {
    readonly v60: {
        readonly name: "v60";
        readonly displayName: "V60";
        readonly scalingRules: {
            readonly scalesPours: true;
            readonly scalesDose: true;
            readonly scalesWater: true;
        };
        readonly defaultParams: {
            readonly ratio: 16;
            readonly waterTemp: 96;
            readonly grindSize: 20;
            readonly bloomRatio: 2;
            readonly bloomTime: 45;
        };
        readonly steps: readonly [{
            readonly name: "Bloom";
            readonly waterRatio: 2;
            readonly duration: 45;
            readonly notes: "Gentle circular pour, swirl";
        }, {
            readonly name: "First pour";
            readonly waterRatio: 6;
            readonly duration: 30;
            readonly notes: "Slow circular pour to 60%";
        }, {
            readonly name: "Second pour";
            readonly waterRatio: 8;
            readonly duration: 30;
            readonly notes: "Continue to target weight";
        }, {
            readonly name: "Drawdown";
            readonly duration: 60;
            readonly notes: "Wait for complete drawdown";
        }];
    };
    readonly moka: {
        readonly name: "moka";
        readonly displayName: "Moka Pot";
        readonly scalingRules: {
            readonly scalesPours: false;
            readonly scalesDose: true;
            readonly scalesWater: false;
        };
        readonly defaultParams: {
            readonly grindSize: 15;
            readonly preheatedWater: true;
            readonly heatLevel: "medium-low";
        };
        readonly steps: readonly [{
            readonly name: "Prep";
            readonly notes: "Fill bottom with hot water to valve, add grounds";
        }, {
            readonly name: "Heat";
            readonly notes: "Medium-low heat, lid open";
        }, {
            readonly name: "Watch";
            readonly notes: "When coffee starts flowing, reduce heat";
        }, {
            readonly name: "Stop";
            readonly notes: "Remove from heat when sputtering starts";
        }, {
            readonly name: "Cool";
            readonly notes: "Run cold water on bottom to stop extraction";
        }];
    };
    readonly espresso: {
        readonly name: "espresso";
        readonly displayName: "Espresso";
        readonly scalingRules: {
            readonly scalesPours: false;
            readonly scalesDose: true;
            readonly scalesWater: true;
        };
        readonly defaultParams: {
            readonly ratio: 2;
            readonly dose: 18;
            readonly yield: 36;
            readonly grindSize: 8;
            readonly waterTemp: 93;
            readonly extractionTime: 28;
        };
        readonly steps: readonly [{
            readonly name: "Grind";
            readonly notes: "Grind fresh, distribute evenly in portafilter";
        }, {
            readonly name: "Tamp";
            readonly notes: "Level tamp with consistent pressure";
        }, {
            readonly name: "Extract";
            readonly notes: "Pull shot, aim for 25-30 seconds";
        }, {
            readonly name: "Evaluate";
            readonly notes: "Check flow rate and color";
        }];
    };
    readonly french_press: {
        readonly name: "french_press";
        readonly displayName: "French Press";
        readonly scalingRules: {
            readonly scalesPours: false;
            readonly scalesDose: true;
            readonly scalesWater: true;
        };
        readonly defaultParams: {
            readonly ratio: 15;
            readonly waterTemp: 96;
            readonly grindSize: 28;
            readonly steepTime: 240;
        };
        readonly steps: readonly [{
            readonly name: "Add coffee";
            readonly notes: "Add coarse ground coffee to carafe";
        }, {
            readonly name: "Bloom";
            readonly duration: 30;
            readonly notes: "Add small amount of water, stir gently";
        }, {
            readonly name: "Fill";
            readonly notes: "Add remaining water, place lid without pressing";
        }, {
            readonly name: "Steep";
            readonly duration: 240;
            readonly notes: "Wait 4 minutes total";
        }, {
            readonly name: "Press";
            readonly notes: "Press plunger slowly and steadily";
        }, {
            readonly name: "Serve";
            readonly notes: "Pour immediately to avoid over-extraction";
        }];
    };
};
export declare const METHOD_ORDER: readonly ["v60", "moka", "espresso", "french_press"];
export type MethodName = keyof typeof DEFAULT_METHODS;
export declare function scaleV60Recipe(baseRecipe: {
    dose: number;
    ratio: number;
    steps: Array<{
        waterRatio?: number;
        [key: string]: unknown;
    }>;
}, scaleFactor: number): {
    dose: number;
    water: number;
    steps: Array<{
        waterAmount?: number;
        [key: string]: unknown;
    }>;
};
export declare function scaleMokaRecipe(baseRecipe: {
    dose: number;
    steps: Array<{
        [key: string]: unknown;
    }>;
}, scaleFactor: number): {
    dose: number;
    steps: Array<{
        [key: string]: unknown;
    }>;
};
//# sourceMappingURL=methods.d.ts.map