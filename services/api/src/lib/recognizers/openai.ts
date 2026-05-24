import { getSupportedEquipmentIds } from '@gym-equipment-ai/shared';
import OpenAI from 'openai';
import type { Recognizer, RecognitionResult } from './types.js';

interface OpenAiRecognitionResponse {
  topMatchId: string | null;
  confidence: number;
  alternatives: string[];
}

export function createOpenAiRecognizer(options: { apiKey: string; model: string }): Recognizer {
  const client = new OpenAI({ apiKey: options.apiKey });
  const supportedIds = getSupportedEquipmentIds();

  return {
    async recognize({ imageBase64, source }): Promise<RecognitionResult> {
      const response = await client.responses.create({
        model: options.model,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: [
                  'You classify Chinese gym machine photos.',
                  `Choose one id from this list only: ${supportedIds.join(', ')}.`,
                  'If the machine is not confidently one of these ids, return topMatchId as null and confidence <= 0.4.'
                ].join(' ')
              }
            ]
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `Source: ${source}. Return JSON only.`
              },
              {
                type: 'input_image',
                image_url: `data:image/jpeg;base64,${imageBase64}`,
                detail: 'high'
              }
            ]
          }
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'equipment_recognition',
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                topMatchId: {
                  anyOf: [
                    { type: 'string', enum: supportedIds },
                    { type: 'null' }
                  ]
                },
                confidence: { type: 'number', minimum: 0, maximum: 1 },
                alternatives: {
                  type: 'array',
                  items: { type: 'string', enum: supportedIds },
                  maxItems: 3
                }
              },
              required: ['topMatchId', 'confidence', 'alternatives']
            }
          }
        }
      });

      const parsed = JSON.parse(response.output_text) as OpenAiRecognitionResponse;

      return {
        topMatchId: parsed.topMatchId,
        confidence: parsed.confidence,
        alternatives: parsed.alternatives
      };
    }
  };
}
