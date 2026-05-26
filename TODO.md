# TODO

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

## Next Recommended Steps

- [ ] Run the manual smoke test in WeChat Developer Tools.
Acceptance:
- Every item in [docs/qa/manual-smoke-test.md](/Users/shc/Documents/Codex/2026-05-24/ai/docs/qa/manual-smoke-test.md) is checked off by a human.
- Camera capture, album import, clipboard copy, and equipment-list navigation all work in the actual mini program runtime.
- The "去 B 站搜索" button either opens the Bilibili mini program search page or copies the Bilibili mobile search URL on failure.
- The running Aliyun-backed API on `http://127.0.0.1:3001` is used successfully from the mini program during the session.
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
- The preferred launch model is `qwen-vl-max-latest`.
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
