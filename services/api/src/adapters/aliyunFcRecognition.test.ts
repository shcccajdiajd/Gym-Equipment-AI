import { Buffer } from 'node:buffer';
import { describe, expect, it, vi } from 'vitest';
import { handler } from './aliyunFcRecognition.js';

describe('temporary aliyun fc debug handler', () => {
  it('returns debug metadata without invoking a vision provider', async () => {
    const response = await handler(
      {
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          imageBase64: '',
          source: 'album'
        })
      },
      {
        requestId: 'debug-request'
      }
    );

    expect(response.statusCode).toBe(200);
    expect(response.headers).toMatchObject({
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'Content-Type,Authorization'
    });
    expect(JSON.parse(response.body)).toMatchObject({
      debug: true,
      eventType: 'object',
      isBuffer: false,
      eventKeys: ['httpMethod', 'headers', 'body'],
      contextKeys: ['requestId'],
      argumentsLength: 2,
      methodCandidates: {
        httpMethod: 'POST'
      }
    });
  });

  it('logs buffer previews for event-style payloads', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const response = await handler(Buffer.from(JSON.stringify({
      httpMethod: 'POST',
      body: '{}'
    })));

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      debug: true,
      eventType: 'object',
      isBuffer: true
    });
    expect(logSpy).toHaveBeenCalledWith(
      '[fc-debug] event buffer preview',
      expect.stringContaining('"httpMethod":"POST"')
    );

    logSpy.mockRestore();
  });

  it('returns an empty CORS response for OPTIONS when method is visible', async () => {
    const response = await handler({
      httpMethod: 'OPTIONS'
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe('');
  });
});
