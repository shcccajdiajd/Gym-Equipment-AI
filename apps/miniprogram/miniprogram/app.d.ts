interface IAppOption {
  globalData: {
    apiBaseUrl: string;
    apiBaseUrls?: string[];
  };
}

interface MiniProgramPageInstance<Data extends Record<string, unknown> = Record<string, unknown>> {
  data?: Data;
  setData: (data: Partial<Data>) => void;
  [key: string]: unknown;
}

declare function App<T extends object>(options: T): T;
declare function Page<T extends object>(options: T): T;
declare function getApp<T = IAppOption>(): T;

declare namespace WechatMiniprogram {
  interface BaseEvent {
    currentTarget: {
      dataset: Record<string, string>;
    };
  }

  interface GeneralCallbackResult {
    errMsg: string;
  }

  interface RequestSuccessCallbackResult<T> {
    data: T;
    statusCode: number;
    errMsg: string;
  }

  interface ReadFileSuccessCallbackResult {
    data: string | ArrayBuffer;
  }

  interface ReadFileOption {
    filePath: string;
    encoding?: 'base64';
    success?: (result: ReadFileSuccessCallbackResult) => void;
    fail?: (error: GeneralCallbackResult) => void;
  }

  interface FileSystemManager {
    readFile: (options: ReadFileOption) => void;
  }

  interface ChooseMediaSuccessCallbackResult {
    tempFiles: Array<{
      tempFilePath: string;
    }>;
  }

  interface ChooseMediaOption {
    count?: number;
    mediaType?: string[];
    sourceType?: string[];
    success?: (result: ChooseMediaSuccessCallbackResult) => void;
    fail?: (error: GeneralCallbackResult) => void;
  }

  interface TakePhotoSuccessCallbackResult {
    tempImagePath: string;
  }

  interface CameraContext {
    takePhoto: (options: {
      quality?: 'high' | 'normal' | 'low';
      success?: (result: TakePhotoSuccessCallbackResult) => void;
      fail?: (error: GeneralCallbackResult) => void;
    }) => void;
  }

  interface RequestOption<T> {
    url: string;
    method?: 'GET' | 'POST';
    timeout?: number;
    data?: unknown;
    success?: (result: RequestSuccessCallbackResult<T>) => void;
    fail?: (error: GeneralCallbackResult) => void;
  }

  interface ClipboardOption {
    data: string;
    success?: () => void;
  }

  interface NavigateToMiniProgramOption {
    appId: string;
    path?: string;
    envVersion?: 'release' | 'develop' | 'trial';
    success?: () => void;
    fail?: (error: GeneralCallbackResult) => void;
  }

  interface CompressImageSuccessCallbackResult {
    tempFilePath: string;
  }

  interface CompressImageOption {
    src: string;
    quality?: number;
    compressedWidth?: number;
    compressedHeight?: number;
    success?: (result: CompressImageSuccessCallbackResult) => void;
    fail?: (error: GeneralCallbackResult) => void;
  }
}

declare const wx: {
  request: <T>(options: WechatMiniprogram.RequestOption<T>) => void;
  getFileSystemManager: () => WechatMiniprogram.FileSystemManager;
  chooseMedia: (options: WechatMiniprogram.ChooseMediaOption) => void;
  createCameraContext: () => WechatMiniprogram.CameraContext;
  showLoading: (options: { title: string }) => void;
  hideLoading: () => void;
  showToast: (options: { title: string; icon: 'none' | 'success' }) => void;
  navigateTo: (options: { url: string }) => void;
  navigateToMiniProgram: (options: WechatMiniprogram.NavigateToMiniProgramOption) => void;
  setClipboardData: (options: WechatMiniprogram.ClipboardOption) => void;
  compressImage: (options: WechatMiniprogram.CompressImageOption) => void;
  getStorageSync: <T = unknown>(key: string) => T;
  setStorageSync: (key: string, value: unknown) => void;
};
