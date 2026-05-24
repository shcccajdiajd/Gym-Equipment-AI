import { Buffer } from 'node:buffer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../app.js';
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
  delete process.env.RECOGNIZER_PROVIDER;
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_MODEL;
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
});
