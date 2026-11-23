import { getViteConfig } from 'astro/config';

// getViteConfig lets vitest compile .astro files (needed for component render tests).
export default getViteConfig({
  test: { include: ['src/**/*.test.ts'] },
});
