import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    testTimeout: 5000,
    hookTimeout: 30_000,
    globals: true,
    // Resolve .js extensions in imports (ESM compat with TypeScript sources)
    alias: {
      '^(\\.\\.?\\/.*)\\.js$': '$1',
    },
  },
});
