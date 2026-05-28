export type RecognitionStatus = 'recognized' | 'low_confidence' | 'unsupported';
export type RecognitionFailureStatus = 'timeout' | 'error' | 'invalid_request';
export type RecognitionApiStatus = RecognitionStatus | RecognitionFailureStatus;

export type DemoRecognitionMode = RecognitionStatus;

export type RecognitionPayload = {
  status: RecognitionApiStatus;
  equipment?: {
    id: string;
  };
  confidence?: number;
  alternatives?: string[];
  message?: string;
};

const REQUEST_TIMEOUT_MS = 180000;
const GENERIC_RECOGNITION_ERROR_MESSAGE = '识别服务暂时不可用，请稍后重试。';

type RecognitionHttpResponse = {
  statusCode: number;
  data?: Partial<RecognitionPayload> & {
    error?: string;
  };
};

function getApiBaseUrls() {
  const globalData = getApp<IAppOption>().globalData;
  return globalData.apiBaseUrls?.length ? globalData.apiBaseUrls : [globalData.apiBaseUrl];
}

export function buildRecognitionRequestUrls(apiBaseUrls: string[]) {
  return apiBaseUrls.map((apiBaseUrl) => `${apiBaseUrl}/api/recognitions`);
}

function requestRecognition(
  url: string,
  imageBase64: string,
  source: 'camera' | 'album'
): Promise<RecognitionPayload> {
  return new Promise((resolve, reject) => {
    wx.request<RecognitionPayload>({
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

export function buildResultNavigationUrl(id: string, status: RecognitionStatus = 'recognized') {
  const baseUrl = `/pages/result/index?id=${encodeURIComponent(id)}`;
  if (status === 'recognized') {
    return baseUrl;
  }

  return `${baseUrl}&status=${encodeURIComponent(status)}`;
}

export function buildFallbackNavigationUrl(status: RecognitionStatus, alternatives: string[] = []) {
  const baseUrl = `/pages/result/index?status=${encodeURIComponent(status)}`;
  if (alternatives.length === 0) {
    return baseUrl;
  }

  return `${baseUrl}&alternatives=${encodeURIComponent(alternatives.join(','))}`;
}

export function parseAlternativeIds(value: string | undefined) {
  if (!value) {
    return [];
  }

  return decodeURIComponent(value)
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export function buildDemoNavigationUrl(mode: DemoRecognitionMode) {
  if (mode === 'unsupported') {
    return buildFallbackNavigationUrl(mode);
  }

  if (mode === 'low_confidence') {
    return buildResultNavigationUrl('lat-pulldown', 'low_confidence');
  }

  return buildResultNavigationUrl('lat-pulldown');
}

export function buildRecognitionFailureMessage(result: {
  status: RecognitionFailureStatus;
  message?: string;
}) {
  if (result.status === 'timeout') {
    return result.message ?? '识别服务响应超时，请稍后重试或换一张更清晰的图片。';
  }

  if (result.status === 'invalid_request') {
    return result.message ?? '图片处理失败，请换一张更清晰的图片再试。';
  }

  return result.message ?? '识别服务暂时不可用，请稍后重试。';
}

function extractCallbackErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'errMsg' in error) {
    return String((error as WechatMiniprogram.GeneralCallbackResult).errMsg);
  }

  return '';
}

export function buildMediaFlowFailureMessage(error: unknown, fallbackMessage: string) {
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

export function normalizeRecognitionResponse(response: RecognitionHttpResponse): RecognitionPayload {
  const data = response.data;

  if (data?.status) {
    return data as RecognitionPayload;
  }

  if (response.statusCode >= 400) {
    return {
      status: 'error',
      message: data?.message ?? data?.error ?? GENERIC_RECOGNITION_ERROR_MESSAGE
    };
  }

  return {
    status: 'error',
    message: GENERIC_RECOGNITION_ERROR_MESSAGE
  };
}

export async function recognizeEquipment(
  imageBase64: string,
  source: 'camera' | 'album'
): Promise<RecognitionPayload> {
  const urls = buildRecognitionRequestUrls(getApiBaseUrls());
  let lastError: WechatMiniprogram.GeneralCallbackResult | undefined;

  for (const url of urls) {
    try {
      return await requestRecognition(url, imageBase64, source);
    } catch (error) {
      lastError = error as WechatMiniprogram.GeneralCallbackResult;
    }
  }

  throw lastError ?? new Error('recognition request failed');
}

export async function compressImageForRecognition(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: path,
      quality: 72,
      success: (result) => resolve(result.tempFilePath),
      fail: () => resolve(path)
    });
  });
}

export async function readFileAsBase64(path: string): Promise<string> {
  const fileSystemManager = wx.getFileSystemManager();

  return new Promise((resolve, reject) => {
    fileSystemManager.readFile({
      filePath: path,
      encoding: 'base64',
      success: (result) => resolve(result.data as string),
      fail: reject
    });
  });
}

export async function chooseSingleImageFromAlbum(): Promise<string> {
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

export async function takeSinglePhoto(): Promise<string> {
  const cameraContext = wx.createCameraContext();

  return new Promise((resolve, reject) => {
    cameraContext.takePhoto({
      quality: 'high',
      success: (photo) => resolve(photo.tempImagePath),
      fail: reject
    });
  });
}
