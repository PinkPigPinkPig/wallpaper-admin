import { defineConfig } from '@playwright/test';

// Local config — runs against localhost FE (npm run dev on port 3005)
// and localhost BE (docker compose up on port 3001)
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3005',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
