"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_js_1 = require("../../utils/api.js");
Page({
    async takePhoto() {
        var _a, _b;
        let loadingShown = false;
        wx.showLoading({ title: '识别中' });
        loadingShown = true;
        try {
            const tempImagePath = await (0, api_js_1.takeSinglePhoto)();
            const preparedImagePath = await (0, api_js_1.compressImageForRecognition)(tempImagePath);
            const imageBase64 = await (0, api_js_1.readFileAsBase64)(preparedImagePath);
            const result = await (0, api_js_1.recognizeEquipment)(imageBase64, 'camera');
            if (((_a = result.equipment) === null || _a === void 0 ? void 0 : _a.id) && (result.status === 'recognized' || result.status === 'low_confidence')) {
                wx.navigateTo({ url: (0, api_js_1.buildResultNavigationUrl)(result.equipment.id, result.status) });
                return;
            }
            if (result.status === 'unsupported') {
                wx.navigateTo({ url: (0, api_js_1.buildFallbackNavigationUrl)(result.status, (_b = result.alternatives) !== null && _b !== void 0 ? _b : []) });
                return;
            }
            if (result.status === 'timeout' || result.status === 'error' || result.status === 'invalid_request') {
                wx.showToast({
                    title: (0, api_js_1.buildRecognitionFailureMessage)({
                        status: result.status,
                        message: result.message
                    }),
                    icon: 'none'
                });
            }
        }
        catch (error) {
            const errMsg = error instanceof Error && error.message.includes('timeout')
                ? '识别请求超时，请稍后重试'
                : '拍照失败，请重试';
            wx.showToast({ title: errMsg, icon: 'none' });
        }
        finally {
            if (loadingShown) {
                wx.hideLoading();
            }
        }
    }
});
