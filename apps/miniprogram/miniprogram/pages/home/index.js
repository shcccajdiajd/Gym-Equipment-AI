"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_js_1 = require("../../utils/api.js");
Page({
    async chooseFromAlbum() {
        var _a;
        let loadingShown = false;
        try {
            const tempFilePath = await (0, api_js_1.chooseSingleImageFromAlbum)();
            wx.showLoading({ title: '识别中' });
            loadingShown = true;
            const preparedImagePath = await (0, api_js_1.compressImageForRecognition)(tempFilePath);
            const imageBase64 = await (0, api_js_1.readFileAsBase64)(preparedImagePath);
            const result = await (0, api_js_1.recognizeEquipment)(imageBase64, 'album');
            if (((_a = result.equipment) === null || _a === void 0 ? void 0 : _a.id) && (result.status === 'recognized' || result.status === 'low_confidence')) {
                wx.navigateTo({ url: (0, api_js_1.buildResultNavigationUrl)(result.equipment.id, result.status) });
                return;
            }
            if (result.status === 'unsupported') {
                wx.navigateTo({ url: (0, api_js_1.buildFallbackNavigationUrl)(result.status) });
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
                : '导入失败，请重试';
            wx.showToast({ title: errMsg, icon: 'none' });
        }
        finally {
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
        wx.navigateTo({ url: (0, api_js_1.buildDemoNavigationUrl)('recognized') });
    },
    openDemoLowConfidence() {
        wx.navigateTo({ url: (0, api_js_1.buildDemoNavigationUrl)('low_confidence') });
    },
    openDemoUnsupported() {
        wx.navigateTo({ url: (0, api_js_1.buildDemoNavigationUrl)('unsupported') });
    }
});
