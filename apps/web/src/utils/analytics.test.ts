import { describe, expect, it, vi } from 'vitest';
import { getEventEndpoint, getOrCreateVisitorId, trackEvent } from './analytics.js';

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    }
  };
}

describe('web analytics', () => {
  it('builds the events endpoint from either an api base or recognition endpoint', () => {
    expect(getEventEndpoint('')).toBe('/api/events');
    expect(getEventEndpoint('https://example.com')).toBe('https://example.com/api/events');
    expect(getEventEndpoint('https://example.com/api/recognitions')).toBe('https://example.com/api/events');
    expect(getEventEndpoint('https://example.com/api/events')).toBe('https://example.com/api/events');
  });

  it('creates and reuses an anonymous visitor id', () => {
    const storage = createMemoryStorage();

    const first = getOrCreateVisitorId(storage);
    const second = getOrCreateVisitorId(storage);

    expect(first).toMatch(/^visitor_/);
    expect(second).toBe(first);
  });

  it('posts anonymous funnel events to the backend', async () => {
    const storage = createMemoryStorage();
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ status: 'ok' }), { status: 202 }));

    await trackEvent('upload_start', {
      fetcher,
      storage,
      properties: {
        source: 'album'
      }
    });

    expect(fetcher).toHaveBeenCalledWith(
      '/api/events',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        }
      })
    );

    const calls = fetcher.mock.calls as unknown as Array<[string, RequestInit]>;
    const [, requestInit] = calls[0];
    const body = JSON.parse(requestInit.body as string);
    expect(body).toMatchObject({
      visitorId: expect.stringMatching(/^visitor_/),
      eventName: 'upload_start',
      properties: {
        source: 'album'
      }
    });
    expect(body.timestamp).toEqual(expect.any(String));
  });
});
