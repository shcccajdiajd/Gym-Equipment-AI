import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  RECOGNIZER_PROVIDER: z.enum(['mock', 'openai', 'ollama']).default('mock'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
  OLLAMA_BASE_URL: z.string().default('http://127.0.0.1:11434'),
  OLLAMA_MODEL: z.string().default('qwen2.5vl:3b')
});

export const env = envSchema.parse(process.env);
