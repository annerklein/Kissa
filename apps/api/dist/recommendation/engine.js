import { interpretBalance, getExtractionAssessment } from '@kissa/shared';
// Target drawdown times for V60 (in seconds)
const V60_DRAWDOWN_TARGETS = {
    short: 150, // 2:30
    ideal: 180, // 3:00
    long: 210, // 3:30
};
/**
 * Generate brewing suggestions based on rating sliders and brew parameters
 * This is V1 - rule-based heuristics
 */
export function generateSuggestion(input) {
    const { method, sliders, drawdownTime, parameters } = input;
    const extraction = getExtractionAssessment(sliders);
    const balance = interpretBalance(sliders.balance);
    // V60-specific suggestions
    if (method === 'v60') {
        return generateV60Suggestion(sliders, balance, extraction, drawdownTime, parameters);
    }
    // Moka-specific suggestions
    return generateMokaSuggestion(sliders, balance, extraction, parameters);
}
function generateV60Suggestion(sliders, balance, extraction, drawdownTime, parameters) {
    // Check drawdown time
    const hasShortDrawdown = drawdownTime && drawdownTime < V60_DRAWDOWN_TARGETS.short;
    const hasLongDrawdown = drawdownTime && drawdownTime > V60_DRAWDOWN_TARGETS.long;
    // Under-extraction: sour, low sweetness
    if (extraction.extraction === 'under') {
        if (hasShortDrawdown) {
            return {
                primary: {
                    variable: 'grind',
                    action: 'Grind 1-2 clicks finer',
                    rationale: 'Short drawdown with sour notes suggests under-extraction. Finer grind will slow flow and increase extraction.',
                },
                secondary: {
                    variable: 'temperature',
                    action: 'Increase water temp by 1-2°C',
                    rationale: 'Higher temperature can help extract more sweetness.',
                },
            };
        }
        // Normal drawdown but still sour
        return {
            primary: {
                variable: 'temperature',
                action: `Increase water temp to ${(parameters.waterTemp || 94) + 2}°C`,
                rationale: 'Higher temperature extracts more sugars and reduces sourness.',
            },
            secondary: {
                variable: 'grind',
                action: 'Try 1 click finer',
                rationale: 'Finer grind increases contact time and extraction.',
            },
        };
    }
    // Over-extraction: bitter, astringent
    if (extraction.extraction === 'over') {
        if (hasLongDrawdown) {
            return {
                primary: {
                    variable: 'grind',
                    action: 'Grind 1-2 clicks coarser',
                    rationale: 'Long drawdown with bitter notes suggests over-extraction. Coarser grind will speed flow.',
                },
                secondary: {
                    variable: 'agitation',
                    action: 'Reduce agitation/stirring',
                    rationale: 'Less agitation reduces extraction of bitter compounds.',
                },
            };
        }
        return {
            primary: {
                variable: 'temperature',
                action: `Decrease water temp to ${(parameters.waterTemp || 96) - 2}°C`,
                rationale: 'Lower temperature reduces extraction of bitter compounds.',
            },
            secondary: {
                variable: 'grind',
                action: 'Try 1 click coarser',
                rationale: 'Coarser grind reduces surface area and extraction.',
            },
        };
    }
    // Good extraction but low clarity
    if (sliders.clarity < 5) {
        return {
            primary: {
                variable: 'grind',
                action: 'Grind 1 click coarser',
                rationale: 'Slightly coarser grind can improve cup clarity.',
            },
        };
    }
    // Good extraction but low body
    if (sliders.body < 5) {
        return {
            primary: {
                variable: 'ratio',
                action: 'Try a tighter ratio (15:1 instead of 16:1)',
                rationale: 'Less water relative to coffee increases body.',
            },
        };
    }
    // Everything is good!
    return {
        primary: {
            variable: 'none',
            action: 'Keep current settings',
            rationale: 'Great extraction! Your current parameters are working well.',
        },
    };
}
function generateMokaSuggestion(sliders, balance, extraction, parameters) {
    // Under-extraction in Moka is less common but can happen
    if (extraction.extraction === 'under') {
        return {
            primary: {
                variable: 'grind',
                action: 'Grind 1-2 clicks finer',
                rationale: 'Finer grind will increase extraction and reduce sourness.',
            },
            secondary: {
                variable: 'heat',
                action: 'Ensure using pre-heated water in bottom chamber',
                rationale: 'Pre-heated water reduces time on heat and prevents channeling.',
            },
        };
    }
    // Over-extraction: very common in Moka
    if (extraction.extraction === 'over') {
        return {
            primary: {
                variable: 'heat',
                action: 'Remove from heat earlier (when first sputtering)',
                rationale: 'Stopping earlier prevents over-extraction from the last drops.',
            },
            secondary: {
                variable: 'cooling',
                action: 'Run cold water on base immediately after removal',
                rationale: 'Rapid cooling stops extraction and prevents bitter notes.',
            },
        };
    }
    // Bitter but not over-extracted (strong/intense)
    if (balance === 'bitter' && sliders.finish < 6) {
        return {
            primary: {
                variable: 'grind',
                action: 'Grind 1 click coarser',
                rationale: 'Slightly coarser grind reduces intensity and bitterness.',
            },
        };
    }
    // Low body in Moka (unusual)
    if (sliders.body < 5) {
        return {
            primary: {
                variable: 'dose',
                action: 'Fill the basket completely without tamping',
                rationale: 'Full basket ensures proper extraction in Moka pot.',
            },
        };
    }
    // Good extraction
    return {
        primary: {
            variable: 'none',
            action: 'Keep current technique',
            rationale: 'Your Moka pot technique is working well!',
        },
    };
}
//# sourceMappingURL=engine.js.map