"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecognitionRequestUrls = buildRecognitionRequestUrls;
exports.buildResultNavigationUrl = buildResultNavigationUrl;
exports.buildFallbackNavigationUrl = buildFallbackNavigationUrl;
exports.parseAlternativeIds = parseAlternativeIds;
exports.buildDemoNavigationUrl = buildDemoNavigationUrl;
exports.buildRecognitionFailureMessage = buildRecognitionFailureMessage;
exports.buildMediaFlowFailureMessage = buildMediaFlowFailureMessage;
exports.normalizeRecognitionResponse = normalizeRecognitionResponse;
exports.recognizeEquipment = recognizeEquipment;
exports.compressImageForRecognition = compressImageForRecognition;
exports.readFileAsBase64 = readFileAsBase64;
exports.chooseSingleImageFromAlbum = chooseSingleImageFromAlbum;
exports.takeSinglePhoto = takeSinglePhoto;
const REQUEST_TIMEOUT_MS = 180000;
const GENERIC_RECOGNITION_ERROR_MESSAGE = '识别服务暂时不可用，请稍后重试。';
function getApiBaseUrls() {
    var _a;
    const globalData = getApp().globalData;
    return ((_a = globalData.apiBaseUrls) === null || _a === void 0 ? void 0 : _a.length) ? globalData.apiBaseUrls : [globalData.apiBaseUrl];
}
function buildRecognitionRequestUrls(apiBaseUrls) {
    return apiBaseUrls.map((apiBaseUrl) => `${apiBaseUrl}/api/recognitions`);
}
function requestRecognition(url, imageBase64, source) {
    return new Promise((resolve, reject) => {
        wx.request({
            url,
            method: 'POST',
            timeout: REQUEST_TIMEOUT_MS,
            data: {
                imageBase64,
                source
            },
            success: (response) => resolve(normalizeRecognitionResponse(response)),
            fail: reject
        });
    });
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
function extractCallbackErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'object' && error !== null && 'errMsg' in error) {
        return String(error.errMsg);
    }
    return '';
}
function buildMediaFlowFailureMessage(error, fallbackMessage) {
    const message = extractCallbackErrorMessage(error);
    if (message.includes('cancel')) {
        return '';
    }
    if (message.includes('timeout')) {
        return '识别请求超时，请确认 API 服务正在运行';
    }
    if (message.includes('request:fail')) {
        return '识别服务连接失败，请检查 API 服务';
    }
    if (message.includes('readFile')) {
        return '图片读取失败，请换一张图片再试';
    }
    return fallbackMessage;
}
function normalizeRecognitionResponse(response) {
    var _a, _b;
    const data = response.data;
    if (data === null || data === void 0 ? void 0 : data.status) {
        return data;
    }
    if (response.statusCode >= 400) {
        return {
            status: 'error',
            message: (_b = (_a = data === null || data === void 0 ? void 0 : data.message) !== null && _a !== void 0 ? _a : data === null || data === void 0 ? void 0 : data.error) !== null && _b !== void 0 ? _b : GENERIC_RECOGNITION_ERROR_MESSAGE
        };
    }
    return {
        status: 'error',
        message: GENERIC_RECOGNITION_ERROR_MESSAGE
    };
}
async function recognizeEquipment(imageBase64, source) {
    const urls = buildRecognitionRequestUrls(getApiBaseUrls());
    let lastError;
    for (const url of urls) {
        try {
            return await requestRecognition(url, imageBase64, source);
        }
        catch (error) {
            lastError = error;
        }
    }
    throw lastError !== null && lastError !== void 0 ? lastError : new Error('recognition request failed');
}
async function compressImageForRecognition(path) {
    return new Promise((resolve, reject) => {
        wx.compressImage({
            src: path,
            quality: 72,
            success: (result) => resolve(result.tempFilePath),
            fail: () => resolve(path)
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
