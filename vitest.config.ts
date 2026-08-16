import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'lib/**/*.ts',
        'features/**/*.ts',
        'features/**/*.tsx',
        'components/**/*.ts',
        'components/**/*.tsx',
        'app/**/*.ts',
        'app/**/*.tsx',
      ],
      exclude: [
        'node_modules/',
        '.next/',
        'vitest.config.ts',
        'vitest.setup.ts',
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.config.*',
        '**/*.config.js',
        '**/*.config.mjs',
        '**/*.config.cjs',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname),
    },
  },
});