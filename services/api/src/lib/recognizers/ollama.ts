import { getSupportedEquipmentIds } from '@gym-equipment-ai/shared';
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

export function createOllamaRecognizer(options: { baseUrl: string; model: string }): Recognizer {
  const supportedIds = getSupportedEquipmentIds();

  return {
    async recognize({ imageBase64, source }): Promise<RecognitionResult> {
      const response = await fetch(`${options.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
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

      if (!response.ok) {
        throw new Error(
          `Ollama request failed with status ${response.status}: ${await response.text()}`
        );
      }

      const payload = (await response.json()) as {
        response: string;
      };
      const parsed = JSON.parse(payload.response) as OllamaRecognitionResponse;

      return {
        topMatchId: parsed.topMatchId,
        confidence: parsed.confidence,
        alternatives: parsed.alternatives
      };
    }
  };
}
