export declare const API_URL: string;
export declare const API_ENDPOINTS: {
    readonly settings: "/api/settings";
    readonly grinder: "/api/grinder";
    readonly grinderApply: "/api/grinder/apply";
    readonly roasters: "/api/roasters";
    readonly roaster: (id: string) => string;
    readonly beans: "/api/beans";
    readonly bean: (id: string) => string;
    readonly beanBags: (id: string) => string;
    readonly bags: "/api/bags";
    readonly bag: (id: string) => string;
    readonly bagTarget: (bagId: string, methodId: string) => string;
    readonly availableBeans: "/api/available-beans";
    readonly methods: "/api/methods";
    readonly method: (id: string) => string;
    readonly brews: "/api/brews";
    readonly brew: (id: string) => string;
    readonly brewRating: (id: string) => string;
    readonly brewApplySuggestion: (id: string) => string;
    readonly analyticsMap: "/api/analytics/map";
    readonly analyticsCountry: (code: string) => string;
    readonly analyticsRegion: (code: string) => string;
    readonly onboarding: "/api/onboarding";
    readonly health: "/health";
};
//# sourceMappingURL=config.d.ts.map