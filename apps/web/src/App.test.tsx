import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from './App.js';

describe('home upload entry points', () => {
  it('renders separate camera and album upload controls', () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('拍照识别');
    expect(html).toContain('从相册上传');
    expect(html).toContain('我的训练记录');
    expect(html).toContain('aria-label="拍照识别器械"');
    expect(html).toContain('aria-label="从相册上传器械图片"');
    expect(html).toContain('capture="environment"');
    expect(html.indexOf('拍照识别')).toBeLessThan(html.indexOf('我的训练记录'));
  });
});
