export type SearchPlatform = 'bilibili' | 'douyin' | 'xiaohongshu' | 'baidu';

export type SearchTarget = {
  id: SearchPlatform;
  label: string;
  url: string;
  fallbackText: string;
};

type PlatformStrategy = {
  label: string;
  buildUrl: (query: string) => string;
};

const strategies: Record<SearchPlatform, PlatformStrategy> = {
  bilibili: {
    label: 'B站',
    buildUrl: (query) => `https://search.bilibili.com/all?keyword=${encodeURIComponent(query)}`
  },
  douyin: {
    label: '抖音',
    buildUrl: (query) => `https://www.douyin.com/search/${encodeURIComponent(query)}?type=video`
  },
  xiaohongshu: {
    label: '小红书',
    buildUrl: (query) => `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(query)}`
  },
  baidu: {
    label: '百度',
    buildUrl: (query) => `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`
  }
};

export function buildSearchTargets(query: string): SearchTarget[] {
  return (Object.keys(strategies) as SearchPlatform[]).map((id) => ({
    id,
    label: strategies[id].label,
    url: strategies[id].buildUrl(query),
    fallbackText: '如果无法打开，请复制搜索词到 App 内搜索。'
  }));
}

export function isWeChatBrowser(userAgent = globalThis.navigator?.userAgent ?? '') {
  return /MicroMessenger/i.test(userAgent);
}
