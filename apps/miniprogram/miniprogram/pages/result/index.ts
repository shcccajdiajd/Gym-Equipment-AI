import { getEquipmentCard } from '../../data/catalog.js';
import { pushHistory } from '../../utils/history.js';
import { buildUnsupportedState, buildVideoSearchCopy } from '../../utils/result-view-model.js';

type ResultPageData = {
  equipment: ReturnType<typeof getEquipmentCard>;
  unsupported: ReturnType<typeof buildUnsupportedState> | null;
  showLowConfidence: boolean;
  primaryMusclesText: string;
  similarEquipmentNames: string[];
};

Page({
  data: {
    equipment: null,
    unsupported: null,
    showLowConfidence: false,
    primaryMusclesText: '',
    similarEquipmentNames: []
  } satisfies ResultPageData,

  onLoad(this: MiniProgramPageInstance<ResultPageData>, query: Record<string, string | undefined>) {
    if (query.status === 'unsupported') {
      this.setData({ unsupported: buildUnsupportedState() });
      return;
    }

    const equipment = query.id ? getEquipmentCard(query.id) : null;
    if (!equipment) {
      this.setData({ unsupported: buildUnsupportedState() });
      return;
    }

    const similarEquipmentNames = equipment.similarEquipmentIds.reduce<string[]>((names, itemId) => {
      const similarName = getEquipmentCard(itemId)?.zhName;
      if (similarName) {
        names.push(similarName);
      }

      return names;
    }, []);

    pushHistory(equipment.id);
    this.setData({
      equipment,
      unsupported: null,
      showLowConfidence: query.status === 'low_confidence',
      primaryMusclesText: equipment.primaryMuscles.join('、'),
      similarEquipmentNames
    });
  },

  copyVideoSearch(this: MiniProgramPageInstance<ResultPageData>) {
    const equipment = this.data?.equipment;
    if (!equipment) {
      return;
    }

    wx.setClipboardData({
      data: buildVideoSearchCopy(equipment.videoRecommendation),
      success: () => {
        wx.showToast({ title: '已复制搜索词', icon: 'success' });
      }
    });
  },

  goToEquipmentList() {
    wx.navigateTo({ url: '/pages/equipment-list/index' });
  }
});
