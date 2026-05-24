import { equipmentCatalog } from '../../data/catalog.js';
import { buildResultNavigationUrl } from '../../utils/api.js';

Page({
  data: {
    equipmentList: equipmentCatalog
  },

  openResult(event: WechatMiniprogram.BaseEvent) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: buildResultNavigationUrl(id) });
  }
});
