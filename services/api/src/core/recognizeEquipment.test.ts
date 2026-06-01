import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { RecognitionProviderError } from '../lib/recognizers/types.js';
import type { Recognizer } from '../lib/recognizers/types.js';
import { recognizeEquipment } from './recognizeEquipment.js';

function recognizer(result: Awaited<ReturnType<Recognizer['recognize']>>): Recognizer {
  return {
    async recognize() {
      return result;
    }
  };
}

describe('recognizeEquipment core', () => {
  it('returns a standard recognized payload with catalog details', async () => {
    const response = await recognizeEquipment(
      {
        imageBase64: Buffer.from('fixture-image').toString('base64'),
        source: 'album'
      },
      {
        recognizer: recognizer({
          topMatchId: 'pec-deck-fly',
          confidence: 0.91,
          alternatives: ['seated-chest-press']
        })
      }
    );

    expect(response).toMatchObject({
      status: 'recognized',
      equipmentId: 'pec-deck-fly',
      equipment: {
        id: 'pec-deck-fly'
      },
      confidence: 0.91,
      candidates: ['seated-chest-press']
    });
  });

  it('returns a clear image-required error without calling the recognizer', async () => {
    let calls = 0;
    const response = await recognizeEquipment(
      {
        imageBase64: '',
        source: 'album'
      },
      {
        recognizer: {
          async recognize() {
            calls += 1;
            return {
              topMatchId: 'pec-deck-fly',
              confidence: 0.91,
              alternatives: []
            };
          }
        }
      }
    );

    expect(calls).toBe(0);
    expect(response).toMatchObject({
      status: 'error',
      errorCode: 'IMAGE_REQUIRED'
    });
  });

  it('maps missing Aliyun key errors without crashing', async () => {
    const response = await recognizeEquipment(
      {
        imageBase64: Buffer.from('fixture-image').toString('base64'),
        source: 'camera'
      },
      {
        recognizer: {
          async recognize() {
            throw new RecognitionProviderError(
              'config_error',
              'ALIYUN_API_KEY is required when RECOGNIZER_PROVIDER=aliyun',
              'ALIYUN_API_KEY_MISSING'
            );
          }
        }
      }
    );

    expect(response).toMatchObject({
      status: 'error',
      errorCode: 'ALIYUN_API_KEY_MISSING'
    });
  });
});
