import { z } from 'zod';
import type { Bean, Bag, BagMethodTarget, BrewLog, Method, Roaster } from './schemas.js';

// ============================================
// API RESPONSE TYPES
// ============================================

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

// ============================================
// AVAILABLE BEANS (Morning Screen)
// ============================================

export interface AvailableBag extends Bag {
  bean: Bean & { roaster: Roaster };
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

// ============================================
// BEAN PROFILE
// ============================================

export interface BeanProfile extends Bean {
  roaster: Roaster;
  bags: (Bag & {
    targets: BagMethodTarget[];
    brewLogs: BrewLog[];
  })[];
  tastingNotesComparison?: {
    expected: string[];
    actual: Record<string, number>; // note -> count
  };
}

// ============================================
// BREW SCREEN
// ============================================

export interface BrewScreenData {
  bag: Bag & { bean: Bean & { roaster: Roaster } };
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

// ============================================
// SUGGESTION
// ============================================

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

// ============================================
// ANALYTICS
// ============================================

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
  bean: Bean & { roaster: Roaster };
  brewCount: number;
  avgScore: number | null;
  bestScore: number;
}

// ============================================
// ONBOARDING
// ============================================

export const OnboardingDataSchema = z.object({
  settings: z.object({
    defaultServings: z.number().int().min(1).max(10),
    gramsPerServing: z.number().int().min(5).max(30),
  }),
  grinder: z.object({
    model: z.string(),
    currentSetting: z.number(),
  }),
  beans: z.array(
    z.object({
      roasterName: z.string(),
      name: z.string(),
      originCountry: z.string().optional(),
      originRegion: z.string().optional(),
      roastLevel: z.enum(['LIGHT', 'MEDIUM_LIGHT', 'MEDIUM', 'MEDIUM_DARK', 'DARK']).optional(),
      tastingNotesExpected: z.array(z.string()).optional(),
      bag: z.object({
        roastDate: z.coerce.date(),
        isAvailable: z.boolean().default(true),
      }),
    })
  ),
});

export type OnboardingData = z.infer<typeof OnboardingDataSchema>;
