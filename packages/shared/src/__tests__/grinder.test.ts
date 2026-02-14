import { describe, it, expect } from 'vitest';
import {
  computeGrinderDelta,
  formatGrinderSetting,
  formatDeltaCompact,
} from '../utils/grinder.js';
import type { GrinderDelta } from '../utils/grinder.js';

// ===========================================================================
// computeGrinderDelta
// ===========================================================================
describe('computeGrinderDelta', () => {
  it('returns "none" when current equals target', () => {
    const delta = computeGrinderDelta(20, 20);
    expect(delta.direction).toBe('none');
    expect(delta.clicks).toBe(0);
    expect(delta.description).toBe('No change needed');
  });

  it('returns "none" for differences less than 0.5', () => {
    const delta = computeGrinderDelta(20, 20.3);
    expect(delta.direction).toBe('none');
    expect(delta.clicks).toBe(0);
  });

  it('returns "coarser" when target is higher', () => {
    const delta = computeGrinderDelta(20, 25);
    expect(delta.direction).toBe('coarser');
    expect(delta.clicks).toBe(5);
    expect(delta.description).toBe('Move 5 clicks coarser');
  });

  it('returns "finer" when target is lower', () => {
    const delta = computeGrinderDelta(25, 20);
    expect(delta.direction).toBe('finer');
    expect(delta.clicks).toBe(5);
    expect(delta.description).toBe('Move 5 clicks finer');
  });

  it('handles single click singular grammar', () => {
    const coarser = computeGrinderDelta(20, 21);
    expect(coarser.description).toBe('Move 1 click coarser');

    const finer = computeGrinderDelta(21, 20);
    expect(finer.description).toBe('Move 1 click finer');
  });

  it('rounds fractional differences', () => {
    const delta = computeGrinderDelta(20, 22.7);
    expect(delta.clicks).toBe(3); // Math.round(2.7)
    expect(delta.direction).toBe('coarser');
  });

  it('handles zero settings', () => {
    const delta = computeGrinderDelta(0, 5);
    expect(delta.direction).toBe('coarser');
    expect(delta.clicks).toBe(5);
  });
});

// ===========================================================================
// formatGrinderSetting
// ===========================================================================
describe('formatGrinderSetting', () => {
  it('formats integer settings with one decimal', () => {
    expect(formatGrinderSetting(20)).toBe('20.0');
  });

  it('formats fractional settings with one decimal', () => {
    expect(formatGrinderSetting(20.5)).toBe('20.5');
  });

  it('formats zero', () => {
    expect(formatGrinderSetting(0)).toBe('0.0');
  });

  it('rounds long decimals to one place', () => {
    expect(formatGrinderSetting(15.678)).toBe('15.7');
  });
});

// ===========================================================================
// formatDeltaCompact
// ===========================================================================
describe('formatDeltaCompact', () => {
  it('returns "0" for no change', () => {
    const delta: GrinderDelta = { direction: 'none', clicks: 0, description: '' };
    expect(formatDeltaCompact(delta)).toBe('0');
  });

  it('returns "+N" for coarser', () => {
    const delta: GrinderDelta = { direction: 'coarser', clicks: 3, description: '' };
    expect(formatDeltaCompact(delta)).toBe('+3');
  });

  it('returns "-N" for finer', () => {
    const delta: GrinderDelta = { direction: 'finer', clicks: 2, description: '' };
    expect(formatDeltaCompact(delta)).toBe('-2');
  });
});
