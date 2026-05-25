# Gym Equipment AI

WeChat mini program plus Fastify API for recognizing common fixed gym machines and serving curated beginner-friendly teaching cards.

## Workspace Layout

- `apps/miniprogram`: native WeChat mini program client
- `services/api`: recognition API
- `packages/shared`: shared catalog data and schemas
- `scripts/sync-catalog.ts`: generates the mini program catalog snapshot from the shared package

## Local Development

1. Install dependencies:

```bash
corepack pnpm install
```

2. Sync the equipment catalog into the mini program package:

```bash
corepack pnpm sync:catalog
```

3. Start the API:

```bash
cp services/api/.env.example services/api/.env
corepack pnpm --filter @gym-equipment-ai/api dev
```

4. Open `apps/miniprogram` in WeChat Developer Tools.
5. Use local debug request settings or a local tunnel before testing on a real device.

The API now auto-loads `services/api/.env` on startup, so you do not need to export these variables manually before running `node --import tsx src/server.ts`.

### Recommended Launch Configuration

For launch readiness, use the Alibaba Model Studio provider instead of the local Ollama model. Update [services/api/.env](/Users/shc/Documents/Codex/2026-05-24/ai/services/api/.env) to:

```env
PORT=3001
RECOGNIZER_PROVIDER=aliyun
ALIYUN_API_KEY=your_real_key_here
ALIYUN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
ALIYUN_MODEL=qwen3-vl-32b-instruct
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5vl:3b
OLLAMA_TIMEOUT_MS=120000
LOG_LEVEL=info
```

The current Aliyun provider uses DashScope's OpenAI-compatible endpoint, so the rest of the API contract stays the same. If you later want an international fallback, you can switch `RECOGNIZER_PROVIDER=openai` and populate `OPENAI_API_KEY`.

## Recognition Providers

- `mock`: deterministic local development provider for fast UI testing
- `aliyun`: recommended launch provider, using Alibaba Model Studio via the OpenAI-compatible DashScope endpoint
- `openai`: optional international fallback using the OpenAI Responses API for vision recognition
- `ollama`: free local vision inference through an Ollama-served model such as `qwen2.5vl:3b`

## Useful Commands

```bash
corepack pnpm test
corepack pnpm typecheck
corepack pnpm --filter @gym-equipment-ai/miniprogram test
corepack pnpm --filter @gym-equipment-ai/api test
```

## Local Ollama Setup

If you want a free local recognizer instead of a paid API:

```bash
ollama pull qwen2.5vl:3b
```

Then configure [services/api/.env](/Users/shc/Documents/Codex/2026-05-24/ai/services/api/.env):

```env
RECOGNIZER_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5vl:3b
```

If the mini program previously timed out on large images, the current client now compresses images before upload and waits longer for local recognition responses.

In this Codex sandbox, `tsx` CLI IPC is restricted, so the working fallback for catalog sync is:

```bash
node --import tsx scripts/sync-catalog.ts
```

## Release Checklist

1. Confirm the 20 launch equipment cards are complete and reviewed for safety wording.
2. Set `RECOGNIZER_PROVIDER=aliyun` and a real `ALIYUN_API_KEY` in [services/api/.env](/Users/shc/Documents/Codex/2026-05-24/ai/services/api/.env).
3. Run `corepack pnpm sync:catalog`.
4. Run `corepack pnpm test`.
5. Run `corepack pnpm typecheck`.
6. Execute [docs/qa/manual-smoke-test.md](/Users/shc/Documents/Codex/2026-05-24/ai/docs/qa/manual-smoke-test.md) in WeChat Developer Tools.
7. Replace `touristappid` in [apps/miniprogram/project.config.json](/Users/shc/Documents/Codex/2026-05-24/ai/apps/miniprogram/project.config.json) with the real AppID before upload.
8. Review [docs/qa/release-checklist.md](/Users/shc/Documents/Codex/2026-05-24/ai/docs/qa/release-checklist.md) before release.
