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

function getApiBaseUrl() {
  return getApp<IAppOption>().globalData.apiBaseUrl;
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

export async function recognizeEquipment(
  imageBase64: string,
  source: 'camera' | 'album'
): Promise<RecognitionPayload> {
  return new Promise((resolve, reject) => {
    wx.request<RecognitionPayload>({
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

export async function compressImageForRecognition(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: path,
      quality: 72,
      success: (result) => resolve(result.tempFilePath),
      fail: reject
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
