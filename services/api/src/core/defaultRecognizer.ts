import { env } from '../env.js';
import { createAliyunRecognizer } from '../lib/recognizers/aliyun.js';
import { mockRecognizer } from '../lib/recognizers/mock.js';
import { createOllamaRecognizer } from '../lib/recognizers/ollama.js';
import { createOpenAiRecognizer } from '../lib/recognizers/openai.js';
import { RecognitionProviderError } from '../lib/recognizers/types.js';
import type { Recognizer } from '../lib/recognizers/types.js';

function configErrorRecognizer(message: string, errorCode?: 'ALIYUN_API_KEY_MISSING'): Recognizer {
  return {
    async recognize() {
      throw new RecognitionProviderError('config_error', message, errorCode);
    }
  };
}

export function createDefaultRecognizer(): Recognizer {
  if (env.RECOGNIZER_PROVIDER === 'openai') {
    if (!env.OPENAI_API_KEY) {
      return configErrorRecognizer('OPENAI_API_KEY is required when RECOGNIZER_PROVIDER=openai');
    }

    return createOpenAiRecognizer({
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL
    });
  }

  if (env.RECOGNIZER_PROVIDER === 'aliyun') {
    if (!env.ALIYUN_API_KEY) {
      return configErrorRecognizer(
        'ALIYUN_API_KEY is required when RECOGNIZER_PROVIDER=aliyun',
        'ALIYUN_API_KEY_MISSING'
      );
    }

    return createAliyunRecognizer({
      apiKey: env.ALIYUN_API_KEY,
      baseUrl: env.ALIYUN_BASE_URL,
      model: env.ALIYUN_MODEL
    });
  }

  if (env.RECOGNIZER_PROVIDER === 'ollama') {
    return createOllamaRecognizer({
      baseUrl: env.OLLAMA_BASE_URL,
      model: env.OLLAMA_MODEL,
      timeoutMs: env.OLLAMA_TIMEOUT_MS
    });
  }

  return mockRecognizer;
}
