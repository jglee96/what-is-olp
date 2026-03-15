import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:5173',
    actionTimeout: 10_000,
    launchOptions: {
      // Enable WebGL in headless Chromium
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--ignore-gpu-blocklist',
        '--enable-webgl',
        '--use-angle=default',
      ],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start vite dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
