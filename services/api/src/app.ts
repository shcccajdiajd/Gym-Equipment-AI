import cors from '@fastify/cors';
import Fastify from 'fastify';
import { env } from './env.js';
import { createDefaultRecognizer } from './core/defaultRecognizer.js';
import type { Recognizer } from './lib/recognizers/types.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerRecognitionRoutes } from './routes/recognitions.js';
import { registerEventRoutes } from './routes/events.js';

export function buildApp(options?: { recognizer?: Recognizer }) {
  const app = Fastify({ logger: { level: env.LOG_LEVEL } });

  app.register(cors, { origin: true });
  registerHealthRoutes(app);
  registerEventRoutes(app);
  registerRecognitionRoutes(app, options?.recognizer ?? createDefaultRecognizer());

  return app;
}
