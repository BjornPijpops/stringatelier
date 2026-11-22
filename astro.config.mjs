import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Project site on GitHub Pages: https://bjornpijpops.github.io/stringatelier/
// Remove `base` and update `site` when a custom domain is added.
export default defineConfig({
  site: 'https://bjornpijpops.github.io',
  base: '/stringatelier',
  vite: { plugins: [tailwindcss()] },
});
