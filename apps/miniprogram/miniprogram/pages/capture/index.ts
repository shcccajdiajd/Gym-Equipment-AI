import {
  buildFallbackNavigationUrl,
  buildRecognitionFailureMessage,
  buildResultNavigationUrl,
  compressImageForRecognition,
  readFileAsBase64,
  recognizeEquipment,
  takeSinglePhoto
} from '../../utils/api.js';

Page({
  async takePhoto() {
    let loadingShown = false;
    wx.showLoading({ title: '识别中' });
    loadingShown = true;

    try {
      const tempImagePath = await takeSinglePhoto();
      const preparedImagePath = await compressImageForRecognition(tempImagePath);
      const imageBase64 = await readFileAsBase64(preparedImagePath);
      const result = await recognizeEquipment(imageBase64, 'camera');

      if (result.equipment?.id && (result.status === 'recognized' || result.status === 'low_confidence')) {
        wx.navigateTo({ url: buildResultNavigationUrl(result.equipment.id, result.status) });
        return;
      }

      if (result.status === 'unsupported') {
        wx.navigateTo({ url: buildFallbackNavigationUrl(result.status) });
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
      const errMsg =
        error instanceof Error && error.message.includes('timeout')
          ? '识别请求超时，请稍后重试'
          : '拍照失败，请重试';

      wx.showToast({ title: errMsg, icon: 'none' });
    } finally {
      if (loadingShown) {
        wx.hideLoading();
      }
    }
  }
});
