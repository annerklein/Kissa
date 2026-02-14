import { describe, it, expect } from 'vitest';
import {
  DEFAULT_METHODS,
  METHOD_ORDER,
  scaleV60Recipe,
  scaleMokaRecipe,
} from '../constants/methods.js';

// ===========================================================================
// DEFAULT_METHODS constants
// ===========================================================================
describe('DEFAULT_METHODS', () => {
  it('defines all four brewing methods', () => {
    expect(Object.keys(DEFAULT_METHODS)).toEqual(
      expect.arrayContaining(['v60', 'moka', 'espresso', 'french_press'])
    );
    expect(Object.keys(DEFAULT_METHODS)).toHaveLength(4);
  });

  it('v60 has correct scaling rules', () => {
    expect(DEFAULT_METHODS.v60.scalingRules).toEqual({
      scalesPours: true,
      scalesDose: true,
      scalesWater: true,
    });
  });

  it('moka does not scale water', () => {
    expect(DEFAULT_METHODS.moka.scalingRules.scalesWater).toBe(false);
    expect(DEFAULT_METHODS.moka.scalingRules.scalesPours).toBe(false);
    expect(DEFAULT_METHODS.moka.scalingRules.scalesDose).toBe(true);
  });

  it('espresso scales water and dose', () => {
    expect(DEFAULT_METHODS.espresso.scalingRules.scalesWater).toBe(true);
    expect(DEFAULT_METHODS.espresso.scalingRules.scalesDose).toBe(true);
  });

  it('french_press scales water and dose', () => {
    expect(DEFAULT_METHODS.french_press.scalingRules.scalesWater).toBe(true);
    expect(DEFAULT_METHODS.french_press.scalingRules.scalesDose).toBe(true);
  });

  it('every method has a displayName', () => {
    for (const method of Object.values(DEFAULT_METHODS)) {
      expect(method.displayName).toBeTruthy();
    }
  });

  it('every method has steps defined', () => {
    for (const method of Object.values(DEFAULT_METHODS)) {
      expect(method.steps.length).toBeGreaterThan(0);
      for (const step of method.steps) {
        expect(step.name).toBeTruthy();
      }
    }
  });

  it('v60 default params include ratio, waterTemp, grindSize', () => {
    const params = DEFAULT_METHODS.v60.defaultParams;
    expect(params.ratio).toBe(16);
    expect(params.waterTemp).toBe(96);
    expect(params.grindSize).toBe(20);
    expect(params.bloomRatio).toBe(2);
    expect(params.bloomTime).toBe(45);
  });
});

// ===========================================================================
// METHOD_ORDER
// ===========================================================================
describe('METHOD_ORDER', () => {
  it('defines the display order for all methods', () => {
    expect(METHOD_ORDER).toEqual(['v60', 'moka', 'espresso', 'french_press']);
  });

  it('matches the keys of DEFAULT_METHODS', () => {
    const keys = Object.keys(DEFAULT_METHODS);
    for (const method of METHOD_ORDER) {
      expect(keys).toContain(method);
    }
  });
});

// ===========================================================================
// scaleV60Recipe
// ===========================================================================
describe('scaleV60Recipe', () => {
  const baseRecipe = {
    dose: 15,
    ratio: 16,
    steps: [
      { name: 'Bloom', waterRatio: 2, duration: 45 },
      { name: 'First pour', waterRatio: 6, duration: 30 },
      { name: 'Second pour', waterRatio: 8, duration: 30 },
      { name: 'Drawdown', duration: 60 },
    ],
  };

  it('scales dose by the factor', () => {
    const result = scaleV60Recipe(baseRecipe, 2);
    expect(result.dose).toBe(30);
  });

  it('calculates water from dose * ratio', () => {
    const result = scaleV60Recipe(baseRecipe, 2);
    expect(result.water).toBe(30 * 16);
  });

  it('scales step water amounts proportionally', () => {
    const result = scaleV60Recipe(baseRecipe, 1);
    const water = 15 * 16; // 240

    // Bloom: waterRatio 2, so waterAmount = (2/16) * 240 = 30
    expect(result.steps[0].waterAmount).toBeCloseTo(30, 2);
    // First pour: waterRatio 6, so waterAmount = (6/16) * 240 = 90
    expect(result.steps[1].waterAmount).toBeCloseTo(90, 2);
    // Second pour: waterRatio 8, so waterAmount = (8/16) * 240 = 120
    expect(result.steps[2].waterAmount).toBeCloseTo(120, 2);
  });

  it('steps without waterRatio get undefined waterAmount', () => {
    const result = scaleV60Recipe(baseRecipe, 1);
    expect(result.steps[3].waterAmount).toBeUndefined();
  });

  it('preserves other step properties', () => {
    const result = scaleV60Recipe(baseRecipe, 1);
    expect(result.steps[0].name).toBe('Bloom');
    expect(result.steps[0].duration).toBe(45);
  });

  it('handles scale factor of 0', () => {
    const result = scaleV60Recipe(baseRecipe, 0);
    expect(result.dose).toBe(0);
    expect(result.water).toBe(0);
  });
});

// ===========================================================================
// scaleMokaRecipe
// ===========================================================================
describe('scaleMokaRecipe', () => {
  const baseRecipe = {
    dose: 15,
    steps: [
      { name: 'Prep', notes: 'Fill with hot water' },
      { name: 'Heat', notes: 'Medium-low heat' },
    ],
  };

  it('scales dose by the factor', () => {
    const result = scaleMokaRecipe(baseRecipe, 2);
    expect(result.dose).toBe(30);
  });

  it('does not modify steps', () => {
    const result = scaleMokaRecipe(baseRecipe, 2);
    expect(result.steps).toBe(baseRecipe.steps); // Same reference
    expect(result.steps).toHaveLength(2);
  });

  it('handles fractional scale factors', () => {
    const result = scaleMokaRecipe(baseRecipe, 1.5);
    expect(result.dose).toBeCloseTo(22.5, 5);
  });
});
