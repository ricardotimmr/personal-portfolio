import { defineConfig, devices } from '@playwright/test'

const PREVIEW_PORT = 4173
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: PREVIEW_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'edge',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'msedge',
      },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${PREVIEW_PORT}`,
    url: PREVIEW_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
