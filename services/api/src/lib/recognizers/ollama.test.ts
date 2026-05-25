import { describe, expect, it, vi } from 'vitest';
import { createOllamaRecognizer } from './ollama.js';

describe('createOllamaRecognizer', () => {
  it('sends a structured vision request to Ollama and parses the JSON response', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        response: JSON.stringify({
          topMatchId: 'lat-pulldown',
          confidence: 0.84,
          alternatives: ['seated-row']
        })
      })
    }));

    vi.stubGlobal('fetch', fetchMock);

    const recognizer = createOllamaRecognizer({
      baseUrl: 'http://127.0.0.1:11434',
      model: 'qwen2.5vl:3b',
      timeoutMs: 30_000
    });

    const result = await recognizer.recognize({
      imageBase64: 'ZmFrZS1pbWFnZS1iYXNlNjQ=',
      source: 'album'
    });

    expect(result).toEqual({
      topMatchId: 'lat-pulldown',
      confidence: 0.84,
      alternatives: ['seated-row']
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('http://127.0.0.1:11434/api/generate');
    expect(request.method).toBe('POST');

    const body = JSON.parse(String(request.body)) as {
      model: string;
      prompt: string;
      images: string[];
      stream: boolean;
      options: { temperature: number };
      format: { type: string; properties: Record<string, unknown> };
    };

    expect(body.model).toBe('qwen2.5vl:3b');
    expect(body.images).toEqual(['ZmFrZS1pbWFnZS1iYXNlNjQ=']);
    expect(body.stream).toBe(false);
    expect(body.options.temperature).toBe(0);
    expect(body.prompt).toContain('Source: album');
    expect(body.prompt).toContain('lat-pulldown');
    expect(body.format.type).toBe('object');
    expect(body.format.properties.topMatchId).toBeDefined();
  });

  it('throws a readable error when Ollama returns a non-ok response', async () => {
    vi.stubGlobal('fetch', async () => ({
      ok: false,
      status: 503,
      text: async () => 'model not loaded'
    }));

    const recognizer = createOllamaRecognizer({
      baseUrl: 'http://127.0.0.1:11434',
      model: 'qwen2.5vl:3b',
      timeoutMs: 30_000
    });

    await expect(
      recognizer.recognize({
        imageBase64: 'ZmFrZS1pbWFnZS1iYXNlNjQ=',
        source: 'camera'
      })
    ).rejects.toThrow('Ollama request failed with status 503: model not loaded');
  });
});
