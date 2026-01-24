import { API_URL, API_ENDPOINTS } from './config.js';
import type {
  ApiResult,
  AvailableBeansResponse,
  BeanProfile,
  BrewScreenData,
  RatingResponse,
  MapDataPoint,
  CountryData,
  OnboardingData,
} from '@kissa/shared';
import type {
  Settings,
  SettingsUpdate,
  GrinderState,
  GrinderApply,
  Roaster,
  RoasterCreate,
  Bean,
  BeanCreate,
  Bag,
  BagCreate,
  BagUpdate,
  BagMethodTargetUpdate,
  Method,
  BrewLog,
  BrewLogCreate,
  BrewLogRating,
} from '@kissa/shared';

// ============================================
// HTTP Client
// ============================================

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json() as Record<string, unknown>;

    if (!response.ok) {
      return {
        error: (data.error as string) || 'Unknown error',
        message: (data.message as string) || 'An error occurred',
        success: false,
      };
    }

    return { data: data as T, success: true };
  } catch (error) {
    return {
      error: 'NetworkError',
      message: error instanceof Error ? error.message : 'Network error',
      success: false,
    };
  }
}

// ============================================
// Settings & Grinder
// ============================================

export const settingsApi = {
  get: () => fetchApi<Settings>(API_ENDPOINTS.settings),
  update: (data: SettingsUpdate) =>
    fetchApi<Settings>(API_ENDPOINTS.settings, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export const grinderApi = {
  get: () => fetchApi<GrinderState>(API_ENDPOINTS.grinder),
  apply: (data: GrinderApply) =>
    fetchApi<GrinderState>(API_ENDPOINTS.grinderApply, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============================================
// Roasters
// ============================================

export const roastersApi = {
  list: () => fetchApi<Roaster[]>(API_ENDPOINTS.roasters),
  get: (id: string) => fetchApi<Roaster>(API_ENDPOINTS.roaster(id)),
  create: (data: RoasterCreate) =>
    fetchApi<Roaster>(API_ENDPOINTS.roasters, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<RoasterCreate>) =>
    fetchApi<Roaster>(API_ENDPOINTS.roaster(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(API_ENDPOINTS.roaster(id), { method: 'DELETE' }),
};

// ============================================
// Beans
// ============================================

export const beansApi = {
  list: () => fetchApi<Bean[]>(API_ENDPOINTS.beans),
  get: (id: string) => fetchApi<BeanProfile>(API_ENDPOINTS.bean(id)),
  create: (data: BeanCreate) =>
    fetchApi<Bean>(API_ENDPOINTS.beans, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<BeanCreate>) =>
    fetchApi<Bean>(API_ENDPOINTS.bean(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(API_ENDPOINTS.bean(id), { method: 'DELETE' }),
  addBag: (beanId: string, data: Omit<BagCreate, 'beanId'>) =>
    fetchApi<Bag>(API_ENDPOINTS.beanBags(beanId), {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============================================
// Bags
// ============================================

export const bagsApi = {
  list: () => fetchApi<Bag[]>(API_ENDPOINTS.bags),
  get: (id: string) => fetchApi<Bag>(API_ENDPOINTS.bag(id)),
  update: (id: string, data: BagUpdate) =>
    fetchApi<Bag>(API_ENDPOINTS.bag(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(API_ENDPOINTS.bag(id), { method: 'DELETE' }),
  updateTarget: (bagId: string, methodId: string, data: BagMethodTargetUpdate) =>
    fetchApi<void>(API_ENDPOINTS.bagTarget(bagId, methodId), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getAvailable: (methodId?: string) =>
    fetchApi<AvailableBeansResponse>(
      `${API_ENDPOINTS.availableBeans}${methodId ? `?methodId=${methodId}` : ''}`
    ),
};

// ============================================
// Methods
// ============================================

export const methodsApi = {
  list: () => fetchApi<Method[]>(API_ENDPOINTS.methods),
  get: (id: string) => fetchApi<Method>(API_ENDPOINTS.method(id)),
};

// ============================================
// Brews
// ============================================

export const brewsApi = {
  list: (bagId?: string) =>
    fetchApi<BrewLog[]>(
      `${API_ENDPOINTS.brews}${bagId ? `?bagId=${bagId}` : ''}`
    ),
  get: (id: string) => fetchApi<BrewLog>(API_ENDPOINTS.brew(id)),
  create: (data: BrewLogCreate) =>
    fetchApi<BrewLog>(API_ENDPOINTS.brews, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<BrewLogCreate>) =>
    fetchApi<BrewLog>(API_ENDPOINTS.brew(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  submitRating: (id: string, data: BrewLogRating) =>
    fetchApi<RatingResponse>(API_ENDPOINTS.brewRating(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  applySuggestion: (id: string, applyTo: 'bag' | 'next') =>
    fetchApi<void>(API_ENDPOINTS.brewApplySuggestion(id), {
      method: 'POST',
      body: JSON.stringify({ applyTo }),
    }),
  getBrewScreen: (bagId: string, methodId: string) =>
    fetchApi<BrewScreenData>(`${API_ENDPOINTS.brews}/screen?bagId=${bagId}&methodId=${methodId}`),
};

// ============================================
// Analytics
// ============================================

export const analyticsApi = {
  getMapData: () => fetchApi<MapDataPoint[]>(API_ENDPOINTS.analyticsMap),
  getCountry: (code: string) =>
    fetchApi<CountryData>(API_ENDPOINTS.analyticsCountry(code)),
};

// ============================================
// Onboarding
// ============================================

export const onboardingApi = {
  submit: (data: OnboardingData) =>
    fetchApi<{ success: boolean }>(API_ENDPOINTS.onboarding, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============================================
// Health Check
// ============================================

export const healthApi = {
  check: () => fetchApi<{ status: string }>(API_ENDPOINTS.health),
};
