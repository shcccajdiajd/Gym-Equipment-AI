# TODO

## Current Phase: Vercel Temporary H5 Demo Deployment

- [x] Extract recognition into a platform-neutral core function.
Acceptance:
- [services/api/src/core/recognizeEquipment.ts](/Users/shc/Documents/Codex/2026-05-24/ai/services/api/src/core/recognizeEquipment.ts) accepts `imageBase64` or `imageDataUrl`.
- Local Fastify routes and Aliyun FC adapter call the same core function.
- Missing image, oversized image, timeout, provider failure, and missing Aliyun key return explicit error codes.

- [x] Add the Aliyun FC recognition adapter.
Acceptance:
- [services/api/src/adapters/aliyunFcRecognition.ts](/Users/shc/Documents/Codex/2026-05-24/ai/services/api/src/adapters/aliyunFcRecognition.ts) accepts only recognition `POST` requests plus CORS `OPTIONS` preflight.
- It exposes a deployable `handler(request, response)` wrapper, parses JSON request bodies, validates image fields, calls `recognizeEquipment`, and returns compact JSON without base64 image data.
- Adapter tests cover preflight, non-POST rejection, success, and empty-image error.

- [x] Make the H5 frontend deployment-configurable and FC-response compatible.
Acceptance:
- The frontend uses `VITE_API_BASE_URL` for deployed API calls and keeps provider keys out of `VITE_` variables.
- Compact FC responses with `equipmentId` and `candidates` hydrate into shared catalog cards.
- Frontend errors map `ALIYUN_API_KEY_MISSING`, `VISION_PROVIDER_FAILED`, `IMAGE_TOO_LARGE`, `IMAGE_REQUIRED`, and `VISION_TIMEOUT` to user-friendly messages.

- [x] Enforce H5 image upload limits before sending to the API.
Acceptance:
- Browser compression uses max edge `1280px` and JPEG quality `0.75`.
- If the base64 payload is still too large, the user sees a retry prompt before upload.
- localStorage history continues to store only equipment id/name/confidence/time/search term, not base64 images.

- [x] Document the Aliyun deployment path.
Acceptance:
- README points to Aliyun OSS + FC as the primary public beta path.
- [docs/deployment/aliyun-oss-fc.md](/Users/shc/Documents/Codex/2026-05-24/ai/docs/deployment/aliyun-oss-fc.md) explains web build, OSS upload, FC creation, HTTP Trigger, FC env vars, `VITE_API_BASE_URL`, and phone smoke testing.
- `PROGRESS.md` and `TODO.md` record this phase.

- [x] Verify the Aliyun deployment refactor.
Acceptance:
- `npm test` exits `0`.
- `npm run build:web` exits `0`.
- `npm run build:fc` exits `0`.
- `npm run typecheck` exits `0`.

- [x] Commit the Aliyun deployment refactor.
Acceptance:
- A git commit is created for the phase.

- [x] Prepare local Aliyun upload artifacts.
Acceptance:
- `npm run build:web` exits `0` and refreshes `apps/web/dist`.
- `npm run build:fc` exits `0` and refreshes `dist/aliyun-fc/index.js`.
- `deploy-artifacts/aliyun-fc-recognitions.zip` exists for FC upload.
- `apps/web/dist` is ready for OSS static website upload.

- [x] Inspect the real Aliyun FC HTTP trigger event shape.
Acceptance:
- A temporary debug Handler `index.handler` logs the first argument type, Buffer status, constructor name, event preview, context keys, and argument count.
- Aliyun console logs confirm the first handler argument is a `Buffer` containing a v1 JSON event.
- The request method is read from `requestContext.http.method`.

- [x] Restore the final FC adapter from the observed event shape.
Acceptance:
- [services/api/src/adapters/aliyunFcRecognition.ts](/Users/shc/Documents/Codex/2026-05-24/ai/services/api/src/adapters/aliyunFcRecognition.ts) parses Buffer, string, and object handler inputs.
- The adapter supports Aliyun v1 events, including `requestContext.http.method` and base64-encoded JSON request bodies.
- Handler `index.handler` can return proxy-style `{ statusCode, headers, body }` responses when Aliyun does not provide response helper methods.
- A local Node smoke test using an Aliyun-style Buffer POST event returns structured `IMAGE_REQUIRED` JSON instead of crashing.
- `deploy-artifacts/aliyun-fc-recognitions.zip` is regenerated with root-level `index.js`.

- [x] Verify the uploaded Aliyun FC function with the real HTTP Trigger.
Acceptance:
- `GET /api/recognitions` returns structured `METHOD_NOT_ALLOWED`.
- Empty `POST /api/recognitions` returns structured `IMAGE_REQUIRED`.
- `OPTIONS /api/recognitions` returns `204` with CORS headers.
- A real image POST using `ims.webp` returns HTTP `200` with `equipmentId: pec-deck-fly` and confidence `0.92`.

- [x] Build the H5 frontend for the verified Aliyun FC API.
Acceptance:
- Root `package.json` includes `npm run build:web:aliyun`.
- `npm run build:web:aliyun` exits `0`.
- The generated `apps/web/dist` bundle contains the verified FC base URL `https://gym-equgnitions-uvamokegso.cn-beijing.fcapp.run`.

- [x] Add FC-only H5 hosting as the current public beta shortcut.
Acceptance:
- `GET /` from the FC handler serves `index.html` from bundled static files.
- `GET /assets/...` from the FC handler serves frontend assets with browser-friendly content types.
- Static HTML responses include `content-disposition: inline` to avoid the download behavior seen with OSS default object URLs.
- `POST /api/recognitions` keeps using the same shared recognition API.
- `npm run build:fc:fullstack` exits `0` and packages root `index.js` plus `public/` into `deploy-artifacts/aliyun-fc-recognitions.zip`.

- [x] Deploy and inspect the FC-only fullstack package.
Acceptance:
- `deploy-artifacts/aliyun-fc-recognitions.zip` is uploaded to the existing Aliyun FC function.
- Handler remains `index.handler`.
- Opening `https://gym-equgnitions-uvamokegso.cn-beijing.fcapp.run/` returns the correct H5 HTML body and `Content-Type: text/html`, but Aliyun's default domain still forces `Content-Disposition: attachment`.
- Opening `https://gym-equgnitions-uvamokegso.cn-beijing.fcapp.run/assets/...` returns JS/CSS assets with correct content types, but the default domain still forces `Content-Disposition: attachment`.
- FC has `RECOGNIZER_PROVIDER=aliyun`, `ALIYUN_API_KEY`, `ALIYUN_BASE_URL`, and `ALIYUN_MODEL=qwen3-vl-plus`. Current status: enough is configured for live recognition to succeed.
- The H5 frontend calls same-origin `/api/recognitions`.

- [x] Choose and configure a browser-renderable public H5 entry.
Acceptance:
- Do not rely on OSS default object URLs or FC `fcapp.run` default URLs as the public page entry because both force browser downloads.
- Current temporary path: deploy `apps/web` to Vercel and keep Aliyun FC as the recognition API.
- The root [vercel.json](/Users/shc/Documents/Codex/2026-05-24/ai/vercel.json) builds `apps/web` with `pnpm run build:web:vercel`.
- No provider API key is added to Vercel frontend environment variables.

- [ ] Deploy the H5 frontend to Vercel.
Acceptance:
- GitHub has the latest commit containing [vercel.json](/Users/shc/Documents/Codex/2026-05-24/ai/vercel.json).
- Vercel imports `shcccajdiajd/Gym-Equipment-AI` from the monorepo root.
- Vercel uses `pnpm run build:web:vercel` and outputs `apps/web/dist`.
- Vercel returns a `*.vercel.app` URL that opens the H5 page directly without downloading.
- The built frontend calls `https://gym-equgnitions-uvamokegso.cn-beijing.fcapp.run/api/recognitions`.

- [ ] Revisit Aliyun custom-domain deployment after the quick demo link is live.
Acceptance:
- Bind a custom domain to OSS static website hosting or FC.
- Verify the response no longer includes `Content-Disposition: attachment`.
- Decide whether to keep Vercel as temporary only or replace it with the domestic custom-domain entry.

- [ ] Run deployed phone smoke test.
Acceptance:
- A phone opens the Vercel public H5 URL outside local-only networking.
- Uploading an image reaches FC and returns recognized, low-confidence, unsupported, or clear error state.
- B站/抖音/小红书/百度 buttons are clickable and copy-search fallback works.
- WeChat in-app browser shows the “用浏览器打开” guidance.

## Phase 1: Persist Context And Create Checkpoints

- [x] Initialize a git repository in `/Users/shc/Documents/Codex/2026-05-24/ai`.
Acceptance:
- `git status --short` runs successfully.
- `PROGRESS.md` and `TODO.md` are tracked.
- A first checkpoint commit exists.

- [x] Confirm the current API/shared verification commands still pass after the repository is initialized.
Acceptance:
- `./node_modules/.bin/tsc -p /Users/shc/Documents/Codex/2026-05-24/ai/packages/shared/tsconfig.json --noEmit` exits `0`.
- `./node_modules/.bin/tsc -p /Users/shc/Documents/Codex/2026-05-24/ai/services/api/tsconfig.json --noEmit` exits `0`.
- `/Users/shc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/shc/Documents/Codex/2026-05-24/ai/node_modules/vitest/vitest.mjs run src/routes/recognitions.test.ts` from `services/api` exits `0`.

- [x] Create the first checkpoint commit for the already completed spec, shared package, and API work.
Acceptance:
- `git log --oneline -1` shows the checkpoint commit.
- `PROGRESS.md` and `TODO.md` are included in that commit.

## Phase 2: Build The Mini Program Shell

- [x] Implement Task 4: native mini program shell, home page, capture page, and API client utilities.
Acceptance:
- `apps/miniprogram` exists with app shell and the `home`/`capture` pages.
- The mini program can navigate from home to capture.
- TypeScript for the mini program package passes.

- [x] Update `PROGRESS.md` and `TODO.md`, then create a git commit for the mini program shell phase.
Acceptance:
- Both files reflect the new state accurately.
- A new commit is created after the phase is verified.

## Phase 3: Build Result And Equipment Browsing

- [x] Implement Task 5: result page, supported equipment list, and local history helpers.
Acceptance:
- Result page supports recognized, low-confidence, and unsupported states.
- Equipment list page can open known equipment detail pages.
- Mini program tests/typecheck pass for this phase.
- Local history captures recent recognitions without blocking the primary flow.

- [x] Update `PROGRESS.md` and `TODO.md`, then create a git commit for the result/browsing phase.
Acceptance:
- Both files reflect the new state accurately.
- A new commit is created after the phase is verified.

## Phase 4: Finish Docs And QA Flow

- [x] Implement Task 6: root README, manual smoke test doc, and release checklist.
Acceptance:
- `README.md` exists and describes setup, development, and release flow.
- `docs/qa/manual-smoke-test.md` exists with concrete manual checks.
- `docs/qa/release-checklist.md` exists with pre-release and post-release checks.
- Relevant verification commands pass.

- [x] Update `PROGRESS.md` and `TODO.md`, then create a git commit for the docs/QA phase.
Acceptance:
- Both files reflect the final state accurately.
- A new commit is created after the phase is verified.

## Phase 5: Final Cleanup

- [x] Revisit root Vitest configuration so it stops relying on the deprecated workspace-file pattern.
Acceptance:
- Root/shared Vitest invocation still passes after the config migration.
- Root test configuration no longer relies on the deprecated workspace-file pattern.

- [x] Run a final end-to-end verification sweep.
Acceptance:
- Shared package typecheck passes.
- API package typecheck passes.
- API recognitions test suite passes.
- Mini program package typecheck/tests pass for the implemented scope.

## Phase 6: Harden Live Aliyun Debugging Flow

- [x] Normalize mini program recognition HTTP failures so API `500` responses become user-visible error toasts instead of leaving the loading state ambiguous.
Acceptance:
- `normalizeRecognitionResponse` converts non-200 responses without a known `status` into `{ status: 'error', message }`.
- Album and camera recognition flows continue to use the same `recognizeEquipment` entry point.
- The rebuilt mini program runtime JavaScript includes the normalization logic.

- [x] Make API recognizer crashes return a structured JSON error body.
Acceptance:
- Unexpected recognizer exceptions return HTTP `500` with `{ status: 'error', message: '识别服务暂时不可用，请稍后重试。' }`.
- Existing `RecognitionProviderError` timeout/upstream handling remains intact.

- [x] Reduce Aliyun compatible-mode request risk and add regression coverage.
Acceptance:
- The Aliyun recognizer no longer sends `extra_body` or `response_format` in the compatible-mode chat request.
- Empty Aliyun completion content is wrapped as `invalid_response` instead of causing an unstructured crash.
- `./node_modules/.bin/vitest run` exits `0` with the new regression tests included.

- [x] Make Aliyun response parsing tolerant of exact catalog names while still validating malformed payloads.
Acceptance:
- If Aliyun returns an exact catalog id, Chinese name, or English name, it can be mapped to the internal equipment id.
- A response with no recognizable match field is returned as `invalid_response` instead of a TypeError.
- Unexpected route errors are logged through the `err` field so the terminal shows the real message/stack.

- [x] Add a targeted false-positive guard for `pec-deck-fly` vs `assisted-pull-up-dip`.
Acceptance:
- The recognizer prompt explicitly says not to return `assisted-pull-up-dip` without a visible knee pad/platform plus dip or pull-up handles.
- The `pec-deck-fly` catalog hints explicitly describe the seat/back pad and two chest-height swing arms case.
- The mini program catalog snapshot is regenerated after the shared catalog change.
- `./node_modules/.bin/vitest run` exits `0` with the new prompt guard test included.

- [x] Add a route-level safety guard for repeated `assisted-pull-up-dip` false positives.
Acceptance:
- `assisted-pull-up-dip` recognitions below `0.95` confidence are converted to `unsupported` rather than a recognized teaching card.
- `pec-deck-fly` is the first fallback suggestion for this guard.
- The recommended Aliyun launch model is `qwen-vl-max-latest` in defaults, docs, and the local ignored `.env`.
- `./node_modules/.bin/vitest run` exits `0` with the safety-guard regression test included.

- [x] Add a Bilibili mini program search jump from result pages.
Acceptance:
- Recognized result pages show a "去 B 站搜索" action in the teaching section.
- The action attempts `wx.navigateToMiniProgram` with the Bilibili mini program AppID and a keyword-bearing search path.
- If the mini program jump fails, the action copies the mobile Bilibili search URL so the user still has a usable fallback.
- `./node_modules/.bin/vitest run` exits `0` with platform-search URL/path tests included.

- [x] Add a WeChat Developer Tools local API fallback for album import timeout.
Acceptance:
- The mini program can build recognition request URLs from multiple API base URL candidates.
- The app config tries the current LAN API URL before falling back to `127.0.0.1`.
- The rebuilt mini program runtime JavaScript includes the fallback URL list.
- `./node_modules/.bin/vitest run apps/miniprogram/tests/result-view-model.test.ts` exits `0` with the new URL test included.

- [x] Make image compression failures non-blocking during import.
Acceptance:
- If `wx.compressImage` fails, the mini program continues with the original selected image path.
- WeChat callback errors now produce more specific toasts for timeout, request failure, read-file failure, and user cancel.
- The rebuilt mini program runtime JavaScript includes the compression fallback and updated page error handling.
- `./node_modules/.bin/vitest run` exits `0` with regression coverage for compression fallback and callback error messages.

- [x] Add a development fallback when WeChat Developer Tools cannot reach the local API.
Acceptance:
- A direct backend call with the real `ims.webp` sample returns HTTP `200`, confirming the API and Aliyun provider path are alive.
- When all mini program recognition requests fail and `enableRecognitionDevFallback` is enabled, `recognizeEquipment` returns an unsupported candidate payload.
- The upload flow can navigate to the unsupported/candidate result page instead of stopping at a transport timeout.
- `./node_modules/.bin/vitest run` exits `0` with regression coverage for the dev fallback payload.

- [x] Move development fallback ahead of image-read failures.
Acceptance:
- Album/camera flows call one shared image-path recognition helper.
- If WeChat Developer Tools cannot read the selected temporary image and development fallback is enabled, the flow returns the unsupported candidate payload.
- The rebuilt mini program runtime JavaScript includes the shared image-path recognition helper.
- `./node_modules/.bin/vitest run` exits `0` with regression coverage for image-read fallback.

## Next Recommended Steps

- [x] Create the mobile H5/PWA MVP in `apps/web`.
Acceptance:
- `apps/web` uses Vite, React, TypeScript, and Tailwind.
- The web app reuses `packages/shared` catalog data and `services/api` recognition API.
- The web app includes upload/preview/compression, result rendering, candidate flows, platform search buttons, copy-search fallback, history, and local correction feedback.
- `npm test` exits `0`.
- `npm run build` exits `0`.

- [ ] Run real-device H5 smoke testing.
Acceptance:
- A phone browser can open the local or deployed web URL.
- The user can upload or capture an image.
- The API returns a result and the page renders recognized, low-confidence, or unsupported states correctly.
- Bilibili search opens `https://search.bilibili.com/all?keyword=...`.
- Douyin, Xiaohongshu, and Baidu buttons are clickable and the copy-search fallback works.
- WeChat in-app browser shows the “用浏览器打开” guidance.
- History and “识别错了？” local feedback write to localStorage without storing base64 images.

- [ ] Retest the H5 mobile upload entry points on a real phone.
Acceptance:
- Tapping `拍照识别` opens the camera or camera-first chooser.
- Tapping `从相册上传` opens the album/photo picker without forcing the camera.
- Both paths can select an image, show preview/loading, and call the same recognition API.

- [ ] Deploy the H5 public beta.
Acceptance:
- Backend is deployed behind HTTPS and `GET /health` returns `status: ok`.
- Backend environment keeps provider keys server-side only and uses `ALIYUN_MODEL=qwen3-vl-plus`.
- Frontend is deployed from `apps/web/dist` with `VITE_API_BASE_URL` pointing to the deployed API origin.
- A phone outside the local Wi-Fi can open the web URL, upload an image, and receive a recognized, low-confidence, unsupported, or clear error state.
- Platform search buttons and copy-search fallback work from the deployed URL.

- [ ] Connect the repo to hosting accounts.
Acceptance:
- [x] A GitHub remote exists for this repository at `https://github.com/shcccajdiajd/Gym-Equipment-AI.git` and `main` is pushed.
- If a future `git push` fails, confirm the machine can reach `github.com:443` or push from a network that can access GitHub.
- Aliyun OSS bucket is created and configured for static website hosting.
- Aliyun FC function is created with `ALIYUN_API_KEY` configured as a server-side environment variable.
- The H5 build uses `VITE_API_BASE_URL` pointing to the FC HTTP Trigger URL.

- [ ] Run the manual smoke test in WeChat Developer Tools.
Acceptance:
- Every item in [docs/qa/manual-smoke-test.md](/Users/shc/Documents/Codex/2026-05-24/ai/docs/qa/manual-smoke-test.md) is checked off by a human.
- Camera capture, album import, clipboard copy, and equipment-list navigation all work in the actual mini program runtime.
- The "去 B 站搜索" button either opens the Bilibili mini program search page or copies the Bilibili mobile search URL on failure.
- The running Aliyun-backed API on `http://127.0.0.1:3001` is used successfully from the mini program during the session.
- If `127.0.0.1` times out in WeChat Developer Tools, the mini program successfully retries the current LAN API URL `http://192.168.7.51:3001`.
- Selecting the same image that previously showed `导入失败` either reaches the result page or shows a more specific toast that identifies the failing step.
- With development fallback enabled, selecting any image in WeChat Developer Tools should at least reach the unsupported candidate result page even if local API transport still times out.
- With development fallback enabled, selecting any image in WeChat Developer Tools should at least reach the unsupported candidate result page even if temporary image reading fails.
- If Aliyun still fails, the mini program exits `识别中` and shows a readable toast rather than staying stuck.
- The API terminal log shows either `recognition provider completed` or a structured `recognition provider failed` / `recognition request crashed unexpectedly` entry.
- If the API logs `recognition provider failed` with `invalid_response`, the logged message identifies whether the provider returned invalid JSON or an unexpected JSON shape.
- The home-page demo buttons successfully preview all three result states in WeChat Developer Tools.
- The project loads in WeChat Developer Tools without the previous `pages/home/index.js` missing-file startup error.
- The Aliyun-backed flow returns a real response instead of a transport or auth error after editing `.env`.
- Re-testing the same `蝴蝶机夹胸` reference image no longer produces a confident `坐姿划船` result; it should either identify `pec-deck-fly` correctly or fall back to `low_confidence`/`unsupported`.
- Re-testing the same `蝴蝶机夹胸` reference image should no longer produce a confident `assisted-pull-up-dip` result after the targeted false-positive guard.
- If the recognizer still returns `unsupported`, the result page shows candidate machine buttons derived from `alternatives`, and tapping `蝴蝶机夹胸` opens its teaching card.
- The same unsupported flow correctly parses encoded `alternatives` from the page URL, so candidate buttons actually render in WeChat DevTools instead of silently disappearing.

- [ ] Verify the live Aliyun recognition path with a real API key.
Acceptance:
- `services/api/.env` is populated with `RECOGNIZER_PROVIDER=aliyun`, a valid `ALIYUN_API_KEY`, and the expected `ALIYUN_BASE_URL`.
- At least one real equipment image returns a recognized or low-confidence response instead of a transport/config error.
- A failed live Aliyun request returns a structured `error` or `timeout` response to the mini program rather than an unhandled Fastify default body.
- The preferred launch model is `qwen3-vl-plus`, because it returned `200` with the current key while `qwen-vl-max-latest` returned Aliyun `403 Access denied`.
- The API successfully authenticates against `https://dashscope.aliyuncs.com/compatible-mode/v1` without an upstream 401 or model-name error.

- [ ] Verify the live Ollama recognition path with a local model.
Acceptance:
- `ollama pull qwen2.5vl:3b` has completed on the local machine.
- `services/api/.env` is populated with `RECOGNIZER_PROVIDER=ollama`, `OLLAMA_BASE_URL`, and `OLLAMA_MODEL`.
- At least one real equipment image returns a recognized or low-confidence response instead of a transport/config error.
- The API terminal logs show request receipt, recognizer completion or timeout, and total duration for the test image.
- The `ims.webp` `蝴蝶机夹胸` sample no longer returns a confidently recognized `坐姿划船` response after the catalog-prompt update and `0.82` recognition threshold change.
- When `topMatchId` is null but alternatives are present, the API returns those alternatives and the mini program surfaces them instead of a dead-end unsupported page.

- [ ] Replace `touristappid` and prepare the first real upload package.
Acceptance:
- [apps/miniprogram/project.config.json](/Users/shc/Documents/Codex/2026-05-24/ai/apps/miniprogram/project.config.json) uses the real AppID.
- The release checklist in [docs/qa/release-checklist.md](/Users/shc/Documents/Codex/2026-05-24/ai/docs/qa/release-checklist.md) is completed before submission.
