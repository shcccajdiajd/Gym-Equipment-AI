import { afterEach, describe, expect, it } from 'vitest';

import {
  buildDemoNavigationUrl,
  buildFallbackNavigationUrl,
  buildMediaFlowFailureMessage,
  buildRecognitionDevFallbackPayload,
  buildRecognitionRequestUrls,
  buildRecognitionFailureMessage,
  buildResultNavigationUrl,
  compressImageForRecognition,
  normalizeRecognitionResponse,
  parseAlternativeIds,
  recognizeImagePathForEquipment
} from '../miniprogram/utils/api.ts';
import { buildUnsupportedState, buildVideoSearchCopy } from '../miniprogram/utils/result-view-model.ts';
import {
  BILIBILI_MINI_PROGRAM_APP_ID,
  buildBilibiliMiniProgramSearchPath,
  buildBilibiliWebSearchUrl
} from '../miniprogram/utils/platform-search.ts';

const testGlobal = globalThis as typeof globalThis & { getApp: typeof getApp; wx: typeof wx };
const originalGetApp = testGlobal.getApp;
const originalWx = testGlobal.wx;

afterEach(() => {
  testGlobal.getApp = originalGetApp;
  testGlobal.wx = originalWx;
});

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

  it('parses encoded alternative ids from the fallback url query', () => {
    expect(parseAlternativeIds('pec-deck-fly%2Cseated-chest-press%2Clat-pulldown')).toEqual([
      'pec-deck-fly',
      'seated-chest-press',
      'lat-pulldown'
    ]);
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

  it('builds Bilibili mini program and web search targets', () => {
    expect(BILIBILI_MINI_PROGRAM_APP_ID).toBe('wx7564fd5313d24844');
    expect(buildBilibiliMiniProgramSearchPath('蝴蝶机夹胸教学')).toBe(
      'pages/search/search?keyword=%E8%9D%B4%E8%9D%B6%E6%9C%BA%E5%A4%B9%E8%83%B8%E6%95%99%E5%AD%A6'
    );
    expect(buildBilibiliWebSearchUrl('蝴蝶机夹胸教学')).toBe(
      'https://m.bilibili.com/search?keyword=%E8%9D%B4%E8%9D%B6%E6%9C%BA%E5%A4%B9%E8%83%B8%E6%95%99%E5%AD%A6'
    );
  });

  it('builds recognition request urls from multiple local API candidates', () => {
    expect(buildRecognitionRequestUrls(['http://192.168.7.51:3001', 'http://127.0.0.1:3001'])).toEqual([
      'http://192.168.7.51:3001/api/recognitions',
      'http://127.0.0.1:3001/api/recognitions'
    ]);
  });

  it('falls back to the original image path when compression fails', async () => {
    testGlobal.wx = {
      ...originalWx,
      compressImage: (options: WechatMiniprogram.CompressImageOption) => {
        options.fail?.({ errMsg: 'compressImage:fail invalid image type' });
      }
    };

    await expect(compressImageForRecognition('/tmp/input.webp')).resolves.toBe('/tmp/input.webp');
  });

  it('builds readable media flow messages from WeChat callback errors', () => {
    expect(buildMediaFlowFailureMessage({ errMsg: 'request:fail timeout' }, '导入失败，请重试')).toBe(
      '识别请求超时，请确认 API 服务正在运行'
    );
    expect(buildMediaFlowFailureMessage({ errMsg: 'readFile:fail permission denied' }, '导入失败，请重试')).toBe(
      '图片读取失败，请换一张图片再试'
    );
    expect(buildMediaFlowFailureMessage({ errMsg: 'chooseMedia:fail cancel' }, '导入失败，请重试')).toBe('');
  });

  it('builds a development fallback payload when recognition transport fails', () => {
    expect(buildRecognitionDevFallbackPayload(true)).toEqual({
      status: 'unsupported',
      alternatives: ['pec-deck-fly', 'lat-pulldown', 'seated-row'],
      message: '开发联调模式：识别服务暂时连不上，先用候选结果跑通流程。'
    });
    expect(buildRecognitionDevFallbackPayload(false)).toBeUndefined();
  });

  it('uses the development fallback when selected image reading fails before API request', async () => {
    testGlobal.getApp = <T = IAppOption>() =>
      ({
      globalData: {
        apiBaseUrl: 'http://127.0.0.1:3001',
        enableRecognitionDevFallback: true
      }
      }) as T;
    testGlobal.wx = {
      ...originalWx,
      compressImage: (options: WechatMiniprogram.CompressImageOption) => {
        options.success?.({ tempFilePath: '/tmp/compressed.jpg' });
      },
      getFileSystemManager: () => ({
        readFile: (options) => {
          options.fail?.({ errMsg: 'readFile:fail permission denied' });
        }
      }),
      request: () => {
        throw new Error('request should not run when image reading fails');
      }
    };

    await expect(recognizeImagePathForEquipment('/tmp/input.jpg', 'album')).resolves.toEqual(
      buildRecognitionDevFallbackPayload(true)
    );
  });

  it('builds readable failure messages for timeout and generic errors', () => {
    expect(buildRecognitionFailureMessage({ status: 'timeout' })).toBe(
      '识别服务响应超时，请稍后重试或换一张更清晰的图片。'
    );
    expect(buildRecognitionFailureMessage({ status: 'error', message: '识别服务暂时不可用，请稍后重试。' })).toBe(
      '识别服务暂时不可用，请稍后重试。'
    );
  });

  it('normalizes HTTP 500 recognition responses into a toastable error payload', () => {
    expect(
      normalizeRecognitionResponse({
        statusCode: 500,
        data: {
          message: 'Internal Server Error'
        }
      })
    ).toEqual({
      status: 'error',
      message: 'Internal Server Error'
    });
  });
});
