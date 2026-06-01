import { Buffer } from 'node:buffer';
import { describe, expect, it, vi } from 'vitest';
import type { Recognizer } from '../lib/recognizers/types.js';
import { aliyunFcRecognition, handler } from './aliyunFcRecognition.js';

const successRecognizer: Recognizer = {
  async recognize() {
    return {
      topMatchId: 'pec-deck-fly',
      confidence: 0.93,
      alternatives: ['seated-chest-press', 'shoulder-press-machine']
    };
  }
};

describe('aliyunFcRecognition adapter', () => {
  it('answers CORS preflight without invoking recognition', async () => {
    const response = await aliyunFcRecognition({
      requestContext: {
        http: {
          method: 'OPTIONS'
        }
      },
      body: ''
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-methods']).toContain('POST');
  });

  it('rejects non-POST requests', async () => {
    const response = await aliyunFcRecognition({
      httpMethod: 'GET',
      body: ''
    });

    expect(response.statusCode).toBe(405);
    expect(JSON.parse(response.body)).toMatchObject({
      status: 'error',
      errorCode: 'METHOD_NOT_ALLOWED'
    });
  });

  it('returns a compact recognition payload without base64 image data', async () => {
    const imageBase64 = Buffer.from('fixture-image').toString('base64');
    const response = await aliyunFcRecognition(
      {
        httpMethod: 'POST',
        body: JSON.stringify({
          imageBase64,
          source: 'album'
        })
      },
      {
        recognizer: successRecognizer
      }
    );

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      status: 'recognized',
      equipmentId: 'pec-deck-fly',
      confidence: 0.93,
      candidates: ['seated-chest-press', 'shoulder-press-machine']
    });
    expect(response.body).not.toContain(imageBase64);
  });

  it('parses Buffer request bodies from HTTP handlers', async () => {
    const imageBase64 = Buffer.from('fixture-image').toString('base64');
    const response = await aliyunFcRecognition(
      {
        method: 'POST',
        body: Buffer.from(JSON.stringify({
          imageBase64,
          source: 'album'
        }))
      },
      {
        recognizer: successRecognizer
      }
    );

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      status: 'recognized',
      equipmentId: 'pec-deck-fly'
    });
  });

  it('returns IMAGE_REQUIRED for empty image payloads', async () => {
    const response = await aliyunFcRecognition(
      {
        httpMethod: 'POST',
        body: JSON.stringify({
          imageBase64: '',
          source: 'album'
        })
      },
      {
        recognizer: successRecognizer
      }
    );

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toMatchObject({
      status: 'error',
      errorCode: 'IMAGE_REQUIRED'
    });
  });

  it('exposes an Aliyun FC HTTP handler wrapper', async () => {
    const setStatusCode = vi.fn();
    const setHeader = vi.fn();
    const send = vi.fn();

    await handler(
      {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: '',
          source: 'album'
        })
      },
      {
        setStatusCode,
        setHeader,
        send
      }
    );

    expect(setStatusCode).toHaveBeenCalledWith(400);
    expect(setHeader).toHaveBeenCalledWith('content-type', 'application/json; charset=utf-8');
    expect(JSON.parse(send.mock.calls[0][0])).toMatchObject({
      status: 'error',
      errorCode: 'IMAGE_REQUIRED'
    });
  });

  it('falls back to returned proxy responses when FC does not pass response helpers', async () => {
    const result = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({
        imageBase64: '',
        source: 'album'
      })
    });

    expect(result).toMatchObject({
      statusCode: 400,
      headers: expect.objectContaining({
        'content-type': 'application/json; charset=utf-8'
      })
    });
    expect(JSON.parse(result?.body ?? '')).toMatchObject({
      status: 'error',
      errorCode: 'IMAGE_REQUIRED'
    });
  });

  it('infers POST when Aliyun omits the method but passes a body', async () => {
    const result = await handler({
      body: JSON.stringify({
        imageBase64: '',
        source: 'album'
      })
    });

    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? '')).toMatchObject({
      status: 'error',
      errorCode: 'IMAGE_REQUIRED'
    });
  });
});
