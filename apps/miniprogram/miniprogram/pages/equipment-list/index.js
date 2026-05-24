"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const catalog_js_1 = require("../../data/catalog.js");
const api_js_1 = require("../../utils/api.js");
Page({
    data: {
        equipmentList: catalog_js_1.equipmentCatalog
    },
    openResult(event) {
        const id = event.currentTarget.dataset.id;
        wx.navigateTo({ url: (0, api_js_1.buildResultNavigationUrl)(id) });
    }
});
