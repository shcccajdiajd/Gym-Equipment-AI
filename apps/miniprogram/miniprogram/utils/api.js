"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildResultNavigationUrl = buildResultNavigationUrl;
exports.buildFallbackNavigationUrl = buildFallbackNavigationUrl;
exports.buildDemoNavigationUrl = buildDemoNavigationUrl;
exports.recognizeEquipment = recognizeEquipment;
exports.readFileAsBase64 = readFileAsBase64;
exports.chooseSingleImageFromAlbum = chooseSingleImageFromAlbum;
exports.takeSinglePhoto = takeSinglePhoto;
function getApiBaseUrl() {
    return getApp().globalData.apiBaseUrl;
}
function buildResultNavigationUrl(id) {
    return `/pages/result/index?id=${encodeURIComponent(id)}`;
}
function buildFallbackNavigationUrl(status) {
    return `/pages/result/index?status=${encodeURIComponent(status)}`;
}
function buildDemoNavigationUrl(mode) {
    if (mode === 'unsupported') {
        return buildFallbackNavigationUrl(mode);
    }
    if (mode === 'low_confidence') {
        return `${buildResultNavigationUrl('lat-pulldown')}&status=low_confidence`;
    }
    return buildResultNavigationUrl('lat-pulldown');
}
async function recognizeEquipment(imageBase64, source) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${getApiBaseUrl()}/api/recognitions`,
            method: 'POST',
            data: {
                imageBase64,
                source
            },
            success: (response) => resolve(response.data),
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
