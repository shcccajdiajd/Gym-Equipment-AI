import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  RECOGNIZER_PROVIDER: z.enum(['mock', 'openai']).default('mock'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini')
});

export const env = envSchema.parse(process.env);
