import {
  buildDemoNavigationUrl,
  buildFallbackNavigationUrl,
  buildResultNavigationUrl,
  chooseSingleImageFromAlbum,
  readFileAsBase64,
  recognizeEquipment
} from '../../utils/api.js';

Page({
  async chooseFromAlbum() {
    try {
      const tempFilePath = await chooseSingleImageFromAlbum();
      wx.showLoading({ title: '识别中' });

      const imageBase64 = await readFileAsBase64(tempFilePath);
      const result = await recognizeEquipment(imageBase64, 'album');

      if (result.equipment?.id) {
        wx.navigateTo({ url: buildResultNavigationUrl(result.equipment.id) });
        return;
      }

      wx.navigateTo({ url: buildFallbackNavigationUrl(result.status) });
    } catch {
      wx.showToast({ title: '导入失败，请重试', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  goToCapture() {
    wx.navigateTo({ url: '/pages/capture/index' });
  },

  goToEquipmentList() {
    wx.navigateTo({ url: '/pages/equipment-list/index' });
  },

  openDemoRecognized() {
    wx.navigateTo({ url: buildDemoNavigationUrl('recognized') });
  },

  openDemoLowConfidence() {
    wx.navigateTo({ url: buildDemoNavigationUrl('low_confidence') });
  },

  openDemoUnsupported() {
    wx.navigateTo({ url: buildDemoNavigationUrl('unsupported') });
  }
});
