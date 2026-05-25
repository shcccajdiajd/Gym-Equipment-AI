import { equipmentCatalog, getSupportedEquipmentIds } from '@gym-equipment-ai/shared';
import OpenAI from 'openai';
import { z } from 'zod';
import { buildRecognitionPrompt } from './prompt.js';
import { RecognitionProviderError } from './types.js';
import type { Recognizer, RecognitionResult } from './types.js';

const recognitionResponseSchema = z.object({
  topMatchId: z.string().nullable().optional(),
  id: z.string().optional(),
  name: z.string().optional(),
  zhName: z.string().optional(),
  enName: z.string().optional(),
  confidence: z.number().min(0).max(1),
  alternatives: z.array(z.string()).default([])
}).refine(
  (payload) =>
    payload.topMatchId !== undefined ||
    payload.id !== undefined ||
    payload.name !== undefined ||
    payload.zhName !== undefined ||
    payload.enName !== undefined,
  'missing topMatchId, id, name, zhName, or enName'
);

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
  let parsed: unknown;

  try {
    parsed = JSON.parse(normalized);
  } catch (error) {
    throw new RecognitionProviderError(
      'invalid_response',
      `Aliyun returned invalid JSON: ${(error as Error).message}`
    );
  }

  const validation = recognitionResponseSchema.safeParse(parsed);
  if (!validation.success) {
    throw new RecognitionProviderError(
      'invalid_response',
      `Aliyun returned unexpected JSON shape: ${z.prettifyError(validation.error)}`
    );
  }

  return validation.data;
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

function normalizeLabel(value: string) {
  return value.trim().toLowerCase();
}

function createCatalogIdResolver() {
  const byLabel = new Map<string, string>();

  for (const item of equipmentCatalog) {
    byLabel.set(normalizeLabel(item.id), item.id);
    byLabel.set(normalizeLabel(item.zhName), item.id);
    byLabel.set(normalizeLabel(item.enName), item.id);
  }

  return (value: string | null | undefined) => {
    if (!value) {
      return null;
    }

    return byLabel.get(normalizeLabel(value)) ?? null;
  };
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
  const resolveCatalogId = createCatalogIdResolver();

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

      const returnedTopMatch = parsed.topMatchId ?? parsed.id ?? parsed.name ?? parsed.zhName ?? parsed.enName;
      const topMatchId = resolveCatalogId(returnedTopMatch);
      const validAlternatives = parsed.alternatives
        .map((item) => resolveCatalogId(item))
        .filter((item): item is string => item !== null)
        .filter((item) => supportedIds.includes(item))
        .filter((item, index, items) => items.indexOf(item) === index)
        .slice(0, 3);

      return {
        topMatchId,
        confidence: parsed.confidence,
        alternatives: validAlternatives
      };
    }
  };
}
