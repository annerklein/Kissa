export declare const TASTING_NOTE_CATEGORIES: {
    readonly fruity: readonly ["cherry", "blueberry", "strawberry", "raspberry", "blackberry", "citrus", "lemon", "orange", "grapefruit", "apple", "pear", "grape", "tropical", "mango", "passionfruit", "papaya", "pineapple", "peach", "apricot", "plum"];
    readonly sweet: readonly ["chocolate", "dark chocolate", "milk chocolate", "cocoa", "caramel", "honey", "brown sugar", "maple", "molasses", "vanilla", "toffee", "butterscotch"];
    readonly nutty: readonly ["almond", "hazelnut", "walnut", "peanut", "pecan", "macadamia", "cashew"];
    readonly floral: readonly ["jasmine", "rose", "lavender", "bergamot", "hibiscus", "chamomile", "orange blossom"];
    readonly spicy: readonly ["cinnamon", "clove", "cardamom", "ginger", "pepper", "nutmeg", "allspice"];
    readonly earthy: readonly ["tobacco", "leather", "cedar", "oak", "mushroom", "forest floor", "moss"];
    readonly herbal: readonly ["tea-like", "green tea", "black tea", "mint", "basil", "sage"];
    readonly other: readonly ["wine", "winey", "bright", "clean", "complex", "balanced", "smooth", "crisp", "juicy"];
};
export type TastingNoteCategory = keyof typeof TASTING_NOTE_CATEGORIES;
export declare const ALL_TASTING_NOTES: ("cherry" | "blueberry" | "strawberry" | "raspberry" | "blackberry" | "citrus" | "lemon" | "orange" | "grapefruit" | "apple" | "pear" | "grape" | "tropical" | "mango" | "passionfruit" | "papaya" | "pineapple" | "peach" | "apricot" | "plum" | "chocolate" | "dark chocolate" | "milk chocolate" | "cocoa" | "caramel" | "honey" | "brown sugar" | "maple" | "molasses" | "vanilla" | "toffee" | "butterscotch" | "almond" | "hazelnut" | "walnut" | "peanut" | "pecan" | "macadamia" | "cashew" | "jasmine" | "rose" | "lavender" | "bergamot" | "hibiscus" | "chamomile" | "orange blossom" | "cinnamon" | "clove" | "cardamom" | "ginger" | "pepper" | "nutmeg" | "allspice" | "tobacco" | "leather" | "cedar" | "oak" | "mushroom" | "forest floor" | "moss" | "tea-like" | "green tea" | "black tea" | "mint" | "basil" | "sage" | "wine" | "winey" | "bright" | "clean" | "complex" | "balanced" | "smooth" | "crisp" | "juicy")[];
export declare function getNoteCategory(note: string): TastingNoteCategory | null;
export declare function searchTastingNotes(query: string): string[];
//# sourceMappingURL=tasting-notes.d.ts.map