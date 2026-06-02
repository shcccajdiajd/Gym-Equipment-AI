import { describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';

describe('POST /api/events', () => {
  it('accepts anonymous funnel events without requiring login', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/events',
      payload: {
        visitorId: 'visitor_123',
        eventName: 'search_click',
        timestamp: '2026-06-02T08:00:00.000Z',
        properties: {
          platform: 'bilibili',
          equipmentId: 'pec-deck-fly'
        }
      }
    });

    expect(response.statusCode).toBe(202);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('rejects unknown event names', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/events',
      payload: {
        visitorId: 'visitor_123',
        eventName: 'phone_login',
        timestamp: '2026-06-02T08:00:00.000Z'
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      status: 'invalid_request',
      errorCode: 'INVALID_EVENT'
    });
  });
});
