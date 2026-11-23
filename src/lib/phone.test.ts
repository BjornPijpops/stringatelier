import { describe, expect, it } from 'vitest';
import { formatBelgianPhone, toTelHref, toWhatsAppHref } from './phone';

describe('formatBelgianPhone', () => {
  it('groups a 10-digit mobile number', () => {
    expect(formatBelgianPhone('0477191385')).toBe('0477 19 13 85');
  });

  it('ignores existing separators', () => {
    expect(formatBelgianPhone('0470 63 02 88')).toBe('0470 63 02 88');
  });

  it('returns digits unchanged when the length is unexpected', () => {
    expect(formatBelgianPhone('123')).toBe('123');
  });
});

describe('toTelHref', () => {
  it('converts a local number to international format', () => {
    expect(toTelHref('0477191385')).toBe('tel:+32477191385');
  });

  it('strips spaces', () => {
    expect(toTelHref('0470 63 02 88')).toBe('tel:+32470630288');
  });
});

describe('toWhatsAppHref', () => {
  it('builds a wa.me link with the international number', () => {
    expect(toWhatsAppHref('0477191385')).toBe('https://wa.me/32477191385');
  });

  it('strips spaces', () => {
    expect(toWhatsAppHref('0470 63 02 88')).toBe('https://wa.me/32470630288');
  });
});
