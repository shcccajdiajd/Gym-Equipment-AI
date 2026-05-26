import { getEquipmentCard } from '../../data/catalog.js';
import { pushHistory } from '../../utils/history.js';
import { parseAlternativeIds } from '../../utils/api.js';
import {
  BILIBILI_MINI_PROGRAM_APP_ID,
  buildBilibiliMiniProgramSearchPath,
  buildBilibiliWebSearchUrl
} from '../../utils/platform-search.js';
import { buildUnsupportedState, buildVideoSearchCopy } from '../../utils/result-view-model.js';

type ResultPageData = {
  equipment: ReturnType<typeof getEquipmentCard>;
  unsupported: ReturnType<typeof buildUnsupportedState> | null;
  showLowConfidence: boolean;
  primaryMusclesText: string;
  similarEquipmentNames: string[];
  suggestedEquipment: Array<{ id: string; zhName: string }>;
  bilibiliSearchQuery: string;
};

Page({
  data: {
    equipment: null,
    unsupported: null,
    showLowConfidence: false,
    primaryMusclesText: '',
    similarEquipmentNames: [],
    suggestedEquipment: [],
    bilibiliSearchQuery: ''
  } satisfies ResultPageData,

  onLoad(this: MiniProgramPageInstance<ResultPageData>, query: Record<string, string | undefined>) {
    const suggestedEquipment = parseAlternativeIds(query.alternatives)
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
      suggestedEquipment: [],
      bilibiliSearchQuery: equipment.videoRecommendation.searchQuery
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

  openBilibiliSearch(this: MiniProgramPageInstance<ResultPageData>) {
    const searchQuery = this.data?.bilibiliSearchQuery;
    if (!searchQuery) {
      return;
    }

    wx.navigateToMiniProgram({
      appId: BILIBILI_MINI_PROGRAM_APP_ID,
      path: buildBilibiliMiniProgramSearchPath(searchQuery),
      envVersion: 'release',
      fail: () => {
        wx.setClipboardData({
          data: buildBilibiliWebSearchUrl(searchQuery),
          success: () => {
            wx.showToast({ title: '已复制B站搜索链接', icon: 'none' });
          }
        });
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
