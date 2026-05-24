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

- [ ] Implement Task 5: result page, supported equipment list, and local history helpers.
Acceptance:
- Result page supports recognized, low-confidence, and unsupported states.
- Equipment list page can open known equipment detail pages.
- Mini program tests/typecheck pass for this phase.
- Local history captures recent recognitions without blocking the primary flow.

- [ ] Update `PROGRESS.md` and `TODO.md`, then create a git commit for the result/browsing phase.
Acceptance:
- Both files reflect the new state accurately.
- A new commit is created after the phase is verified.

## Phase 4: Finish Docs And QA Flow

- [ ] Implement Task 6: root README, manual smoke test doc, and release checklist.
Acceptance:
- `README.md` exists and describes setup, development, and release flow.
- `docs/qa/manual-smoke-test.md` exists with concrete manual checks.
- Relevant verification commands pass.

- [ ] Update `PROGRESS.md` and `TODO.md`, then create a git commit for the docs/QA phase.
Acceptance:
- Both files reflect the final state accurately.
- A new commit is created after the phase is verified.

## Phase 5: Final Cleanup

- [ ] Revisit root Vitest configuration so it stops relying on the deprecated workspace-file pattern.
Acceptance:
- Root/shared Vitest invocation still passes after the config migration.
- Root test configuration no longer relies on the deprecated workspace-file pattern.

- [ ] Run a final end-to-end verification sweep.
Acceptance:
- Shared package typecheck passes.
- API package typecheck passes.
- API recognitions test suite passes.
- Mini program package typecheck/tests pass for the implemented scope.
