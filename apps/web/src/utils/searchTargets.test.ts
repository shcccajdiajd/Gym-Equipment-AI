import { describe, expect, it } from 'vitest';
import { buildSearchTargets, isWeChatBrowser } from './searchTargets.js';

describe('searchTargets', () => {
  it('builds platform search urls from one query', () => {
    const targets = buildSearchTargets('蝴蝶机夹胸 教程');

    expect(targets.find((target) => target.id === 'bilibili')?.url).toBe(
      'https://search.bilibili.com/all?keyword=%E8%9D%B4%E8%9D%B6%E6%9C%BA%E5%A4%B9%E8%83%B8%20%E6%95%99%E7%A8%8B'
    );
    expect(targets.map((target) => target.id)).toEqual(['bilibili', 'douyin', 'xiaohongshu', 'baidu']);
    expect(targets.every((target) => target.fallbackText.includes('复制搜索词'))).toBe(true);
  });

  it('detects WeChat embedded browsers', () => {
    expect(isWeChatBrowser('Mozilla/5.0 MicroMessenger/8.0.49')).toBe(true);
    expect(isWeChatBrowser('Mobile Safari/605.1.15')).toBe(false);
  });
});
