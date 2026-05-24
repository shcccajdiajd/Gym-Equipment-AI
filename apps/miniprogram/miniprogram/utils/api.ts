export type RecognitionStatus = 'recognized' | 'low_confidence' | 'unsupported';

export type DemoRecognitionMode = RecognitionStatus;

export type RecognitionPayload = {
  status: RecognitionStatus;
  equipment?: {
    id: string;
  };
  confidence?: number;
  alternatives?: string[];
  message?: string;
};

function getApiBaseUrl() {
  return getApp<IAppOption>().globalData.apiBaseUrl;
}

export function buildResultNavigationUrl(id: string) {
  return `/pages/result/index?id=${encodeURIComponent(id)}`;
}

export function buildFallbackNavigationUrl(status: RecognitionStatus) {
  return `/pages/result/index?status=${encodeURIComponent(status)}`;
}

export function buildDemoNavigationUrl(mode: DemoRecognitionMode) {
  if (mode === 'unsupported') {
    return buildFallbackNavigationUrl(mode);
  }

  if (mode === 'low_confidence') {
    return `${buildResultNavigationUrl('lat-pulldown')}&status=low_confidence`;
  }

  return buildResultNavigationUrl('lat-pulldown');
}

export async function recognizeEquipment(
  imageBase64: string,
  source: 'camera' | 'album'
): Promise<RecognitionPayload> {
  return new Promise((resolve, reject) => {
    wx.request<RecognitionPayload>({
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
