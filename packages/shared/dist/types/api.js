import { z } from 'zod';
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
    beans: z.array(z.object({
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
    })),
});
//# sourceMappingURL=api.js.map