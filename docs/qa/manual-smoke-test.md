# Manual Smoke Test

## Environment

- API running on `http://127.0.0.1:3001`
- WeChat Developer Tools opened on `apps/miniprogram`
- `RECOGNIZER_PROVIDER=aliyun`
- `ALIYUN_API_KEY` populated in `services/api/.env`
- Catalog synced with `corepack pnpm sync:catalog`

## Checks

1. Open the home page and confirm you can see `拍照识别器械`, `从相册导入`, and `查看支持识别的器械`.
2. Confirm the home page also shows a `开发联调 Demo` card with three buttons for `模拟识别成功`、`模拟低置信度`、`模拟暂未收录`.
3. Tap `模拟识别成功` and confirm the result page shows `高位下拉`.
4. Return home and tap `模拟低置信度`, then confirm the result page shows the low-confidence warning card.
5. Return home and tap `模拟暂未收录`, then confirm the fallback state shows `这类器械暂未收录`.
6. Tap `查看支持识别的器械` and confirm the list contains `坐姿推胸机` and `高位下拉`.
7. Return home and use album import with one real supported machine photo.
8. Confirm the result page opens as either:
   - a recognized result
   - a low-confidence result
   - or an unsupported result with a readable fallback
9. Use the same `蝴蝶机夹胸` image that previously failed.
10. Confirm the result is no longer a confident wrong match such as `坐姿划船`.
11. If the result is unsupported, confirm the page still renders a readable fallback instead of a broken or blank page.
12. Open a recognized result page and tap `复制视频搜索词`.
13. Confirm a toast appears and the clipboard contains the platform, title, and search query string.
14. Re-open a known equipment from the equipment list and confirm the result page still renders.

## Notes

- If camera capture is not available on the current machine, complete the recognized-state checks through album import.
- For launch validation, prioritize the Aliyun-backed path over the local Ollama path.
