# Vercel H5 Demo Deployment

This is the fastest temporary path for getting a shareable H5 link while Aliyun custom-domain setup and ICP filing are not ready.

## What This Deploys

- Frontend: `apps/web` on Vercel Hobby.
- Backend: the existing Aliyun FC recognition API at `https://gym-equgnitions-uvamokegso.cn-beijing.fcapp.run`.
- Secrets: no AI provider key is placed in Vercel or the frontend bundle.

Use this as a short-term demo URL, not the final mainland-China production entry. Vercel's default domain may be slow or unstable for some users in mainland China.

## Before You Start

1. Make sure the latest code is pushed to GitHub.
2. Make sure the Aliyun FC API still works.
3. Do not choose a Pro trial if Vercel asks for a card. Use the free Hobby project path.

## Vercel Import Settings

When importing `shcccajdiajd/Gym-Equipment-AI` from GitHub:

```text
Framework Preset: Vite
Root Directory: .
Install Command: corepack enable && pnpm install --frozen-lockfile
Build Command: pnpm run build:web:vercel
Output Directory: apps/web/dist
```

The repository also includes [vercel.json](/Users/shc/Documents/Codex/2026-05-24/ai/vercel.json), so Vercel should prefill these values automatically.

## Environment Variables

For the current temporary demo, no Vercel environment variable is required.

The build command uses:

```bash
VITE_API_BASE_URL=https://gym-equgnitions-uvamokegso.cn-beijing.fcapp.run
```

Do not add `ALIYUN_API_KEY`, `OPENAI_API_KEY`, or any model provider key to Vercel frontend environment variables.

## Local Verification

Run this before deploying:

```bash
npm run build:web:vercel
```

Expected result:

- The command exits `0`.
- `apps/web/dist` is generated.
- The built frontend calls the Aliyun FC API, not local `/api`.

## Phone Smoke Test

After Vercel gives a `*.vercel.app` URL:

1. Open the URL in a phone browser.
2. Tap `拍照识别`.
3. Upload a gym-equipment image.
4. Confirm the result page renders a recognized, low-confidence, unsupported, or clear error state.
5. Tap B站, 抖音, 小红书, and 百度 search actions.
6. Try the same link inside WeChat and confirm the browser-open guidance appears.

## Known Tradeoffs

- Vercel is only the temporary public demo entry.
- Some mainland-China networks may open `*.vercel.app` slowly or inconsistently.
- The long-term China-friendly path is still a custom domain on a domestic hosting setup.
