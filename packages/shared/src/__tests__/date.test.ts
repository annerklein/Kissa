import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatRoastDate,
  daysSinceRoast,
  getFreshnessIndicator,
  formatLastBrewed,
} from '../utils/date.js';

// ===========================================================================
// Helpers
// ===========================================================================
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function minutesAgo(n: number): Date {
  return new Date(Date.now() - n * 60 * 1000);
}

function hoursAgo(n: number): Date {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

// ===========================================================================
// formatRoastDate
// ===========================================================================
describe('formatRoastDate', () => {
  it('returns "Roasted today" for today\'s date', () => {
    expect(formatRoastDate(new Date())).toBe('Roasted today');
  });

  it('returns "Roasted yesterday" for yesterday', () => {
    expect(formatRoastDate(daysAgo(1))).toBe('Roasted yesterday');
  });

  it('returns "N days off roast" for 2-6 days ago', () => {
    expect(formatRoastDate(daysAgo(3))).toBe('3 days off roast');
    expect(formatRoastDate(daysAgo(6))).toBe('6 days off roast');
  });

  it('returns "1 week off roast" for 7-13 days ago', () => {
    expect(formatRoastDate(daysAgo(7))).toBe('1 week off roast');
    expect(formatRoastDate(daysAgo(10))).toBe('1 week off roast');
  });

  it('returns "2 weeks off roast" for 14-20 days ago', () => {
    expect(formatRoastDate(daysAgo(14))).toBe('2 weeks off roast');
    expect(formatRoastDate(daysAgo(18))).toBe('2 weeks off roast');
  });

  it('returns "3 weeks off roast" for 21-27 days ago', () => {
    expect(formatRoastDate(daysAgo(21))).toBe('3 weeks off roast');
    expect(formatRoastDate(daysAgo(25))).toBe('3 weeks off roast');
  });

  it('returns formatted date for 28+ days ago', () => {
    const result = formatRoastDate(daysAgo(60));
    // Should be a locale-formatted short date like "Dec 15"
    expect(result).toMatch(/\w{3}\s+\d{1,2}/);
  });
});

// ===========================================================================
// daysSinceRoast
// ===========================================================================
describe('daysSinceRoast', () => {
  it('returns 0 for today', () => {
    expect(daysSinceRoast(new Date())).toBe(0);
  });

  it('returns correct number of days', () => {
    expect(daysSinceRoast(daysAgo(5))).toBe(5);
    expect(daysSinceRoast(daysAgo(14))).toBe(14);
  });
});

// ===========================================================================
// getFreshnessIndicator
// ===========================================================================
describe('getFreshnessIndicator', () => {
  it('returns "resting" for 0-2 days', () => {
    expect(getFreshnessIndicator(new Date())).toBe('resting');
    expect(getFreshnessIndicator(daysAgo(2))).toBe('resting');
  });

  it('returns "peak" for 3-20 days', () => {
    expect(getFreshnessIndicator(daysAgo(3))).toBe('peak');
    expect(getFreshnessIndicator(daysAgo(10))).toBe('peak');
    expect(getFreshnessIndicator(daysAgo(20))).toBe('peak');
  });

  it('returns "fading" for 21-34 days', () => {
    expect(getFreshnessIndicator(daysAgo(21))).toBe('fading');
    expect(getFreshnessIndicator(daysAgo(30))).toBe('fading');
  });

  it('returns "stale" for 35+ days', () => {
    expect(getFreshnessIndicator(daysAgo(35))).toBe('stale');
    expect(getFreshnessIndicator(daysAgo(60))).toBe('stale');
  });
});

// ===========================================================================
// formatLastBrewed
// ===========================================================================
describe('formatLastBrewed', () => {
  it('returns "Just now" for < 1 minute ago', () => {
    expect(formatLastBrewed(new Date())).toBe('Just now');
  });

  it('returns "Nm ago" for minutes', () => {
    expect(formatLastBrewed(minutesAgo(5))).toBe('5m ago');
    expect(formatLastBrewed(minutesAgo(30))).toBe('30m ago');
  });

  it('returns "Nh ago" for hours', () => {
    expect(formatLastBrewed(hoursAgo(2))).toBe('2h ago');
    expect(formatLastBrewed(hoursAgo(12))).toBe('12h ago');
  });

  it('returns "Yesterday" for 1 day ago', () => {
    expect(formatLastBrewed(daysAgo(1))).toBe('Yesterday');
  });

  it('returns "N days ago" for 2-6 days', () => {
    expect(formatLastBrewed(daysAgo(3))).toBe('3 days ago');
    expect(formatLastBrewed(daysAgo(6))).toBe('6 days ago');
  });

  it('returns formatted date for 7+ days ago', () => {
    const result = formatLastBrewed(daysAgo(14));
    // Should be a locale-formatted short date
    expect(result).toMatch(/\w{3}\s+\d{1,2}/);
  });
});
