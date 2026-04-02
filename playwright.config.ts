import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'https://wallpaper-admin-five.vercel.app';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL,
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
