# Aliyun OSS + Function Compute Deployment

The production direction for the H5 MVP is now a China-friendly Aliyun deployment:

- `apps/web` is built as a static H5 site and hosted by OSS static website hosting.
- Recognition runs in Aliyun Function Compute (FC), using the same core code as local `services/api`.
- DashScope / Alibaba Model Studio stays server-side. Never put `ALIYUN_API_KEY` in any `VITE_` frontend variable.

Current MVP shortcut:

- Because OSS default object URLs can force-download `index.html`, the quickest public test path is FC-only hosting.
- The same FC function can serve `GET /` and `GET /assets/...` for the H5 frontend, while `POST /api/recognitions` continues to run recognition.
- Build this package with `npm run build:fc:fullstack`, then upload [deploy-artifacts/aliyun-fc-recognitions.zip](/Users/shc/Documents/Codex/2026-05-24/ai/deploy-artifacts/aliyun-fc-recognitions.zip) to FC.

Official references:

- OSS static website hosting: https://help.aliyun.com/zh/oss/static-website-hosting-overview
- FC HTTP triggers: https://help.aliyun.com/zh/functioncompute/fc/user-guide/http-triggers-overview
- FC environment variables: https://help.aliyun.com/zh/functioncompute/fc-2-0/overview-26
- FC programming model: https://help.aliyun.com/zh/functioncompute/fc/user-guide/basics

## Build The Frontend

### Option A: FC-only public beta

This is the recommended path for the current MVP test because it avoids OSS default-domain forced downloads.

```bash
npm run build:fc:fullstack
```

Build output:

```text
deploy-artifacts/aliyun-fc-recognitions.zip
```

Upload that zip to the existing FC function and keep Handler:

```text
index.handler
```

After upload, open the FC HTTP Trigger root URL:

```text
https://gym-equgnitions-uvamokegso.cn-beijing.fcapp.run/
```

The frontend in this package calls `/api/recognitions` on the same origin.

### Option B: OSS static website plus FC API

Set the frontend API base URL before building. Use the FC HTTP trigger base URL if the trigger path is `/api/recognitions`, or use the full trigger URL ending in `/api/recognitions`.

```bash
VITE_API_BASE_URL=https://your-fc-http-trigger.example.com npm run build:web
```

For the currently verified FC trigger in this project, you can run:

```bash
npm run build:web:aliyun
```

Build output:

```text
apps/web/dist
```

Upload every file inside `apps/web/dist` to the OSS bucket root. Do not upload `apps/web/dist` as one zip unless the OSS console explicitly extracts it. The bucket root should contain `index.html` and the `assets/` folder.

Recommended OSS static website settings:

- Default homepage: `index.html`
- Default 404 page: `index.html`
- If using a China mainland bucket with a custom domain, complete ICP filing before binding the domain.

## Build The FC Handler

Build the bundled FC entry:

```bash
npm run build:fc
```

Build output:

```text
dist/aliyun-fc/index.js
```

The prepared local upload package is:

```text
deploy-artifacts/aliyun-fc-recognitions.zip
```

Create a Node.js Function Compute function and upload `deploy-artifacts/aliyun-fc-recognitions.zip`, or upload `dist/aliyun-fc/index.js` directly if the console asks for a single code file.

Recommended handler:

```text
index.handler
```

The exported `handler(request, response)` wrapper adapts Aliyun FC's Node.js HTTP handler shape to the shared recognition adapter. It handles CORS preflight, allows recognition only through `POST`, and returns compact JSON:

```json
{
  "status": "recognized",
  "equipmentId": "pec-deck-fly",
  "confidence": 0.93,
  "candidates": ["seated-chest-press"]
}
```

The response never includes the uploaded base64 image.

## Configure FC

Create an HTTP Trigger for the function. For MVP testing, anonymous access is the simplest path, but treat the trigger URL as public.

Set environment variables on the FC function:

```env
RECOGNIZER_PROVIDER=aliyun
ALIYUN_API_KEY=your_real_key_here
ALIYUN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
ALIYUN_MODEL=qwen3-vl-plus
LOG_LEVEL=info
```

Do not configure `ALIYUN_API_KEY` in OSS, Vite, or any frontend environment variable.

Configure CORS at the FC HTTP Trigger level:

- Origin: your OSS static website domain
- Methods: `POST, OPTIONS`
- Headers: `content-type`

Do not also add CORS headers in the function response. Duplicate `Access-Control-Allow-Origin` headers can cause mobile browsers to reject the request before it reaches the API response parser.

## Configure The Web App

For local development, keep [apps/web/.env.example](/Users/shc/Documents/Codex/2026-05-24/ai/apps/web/.env.example) like this:

```env
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://127.0.0.1:3001
```

For Aliyun deployment, set only:

```env
VITE_API_BASE_URL=https://your-fc-http-trigger.example.com
```

The current verified FC base URL is:

```text
https://gym-equgnitions-uvamokegso.cn-beijing.fcapp.run
```

Then rebuild and upload the new `apps/web/dist`.

## Phone Smoke Test

1. Open the OSS static website URL on a phone browser.
2. Tap `拍照识别` or `从相册上传`.
3. Upload a gym-equipment image and wait for recognition.
4. Confirm the result, low-confidence candidate page, unknown page, or friendly error page appears.
5. Tap B站, 抖音, 小红书, and 百度 search buttons.
6. If a platform cannot open cleanly, use `复制搜索词`.
7. Open the URL inside WeChat and confirm the page suggests using a browser for better B站/抖音 jumping.

## Error Codes

- `ALIYUN_API_KEY_MISSING`: FC environment is missing `ALIYUN_API_KEY`.
- `VISION_PROVIDER_FAILED`: DashScope call failed or returned an unusable response.
- `IMAGE_TOO_LARGE`: compressed image base64 exceeds the allowed request size.
- `IMAGE_REQUIRED`: request did not include image data.
- `VISION_TIMEOUT`: model call timed out.
- `INVALID_REQUEST`: request body is not valid JSON or has an invalid shape.
- `METHOD_NOT_ALLOWED`: request was not `POST` or CORS `OPTIONS`.

## Local Development Stays The Same

```bash
npm run dev:api
npm run dev:web
```

During local development, the web app calls `/api/recognitions`, and Vite proxies it to `http://127.0.0.1:3001`.
