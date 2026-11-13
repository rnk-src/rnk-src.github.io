import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  webServer: {
    command: 'npx astro build && npx astro preview --port 4399 --ignore-lock',
    url: 'http://localhost:4399',
    reuseExistingServer: false,
  },
  use: { baseURL: 'http://localhost:4399' },
});
