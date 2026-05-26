"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BILIBILI_MINI_PROGRAM_APP_ID = void 0;
exports.buildBilibiliMiniProgramSearchPath = buildBilibiliMiniProgramSearchPath;
exports.buildBilibiliWebSearchUrl = buildBilibiliWebSearchUrl;
exports.BILIBILI_MINI_PROGRAM_APP_ID = 'wx7564fd5313d24844';
function buildBilibiliMiniProgramSearchPath(query) {
    return `pages/search/search?keyword=${encodeURIComponent(query)}`;
}
function buildBilibiliWebSearchUrl(query) {
    return `https://m.bilibili.com/search?keyword=${encodeURIComponent(query)}`;
}
