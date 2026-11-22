import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// `site` and `base` are set for GitHub Pages in feature/deploy-github-pages.
export default defineConfig({
  vite: { plugins: [tailwindcss()] },
});
