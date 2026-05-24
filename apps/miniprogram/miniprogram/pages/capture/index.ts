import {
  buildFallbackNavigationUrl,
  buildResultNavigationUrl,
  readFileAsBase64,
  recognizeEquipment,
  takeSinglePhoto
} from '../../utils/api.js';

Page({
  async takePhoto() {
    wx.showLoading({ title: '识别中' });

    try {
      const tempImagePath = await takeSinglePhoto();
      const imageBase64 = await readFileAsBase64(tempImagePath);
      const result = await recognizeEquipment(imageBase64, 'camera');

      if (result.equipment?.id) {
        wx.navigateTo({ url: buildResultNavigationUrl(result.equipment.id) });
        return;
      }

      wx.navigateTo({ url: buildFallbackNavigationUrl(result.status) });
    } catch {
      wx.showToast({ title: '拍照失败，请重试', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});
