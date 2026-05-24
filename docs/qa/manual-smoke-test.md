# Manual Smoke Test

## Environment

- API running on `http://127.0.0.1:3001`
- WeChat Developer Tools opened on `apps/miniprogram`
- `RECOGNIZER_PROVIDER=mock`
- Catalog synced with `corepack pnpm sync:catalog`

## Checks

1. Open the home page and confirm you can see `拍照识别器械`, `从相册导入`, and `查看支持识别的器械`.
2. Confirm the home page also shows a `开发联调 Demo` card with three buttons for `模拟识别成功`、`模拟低置信度`、`模拟暂未收录`.
3. Tap `模拟识别成功` and confirm the result page shows `高位下拉`.
4. Return home and tap `模拟低置信度`, then confirm the result page shows the low-confidence warning card.
5. Return home and tap `模拟暂未收录`, then confirm the fallback state shows `这类器械暂未收录`.
6. Tap `查看支持识别的器械` and confirm the list contains `坐姿推胸机` and `高位下拉`.
7. Return home, open camera capture, and take a test photo whose mock payload includes the word `back`.
8. Confirm the result page shows `高位下拉` and the low-confidence warning is hidden for a clean recognized case.
9. Return home, use album import with a mock payload containing the word `legs`, and confirm the result page shows `腿举机`.
10. Use album import again with a mock payload containing no known keyword.
11. Confirm the result page shows `这类器械暂未收录`.
12. Open a recognized result page and tap `复制视频搜索词`.
13. Confirm a toast appears and the clipboard contains the platform, title, and search query string.
14. Re-open a known equipment from the equipment list and confirm the result page still renders.

## Notes

- The mock recognizer keys off decoded payload text such as `chest`, `back`, and `legs`.
- If camera capture is not available on the current machine, complete the recognized-state checks through album import.
