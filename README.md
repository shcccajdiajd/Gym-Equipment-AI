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

## Recognition Providers

- `mock`: deterministic local development provider for fast UI testing
- `openai`: image recognition through the OpenAI Responses API
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

In this Codex sandbox, `tsx` CLI IPC is restricted, so the working fallback for catalog sync is:

```bash
node --import tsx scripts/sync-catalog.ts
```

## Release Checklist

1. Confirm the 20 launch equipment cards are complete and reviewed for safety wording.
2. Run `corepack pnpm sync:catalog`.
3. Run `corepack pnpm test`.
4. Run `corepack pnpm typecheck`.
5. Execute [docs/qa/manual-smoke-test.md](/Users/shc/Documents/Codex/2026-05-24/ai/docs/qa/manual-smoke-test.md) in WeChat Developer Tools.
6. Replace `touristappid` in [apps/miniprogram/project.config.json](/Users/shc/Documents/Codex/2026-05-24/ai/apps/miniprogram/project.config.json) with the real AppID before upload.
7. Review [docs/qa/release-checklist.md](/Users/shc/Documents/Codex/2026-05-24/ai/docs/qa/release-checklist.md) before release.
