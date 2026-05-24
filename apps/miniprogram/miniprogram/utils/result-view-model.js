"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUnsupportedState = buildUnsupportedState;
exports.buildVideoSearchCopy = buildVideoSearchCopy;
function buildUnsupportedState() {
    return {
        title: '这类器械暂未收录',
        actionLabel: '查看支持识别的器械'
    };
}
function buildVideoSearchCopy(video) {
    return `${video.platform}｜${video.title}｜${video.searchQuery}`;
}
