"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readHistory = readHistory;
exports.pushHistory = pushHistory;
const HISTORY_KEY = 'equipment-history';
function readHistory() {
    return wx.getStorageSync(HISTORY_KEY) || [];
}
function pushHistory(id) {
    const current = readHistory().filter((item) => item !== id);
    const next = [id, ...current].slice(0, 10);
    wx.setStorageSync(HISTORY_KEY, next);
}
