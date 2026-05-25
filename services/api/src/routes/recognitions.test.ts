import { Buffer } from 'node:buffer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../app.js';
import { RecognitionProviderError } from '../lib/recognizers/types.js';
import type { Recognizer } from '../lib/recognizers/types.js';

function createRecognizer(result: Awaited<ReturnType<Recognizer['recognize']>>): Recognizer {
  return {
    async recognize() {
      return result;
    }
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete process.env.RECOGNIZER_PROVIDER;
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_MODEL;
  delete process.env.OLLAMA_BASE_URL;
  delete process.env.OLLAMA_MODEL;
});

describe('POST /api/recognitions', () => {
  it('uses the provided recognizer implementation instead of the default provider', async () => {
    const recognizer: Recognizer = {
      recognize: vi.fn(async () => ({
        topMatchId: 'leg-press',
        confidence: 0.93,
        alternatives: ['hack-squat-machine', 'leg-extension']
      }))
    };

    const imageBase64 = Buffer.from('legs-fixture').toString('base64');
    const app = buildApp({ recognizer });

    await app.inject({
      method: 'POST',
      url: '/api/recognitions',
      payload: {
        imageBase64,
        source: 'album'
      }
    });

    expect(recognizer.recognize).toHaveBeenCalledWith({
      imageBase64,
      source: 'album'
    });
  });

  it('throws when openai provider is configured without an api key', async () => {
    process.env.RECOGNIZER_PROVIDER = 'openai';
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;

    vi.resetModules();
    const { buildApp: buildAppWithEnv } = await import('../app.js');

    expect(() => buildAppWithEnv()).toThrow(
      'OPENAI_API_KEY is required when RECOGNIZER_PROVIDER=openai'
    );
  });

  it('uses the ollama provider when configured', async () => {
    process.env.RECOGNIZER_PROVIDER = 'ollama';
    process.env.OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
    process.env.OLLAMA_MODEL = 'qwen2.5vl:3b';

    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        response: JSON.stringify({
          topMatchId: 'lat-pulldown',
          confidence: 0.87,
          alternatives: ['seated-row']
        })
      })
    }));

    vi.stubGlobal('fetch', fetchMock);
    vi.resetModules();
    const { buildApp: buildAppWithEnv } = await import('../app.js');
    const app = buildAppWithEnv();

    const response = await app.inject({
      method: 'POST',
      url: '/api/recognitions',
      payload: {
        imageBase64: Buffer.from('back-fixture-image').toString('base64'),
        source: 'album'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'recognized',
      equipment: {
        id: 'lat-pulldown'
      }
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('returns a recognized equipment card payload', async () => {
    const app = buildApp({
      recognizer: createRecognizer({
        topMatchId: 'lat-pulldown',
        confidence: 0.91,
        alternatives: ['assisted-pull-up-dip', 'seated-row']
      })
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/recognitions',
      payload: {
        imageBase64: Buffer.from('fixture-image').toString('base64'),
        source: 'camera'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'recognized',
      equipment: {
        id: 'lat-pulldown',
        zhName: '高位下拉'
      },
      confidence: 0.91,
      alternatives: ['assisted-pull-up-dip', 'seated-row']
    });
  });

  it('returns 400 for an invalid request payload', async () => {
    const app = buildApp({
      recognizer: createRecognizer({
        topMatchId: 'lat-pulldown',
        confidence: 0.91,
        alternatives: []
      })
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/recognitions',
      payload: {
        imageBase64: 'too-short',
        source: 'camera'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      status: 'invalid_request'
    });
  });

  it('returns unsupported when no catalog match is recognized', async () => {
    const app = buildApp({
      recognizer: createRecognizer({
        topMatchId: null,
        confidence: 0.12,
        alternatives: []
      })
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/recognitions',
      payload: {
        imageBase64: Buffer.from('fixture-image').toString('base64'),
        source: 'album'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'unsupported'
    });
  });

  it('returns low confidence when a supported match is uncertain', async () => {
    const app = buildApp({
      recognizer: createRecognizer({
        topMatchId: 'lat-pulldown',
        confidence: 0.42,
        alternatives: ['seated-row']
      })
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/recognitions',
      payload: {
        imageBase64: Buffer.from('fixture-image').toString('base64'),
        source: 'camera'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'low_confidence',
      equipment: {
        id: 'lat-pulldown'
      },
      confidence: 0.42,
      alternatives: ['seated-row']
    });
  });

  it('keeps borderline matches in low confidence instead of auto-confirming them', async () => {
    const app = buildApp({
      recognizer: createRecognizer({
        topMatchId: 'seated-row',
        confidence: 0.8,
        alternatives: ['pec-deck-fly']
      })
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/recognitions',
      payload: {
        imageBase64: Buffer.from('fixture-image').toString('base64'),
        source: 'album'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'low_confidence',
      equipment: {
        id: 'seated-row'
      },
      confidence: 0.8,
      alternatives: ['pec-deck-fly']
    });
  });

  it('returns 500 when a recognizer result does not map to catalog content', async () => {
    const app = buildApp({
      recognizer: createRecognizer({
        topMatchId: 'not-in-catalog',
        confidence: 0.88,
        alternatives: []
      })
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/recognitions',
      payload: {
        imageBase64: Buffer.from('fixture-image').toString('base64'),
        source: 'camera'
      }
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toMatchObject({
      status: 'error'
    });
  });

  it('returns 504 when the recognizer times out', async () => {
    const app = buildApp({
      recognizer: {
        async recognize() {
          throw new RecognitionProviderError(
            'timeout',
            '识别服务响应超时，请稍后重试或换一张更清晰的图片。'
          );
        }
      }
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/recognitions',
      payload: {
        imageBase64: Buffer.from('fixture-image').toString('base64'),
        source: 'camera'
      }
    });

    expect(response.statusCode).toBe(504);
    expect(response.json()).toMatchObject({
      status: 'timeout'
    });
  });
});
