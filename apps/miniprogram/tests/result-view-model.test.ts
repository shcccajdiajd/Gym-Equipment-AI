import { describe, expect, it } from 'vitest';

import {
  buildDemoNavigationUrl,
  buildFallbackNavigationUrl,
  buildRecognitionFailureMessage,
  buildResultNavigationUrl
} from '../miniprogram/utils/api.ts';
import { buildUnsupportedState, buildVideoSearchCopy } from '../miniprogram/utils/result-view-model.ts';

describe('result view model', () => {
  it('builds a result page url from an API payload id', () => {
    expect(buildResultNavigationUrl('lat-pulldown')).toBe('/pages/result/index?id=lat-pulldown');
  });

  it('keeps low confidence state in the result page url', () => {
    expect(buildResultNavigationUrl('lat-pulldown', 'low_confidence')).toBe(
      '/pages/result/index?id=lat-pulldown&status=low_confidence'
    );
  });

  it('builds demo urls for recognized, low confidence, and unsupported states', () => {
    expect(buildDemoNavigationUrl('recognized')).toBe('/pages/result/index?id=lat-pulldown');
    expect(buildDemoNavigationUrl('low_confidence')).toBe(
      '/pages/result/index?id=lat-pulldown&status=low_confidence'
    );
    expect(buildDemoNavigationUrl('unsupported')).toBe('/pages/result/index?status=unsupported');
  });

  it('keeps unsupported candidate ids in the fallback url', () => {
    expect(buildFallbackNavigationUrl('unsupported', ['pec-deck-fly', 'seated-chest-press'])).toBe(
      '/pages/result/index?status=unsupported&alternatives=pec-deck-fly%2Cseated-chest-press'
    );
  });

  it('builds an unsupported fallback message', () => {
    expect(buildUnsupportedState([])).toEqual({
      title: '这类器械暂未收录',
      summary: '你可以先从已支持的固定器械里继续找，避免搜错教程。',
      suggestionTitle: '',
      actionLabel: '查看支持识别的器械'
    });
  });

  it('builds an unsupported state with candidate suggestions when available', () => {
    expect(buildUnsupportedState(['蝴蝶机夹胸', '坐姿推胸机'])).toEqual({
      title: '暂时没法完全确定这台器械',
      summary: '它更像下面这些已收录器械，你可以点一个最像的继续看教学。',
      suggestionTitle: '你看到的可能是',
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

  it('builds readable failure messages for timeout and generic errors', () => {
    expect(buildRecognitionFailureMessage({ status: 'timeout' })).toBe(
      '识别服务响应超时，请稍后重试或换一张更清晰的图片。'
    );
    expect(buildRecognitionFailureMessage({ status: 'error', message: '识别服务暂时不可用，请稍后重试。' })).toBe(
      '识别服务暂时不可用，请稍后重试。'
    );
  });
});
