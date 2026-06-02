# Gym Equipment AI

Mobile-first H5/PWA plus Fastify API for recognizing common fixed gym machines and turning the result into high-quality tutorial search entry points.

The product mainline has moved from the WeChat mini program to `apps/web`. The mini program remains in the repository as a historical asset, but the current MVP target is a phone browser experience that can be opened by QR code and can link out to tutorial search pages more freely.

## Workspace Layout

- `apps/web`: mobile-first H5/PWA MVP built with Vite, React, TypeScript, and Tailwind
- `apps/miniprogram`: native WeChat mini program client, currently paused
- `services/api`: recognition API
- `packages/shared`: shared catalog data and schemas
- `scripts/sync-catalog.ts`: generates the mini program catalog snapshot from the shared package

## Local Development

1. Install dependencies:

```bash
node .tools/pnpm/dist/pnpm.mjs install --ignore-scripts
```

2. Start the API:

```bash
cp services/api/.env.example services/api/.env
npm run dev:api
```

3. Start the H5/PWA web app:

```bash
npm run dev:web
```

4. Open the Vite local URL on a phone browser or desktop mobile emulator.
5. Keep AI provider keys only in `services/api/.env`. `apps/web` uses `VITE_API_BASE_URL` or the Vite `/api` proxy and must not contain provider keys.

For local web development, [apps/web/.env.example](/Users/shc/Documents/Codex/2026-05-24/ai/apps/web/.env.example) supports:

```env
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://127.0.0.1:3001
```

Leaving `VITE_API_BASE_URL` empty lets the browser call `/api/recognitions`, which Vite proxies to the local API during development.

## Anonymous MVP Analytics

The H5 MVP uses a lightweight anonymous analytics flow. The frontend creates a `visitorId` in `localStorage` and sends small event payloads to `POST /api/events`. It does not send photos, phone numbers, login identity, or provider API keys.

Tracked events:

- `page_open`: a browser opened the H5 page.
- `upload_start`: a user selected camera or album upload.
- `recognition_success`: the recognition flow returned a matched or low-confidence equipment result.
- `recognition_error`: recognition failed, timed out, or returned unsupported.
- `search_click`: a user clicked B站, 抖音, 小红书, or 百度 search.
- `copy_query`: a user copied a tutorial search term.

For the current Vercel + Aliyun FC demo, view these events in the Aliyun Function Compute logs:

1. Open the Aliyun FC function used by `https://gym-equgnitions-uvamokegso.cn-beijing.fcapp.run`.
2. Go to `日志`.
3. Search for `analytics event received`.
4. Count or filter by `analyticsEvent.eventName` and de-duplicate by `analyticsEvent.visitorId` when you want approximate user counts.

After changing analytics backend code, rebuild and upload the FC package so `/api/events` exists in production:

```bash
npm run build:fc:fullstack
```

Upload [deploy-artifacts/aliyun-fc-recognitions.zip](/Users/shc/Documents/Codex/2026-05-24/ai/deploy-artifacts/aliyun-fc-recognitions.zip) to Aliyun FC with Handler `index.handler`.

If you need to revisit the mini program later, sync the equipment catalog and open `apps/miniprogram` in WeChat Developer Tools:

```bash
npm run sync:catalog
```

The API now auto-loads `services/api/.env` on startup, so you do not need to export these variables manually before running `node --import tsx src/server.ts`.

### Recommended Launch Configuration

For launch readiness, use the Alibaba Model Studio provider instead of the local Ollama model. Update [services/api/.env](/Users/shc/Documents/Codex/2026-05-24/ai/services/api/.env) to:

```env
PORT=3001
RECOGNIZER_PROVIDER=aliyun
ALIYUN_API_KEY=your_real_key_here
ALIYUN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
ALIYUN_MODEL=qwen3-vl-plus
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5vl:3b
OLLAMA_TIMEOUT_MS=120000
LOG_LEVEL=info
```

The current Aliyun provider uses DashScope's OpenAI-compatible endpoint, so the rest of the API contract stays the same. If you later want an international fallback, you can switch `RECOGNIZER_PROVIDER=openai` and populate `OPENAI_API_KEY`.

If the API log shows `403 Access denied`, first check `ALIYUN_MODEL`. In local testing, `qwen-vl-max-latest` was denied for the current key while `qwen3-vl-plus` returned `200`, so `qwen3-vl-plus` is the recommended default for this project.

For a fast shareable H5 demo link, use Vercel for `apps/web` while keeping recognition on Aliyun FC. Follow [docs/deployment/vercel-h5-demo.md](/Users/shc/Documents/Codex/2026-05-24/ai/docs/deployment/vercel-h5-demo.md). This is the current fastest path while Aliyun custom-domain setup is not ready.

For a longer-term China-friendly public beta, use Aliyun OSS static website hosting plus Aliyun Function Compute with a custom domain. Use [docs/deployment/aliyun-oss-fc.md](/Users/shc/Documents/Codex/2026-05-24/ai/docs/deployment/aliyun-oss-fc.md). The local Fastify API still exposes `GET /health` and `GET /api/health` for development health checks.

The older [render.yaml](/Users/shc/Documents/Codex/2026-05-24/ai/render.yaml) file remains as a historical/optional hosting preset, but it is no longer the recommended deployment path.

## Recognition Providers

- `mock`: deterministic local development provider for fast UI testing
- `aliyun`: recommended launch provider, using Alibaba Model Studio via the OpenAI-compatible DashScope endpoint
- `openai`: optional international fallback using the OpenAI Responses API for vision recognition
- `ollama`: free local vision inference through an Ollama-served model such as `qwen2.5vl:3b`

## Useful Commands

```bash
npm test
npm run build:web
npm run build:web:aliyun
npm run build:web:vercel
npm run build:fc
npm run build:fc:fullstack
npm run build
npm run typecheck
npm run dev:api
npm run dev:web
npm run start:api
```

Web-only verification:

```bash
cd apps/web
../../node_modules/.bin/vitest run
../../node_modules/.bin/vite build
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
3. Run `npm test`.
4. For the fastest demo link, push to GitHub and import the repo into Vercel using [docs/deployment/vercel-h5-demo.md](/Users/shc/Documents/Codex/2026-05-24/ai/docs/deployment/vercel-h5-demo.md).
5. For Aliyun-only deployment, bind a custom domain before using OSS or FC as the public H5 entry; default Aliyun domains force browser downloads.
6. Test the H5 flow on a real phone browser, including image upload, result rendering, Bilibili search, Douyin/Xiaohongshu/Baidu search buttons, search-term copying, and WeChat in-app browser messaging.
7. Review [docs/qa/release-checklist.md](/Users/shc/Documents/Codex/2026-05-24/ai/docs/qa/release-checklist.md) before release.
