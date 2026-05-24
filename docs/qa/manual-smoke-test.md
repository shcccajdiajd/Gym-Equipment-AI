# Manual Smoke Test

## Environment

- API running on `http://127.0.0.1:3001`
- WeChat Developer Tools opened on `apps/miniprogram`
- `RECOGNIZER_PROVIDER=mock`
- Catalog synced with `corepack pnpm sync:catalog`

## Checks

1. Open the home page and confirm you can see `拍照识别器械`, `从相册导入`, and `查看支持识别的器械`.
2. Tap `查看支持识别的器械` and confirm the list contains `坐姿推胸机` and `高位下拉`.
3. Return home, open camera capture, and take a test photo whose mock payload includes the word `back`.
4. Confirm the result page shows `高位下拉` and the low-confidence warning is hidden for a clean recognized case.
5. Return home, use album import with a mock payload containing the word `legs`, and confirm the result page shows `腿举机`.
6. Use album import again with a mock payload containing no known keyword.
7. Confirm the result page shows `这类器械暂未收录`.
8. Open a recognized result page and tap `复制视频搜索词`.
9. Confirm a toast appears and the clipboard contains the platform, title, and search query string.
10. Re-open a known equipment from the equipment list and confirm the result page still renders.

## Notes

- The mock recognizer keys off decoded payload text such as `chest`, `back`, and `legs`.
- If camera capture is not available on the current machine, complete the recognized-state checks through album import.
