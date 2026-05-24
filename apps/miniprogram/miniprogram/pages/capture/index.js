"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_js_1 = require("../../utils/api.js");
Page({
    async takePhoto() {
        var _a;
        wx.showLoading({ title: '识别中' });
        try {
            const tempImagePath = await (0, api_js_1.takeSinglePhoto)();
            const imageBase64 = await (0, api_js_1.readFileAsBase64)(tempImagePath);
            const result = await (0, api_js_1.recognizeEquipment)(imageBase64, 'camera');
            if ((_a = result.equipment) === null || _a === void 0 ? void 0 : _a.id) {
                wx.navigateTo({ url: (0, api_js_1.buildResultNavigationUrl)(result.equipment.id) });
                return;
            }
            wx.navigateTo({ url: (0, api_js_1.buildFallbackNavigationUrl)(result.status) });
        }
        catch {
            wx.showToast({ title: '拍照失败，请重试', icon: 'none' });
        }
        finally {
            wx.hideLoading();
        }
    }
});
