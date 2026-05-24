import cors from '@fastify/cors';
import Fastify from 'fastify';
import { env } from './env.js';
import { mockRecognizer } from './lib/recognizers/mock.js';
import { createOpenAiRecognizer } from './lib/recognizers/openai.js';
import type { Recognizer } from './lib/recognizers/types.js';
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

  return mockRecognizer;
}

export function buildApp(options?: { recognizer?: Recognizer }) {
  const app = Fastify({ logger: false });

  app.register(cors, { origin: true });
  registerRecognitionRoutes(app, options?.recognizer ?? defaultRecognizer());

  return app;
}
