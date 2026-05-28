import {
  buildDemoNavigationUrl,
  buildFallbackNavigationUrl,
  buildMediaFlowFailureMessage,
  buildRecognitionFailureMessage,
  buildResultNavigationUrl,
  chooseSingleImageFromAlbum,
  recognizeImagePathForEquipment
} from '../../utils/api.js';

Page({
  async chooseFromAlbum() {
    let loadingShown = false;

    try {
      const tempFilePath = await chooseSingleImageFromAlbum();
      wx.showLoading({ title: '识别中' });
      loadingShown = true;

      const result = await recognizeImagePathForEquipment(tempFilePath, 'album');

      if (result.equipment?.id && (result.status === 'recognized' || result.status === 'low_confidence')) {
        wx.navigateTo({ url: buildResultNavigationUrl(result.equipment.id, result.status) });
        return;
      }

      if (result.status === 'unsupported') {
        wx.navigateTo({ url: buildFallbackNavigationUrl(result.status, result.alternatives ?? []) });
        return;
      }

      if (result.status === 'timeout' || result.status === 'error' || result.status === 'invalid_request') {
        wx.showToast({
          title: buildRecognitionFailureMessage({
            status: result.status,
            message: result.message
          }),
          icon: 'none'
        });
      }
    } catch (error) {
      const errMsg = buildMediaFlowFailureMessage(error, '导入失败，请重试');

      if (errMsg) {
        wx.showToast({ title: errMsg, icon: 'none' });
      }
    } finally {
      if (loadingShown) {
        wx.hideLoading();
      }
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
