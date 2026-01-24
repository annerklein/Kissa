import { API_URL, API_ENDPOINTS } from './config.js';
// ============================================
// HTTP Client
// ============================================
async function fetchApi(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            return {
                error: data.error || 'Unknown error',
                message: data.message || 'An error occurred',
                success: false,
            };
        }
        return { data: data, success: true };
    }
    catch (error) {
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
    get: () => fetchApi(API_ENDPOINTS.settings),
    update: (data) => fetchApi(API_ENDPOINTS.settings, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
};
export const grinderApi = {
    get: () => fetchApi(API_ENDPOINTS.grinder),
    apply: (data) => fetchApi(API_ENDPOINTS.grinderApply, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};
// ============================================
// Roasters
// ============================================
export const roastersApi = {
    list: () => fetchApi(API_ENDPOINTS.roasters),
    get: (id) => fetchApi(API_ENDPOINTS.roaster(id)),
    create: (data) => fetchApi(API_ENDPOINTS.roasters, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id, data) => fetchApi(API_ENDPOINTS.roaster(id), {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    delete: (id) => fetchApi(API_ENDPOINTS.roaster(id), { method: 'DELETE' }),
};
// ============================================
// Beans
// ============================================
export const beansApi = {
    list: () => fetchApi(API_ENDPOINTS.beans),
    get: (id) => fetchApi(API_ENDPOINTS.bean(id)),
    create: (data) => fetchApi(API_ENDPOINTS.beans, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id, data) => fetchApi(API_ENDPOINTS.bean(id), {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    delete: (id) => fetchApi(API_ENDPOINTS.bean(id), { method: 'DELETE' }),
    addBag: (beanId, data) => fetchApi(API_ENDPOINTS.beanBags(beanId), {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};
// ============================================
// Bags
// ============================================
export const bagsApi = {
    list: () => fetchApi(API_ENDPOINTS.bags),
    get: (id) => fetchApi(API_ENDPOINTS.bag(id)),
    update: (id, data) => fetchApi(API_ENDPOINTS.bag(id), {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    delete: (id) => fetchApi(API_ENDPOINTS.bag(id), { method: 'DELETE' }),
    updateTarget: (bagId, methodId, data) => fetchApi(API_ENDPOINTS.bagTarget(bagId, methodId), {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    getAvailable: (methodId) => fetchApi(`${API_ENDPOINTS.availableBeans}${methodId ? `?methodId=${methodId}` : ''}`),
};
// ============================================
// Methods
// ============================================
export const methodsApi = {
    list: () => fetchApi(API_ENDPOINTS.methods),
    get: (id) => fetchApi(API_ENDPOINTS.method(id)),
};
// ============================================
// Brews
// ============================================
export const brewsApi = {
    list: (bagId) => fetchApi(`${API_ENDPOINTS.brews}${bagId ? `?bagId=${bagId}` : ''}`),
    get: (id) => fetchApi(API_ENDPOINTS.brew(id)),
    create: (data) => fetchApi(API_ENDPOINTS.brews, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id, data) => fetchApi(API_ENDPOINTS.brew(id), {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    submitRating: (id, data) => fetchApi(API_ENDPOINTS.brewRating(id), {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    applySuggestion: (id, applyTo) => fetchApi(API_ENDPOINTS.brewApplySuggestion(id), {
        method: 'POST',
        body: JSON.stringify({ applyTo }),
    }),
    getBrewScreen: (bagId, methodId) => fetchApi(`${API_ENDPOINTS.brews}/screen?bagId=${bagId}&methodId=${methodId}`),
};
// ============================================
// Analytics
// ============================================
export const analyticsApi = {
    getMapData: () => fetchApi(API_ENDPOINTS.analyticsMap),
    getCountry: (code) => fetchApi(API_ENDPOINTS.analyticsCountry(code)),
};
// ============================================
// Onboarding
// ============================================
export const onboardingApi = {
    submit: (data) => fetchApi(API_ENDPOINTS.onboarding, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};
// ============================================
// Health Check
// ============================================
export const healthApi = {
    check: () => fetchApi(API_ENDPOINTS.health),
};
//# sourceMappingURL=client.js.map