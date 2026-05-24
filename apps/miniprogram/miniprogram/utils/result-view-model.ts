type VideoRecommendation = {
  platform: string;
  title: string;
  searchQuery: string;
};

export function buildUnsupportedState() {
  return {
    title: '这类器械暂未收录',
    actionLabel: '查看支持识别的器械'
  };
}

export function buildVideoSearchCopy(video: VideoRecommendation) {
  return `${video.platform}｜${video.title}｜${video.searchQuery}`;
}
