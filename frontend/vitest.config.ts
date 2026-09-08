import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    restoreMocks: true,
    // API route handlers and lib code log verbosely; keep test output readable
    silent: false,
  },
});
