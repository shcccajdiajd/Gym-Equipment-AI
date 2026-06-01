import { describe, expect, it } from 'vitest';
import { normalizeRecognitionResponse, recognizeEquipmentImage } from './api.js';

describe('web recognition api', () => {
  it('normalizes recognized, low-confidence, unsupported, and error payloads', () => {
    expect(normalizeRecognitionResponse(200, { status: 'recognized', equipmentId: 'pec-deck-fly', confidence: 0.93 })).toMatchObject({
      status: 'recognized',
      confidence: 0.93,
      equipment: {
        id: 'pec-deck-fly'
      }
    });
    expect(normalizeRecognitionResponse(200, {
      status: 'low_confidence',
      equipmentId: 'seated-row',
      confidence: 0.61,
      candidates: ['lat-pulldown']
    })).toMatchObject({
      status: 'low_confidence',
      confidence: 0.61,
      alternatives: ['lat-pulldown'],
      equipment: {
        id: 'seated-row'
      }
    });
    expect(normalizeRecognitionResponse(200, { status: 'unsupported', candidates: ['pec-deck-fly'] })).toMatchObject({
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
      new Response(JSON.stringify({ status: 'unsupported', candidates: ['pec-deck-fly'] }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });

    await expect(recognizeEquipmentImage('base64-image', 'album', { fetcher, timeoutMs: 10 })).resolves.toMatchObject({
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

  it('maps backend error codes to friendly messages', () => {
    expect(normalizeRecognitionResponse(502, { status: 'error', errorCode: 'VISION_PROVIDER_FAILED' })).toEqual({
      status: 'error',
      errorCode: 'VISION_PROVIDER_FAILED',
      message: '识别模型暂时不可用，请稍后重试。'
    });
    expect(normalizeRecognitionResponse(400, { status: 'error', errorCode: 'IMAGE_TOO_LARGE' })).toEqual({
      status: 'error',
      errorCode: 'IMAGE_TOO_LARGE',
      message: '图片太大了，请重新拍摄或换一张更清晰但体积更小的图片。'
    });
  });
});
