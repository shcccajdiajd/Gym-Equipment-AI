import cors from '@fastify/cors';
import Fastify from 'fastify';
import { env } from './env.js';
import { createAliyunRecognizer } from './lib/recognizers/aliyun.js';
import { mockRecognizer } from './lib/recognizers/mock.js';
import { createOllamaRecognizer } from './lib/recognizers/ollama.js';
import { createOpenAiRecognizer } from './lib/recognizers/openai.js';
import type { Recognizer } from './lib/recognizers/types.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerRecognitionRoutes } from './routes/recognitions.js';

function defaultRecognizer(): Recognizer {
  if (env.RECOGNIZER_PROVIDER === 'openai') {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required when RECOGNIZER_PROVIDER=openai');
    }

    return createOpenAiRecognizer({
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL
    });
  }

  if (env.RECOGNIZER_PROVIDER === 'aliyun') {
    if (!env.ALIYUN_API_KEY) {
      throw new Error('ALIYUN_API_KEY is required when RECOGNIZER_PROVIDER=aliyun');
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

export function buildApp(options?: { recognizer?: Recognizer }) {
  const app = Fastify({ logger: { level: env.LOG_LEVEL } });

  app.register(cors, { origin: true });
  registerHealthRoutes(app);
  registerRecognitionRoutes(app, options?.recognizer ?? defaultRecognizer());

  return app;
}
