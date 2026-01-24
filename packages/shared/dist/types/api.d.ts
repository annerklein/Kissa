import { z } from 'zod';
import type { Bean, Bag, BagMethodTarget, BrewLog, Method, Roaster } from './schemas.js';
export interface ApiResponse<T> {
    data: T;
    success: true;
}
export interface ApiError {
    error: string;
    message: string;
    success: false;
}
export type ApiResult<T> = ApiResponse<T> | ApiError;
export interface AvailableBag extends Bag {
    bean: Bean & {
        roaster: Roaster;
    };
    targets: BagMethodTarget[];
    lastBrew?: {
        brewedAt: Date;
        computedScore: number | null;
    };
    grinderDelta?: {
        direction: 'finer' | 'coarser' | 'none';
        clicks: number;
    };
}
export interface AvailableBeansResponse {
    bags: AvailableBag[];
    currentGrinderSetting: number;
    selectedMethodId: string;
}
export interface BeanProfile extends Bean {
    roaster: Roaster;
    bags: (Bag & {
        targets: BagMethodTarget[];
        brewLogs: BrewLog[];
    })[];
    tastingNotesComparison?: {
        expected: string[];
        actual: Record<string, number>;
    };
}
export interface BrewScreenData {
    bag: Bag & {
        bean: Bean & {
            roaster: Roaster;
        };
    };
    method: Method;
    target: BagMethodTarget | null;
    currentGrinderSetting: number;
    scaledRecipe: ScaledRecipe;
}
export interface ScaledRecipe {
    dose: number;
    water: number;
    ratio: number;
    waterTemp: number;
    steps: RecipeStep[];
}
export interface RecipeStep {
    name: string;
    waterAmount?: number;
    waterRatio?: number;
    duration?: number;
    notes?: string;
}
export interface Suggestion {
    primary: {
        variable: string;
        action: string;
        rationale: string;
    };
    secondary?: {
        variable: string;
        action: string;
        rationale: string;
    };
}
export interface RatingResponse {
    computedScore: number;
    suggestion: Suggestion;
}
export interface MapDataPoint {
    countryCode: string;
    countryName: string;
    count: number;
    avgScore: number | null;
}
export interface CountryData {
    countryCode: string;
    countryName: string;
    regions: RegionData[];
}
export interface RegionData {
    regionName: string;
    beans: BeanRankingItem[];
}
export interface BeanRankingItem {
    bean: Bean & {
        roaster: Roaster;
    };
    brewCount: number;
    avgScore: number | null;
    bestScore: number;
}
export declare const OnboardingDataSchema: z.ZodObject<{
    settings: z.ZodObject<{
        defaultServings: z.ZodNumber;
        gramsPerServing: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        defaultServings: number;
        gramsPerServing: number;
    }, {
        defaultServings: number;
        gramsPerServing: number;
    }>;
    grinder: z.ZodObject<{
        model: z.ZodString;
        currentSetting: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        currentSetting: number;
        model: string;
    }, {
        currentSetting: number;
        model: string;
    }>;
    beans: z.ZodArray<z.ZodObject<{
        roasterName: z.ZodString;
        name: z.ZodString;
        originCountry: z.ZodOptional<z.ZodString>;
        originRegion: z.ZodOptional<z.ZodString>;
        roastLevel: z.ZodOptional<z.ZodEnum<["LIGHT", "MEDIUM_LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"]>>;
        tastingNotesExpected: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        bag: z.ZodObject<{
            roastDate: z.ZodDate;
            isAvailable: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            roastDate: Date;
            isAvailable: boolean;
        }, {
            roastDate: Date;
            isAvailable?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        roasterName: string;
        bag: {
            roastDate: Date;
            isAvailable: boolean;
        };
        originCountry?: string | undefined;
        originRegion?: string | undefined;
        roastLevel?: "LIGHT" | "MEDIUM_LIGHT" | "MEDIUM" | "MEDIUM_DARK" | "DARK" | undefined;
        tastingNotesExpected?: string[] | undefined;
    }, {
        name: string;
        roasterName: string;
        bag: {
            roastDate: Date;
            isAvailable?: boolean | undefined;
        };
        originCountry?: string | undefined;
        originRegion?: string | undefined;
        roastLevel?: "LIGHT" | "MEDIUM_LIGHT" | "MEDIUM" | "MEDIUM_DARK" | "DARK" | undefined;
        tastingNotesExpected?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    settings: {
        defaultServings: number;
        gramsPerServing: number;
    };
    grinder: {
        currentSetting: number;
        model: string;
    };
    beans: {
        name: string;
        roasterName: string;
        bag: {
            roastDate: Date;
            isAvailable: boolean;
        };
        originCountry?: string | undefined;
        originRegion?: string | undefined;
        roastLevel?: "LIGHT" | "MEDIUM_LIGHT" | "MEDIUM" | "MEDIUM_DARK" | "DARK" | undefined;
        tastingNotesExpected?: string[] | undefined;
    }[];
}, {
    settings: {
        defaultServings: number;
        gramsPerServing: number;
    };
    grinder: {
        currentSetting: number;
        model: string;
    };
    beans: {
        name: string;
        roasterName: string;
        bag: {
            roastDate: Date;
            isAvailable?: boolean | undefined;
        };
        originCountry?: string | undefined;
        originRegion?: string | undefined;
        roastLevel?: "LIGHT" | "MEDIUM_LIGHT" | "MEDIUM" | "MEDIUM_DARK" | "DARK" | undefined;
        tastingNotesExpected?: string[] | undefined;
    }[];
}>;
export type OnboardingData = z.infer<typeof OnboardingDataSchema>;
//# sourceMappingURL=api.d.ts.map