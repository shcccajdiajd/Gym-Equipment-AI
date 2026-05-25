"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUnsupportedState = buildUnsupportedState;
exports.buildVideoSearchCopy = buildVideoSearchCopy;
function buildUnsupportedState(suggestions) {
    if (suggestions.length > 0) {
        return {
            title: '暂时没法完全确定这台器械',
            summary: '它更像下面这些已收录器械，你可以点一个最像的继续看教学。',
            suggestionTitle: '你看到的可能是',
            actionLabel: '查看支持识别的器械'
        };
    }
    return {
        title: '这类器械暂未收录',
        summary: '你可以先从已支持的固定器械里继续找，避免搜错教程。',
        suggestionTitle: '',
        actionLabel: '查看支持识别的器械'
    };
}
function buildVideoSearchCopy(video) {
    return `${video.platform}｜${video.title}｜${video.searchQuery}`;
}
