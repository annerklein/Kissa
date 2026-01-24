// API configuration

declare const __DEV__: boolean | undefined;

export const API_URL =
  typeof __DEV__ !== 'undefined' && __DEV__
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
  roaster: (id: string) => `/api/roasters/${id}`,
  beans: '/api/beans',
  bean: (id: string) => `/api/beans/${id}`,
  beanBags: (id: string) => `/api/beans/${id}/bags`,

  // Bags
  bags: '/api/bags',
  bag: (id: string) => `/api/bags/${id}`,
  bagTarget: (bagId: string, methodId: string) => `/api/bags/${bagId}/targets/${methodId}`,
  availableBeans: '/api/available-beans',

  // Methods
  methods: '/api/methods',
  method: (id: string) => `/api/methods/${id}`,

  // Brews
  brews: '/api/brews',
  brew: (id: string) => `/api/brews/${id}`,
  brewRating: (id: string) => `/api/brews/${id}/rating`,
  brewApplySuggestion: (id: string) => `/api/brews/${id}/apply-suggestion`,

  // Analytics
  analyticsMap: '/api/analytics/map',
  analyticsCountry: (code: string) => `/api/analytics/country/${code}`,
  analyticsRegion: (code: string) => `/api/analytics/region/${code}`,

  // Onboarding
  onboarding: '/api/onboarding',

  // Health
  health: '/health',
} as const;
