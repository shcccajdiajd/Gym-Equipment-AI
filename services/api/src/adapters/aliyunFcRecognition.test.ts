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

function aliyunHttpEvent(input: {
  method: string;
  body?: string;
  isBase64Encoded?: boolean;
}) {
  return Buffer.from(JSON.stringify({
    version: 'v1',
    rawPath: '/api/recognitions',
    headers: {
      'content-type': 'application/json'
    },
    queryParameters: {},
    body: input.body ?? '',
    isBase64Encoded: input.isBase64Encoded ?? false,
    requestContext: {
      http: {
        method: input.method,
        path: '/api/recognitions',
        protocol: 'HTTP/1.1'
      }
    }
  }));
}

describe('aliyunFcRecognition adapter', () => {
  it('answers CORS preflight from the real Aliyun HTTP event shape', async () => {
    const response = await handler(aliyunHttpEvent({
      method: 'OPTIONS'
    }));

    expect(response?.statusCode).toBe(204);
    expect(response?.headers['access-control-allow-methods']).toContain('POST');
  });

  it('rejects GET from the real Aliyun HTTP event shape', async () => {
    const response = await handler(aliyunHttpEvent({
      method: 'GET'
    }));

    expect(response?.statusCode).toBe(405);
    expect(JSON.parse(response?.body ?? '')).toMatchObject({
      status: 'error',
      errorCode: 'METHOD_NOT_ALLOWED'
    });
  });

  it('returns IMAGE_REQUIRED for empty POST bodies from the real Aliyun HTTP event shape', async () => {
    const response = await handler(aliyunHttpEvent({
      method: 'POST',
      body: JSON.stringify({
        imageBase64: '',
        source: 'album'
      })
    }));

    expect(response?.statusCode).toBe(400);
    expect(JSON.parse(response?.body ?? '')).toMatchObject({
      status: 'error',
      errorCode: 'IMAGE_REQUIRED'
    });
  });

  it('decodes base64-encoded POST bodies from Aliyun HTTP events', async () => {
    const response = await handler(aliyunHttpEvent({
      method: 'POST',
      body: Buffer.from(JSON.stringify({
        imageBase64: '',
        source: 'album'
      })).toString('base64'),
      isBase64Encoded: true
    }));

    expect(response?.statusCode).toBe(400);
    expect(JSON.parse(response?.body ?? '')).toMatchObject({
      status: 'error',
      errorCode: 'IMAGE_REQUIRED'
    });
  });

  it('treats an empty POST body as a missing image instead of crashing', async () => {
    const response = await handler(aliyunHttpEvent({
      method: 'POST',
      body: ''
    }));

    expect(response?.statusCode).toBe(400);
    expect(JSON.parse(response?.body ?? '')).toMatchObject({
      status: 'error',
      errorCode: 'IMAGE_REQUIRED'
    });
  });

  it('returns INVALID_REQUEST for malformed handler event JSON', async () => {
    const response = await handler(Buffer.from('{not-json'));

    expect(response?.statusCode).toBe(400);
    expect(JSON.parse(response?.body ?? '')).toMatchObject({
      status: 'invalid_request',
      errorCode: 'INVALID_REQUEST'
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

  it('supports response helper style handlers when available', async () => {
    const setStatusCode = vi.fn();
    const setHeader = vi.fn();
    const send = vi.fn();

    await handler(
      {
        httpMethod: 'POST',
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
});
