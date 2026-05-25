"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildResultNavigationUrl = buildResultNavigationUrl;
exports.buildFallbackNavigationUrl = buildFallbackNavigationUrl;
exports.parseAlternativeIds = parseAlternativeIds;
exports.buildDemoNavigationUrl = buildDemoNavigationUrl;
exports.buildRecognitionFailureMessage = buildRecognitionFailureMessage;
exports.recognizeEquipment = recognizeEquipment;
exports.compressImageForRecognition = compressImageForRecognition;
exports.readFileAsBase64 = readFileAsBase64;
exports.chooseSingleImageFromAlbum = chooseSingleImageFromAlbum;
exports.takeSinglePhoto = takeSinglePhoto;
const REQUEST_TIMEOUT_MS = 180000;
function getApiBaseUrl() {
    return getApp().globalData.apiBaseUrl;
}
function buildResultNavigationUrl(id, status = 'recognized') {
    const baseUrl = `/pages/result/index?id=${encodeURIComponent(id)}`;
    if (status === 'recognized') {
        return baseUrl;
    }
    return `${baseUrl}&status=${encodeURIComponent(status)}`;
}
function buildFallbackNavigationUrl(status, alternatives = []) {
    const baseUrl = `/pages/result/index?status=${encodeURIComponent(status)}`;
    if (alternatives.length === 0) {
        return baseUrl;
    }
    return `${baseUrl}&alternatives=${encodeURIComponent(alternatives.join(','))}`;
}
function parseAlternativeIds(value) {
    if (!value) {
        return [];
    }
    return decodeURIComponent(value)
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
}
function buildDemoNavigationUrl(mode) {
    if (mode === 'unsupported') {
        return buildFallbackNavigationUrl(mode);
    }
    if (mode === 'low_confidence') {
        return buildResultNavigationUrl('lat-pulldown', 'low_confidence');
    }
    return buildResultNavigationUrl('lat-pulldown');
}
function buildRecognitionFailureMessage(result) {
    var _a, _b, _c;
    if (result.status === 'timeout') {
        return (_a = result.message) !== null && _a !== void 0 ? _a : '识别服务响应超时，请稍后重试或换一张更清晰的图片。';
    }
    if (result.status === 'invalid_request') {
        return (_b = result.message) !== null && _b !== void 0 ? _b : '图片处理失败，请换一张更清晰的图片再试。';
    }
    return (_c = result.message) !== null && _c !== void 0 ? _c : '识别服务暂时不可用，请稍后重试。';
}
async function recognizeEquipment(imageBase64, source) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${getApiBaseUrl()}/api/recognitions`,
            method: 'POST',
            timeout: REQUEST_TIMEOUT_MS,
            data: {
                imageBase64,
                source
            },
            success: (response) => resolve(response.data),
            fail: reject
        });
    });
}
async function compressImageForRecognition(path) {
    return new Promise((resolve, reject) => {
        wx.compressImage({
            src: path,
            quality: 72,
            success: (result) => resolve(result.tempFilePath),
            fail: reject
        });
    });
}
async function readFileAsBase64(path) {
    const fileSystemManager = wx.getFileSystemManager();
    return new Promise((resolve, reject) => {
        fileSystemManager.readFile({
            filePath: path,
            encoding: 'base64',
            success: (result) => resolve(result.data),
            fail: reject
        });
    });
}
async function chooseSingleImageFromAlbum() {
    return new Promise((resolve, reject) => {
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album'],
            success: (media) => resolve(media.tempFiles[0].tempFilePath),
            fail: reject
        });
    });
}
async function takeSinglePhoto() {
    const cameraContext = wx.createCameraContext();
    return new Promise((resolve, reject) => {
        cameraContext.takePhoto({
            quality: 'high',
            success: (photo) => resolve(photo.tempImagePath),
            fail: reject
        });
    });
}
