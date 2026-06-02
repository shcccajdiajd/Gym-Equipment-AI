import { Buffer } from 'node:buffer';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
  path?: string;
  body?: string;
  isBase64Encoded?: boolean;
}) {
  const path = input.path ?? '/api/recognitions';

  return Buffer.from(JSON.stringify({
    version: 'v1',
    rawPath: path,
    headers: {
      'content-type': 'application/json'
    },
    queryParameters: {},
    body: input.body ?? '',
    isBase64Encoded: input.isBase64Encoded ?? false,
    requestContext: {
      http: {
        method: input.method,
        path,
        protocol: 'HTTP/1.1'
      }
    }
  }));
}

function withStaticFixture<T>(callback: (staticRoot: string) => Promise<T>) {
  const staticRoot = mkdtempSync(join(tmpdir(), 'gym-equipment-fc-static-'));
  mkdirSync(join(staticRoot, 'assets'));
  writeFileSync(join(staticRoot, 'index.html'), '<!doctype html><div id="root">Gym Equipment AI</div>');
  writeFileSync(join(staticRoot, 'assets', 'app.js'), 'console.log("gym equipment ai");');

  const previous = process.env.ALIYUN_FC_STATIC_ROOT;
  process.env.ALIYUN_FC_STATIC_ROOT = staticRoot;

  return callback(staticRoot).finally(() => {
    if (previous === undefined) {
      delete process.env.ALIYUN_FC_STATIC_ROOT;
    } else {
      process.env.ALIYUN_FC_STATIC_ROOT = previous;
    }
  });
}

describe('aliyunFcRecognition adapter', () => {
  it('serves the web index from the FC handler root path', async () => {
    await withStaticFixture(async () => {
      const response = await handler(aliyunHttpEvent({
        method: 'GET',
        path: '/'
      }));

      expect(response?.statusCode).toBe(200);
      expect(response?.headers['content-type']).toContain('text/html');
      expect(response?.headers['content-disposition']).toBe('inline');
      expect(response?.body).toContain('Gym Equipment AI');
    });
  });

  it('serves web static assets from the FC handler', async () => {
    await withStaticFixture(async () => {
      const response = await handler(aliyunHttpEvent({
        method: 'GET',
        path: '/assets/app.js'
      }));

      expect(response?.statusCode).toBe(200);
      expect(response?.headers['content-type']).toContain('javascript');
      expect(response?.body).toContain('gym equipment ai');
    });
  });

  it('answers CORS preflight from the real Aliyun HTTP event shape', async () => {
    const response = await handler(aliyunHttpEvent({
      method: 'OPTIONS'
    }));

    expect(response?.statusCode).toBe(204);
    expect(response?.headers['content-type']).toContain('application/json');
    expect(response?.headers['access-control-allow-origin']).toBeUndefined();
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

  it('accepts anonymous analytics events from the FC handler', async () => {
    const response = await handler(aliyunHttpEvent({
      method: 'POST',
      path: '/api/events',
      body: JSON.stringify({
        visitorId: 'visitor_123',
        eventName: 'page_open',
        timestamp: '2026-06-02T08:00:00.000Z',
        properties: {
          inWeChat: false
        }
      })
    }));

    expect(response?.statusCode).toBe(202);
    expect(JSON.parse(response?.body ?? '')).toEqual({ status: 'ok' });
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
