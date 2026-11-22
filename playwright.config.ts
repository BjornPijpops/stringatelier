import { defineConfig } from '@playwright/test';

const PORT = 4399;

// Runs against the production build served by `astro preview` (run `npm run build` first).
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PORT}/stringatelier/` },
  webServer: {
    command: `npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}/stringatelier/`,
    reuseExistingServer: !process.env.CI,
  },
});
