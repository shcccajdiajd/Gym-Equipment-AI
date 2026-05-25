# Release Checklist

## Before Upload

1. Confirm the mini program AppID is no longer `touristappid`.
2. Verify `services/api/.env` uses `RECOGNIZER_PROVIDER=openai`, a real `OPENAI_API_KEY`, and production-safe secrets handling.
3. Re-run `corepack pnpm sync:catalog` so the mini program snapshot matches the shared catalog.
4. Run `corepack pnpm test`.
5. Run `corepack pnpm typecheck`.
6. Complete every item in [manual-smoke-test.md](/Users/shc/Documents/Codex/2026-05-24/ai/docs/qa/manual-smoke-test.md).

## Content Review

1. Spot-check the 20 supported equipment cards for Chinese naming, English naming, and muscle-group accuracy.
2. Review adjustment, safety, and common-error copy for beginner-friendly wording.
3. Verify every recommended video search string still matches the intended equipment and movement.

## Upload And Aftercare

1. Build and upload through WeChat Developer Tools.
2. Review the submission metadata, category selection, and screenshots before submitting for review.
3. After release, test one real recognition flow from home page to result page on a real device.
