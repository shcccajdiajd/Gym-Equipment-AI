import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/shared',
  'services/api',
  'apps/miniprogram'
]);
