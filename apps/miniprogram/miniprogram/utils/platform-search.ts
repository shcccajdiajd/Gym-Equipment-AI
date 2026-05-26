export const BILIBILI_MINI_PROGRAM_APP_ID = 'wx7564fd5313d24844';

export function buildBilibiliMiniProgramSearchPath(query: string) {
  return `pages/search/search?keyword=${encodeURIComponent(query)}`;
}

export function buildBilibiliWebSearchUrl(query: string) {
  return `https://m.bilibili.com/search?keyword=${encodeURIComponent(query)}`;
}
