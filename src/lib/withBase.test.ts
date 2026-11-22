import { describe, expect, it } from 'vitest';
import { withBase } from './withBase';

describe('withBase', () => {
  it('prefixes a path with the base', () => {
    expect(withBase('/prijzen', '/stringatelier')).toBe(
      '/stringatelier/prijzen',
    );
  });

  it('handles a base with a trailing slash', () => {
    expect(withBase('prijzen', '/stringatelier/')).toBe(
      '/stringatelier/prijzen',
    );
  });

  it('returns the base root for an empty or root path', () => {
    expect(withBase('/', '/stringatelier')).toBe('/stringatelier/');
    expect(withBase('', '/')).toBe('/');
  });

  it('works when there is no base', () => {
    expect(withBase('/contact', '/')).toBe('/contact');
  });
});
