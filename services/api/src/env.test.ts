import { mkdtemp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';

import { loadRuntimeEnv, parseDotEnv } from './env.js';

describe('env helpers', () => {
  afterEach(() => {
    delete process.env.RECOGNIZER_PROVIDER;
    delete process.env.OLLAMA_MODEL;
    delete process.env.PORT;
  });

  it('parses dotenv-style content', () => {
    expect(
      parseDotEnv(`
PORT=3001
# comment
RECOGNIZER_PROVIDER=ollama
OLLAMA_MODEL=qwen2.5vl:7b
      `)
    ).toEqual({
      PORT: '3001',
      RECOGNIZER_PROVIDER: 'ollama',
      OLLAMA_MODEL: 'qwen2.5vl:7b'
    });
  });

  it('loads .env values into process.env without overwriting existing values', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'gym-env-'));
    const envPath = join(tempDir, '.env');

    await writeFile(
      envPath,
      ['PORT=3001', 'RECOGNIZER_PROVIDER=ollama', 'OLLAMA_MODEL=qwen2.5vl:7b'].join('\n'),
      'utf8'
    );

    process.env.PORT = '9999';
    loadRuntimeEnv(envPath);

    expect(process.env.PORT).toBe('9999');
    expect(process.env.RECOGNIZER_PROVIDER).toBe('ollama');
    expect(process.env.OLLAMA_MODEL).toBe('qwen2.5vl:7b');
  });
});
