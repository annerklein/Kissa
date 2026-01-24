import { z } from 'zod';
export declare const SettingsSchema: z.ZodObject<{
    id: z.ZodString;
    defaultServings: z.ZodDefault<z.ZodNumber>;
    gramsPerServing: z.ZodDefault<z.ZodNumber>;
    displayPreferences: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    defaultServings: number;
    gramsPerServing: number;
    createdAt: Date;
    updatedAt: Date;
    displayPreferences?: string | null | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    defaultServings?: number | undefined;
    gramsPerServing?: number | undefined;
    displayPreferences?: string | null | undefined;
}>;
export type Settings = z.infer<typeof SettingsSchema>;
export declare const SettingsUpdateSchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    defaultServings: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    gramsPerServing: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    displayPreferences: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
}, "id" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    defaultServings?: number | undefined;
    gramsPerServing?: number | undefined;
    displayPreferences?: string | null | undefined;
}, {
    defaultServings?: number | undefined;
    gramsPerServing?: number | undefined;
    displayPreferences?: string | null | undefined;
}>;
export type SettingsUpdate = z.infer<typeof SettingsUpdateSchema>;
export declare const GrinderStateSchema: z.ZodObject<{
    id: z.ZodString;
    grinderModel: z.ZodDefault<z.ZodString>;
    currentSetting: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    grinderModel: string;
    currentSetting: number;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    grinderModel?: string | undefined;
    currentSetting?: number | undefined;
}>;
export type GrinderState = z.infer<typeof GrinderStateSchema>;
export declare const GrinderApplySchema: z.ZodObject<{
    newSetting: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    newSetting: number;
}, {
    newSetting: number;
}>;
export type GrinderApply = z.infer<typeof GrinderApplySchema>;
export declare const RoasterSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    website: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    logoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    country?: string | null | undefined;
    website?: string | null | undefined;
    logoUrl?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    country?: string | null | undefined;
    website?: string | null | undefined;
    logoUrl?: string | null | undefined;
    notes?: string | null | undefined;
}>;
export type Roaster = z.infer<typeof RoasterSchema>;
export declare const RoasterCreateSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    name: z.ZodString;
    country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    website: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    logoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "id" | "createdAt" | "updatedAt">, "strip", z.ZodTypeAny, {
    name: string;
    country?: string | null | undefined;
    website?: string | null | undefined;
    logoUrl?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    name: string;
    country?: string | null | undefined;
    website?: string | null | undefined;
    logoUrl?: string | null | undefined;
    notes?: string | null | undefined;
}>;
export type RoasterCreate = z.infer<typeof RoasterCreateSchema>;
export declare const RoastLevelSchema: z.ZodEnum<["LIGHT", "MEDIUM_LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"]>;
export declare const BeanSchema: z.ZodObject<{
    id: z.ZodString;
    roasterId: z.ZodString;
    name: z.ZodString;
    originCountry: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    originRegion: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    varietal: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    process: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    roastLevel: z.ZodDefault<z.ZodEnum<["LIGHT", "MEDIUM_LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"]>>;
    tastingNotesExpected: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    roasterId: string;
    roastLevel: "LIGHT" | "MEDIUM_LIGHT" | "MEDIUM" | "MEDIUM_DARK" | "DARK";
    originCountry?: string | null | undefined;
    originRegion?: string | null | undefined;
    varietal?: string | null | undefined;
    process?: string | null | undefined;
    tastingNotesExpected?: string[] | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    roasterId: string;
    originCountry?: string | null | undefined;
    originRegion?: string | null | undefined;
    varietal?: string | null | undefined;
    process?: string | null | undefined;
    roastLevel?: "LIGHT" | "MEDIUM_LIGHT" | "MEDIUM" | "MEDIUM_DARK" | "DARK" | undefined;
    tastingNotesExpected?: string[] | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export type Bean = z.infer<typeof BeanSchema>;
export declare const BeanCreateSchema: z.ZodObject<{
    roasterId: z.ZodString;
    name: z.ZodString;
    originCountry: z.ZodOptional<z.ZodString>;
    originRegion: z.ZodOptional<z.ZodString>;
    varietal: z.ZodOptional<z.ZodString>;
    process: z.ZodOptional<z.ZodString>;
    roastLevel: z.ZodDefault<z.ZodEnum<["LIGHT", "MEDIUM_LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"]>>;
    tastingNotesExpected: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    roasterId: string;
    roastLevel: "LIGHT" | "MEDIUM_LIGHT" | "MEDIUM" | "MEDIUM_DARK" | "DARK";
    originCountry?: string | undefined;
    originRegion?: string | undefined;
    varietal?: string | undefined;
    process?: string | undefined;
    tastingNotesExpected?: string[] | undefined;
}, {
    name: string;
    roasterId: string;
    originCountry?: string | undefined;
    originRegion?: string | undefined;
    varietal?: string | undefined;
    process?: string | undefined;
    roastLevel?: "LIGHT" | "MEDIUM_LIGHT" | "MEDIUM" | "MEDIUM_DARK" | "DARK" | undefined;
    tastingNotesExpected?: string[] | undefined;
}>;
export type BeanCreate = z.infer<typeof BeanCreateSchema>;
export declare const BeanWithRoasterSchema: z.ZodObject<{
    id: z.ZodString;
    roasterId: z.ZodString;
    name: z.ZodString;
    originCountry: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    originRegion: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    varietal: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    process: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    roastLevel: z.ZodDefault<z.ZodEnum<["LIGHT", "MEDIUM_LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"]>>;
    tastingNotesExpected: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    roaster: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        website: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        logoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        country?: string | null | undefined;
        website?: string | null | undefined;
        logoUrl?: string | null | undefined;
        notes?: string | null | undefined;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        country?: string | null | undefined;
        website?: string | null | undefined;
        logoUrl?: string | null | undefined;
        notes?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    roasterId: string;
    roastLevel: "LIGHT" | "MEDIUM_LIGHT" | "MEDIUM" | "MEDIUM_DARK" | "DARK";
    roaster: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        country?: string | null | undefined;
        website?: string | null | undefined;
        logoUrl?: string | null | undefined;
        notes?: string | null | undefined;
    };
    originCountry?: string | null | undefined;
    originRegion?: string | null | undefined;
    varietal?: string | null | undefined;
    process?: string | null | undefined;
    tastingNotesExpected?: string[] | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    roasterId: string;
    roaster: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        country?: string | null | undefined;
        website?: string | null | undefined;
        logoUrl?: string | null | undefined;
        notes?: string | null | undefined;
    };
    originCountry?: string | null | undefined;
    originRegion?: string | null | undefined;
    varietal?: string | null | undefined;
    process?: string | null | undefined;
    roastLevel?: "LIGHT" | "MEDIUM_LIGHT" | "MEDIUM" | "MEDIUM_DARK" | "DARK" | undefined;
    tastingNotesExpected?: string[] | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export type BeanWithRoaster = z.infer<typeof BeanWithRoasterSchema>;
export declare const BagStatusSchema: z.ZodEnum<["UNOPENED", "OPEN", "FINISHED"]>;
export declare const BagSchema: z.ZodObject<{
    id: z.ZodString;
    beanId: z.ZodString;
    roastDate: z.ZodDate;
    openedDate: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    bagSizeGrams: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    status: z.ZodDefault<z.ZodEnum<["UNOPENED", "OPEN", "FINISHED"]>>;
    isAvailable: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: "UNOPENED" | "OPEN" | "FINISHED";
    beanId: string;
    roastDate: Date;
    isAvailable: boolean;
    notes?: string | null | undefined;
    openedDate?: Date | null | undefined;
    bagSizeGrams?: number | null | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    beanId: string;
    roastDate: Date;
    status?: "UNOPENED" | "OPEN" | "FINISHED" | undefined;
    notes?: string | null | undefined;
    openedDate?: Date | null | undefined;
    bagSizeGrams?: number | null | undefined;
    isAvailable?: boolean | undefined;
}>;
export type Bag = z.infer<typeof BagSchema>;
export declare const BagCreateSchema: z.ZodObject<{
    beanId: z.ZodString;
    roastDate: z.ZodDate;
    openedDate: z.ZodOptional<z.ZodDate>;
    bagSizeGrams: z.ZodOptional<z.ZodNumber>;
    status: z.ZodDefault<z.ZodEnum<["UNOPENED", "OPEN", "FINISHED"]>>;
    isAvailable: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "UNOPENED" | "OPEN" | "FINISHED";
    beanId: string;
    roastDate: Date;
    isAvailable: boolean;
    notes?: string | undefined;
    openedDate?: Date | undefined;
    bagSizeGrams?: number | undefined;
}, {
    beanId: string;
    roastDate: Date;
    status?: "UNOPENED" | "OPEN" | "FINISHED" | undefined;
    notes?: string | undefined;
    openedDate?: Date | undefined;
    bagSizeGrams?: number | undefined;
    isAvailable?: boolean | undefined;
}>;
export type BagCreate = z.infer<typeof BagCreateSchema>;
export declare const BagUpdateSchema: z.ZodObject<Omit<{
    beanId: z.ZodOptional<z.ZodString>;
    roastDate: z.ZodOptional<z.ZodDate>;
    openedDate: z.ZodOptional<z.ZodOptional<z.ZodDate>>;
    bagSizeGrams: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["UNOPENED", "OPEN", "FINISHED"]>>>;
    isAvailable: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "beanId">, "strip", z.ZodTypeAny, {
    status?: "UNOPENED" | "OPEN" | "FINISHED" | undefined;
    notes?: string | undefined;
    roastDate?: Date | undefined;
    openedDate?: Date | undefined;
    bagSizeGrams?: number | undefined;
    isAvailable?: boolean | undefined;
}, {
    status?: "UNOPENED" | "OPEN" | "FINISHED" | undefined;
    notes?: string | undefined;
    roastDate?: Date | undefined;
    openedDate?: Date | undefined;
    bagSizeGrams?: number | undefined;
    isAvailable?: boolean | undefined;
}>;
export type BagUpdate = z.infer<typeof BagUpdateSchema>;
export declare const MethodSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    displayName: z.ZodString;
    scalingRules: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    defaultParams: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    steps: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    displayName: string;
    isActive: boolean;
    scalingRules?: Record<string, unknown> | null | undefined;
    defaultParams?: Record<string, unknown> | null | undefined;
    steps?: Record<string, unknown>[] | null | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    displayName: string;
    scalingRules?: Record<string, unknown> | null | undefined;
    defaultParams?: Record<string, unknown> | null | undefined;
    steps?: Record<string, unknown>[] | null | undefined;
    isActive?: boolean | undefined;
}>;
export type Method = z.infer<typeof MethodSchema>;
export declare const DialStatusSchema: z.ZodEnum<["DIALING_IN", "STABLE"]>;
export declare const BagMethodTargetSchema: z.ZodObject<{
    id: z.ZodString;
    bagId: z.ZodString;
    methodId: z.ZodString;
    grinderTarget: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    recipeOverrides: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    dialStatus: z.ZodDefault<z.ZodEnum<["DIALING_IN", "STABLE"]>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    bagId: string;
    methodId: string;
    dialStatus: "DIALING_IN" | "STABLE";
    grinderTarget?: number | null | undefined;
    recipeOverrides?: Record<string, unknown> | null | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    bagId: string;
    methodId: string;
    grinderTarget?: number | null | undefined;
    recipeOverrides?: Record<string, unknown> | null | undefined;
    dialStatus?: "DIALING_IN" | "STABLE" | undefined;
}>;
export type BagMethodTarget = z.infer<typeof BagMethodTargetSchema>;
export declare const BagMethodTargetUpdateSchema: z.ZodObject<{
    grinderTarget: z.ZodOptional<z.ZodNumber>;
    recipeOverrides: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    dialStatus: z.ZodOptional<z.ZodEnum<["DIALING_IN", "STABLE"]>>;
}, "strip", z.ZodTypeAny, {
    grinderTarget?: number | undefined;
    recipeOverrides?: Record<string, unknown> | undefined;
    dialStatus?: "DIALING_IN" | "STABLE" | undefined;
}, {
    grinderTarget?: number | undefined;
    recipeOverrides?: Record<string, unknown> | undefined;
    dialStatus?: "DIALING_IN" | "STABLE" | undefined;
}>;
export type BagMethodTargetUpdate = z.infer<typeof BagMethodTargetUpdateSchema>;
export declare const RatingSlidersSchema: z.ZodObject<{
    balance: z.ZodNumber;
    sweetness: z.ZodNumber;
    clarity: z.ZodNumber;
    body: z.ZodNumber;
    finish: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    balance: number;
    sweetness: number;
    clarity: number;
    body: number;
    finish: number;
}, {
    balance: number;
    sweetness: number;
    clarity: number;
    body: number;
    finish: number;
}>;
export type RatingSliders = z.infer<typeof RatingSlidersSchema>;
export declare const BrewParametersSchema: z.ZodObject<{
    dose: z.ZodOptional<z.ZodNumber>;
    water: z.ZodOptional<z.ZodNumber>;
    ratio: z.ZodOptional<z.ZodNumber>;
    waterTemp: z.ZodOptional<z.ZodNumber>;
    grindSize: z.ZodOptional<z.ZodNumber>;
    bloomTime: z.ZodOptional<z.ZodNumber>;
    bloomRatio: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    dose?: number | undefined;
    water?: number | undefined;
    ratio?: number | undefined;
    waterTemp?: number | undefined;
    grindSize?: number | undefined;
    bloomTime?: number | undefined;
    bloomRatio?: number | undefined;
}, {
    dose?: number | undefined;
    water?: number | undefined;
    ratio?: number | undefined;
    waterTemp?: number | undefined;
    grindSize?: number | undefined;
    bloomTime?: number | undefined;
    bloomRatio?: number | undefined;
}>;
export type BrewParameters = z.infer<typeof BrewParametersSchema>;
export declare const BrewLogSchema: z.ZodObject<{
    id: z.ZodString;
    bagId: z.ZodString;
    methodId: z.ZodString;
    parameters: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        dose: z.ZodOptional<z.ZodNumber>;
        water: z.ZodOptional<z.ZodNumber>;
        ratio: z.ZodOptional<z.ZodNumber>;
        waterTemp: z.ZodOptional<z.ZodNumber>;
        grindSize: z.ZodOptional<z.ZodNumber>;
        bloomTime: z.ZodOptional<z.ZodNumber>;
        bloomRatio: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        dose?: number | undefined;
        water?: number | undefined;
        ratio?: number | undefined;
        waterTemp?: number | undefined;
        grindSize?: number | undefined;
        bloomTime?: number | undefined;
        bloomRatio?: number | undefined;
    }, {
        dose?: number | undefined;
        water?: number | undefined;
        ratio?: number | undefined;
        waterTemp?: number | undefined;
        grindSize?: number | undefined;
        bloomTime?: number | undefined;
        bloomRatio?: number | undefined;
    }>>>;
    ratingSliders: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        balance: z.ZodNumber;
        sweetness: z.ZodNumber;
        clarity: z.ZodNumber;
        body: z.ZodNumber;
        finish: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        balance: number;
        sweetness: number;
        clarity: number;
        body: number;
        finish: number;
    }, {
        balance: number;
        sweetness: number;
        clarity: number;
        body: number;
        finish: number;
    }>>>;
    drawdownTime: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    computedScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    tastingNotesActual: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    suggestionShown: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    suggestionAccepted: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    brewedAt: z.ZodDate;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    bagId: string;
    methodId: string;
    brewedAt: Date;
    notes?: string | null | undefined;
    parameters?: {
        dose?: number | undefined;
        water?: number | undefined;
        ratio?: number | undefined;
        waterTemp?: number | undefined;
        grindSize?: number | undefined;
        bloomTime?: number | undefined;
        bloomRatio?: number | undefined;
    } | null | undefined;
    ratingSliders?: {
        balance: number;
        sweetness: number;
        clarity: number;
        body: number;
        finish: number;
    } | null | undefined;
    drawdownTime?: number | null | undefined;
    computedScore?: number | null | undefined;
    tastingNotesActual?: string[] | null | undefined;
    suggestionShown?: Record<string, unknown> | null | undefined;
    suggestionAccepted?: boolean | null | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    bagId: string;
    methodId: string;
    brewedAt: Date;
    notes?: string | null | undefined;
    parameters?: {
        dose?: number | undefined;
        water?: number | undefined;
        ratio?: number | undefined;
        waterTemp?: number | undefined;
        grindSize?: number | undefined;
        bloomTime?: number | undefined;
        bloomRatio?: number | undefined;
    } | null | undefined;
    ratingSliders?: {
        balance: number;
        sweetness: number;
        clarity: number;
        body: number;
        finish: number;
    } | null | undefined;
    drawdownTime?: number | null | undefined;
    computedScore?: number | null | undefined;
    tastingNotesActual?: string[] | null | undefined;
    suggestionShown?: Record<string, unknown> | null | undefined;
    suggestionAccepted?: boolean | null | undefined;
}>;
export type BrewLog = z.infer<typeof BrewLogSchema>;
export declare const BrewLogCreateSchema: z.ZodObject<{
    bagId: z.ZodString;
    methodId: z.ZodString;
    parameters: z.ZodOptional<z.ZodObject<{
        dose: z.ZodOptional<z.ZodNumber>;
        water: z.ZodOptional<z.ZodNumber>;
        ratio: z.ZodOptional<z.ZodNumber>;
        waterTemp: z.ZodOptional<z.ZodNumber>;
        grindSize: z.ZodOptional<z.ZodNumber>;
        bloomTime: z.ZodOptional<z.ZodNumber>;
        bloomRatio: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        dose?: number | undefined;
        water?: number | undefined;
        ratio?: number | undefined;
        waterTemp?: number | undefined;
        grindSize?: number | undefined;
        bloomTime?: number | undefined;
        bloomRatio?: number | undefined;
    }, {
        dose?: number | undefined;
        water?: number | undefined;
        ratio?: number | undefined;
        waterTemp?: number | undefined;
        grindSize?: number | undefined;
        bloomTime?: number | undefined;
        bloomRatio?: number | undefined;
    }>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    bagId: string;
    methodId: string;
    notes?: string | undefined;
    parameters?: {
        dose?: number | undefined;
        water?: number | undefined;
        ratio?: number | undefined;
        waterTemp?: number | undefined;
        grindSize?: number | undefined;
        bloomTime?: number | undefined;
        bloomRatio?: number | undefined;
    } | undefined;
}, {
    bagId: string;
    methodId: string;
    notes?: string | undefined;
    parameters?: {
        dose?: number | undefined;
        water?: number | undefined;
        ratio?: number | undefined;
        waterTemp?: number | undefined;
        grindSize?: number | undefined;
        bloomTime?: number | undefined;
        bloomRatio?: number | undefined;
    } | undefined;
}>;
export type BrewLogCreate = z.infer<typeof BrewLogCreateSchema>;
export declare const BrewLogRatingSchema: z.ZodObject<{
    ratingSliders: z.ZodObject<{
        balance: z.ZodNumber;
        sweetness: z.ZodNumber;
        clarity: z.ZodNumber;
        body: z.ZodNumber;
        finish: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        balance: number;
        sweetness: number;
        clarity: number;
        body: number;
        finish: number;
    }, {
        balance: number;
        sweetness: number;
        clarity: number;
        body: number;
        finish: number;
    }>;
    drawdownTime: z.ZodOptional<z.ZodNumber>;
    tastingNotesActual: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ratingSliders: {
        balance: number;
        sweetness: number;
        clarity: number;
        body: number;
        finish: number;
    };
    notes?: string | undefined;
    drawdownTime?: number | undefined;
    tastingNotesActual?: string[] | undefined;
}, {
    ratingSliders: {
        balance: number;
        sweetness: number;
        clarity: number;
        body: number;
        finish: number;
    };
    notes?: string | undefined;
    drawdownTime?: number | undefined;
    tastingNotesActual?: string[] | undefined;
}>;
export type BrewLogRating = z.infer<typeof BrewLogRatingSchema>;
//# sourceMappingURL=schemas.d.ts.map