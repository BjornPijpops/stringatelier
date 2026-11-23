import { describe, expect, it } from 'vitest';
import { formatMoney, formatWholeEuros } from './formatMoney';

// Intl uses a non-breaking space; normalise it so the test reads naturally.
const normalise = (value: string) => value.replace(/\s/g, ' ');

describe('formatMoney', () => {
  it('formats whole euros with two decimals', () => {
    expect(normalise(formatMoney(1200))).toBe('€ 12,00');
  });

  it('formats cents with a decimal comma', () => {
    expect(normalise(formatMoney(450))).toBe('€ 4,50');
  });

  it('formats zero', () => {
    expect(normalise(formatMoney(0))).toBe('€ 0,00');
  });
});

describe('formatWholeEuros', () => {
  it('formats whole euros without decimals', () => {
    expect(normalise(formatWholeEuros(1200))).toBe('€ 12');
  });
});
