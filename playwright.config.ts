import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/visual',
  outputDir: 'test-results',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFileName}/{arg}{ext}',
  fullyParallel: true,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:61001',
    viewport: { width: 800, height: 600 },
  },
  webServer: {
    command: 'pnpm build:css && pnpm playground:build && node scripts/serve-ladle.mjs',
    url: 'http://localhost:61001',
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
})
