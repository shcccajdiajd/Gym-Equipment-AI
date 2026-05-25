import { getSupportedEquipmentIds } from '@gym-equipment-ai/shared';
import { RecognitionProviderError } from './types.js';
import type { Recognizer, RecognitionResult } from './types.js';

interface OllamaRecognitionResponse {
  topMatchId: string | null;
  confidence: number;
  alternatives: string[];
}

function recognitionSchema(supportedIds: string[]) {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      topMatchId: {
        anyOf: [{ type: 'string', enum: supportedIds }, { type: 'null' }]
      },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
      alternatives: {
        type: 'array',
        items: { type: 'string', enum: supportedIds },
        maxItems: 3
      }
    },
    required: ['topMatchId', 'confidence', 'alternatives']
  } as const;
}

export function createOllamaRecognizer(options: {
  baseUrl: string;
  model: string;
  timeoutMs: number;
}): Recognizer {
  const supportedIds = getSupportedEquipmentIds();

  return {
    async recognize({ imageBase64, source }): Promise<RecognitionResult> {
      let response: Response;

      try {
        response = await fetch(`${options.baseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          signal: AbortSignal.timeout(options.timeoutMs),
          body: JSON.stringify({
            model: options.model,
            stream: false,
            options: {
              temperature: 0
            },
            prompt: [
              'You classify Chinese gym machine photos.',
              `Choose one id from this list only: ${supportedIds.join(', ')}.`,
              'If the machine is not confidently one of these ids, return topMatchId as null and confidence <= 0.4.',
              `Source: ${source}. Return JSON only.`
            ].join(' '),
            images: [imageBase64],
            format: recognitionSchema(supportedIds)
          })
        });
      } catch (error) {
        if ((error as Error).name === 'TimeoutError') {
          throw new RecognitionProviderError(
            'timeout',
            `Ollama request timed out after ${options.timeoutMs}ms`
          );
        }

        throw new RecognitionProviderError(
          'upstream_error',
          `Ollama request failed: ${(error as Error).message}`
        );
      }

      if (!response.ok) {
        throw new RecognitionProviderError(
          'upstream_error',
          `Ollama request failed with status ${response.status}: ${await response.text()}`
        );
      }

      const payload = (await response.json()) as {
        response: string;
      };
      let parsed: OllamaRecognitionResponse;

      try {
        parsed = JSON.parse(payload.response) as OllamaRecognitionResponse;
      } catch (error) {
        throw new RecognitionProviderError(
          'invalid_response',
          `Ollama returned invalid JSON: ${(error as Error).message}`
        );
      }

      return {
        topMatchId: parsed.topMatchId,
        confidence: parsed.confidence,
        alternatives: parsed.alternatives
      };
    }
  };
}
