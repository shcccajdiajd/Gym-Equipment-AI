import {
  buildFallbackNavigationUrl,
  buildMediaFlowFailureMessage,
  buildRecognitionFailureMessage,
  buildResultNavigationUrl,
  recognizeImagePathForEquipment,
  takeSinglePhoto
} from '../../utils/api.js';

Page({
  async takePhoto() {
    let loadingShown = false;
    wx.showLoading({ title: '识别中' });
    loadingShown = true;

    try {
      const tempImagePath = await takeSinglePhoto();
      const result = await recognizeImagePathForEquipment(tempImagePath, 'camera');

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
      const errMsg = buildMediaFlowFailureMessage(error, '拍照失败，请重试');

      if (errMsg) {
        wx.showToast({ title: errMsg, icon: 'none' });
      }
    } finally {
      if (loadingShown) {
        wx.hideLoading();
      }
    }
  }
});
