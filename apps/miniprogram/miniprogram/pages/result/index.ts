import { getEquipmentCard } from '../../data/catalog.js';
import { pushHistory } from '../../utils/history.js';
import { buildUnsupportedState, buildVideoSearchCopy } from '../../utils/result-view-model.js';

type ResultPageData = {
  equipment: ReturnType<typeof getEquipmentCard>;
  unsupported: ReturnType<typeof buildUnsupportedState> | null;
  showLowConfidence: boolean;
  primaryMusclesText: string;
  similarEquipmentNames: string[];
  suggestedEquipment: Array<{ id: string; zhName: string }>;
};

Page({
  data: {
    equipment: null,
    unsupported: null,
    showLowConfidence: false,
    primaryMusclesText: '',
    similarEquipmentNames: [],
    suggestedEquipment: []
  } satisfies ResultPageData,

  onLoad(this: MiniProgramPageInstance<ResultPageData>, query: Record<string, string | undefined>) {
    const suggestedEquipment = (query.alternatives ?? '')
      .split(',')
      .map((id) => decodeURIComponent(id).trim())
      .filter(Boolean)
      .reduce<Array<{ id: string; zhName: string }>>((items, id) => {
        const equipment = getEquipmentCard(id);
        if (equipment) {
          items.push({ id: equipment.id, zhName: equipment.zhName });
        }

        return items;
      }, []);

    if (query.status === 'unsupported') {
      this.setData({
        unsupported: buildUnsupportedState(suggestedEquipment.map((item) => item.zhName)),
        suggestedEquipment
      });
      return;
    }

    const equipment = query.id ? getEquipmentCard(query.id) : null;
    if (!equipment) {
      this.setData({
        unsupported: buildUnsupportedState([]),
        suggestedEquipment: []
      });
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
      similarEquipmentNames,
      suggestedEquipment: []
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
  },

  chooseSuggestedEquipment(
    this: MiniProgramPageInstance<ResultPageData>,
    event: WechatMiniprogram.BaseEvent
  ) {
    const equipmentId = (event.currentTarget.dataset as { id?: string }).id;
    if (!equipmentId) {
      return;
    }

    wx.navigateTo({ url: `/pages/result/index?id=${encodeURIComponent(equipmentId)}&status=low_confidence` });
  }
});
