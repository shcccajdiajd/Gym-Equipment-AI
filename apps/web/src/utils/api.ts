import type { RecognitionPayload } from '../types.js';

const DEFAULT_TIMEOUT_MS = 45_000;

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || '';
}

export function normalizeRecognitionResponse(statusCode: number, data: Partial<RecognitionPayload>): RecognitionPayload {
  if (data.status) {
    return data as RecognitionPayload;
  }

  if (statusCode >= 400) {
    return {
      status: 'error',
      message: data.message ?? '识别服务暂时不可用，请稍后重试。'
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
    const response = await fetcher(`${getApiBaseUrl()}/api/recognitions`, {
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
