import type { ApiResult, AvailableBeansResponse, BeanProfile, BrewScreenData, RatingResponse, MapDataPoint, CountryData, OnboardingData } from '@kissa/shared';
import type { SettingsUpdate, GrinderApply, RoasterCreate, BeanCreate, BagCreate, BagUpdate, BagMethodTargetUpdate, BrewLogCreate, BrewLogRating } from '@kissa/shared';
export declare const settingsApi: {
    get: () => Promise<ApiResult<{
        id: string;
        defaultServings: number;
        gramsPerServing: number;
        createdAt: Date;
        updatedAt: Date;
        displayPreferences?: string | null | undefined;
    }>>;
    update: (data: SettingsUpdate) => Promise<ApiResult<{
        id: string;
        defaultServings: number;
        gramsPerServing: number;
        createdAt: Date;
        updatedAt: Date;
        displayPreferences?: string | null | undefined;
    }>>;
};
export declare const grinderApi: {
    get: () => Promise<ApiResult<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        grinderModel: string;
        currentSetting: number;
    }>>;
    apply: (data: GrinderApply) => Promise<ApiResult<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        grinderModel: string;
        currentSetting: number;
    }>>;
};
export declare const roastersApi: {
    list: () => Promise<ApiResult<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        country?: string | null | undefined;
        website?: string | null | undefined;
        notes?: string | null | undefined;
    }[]>>;
    get: (id: string) => Promise<ApiResult<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        country?: string | null | undefined;
        website?: string | null | undefined;
        notes?: string | null | undefined;
    }>>;
    create: (data: RoasterCreate) => Promise<ApiResult<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        country?: string | null | undefined;
        website?: string | null | undefined;
        notes?: string | null | undefined;
    }>>;
    update: (id: string, data: Partial<RoasterCreate>) => Promise<ApiResult<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        country?: string | null | undefined;
        website?: string | null | undefined;
        notes?: string | null | undefined;
    }>>;
    delete: (id: string) => Promise<ApiResult<void>>;
};
export declare const beansApi: {
    list: () => Promise<ApiResult<{
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
    }[]>>;
    get: (id: string) => Promise<ApiResult<BeanProfile>>;
    create: (data: BeanCreate) => Promise<ApiResult<{
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
    }>>;
    update: (id: string, data: Partial<BeanCreate>) => Promise<ApiResult<{
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
    }>>;
    delete: (id: string) => Promise<ApiResult<void>>;
    addBag: (beanId: string, data: Omit<BagCreate, "beanId">) => Promise<ApiResult<{
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
    }>>;
};
export declare const bagsApi: {
    list: () => Promise<ApiResult<{
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
    }[]>>;
    get: (id: string) => Promise<ApiResult<{
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
    }>>;
    update: (id: string, data: BagUpdate) => Promise<ApiResult<{
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
    }>>;
    delete: (id: string) => Promise<ApiResult<void>>;
    updateTarget: (bagId: string, methodId: string, data: BagMethodTargetUpdate) => Promise<ApiResult<void>>;
    getAvailable: (methodId?: string) => Promise<ApiResult<AvailableBeansResponse>>;
};
export declare const methodsApi: {
    list: () => Promise<ApiResult<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        displayName: string;
        isActive: boolean;
        scalingRules?: Record<string, unknown> | null | undefined;
        defaultParams?: Record<string, unknown> | null | undefined;
        steps?: Record<string, unknown>[] | null | undefined;
    }[]>>;
    get: (id: string) => Promise<ApiResult<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        displayName: string;
        isActive: boolean;
        scalingRules?: Record<string, unknown> | null | undefined;
        defaultParams?: Record<string, unknown> | null | undefined;
        steps?: Record<string, unknown>[] | null | undefined;
    }>>;
};
export declare const brewsApi: {
    list: (bagId?: string) => Promise<ApiResult<{
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
    }[]>>;
    get: (id: string) => Promise<ApiResult<{
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
    }>>;
    create: (data: BrewLogCreate) => Promise<ApiResult<{
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
    }>>;
    update: (id: string, data: Partial<BrewLogCreate>) => Promise<ApiResult<{
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
    }>>;
    submitRating: (id: string, data: BrewLogRating) => Promise<ApiResult<RatingResponse>>;
    applySuggestion: (id: string, applyTo: "bag" | "next") => Promise<ApiResult<void>>;
    getBrewScreen: (bagId: string, methodId: string) => Promise<ApiResult<BrewScreenData>>;
};
export declare const analyticsApi: {
    getMapData: () => Promise<ApiResult<MapDataPoint[]>>;
    getCountry: (code: string) => Promise<ApiResult<CountryData>>;
};
export declare const onboardingApi: {
    submit: (data: OnboardingData) => Promise<ApiResult<{
        success: boolean;
    }>>;
};
export declare const healthApi: {
    check: () => Promise<ApiResult<{
        status: string;
    }>>;
};
//# sourceMappingURL=client.d.ts.map