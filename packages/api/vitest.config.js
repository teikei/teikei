import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 120000,
    globalSetup: './db/globalSetup.js',
    include: ['src/**/*.test.js']
  }
})
