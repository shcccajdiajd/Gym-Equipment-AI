import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/shared', 'services/api', 'apps/miniprogram'],
    exclude: ['**/.tmp-run/**', '**/.tmp-api-run/**']
  }
});
