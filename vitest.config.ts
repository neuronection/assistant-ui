import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    // Node 26 defines globalThis.localStorage (undefined without
    // --localstorage-file), which shadows jsdom's; keep the storage globals off.
    execArgv: ['--no-experimental-webstorage'],
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
