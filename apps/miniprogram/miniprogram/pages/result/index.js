"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const catalog_js_1 = require("../../data/catalog.js");
const history_js_1 = require("../../utils/history.js");
const api_js_1 = require("../../utils/api.js");
const result_view_model_js_1 = require("../../utils/result-view-model.js");
Page({
    data: {
        equipment: null,
        unsupported: null,
        showLowConfidence: false,
        primaryMusclesText: '',
        similarEquipmentNames: [],
        suggestedEquipment: []
    },
    onLoad(query) {
        const suggestedEquipment = (0, api_js_1.parseAlternativeIds)(query.alternatives)
            .filter(Boolean)
            .reduce((items, id) => {
            const equipment = (0, catalog_js_1.getEquipmentCard)(id);
            if (equipment) {
                items.push({ id: equipment.id, zhName: equipment.zhName });
            }
            return items;
        }, []);
        if (query.status === 'unsupported') {
            this.setData({
                unsupported: (0, result_view_model_js_1.buildUnsupportedState)(suggestedEquipment.map((item) => item.zhName)),
                suggestedEquipment
            });
            return;
        }
        const equipment = query.id ? (0, catalog_js_1.getEquipmentCard)(query.id) : null;
        if (!equipment) {
            this.setData({
                unsupported: (0, result_view_model_js_1.buildUnsupportedState)([]),
                suggestedEquipment: []
            });
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
            similarEquipmentNames,
            suggestedEquipment: []
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
    },
    chooseSuggestedEquipment(event) {
        const equipmentId = event.currentTarget.dataset.id;
        if (!equipmentId) {
            return;
        }
        wx.navigateTo({ url: `/pages/result/index?id=${encodeURIComponent(equipmentId)}&status=low_confidence` });
    }
});
