// API configuration
export const API_URL = typeof __DEV__ !== 'undefined' && __DEV__
    ? 'http://localhost:3001'
    : (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
        (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
        'http://kissa.local:3001';
export const API_ENDPOINTS = {
    // Settings & Grinder
    settings: '/api/settings',
    grinder: '/api/grinder',
    grinderApply: '/api/grinder/apply',
    // Beans & Roasters
    roasters: '/api/roasters',
    roaster: (id) => `/api/roasters/${id}`,
    beans: '/api/beans',
    bean: (id) => `/api/beans/${id}`,
    beanBags: (id) => `/api/beans/${id}/bags`,
    // Bags
    bags: '/api/bags',
    bag: (id) => `/api/bags/${id}`,
    bagTarget: (bagId, methodId) => `/api/bags/${bagId}/targets/${methodId}`,
    availableBeans: '/api/available-beans',
    // Methods
    methods: '/api/methods',
    method: (id) => `/api/methods/${id}`,
    // Brews
    brews: '/api/brews',
    brew: (id) => `/api/brews/${id}`,
    brewRating: (id) => `/api/brews/${id}/rating`,
    brewApplySuggestion: (id) => `/api/brews/${id}/apply-suggestion`,
    // Analytics
    analyticsMap: '/api/analytics/map',
    analyticsCountry: (code) => `/api/analytics/country/${code}`,
    analyticsRegion: (code) => `/api/analytics/region/${code}`,
    // Onboarding
    onboarding: '/api/onboarding',
    // Health
    health: '/health',
};
//# sourceMappingURL=config.js.map