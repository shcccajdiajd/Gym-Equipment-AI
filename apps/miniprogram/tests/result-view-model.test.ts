import { describe, expect, it } from 'vitest';

import { buildDemoNavigationUrl, buildResultNavigationUrl } from '../miniprogram/utils/api.js';
import { buildUnsupportedState, buildVideoSearchCopy } from '../miniprogram/utils/result-view-model.js';

describe('result view model', () => {
  it('builds a result page url from an API payload id', () => {
    expect(buildResultNavigationUrl('lat-pulldown')).toBe('/pages/result/index?id=lat-pulldown');
  });

  it('builds demo urls for recognized, low confidence, and unsupported states', () => {
    expect(buildDemoNavigationUrl('recognized')).toBe('/pages/result/index?id=lat-pulldown');
    expect(buildDemoNavigationUrl('low_confidence')).toBe(
      '/pages/result/index?id=lat-pulldown&status=low_confidence'
    );
    expect(buildDemoNavigationUrl('unsupported')).toBe('/pages/result/index?status=unsupported');
  });

  it('builds an unsupported fallback message', () => {
    expect(buildUnsupportedState()).toEqual({
      title: '这类器械暂未收录',
      actionLabel: '查看支持识别的器械'
    });
  });

  it('formats a copy-friendly video search string', () => {
    expect(
      buildVideoSearchCopy({
        platform: 'Bilibili',
        title: '高位下拉新手教学',
        searchQuery: '高位下拉 正确使用 教学'
      })
    ).toBe('Bilibili｜高位下拉新手教学｜高位下拉 正确使用 教学');
  });
});
