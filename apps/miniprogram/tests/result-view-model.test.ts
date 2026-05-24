import { describe, expect, it } from 'vitest';

import { buildResultNavigationUrl } from '../miniprogram/utils/api.js';

describe('result navigation url', () => {
  it('builds a result page url from an API payload id', () => {
    expect(buildResultNavigationUrl('lat-pulldown')).toBe('/pages/result/index?id=lat-pulldown');
  });
});
