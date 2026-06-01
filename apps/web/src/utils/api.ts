import { getEquipmentCard } from '@gym-equipment-ai/shared';
import type { RecognitionPayload } from '../types.js';

const DEFAULT_TIMEOUT_MS = 45_000;

const ERROR_CODE_MESSAGES: Record<string, string> = {
  ALIYUN_API_KEY_MISSING: '识别服务还没有配置阿里云 API Key，请稍后再试。',
  VISION_PROVIDER_FAILED: '识别模型暂时不可用，请稍后重试。',
  IMAGE_TOO_LARGE: '图片太大了，请重新拍摄或换一张更清晰但体积更小的图片。',
  IMAGE_REQUIRED: '请先选择或拍摄一张器械图片。',
  VISION_TIMEOUT: '识别请求超时，请稍后重试或换一张更清晰的图片。',
  INVALID_REQUEST: '图片上传请求格式有误，请重新选择图片。',
  METHOD_NOT_ALLOWED: '识别接口请求方式不正确，请刷新页面再试。',
  RECOGNITION_MAPPING_FAILED: '识别结果暂时无法匹配到器械目录，请稍后重试。'
};

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || '';
}

function getRecognitionEndpoint() {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');

  if (!baseUrl) {
    return '/api/recognitions';
  }

  if (baseUrl.endsWith('/api/recognitions')) {
    return baseUrl;
  }

  return `${baseUrl}/api/recognitions`;
}

export function normalizeRecognitionResponse(statusCode: number, data: Partial<RecognitionPayload>): RecognitionPayload {
  const message = data.message ?? (data.errorCode ? ERROR_CODE_MESSAGES[data.errorCode] : undefined);
  const equipment = data.equipment ?? (data.equipmentId ? getEquipmentCard(data.equipmentId) : undefined);
  const alternatives = data.alternatives ?? data.candidates;

  if (data.status) {
    return {
      ...data,
      equipment,
      alternatives,
      message
    } as RecognitionPayload;
  }

  if (statusCode >= 400) {
    return {
      status: 'error',
      errorCode: data.errorCode,
      message: message ?? '识别服务暂时不可用，请稍后重试。'
    };
  }

  return {
    status: 'error',
    message: '识别服务返回异常，请稍后重试。'
  };
}

export async function recognizeEquipmentImage(
  imageBase64: string,
  source: 'camera' | 'album',
  options: { fetcher?: typeof fetch; timeoutMs?: number } = {}
): Promise<RecognitionPayload> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const fetcher = options.fetcher ?? fetch;

  try {
    const response = await fetcher(getRecognitionEndpoint(), {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ imageBase64, source }),
      signal: controller.signal
    });
    const data = (await response.json()) as Partial<RecognitionPayload>;
    return normalizeRecognitionResponse(response.status, data);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        status: 'timeout',
        message: '识别请求超时，请稍后重试或换一张更清晰的图片。'
      };
    }

    return {
      status: 'error',
      message: '识别服务连接失败，请检查网络或稍后重试。'
    };
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
