# H5 Public Beta Deployment

This product is now led by the mobile H5/PWA flow. The goal of this phase is a shareable URL that lets testers open the web app on a phone, upload a gym-equipment image, receive a recognition result, and jump to tutorial searches.

## Target Architecture

- `apps/web`: static H5/PWA frontend deployed to Aliyun OSS static website hosting.
- `services/api`: local Fastify development API plus an Aliyun FC HTTP adapter for public deployment.
- `packages/shared`: bundled into both frontend and backend during build.
- AI provider keys stay only in the backend environment. Do not put `ALIYUN_API_KEY`, `OPENAI_API_KEY`, or any provider secret in `apps/web`.

## Backend API

Recommended first-beta host: Aliyun Function Compute (FC).

Required environment variables:

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

Local backend commands:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm --filter @gym-equipment-ai/api typecheck
pnpm --filter @gym-equipment-ai/api start
```

For FC deployment, build the bundled function entry:

```bash
npm run build:fc
```

Upload [dist/aliyun-fc/recognitions.mjs](/Users/shc/Documents/Codex/2026-05-24/ai/dist/aliyun-fc/recognitions.mjs) to Aliyun FC and use handler `recognitions.aliyunFcRecognition`. Set `ALIYUN_API_KEY` only in FC environment variables.

Health checks:

```text
GET /health
GET /api/health
```

Both health endpoints return service readiness metadata without exposing API keys.

## Frontend Web

Recommended first-beta host: Aliyun OSS static website hosting.

Required frontend environment variable for deployment:

```env
VITE_API_BASE_URL=https://your-api-domain.example.com
```

Build command:

```bash
npm run build:web
```

Build output:

```text
apps/web/dist
```

Upload the contents of `apps/web/dist` to the OSS bucket root. After changing `VITE_API_BASE_URL`, rebuild and re-upload the frontend.

For local development, leave `VITE_API_BASE_URL` empty and use `VITE_API_PROXY_TARGET=http://127.0.0.1:3001` so Vite proxies `/api` to the local backend.

## Public Beta Smoke Test

1. Open the deployed web URL on a phone browser.
2. Tap `拍照识别` and confirm the camera or camera-first chooser appears.
3. Tap `从相册上传` and confirm the album/photo picker appears.
4. Upload a known equipment image and wait for a result.
5. Confirm the result page shows equipment name, confidence, muscles, adjustment, steps, safety, errors, and search terms.
6. Tap B站, 抖音, 小红书, and 百度 search buttons.
7. Confirm copying search terms works when a platform cannot open cleanly.
8. Open the page inside WeChat and confirm the browser-open guidance appears.
9. Visit `/health` on the API domain and confirm it returns `status: ok`.

## Deployment Order

1. Build the FC handler with `npm run build:fc`.
2. Create an Aliyun FC Node.js function and HTTP Trigger.
3. Set `RECOGNIZER_PROVIDER=aliyun`, `ALIYUN_API_KEY`, `ALIYUN_BASE_URL`, and `ALIYUN_MODEL=qwen3-vl-plus` in FC environment variables.
4. Build the frontend with `VITE_API_BASE_URL=<FC HTTP Trigger URL> npm run build:web`.
5. Upload `apps/web/dist` to OSS static website hosting.
6. Run the public beta smoke test above from a phone not relying on local Wi-Fi.

For the full Aliyun guide, see [docs/deployment/aliyun-oss-fc.md](/Users/shc/Documents/Codex/2026-05-24/ai/docs/deployment/aliyun-oss-fc.md).

## Known First-Beta Tradeoffs

- No login and no cloud user history.
- Correction feedback is stored in localStorage only.
- Platform search URLs are best-effort and may behave differently across mobile browsers.
- CORS is currently permissive for fast MVP testing; tighten it before a broader public launch.
