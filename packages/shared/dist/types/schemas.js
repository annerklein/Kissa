import { z } from 'zod';
// ============================================
// SETTINGS & GRINDER STATE
// ============================================
export const SettingsSchema = z.object({
    id: z.string().uuid(),
    defaultServings: z.number().int().min(1).max(10).default(2),
    gramsPerServing: z.number().int().min(5).max(30).default(15),
    displayPreferences: z.string().nullable().optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export const SettingsUpdateSchema = SettingsSchema.partial().omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const GrinderStateSchema = z.object({
    id: z.string().uuid(),
    grinderModel: z.string().default('Comandante C40'),
    currentSetting: z.number().min(0).max(50).default(20),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export const GrinderApplySchema = z.object({
    newSetting: z.number().min(0).max(50),
});
// ============================================
// ROASTER
// ============================================
export const RoasterSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    country: z.string().nullable().optional(),
    website: z.string().url().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export const RoasterCreateSchema = RoasterSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// ============================================
// BEAN
// ============================================
export const RoastLevelSchema = z.enum([
    'LIGHT',
    'MEDIUM_LIGHT',
    'MEDIUM',
    'MEDIUM_DARK',
    'DARK',
]);
export const BeanSchema = z.object({
    id: z.string().uuid(),
    roasterId: z.string().uuid(),
    name: z.string().min(1).max(100),
    originCountry: z.string().nullable().optional(),
    originRegion: z.string().nullable().optional(),
    varietal: z.string().nullable().optional(),
    process: z.string().nullable().optional(),
    roastLevel: RoastLevelSchema.default('MEDIUM'),
    tastingNotesExpected: z.array(z.string()).nullable().optional(),
    metadata: z.record(z.unknown()).nullable().optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export const BeanCreateSchema = z.object({
    roasterId: z.string().uuid(),
    name: z.string().min(1).max(100),
    originCountry: z.string().optional(),
    originRegion: z.string().optional(),
    varietal: z.string().optional(),
    process: z.string().optional(),
    roastLevel: RoastLevelSchema.default('MEDIUM'),
    tastingNotesExpected: z.array(z.string()).optional(),
});
export const BeanWithRoasterSchema = BeanSchema.extend({
    roaster: RoasterSchema,
});
// ============================================
// BAG
// ============================================
export const BagStatusSchema = z.enum(['UNOPENED', 'OPEN', 'FINISHED']);
export const BagSchema = z.object({
    id: z.string().uuid(),
    beanId: z.string().uuid(),
    roastDate: z.coerce.date(),
    openedDate: z.coerce.date().nullable().optional(),
    bagSizeGrams: z.number().int().positive().nullable().optional(),
    status: BagStatusSchema.default('UNOPENED'),
    isAvailable: z.boolean().default(true),
    notes: z.string().nullable().optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export const BagCreateSchema = z.object({
    beanId: z.string().uuid(),
    roastDate: z.coerce.date(),
    openedDate: z.coerce.date().optional(),
    bagSizeGrams: z.number().int().positive().optional(),
    status: BagStatusSchema.default('UNOPENED'),
    isAvailable: z.boolean().default(true),
    notes: z.string().optional(),
});
export const BagUpdateSchema = BagCreateSchema.partial().omit({ beanId: true });
// ============================================
// METHOD
// ============================================
export const MethodSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    displayName: z.string(),
    scalingRules: z.record(z.unknown()).nullable().optional(),
    defaultParams: z.record(z.unknown()).nullable().optional(),
    steps: z.array(z.record(z.unknown())).nullable().optional(),
    isActive: z.boolean().default(true),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
// ============================================
// BAG METHOD TARGET
// ============================================
export const DialStatusSchema = z.enum(['DIALING_IN', 'STABLE']);
export const BagMethodTargetSchema = z.object({
    id: z.string().uuid(),
    bagId: z.string().uuid(),
    methodId: z.string().uuid(),
    grinderTarget: z.number().nullable().optional(),
    recipeOverrides: z.record(z.unknown()).nullable().optional(),
    dialStatus: DialStatusSchema.default('DIALING_IN'),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export const BagMethodTargetUpdateSchema = z.object({
    grinderTarget: z.number().optional(),
    recipeOverrides: z.record(z.unknown()).optional(),
    dialStatus: DialStatusSchema.optional(),
});
// ============================================
// BREW LOG
// ============================================
export const RatingSlidersSchema = z.object({
    balance: z.number().min(1).max(10), // 1=sour, 5=balanced, 10=bitter
    sweetness: z.number().min(1).max(10),
    clarity: z.number().min(1).max(10),
    body: z.number().min(1).max(10),
    finish: z.number().min(1).max(10),
});
export const BrewParametersSchema = z.object({
    dose: z.number().positive().optional(),
    water: z.number().positive().optional(),
    ratio: z.number().positive().optional(),
    waterTemp: z.number().min(80).max(100).optional(),
    grindSize: z.number().positive().optional(),
    bloomTime: z.number().positive().optional(),
    bloomRatio: z.number().positive().optional(),
});
export const BrewLogSchema = z.object({
    id: z.string().uuid(),
    bagId: z.string().uuid(),
    methodId: z.string().uuid(),
    parameters: BrewParametersSchema.nullable().optional(),
    ratingSliders: RatingSlidersSchema.nullable().optional(),
    drawdownTime: z.number().positive().nullable().optional(),
    computedScore: z.number().min(0).max(10).nullable().optional(),
    tastingNotesActual: z.array(z.string()).nullable().optional(),
    notes: z.string().nullable().optional(),
    suggestionShown: z.record(z.unknown()).nullable().optional(),
    suggestionAccepted: z.boolean().nullable().optional(),
    brewedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export const BrewLogCreateSchema = z.object({
    bagId: z.string().uuid(),
    methodId: z.string().uuid(),
    parameters: BrewParametersSchema.optional(),
    notes: z.string().optional(),
});
export const BrewLogRatingSchema = z.object({
    ratingSliders: RatingSlidersSchema,
    drawdownTime: z.number().positive().optional(),
    tastingNotesActual: z.array(z.string()).optional(),
    notes: z.string().optional(),
});
//# sourceMappingURL=schemas.js.map