"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const catalog_js_1 = require("../../data/catalog.js");
const history_js_1 = require("../../utils/history.js");
const result_view_model_js_1 = require("../../utils/result-view-model.js");
Page({
    data: {
        equipment: null,
        unsupported: null,
        showLowConfidence: false,
        primaryMusclesText: '',
        similarEquipmentNames: []
    },
    onLoad(query) {
        if (query.status === 'unsupported') {
            this.setData({ unsupported: (0, result_view_model_js_1.buildUnsupportedState)() });
            return;
        }
        const equipment = query.id ? (0, catalog_js_1.getEquipmentCard)(query.id) : null;
        if (!equipment) {
            this.setData({ unsupported: (0, result_view_model_js_1.buildUnsupportedState)() });
            return;
        }
        const similarEquipmentNames = equipment.similarEquipmentIds.reduce((names, itemId) => {
            var _a;
            const similarName = (_a = (0, catalog_js_1.getEquipmentCard)(itemId)) === null || _a === void 0 ? void 0 : _a.zhName;
            if (similarName) {
                names.push(similarName);
            }
            return names;
        }, []);
        (0, history_js_1.pushHistory)(equipment.id);
        this.setData({
            equipment,
            unsupported: null,
            showLowConfidence: query.status === 'low_confidence',
            primaryMusclesText: equipment.primaryMuscles.join('、'),
            similarEquipmentNames
        });
    },
    copyVideoSearch() {
        var _a;
        const equipment = (_a = this.data) === null || _a === void 0 ? void 0 : _a.equipment;
        if (!equipment) {
            return;
        }
        wx.setClipboardData({
            data: (0, result_view_model_js_1.buildVideoSearchCopy)(equipment.videoRecommendation),
            success: () => {
                wx.showToast({ title: '已复制搜索词', icon: 'success' });
            }
        });
    },
    goToEquipmentList() {
        wx.navigateTo({ url: '/pages/equipment-list/index' });
    }
});
