import { describe, expect, it } from 'vitest';
import { normalizeRecognitionResponse, recognizeEquipmentImage } from './api.js';

describe('web recognition api', () => {
  it('normalizes recognized, low-confidence, unsupported, and error payloads', () => {
    expect(normalizeRecognitionResponse(200, { status: 'recognized', confidence: 0.93 })).toMatchObject({
      status: 'recognized',
      confidence: 0.93
    });
    expect(normalizeRecognitionResponse(200, { status: 'low_confidence', confidence: 0.61 })).toMatchObject({
      status: 'low_confidence',
      confidence: 0.61
    });
    expect(normalizeRecognitionResponse(200, { status: 'unsupported', alternatives: ['pec-deck-fly'] })).toEqual({
      status: 'unsupported',
      alternatives: ['pec-deck-fly']
    });
    expect(normalizeRecognitionResponse(500, { message: 'Internal Server Error' })).toEqual({
      status: 'error',
      message: 'Internal Server Error'
    });
  });

  it('calls the recognition endpoint and returns parsed success payloads', async () => {
    const fetcher = async () =>
      new Response(JSON.stringify({ status: 'unsupported', alternatives: ['pec-deck-fly'] }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });

    await expect(recognizeEquipmentImage('base64-image', 'album', { fetcher, timeoutMs: 10 })).resolves.toEqual({
      status: 'unsupported',
      alternatives: ['pec-deck-fly']
    });
  });

  it('returns an error payload when fetch fails', async () => {
    const fetcher = async () => {
      throw new Error('network down');
    };

    await expect(recognizeEquipmentImage('base64-image', 'album', { fetcher, timeoutMs: 10 })).resolves.toMatchObject({
      status: 'error'
    });
  });
});
