import { describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';

describe('health routes', () => {
  it('returns a lightweight readiness payload without exposing secrets', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'ok',
      service: 'gym-equipment-ai-api'
    });
    expect(JSON.stringify(response.json())).not.toContain('API_KEY');
  });

  it('also exposes health under /api for frontend proxy checks', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/health'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'ok'
    });
  });
});
