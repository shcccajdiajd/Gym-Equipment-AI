import type { FastifyInstance } from 'fastify';
import { env } from '../env.js';

function healthPayload() {
  return {
    status: 'ok',
    service: 'gym-equipment-ai-api',
    provider: env.RECOGNIZER_PROVIDER,
    model:
      env.RECOGNIZER_PROVIDER === 'aliyun'
        ? env.ALIYUN_MODEL
        : env.RECOGNIZER_PROVIDER === 'openai'
          ? env.OPENAI_MODEL
          : env.RECOGNIZER_PROVIDER === 'ollama'
            ? env.OLLAMA_MODEL
            : 'mock'
  };
}

export function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', async () => healthPayload());
  app.get('/api/health', async () => healthPayload());
}
