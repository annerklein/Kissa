// Common coffee tasting notes vocabulary
export const TASTING_NOTE_CATEGORIES = {
    fruity: [
        'cherry',
        'blueberry',
        'strawberry',
        'raspberry',
        'blackberry',
        'citrus',
        'lemon',
        'orange',
        'grapefruit',
        'apple',
        'pear',
        'grape',
        'tropical',
        'mango',
        'passionfruit',
        'papaya',
        'pineapple',
        'peach',
        'apricot',
        'plum',
    ],
    sweet: [
        'chocolate',
        'dark chocolate',
        'milk chocolate',
        'cocoa',
        'caramel',
        'honey',
        'brown sugar',
        'maple',
        'molasses',
        'vanilla',
        'toffee',
        'butterscotch',
    ],
    nutty: ['almond', 'hazelnut', 'walnut', 'peanut', 'pecan', 'macadamia', 'cashew'],
    floral: ['jasmine', 'rose', 'lavender', 'bergamot', 'hibiscus', 'chamomile', 'orange blossom'],
    spicy: ['cinnamon', 'clove', 'cardamom', 'ginger', 'pepper', 'nutmeg', 'allspice'],
    earthy: ['tobacco', 'leather', 'cedar', 'oak', 'mushroom', 'forest floor', 'moss'],
    herbal: ['tea-like', 'green tea', 'black tea', 'mint', 'basil', 'sage'],
    other: ['wine', 'winey', 'bright', 'clean', 'complex', 'balanced', 'smooth', 'crisp', 'juicy'],
};
// Flatten all notes into a single array
export const ALL_TASTING_NOTES = Object.values(TASTING_NOTE_CATEGORIES).flat();
// Get category for a note
export function getNoteCategory(note) {
    for (const [category, notes] of Object.entries(TASTING_NOTE_CATEGORIES)) {
        if (notes.includes(note.toLowerCase())) {
            return category;
        }
    }
    return null;
}
// Search notes by partial match
export function searchTastingNotes(query) {
    const lowerQuery = query.toLowerCase();
    return ALL_TASTING_NOTES.filter((note) => note.includes(lowerQuery));
}
//# sourceMappingURL=tasting-notes.js.map