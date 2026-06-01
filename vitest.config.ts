import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/shared', 'services/api', 'apps/miniprogram', 'apps/web'],
    exclude: ['**/.tmp-run/**', '**/.tmp-api-run/**']
  }
});
