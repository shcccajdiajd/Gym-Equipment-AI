import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

export function parseDotEnv(source: string) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'))
      .map((line) => {
        const separatorIndex = line.indexOf('=');
        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();
        return [key, value];
      })
      .filter(([key]) => key.length > 0)
  ) as Record<string, string>;
}

export function loadRuntimeEnv(envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../.env')) {
  try {
    const fileContents = readFileSync(envPath, 'utf8');
    const parsed = parseDotEnv(fileContents);

    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    const errorCode = (error as NodeJS.ErrnoException).code;
    if (errorCode !== 'ENOENT') {
      throw error;
    }
  }
}

loadRuntimeEnv();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  RECOGNIZER_PROVIDER: z.enum(['mock', 'openai', 'aliyun', 'ollama']).default('mock'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
  ALIYUN_API_KEY: z.string().optional(),
  ALIYUN_BASE_URL: z.string().default('https://dashscope.aliyuncs.com/compatible-mode/v1'),
  ALIYUN_MODEL: z.string().default('qwen3-vl-plus'),
  OLLAMA_BASE_URL: z.string().default('http://127.0.0.1:11434'),
  OLLAMA_MODEL: z.string().default('qwen2.5vl:3b'),
  OLLAMA_TIMEOUT_MS: z.coerce.number().default(120000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info')
});

export const env = envSchema.parse(process.env);
