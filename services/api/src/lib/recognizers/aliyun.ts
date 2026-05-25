import { getSupportedEquipmentIds } from '@gym-equipment-ai/shared';
import OpenAI from 'openai';
import { buildRecognitionPrompt } from './prompt.js';
import { RecognitionProviderError } from './types.js';
import type { Recognizer, RecognitionResult } from './types.js';

interface AliyunRecognitionResponse {
  topMatchId: string | null;
  confidence: number;
  alternatives: string[];
}

function extractJsonText(content: unknown) {
  if (typeof content === 'string' && content.trim().length > 0) {
    return content;
  }

  if (Array.isArray(content)) {
    const text = content
      .flatMap((item) => {
        if (typeof item === 'string') {
          return [item];
        }

        if (typeof item === 'object' && item && 'text' in item && typeof item.text === 'string') {
          return [item.text];
        }

        return [];
      })
      .join('\n');

    if (text.trim().length > 0) {
      return text;
    }
  }

  throw new RecognitionProviderError('invalid_response', 'Aliyun returned empty completion content');
}

function parseJsonPayload(content: string) {
  const fencedMatch = content.match(/```json\s*([\s\S]*?)```/i) ?? content.match(/```\s*([\s\S]*?)```/i);
  const normalized = (fencedMatch?.[1] ?? content).trim();

  try {
    return JSON.parse(normalized) as AliyunRecognitionResponse;
  } catch (error) {
    throw new RecognitionProviderError(
      'invalid_response',
      `Aliyun returned invalid JSON: ${(error as Error).message}`
    );
  }
}

function describeUpstreamError(error: unknown) {
  const maybeError = error as {
    message?: string;
    status?: number;
    code?: string;
    type?: string;
  };
  const details = [
    maybeError.status ? `status=${maybeError.status}` : '',
    maybeError.code ? `code=${maybeError.code}` : '',
    maybeError.type ? `type=${maybeError.type}` : ''
  ].filter(Boolean);

  return [maybeError.message ?? 'unknown error', ...details].join(' ');
}

export function createAliyunRecognizer(options: {
  apiKey: string;
  baseUrl: string;
  model: string;
}): Recognizer {
  const client = new OpenAI({
    apiKey: options.apiKey,
    baseURL: options.baseUrl
  });
  const supportedIds = getSupportedEquipmentIds();

  return {
    async recognize({ imageBase64, source }): Promise<RecognitionResult> {
      let completion;

      try {
        completion = await client.chat.completions.create({
          model: options.model,
          messages: [
            {
              role: 'system',
              content: buildRecognitionPrompt(source)
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Return JSON only.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          temperature: 0
        });
      } catch (error) {
        throw new RecognitionProviderError(
          'upstream_error',
          `Aliyun request failed: ${describeUpstreamError(error)}`
        );
      }

      const parsed = parseJsonPayload(extractJsonText(completion.choices?.[0]?.message?.content));

      const validAlternatives = parsed.alternatives.filter((item) => supportedIds.includes(item)).slice(0, 3);
      const topMatchId = parsed.topMatchId && supportedIds.includes(parsed.topMatchId) ? parsed.topMatchId : null;

      return {
        topMatchId,
        confidence: parsed.confidence,
        alternatives: validAlternatives
      };
    }
  };
}
