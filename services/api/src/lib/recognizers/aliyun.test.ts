import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecognitionProviderError } from './types.js';

const createMock = vi.fn();
const OpenAiMock = vi.fn(() => ({
  chat: {
    completions: {
      create: createMock
    }
  }
}));

vi.mock('openai', () => ({
  default: OpenAiMock
}));

const { createAliyunRecognizer } = await import('./aliyun.js');

afterEach(() => {
  createMock.mockReset();
  OpenAiMock.mockClear();
});

describe('createAliyunRecognizer', () => {
  it('does not send provider-specific request fields that can break DashScope compatible mode', async () => {
    createMock.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              topMatchId: 'pec-deck-fly',
              confidence: 0.91,
              alternatives: ['seated-chest-press']
            })
          }
        }
      ]
    });

    const recognizer = createAliyunRecognizer({
      apiKey: 'test-key',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen3-vl-32b-instruct'
    });

    await recognizer.recognize({
      imageBase64: 'ZmFrZS1pbWFnZS1iYXNlNjQ=',
      source: 'album'
    });

    const [requestBody] = createMock.mock.calls[0] as unknown as [Record<string, unknown>];
    expect(requestBody).not.toHaveProperty('extra_body');
    expect(requestBody).not.toHaveProperty('response_format');
  });

  it('wraps empty completion content as an invalid provider response', async () => {
    createMock.mockResolvedValueOnce({
      choices: [
        {
          message: {}
        }
      ]
    });

    const recognizer = createAliyunRecognizer({
      apiKey: 'test-key',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen3-vl-32b-instruct'
    });

    await expect(
      recognizer.recognize({
        imageBase64: 'ZmFrZS1pbWFnZS1iYXNlNjQ=',
        source: 'camera'
      })
    ).rejects.toEqual(
      expect.objectContaining<Partial<RecognitionProviderError>>({
        code: 'invalid_response'
      })
    );
  });
});
