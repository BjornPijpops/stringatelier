import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default [
  { ignores: ['dist/', '.astro/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    // Node script that also evaluates code inside the browser page.
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { console: 'readonly', document: 'readonly' } },
  },
];
