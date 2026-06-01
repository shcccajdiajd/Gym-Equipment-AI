import type { EquipmentCard } from '@gym-equipment-ai/shared';
import { resolveEquipmentPayload } from '../lib/catalog-service.js';
import { RECOGNIZED_CONFIDENCE_THRESHOLD } from '../lib/recognizers/prompt.js';
import { RecognitionProviderError } from '../lib/recognizers/types.js';
import type { RecognitionErrorCode, RecognitionResult, Recognizer } from '../lib/recognizers/types.js';

export const MAX_IMAGE_BASE64_LENGTH = 1_800_000;

export type RecognitionCoreStatus =
  | 'recognized'
  | 'low_confidence'
  | 'unsupported'
  | 'error'
  | 'timeout'
  | 'invalid_request';

export type RecognitionCoreResponse = {
  status: RecognitionCoreStatus;
  equipment?: EquipmentCard;
  equipmentId?: string;
  confidence?: number;
  alternatives?: string[];
  candidates?: string[];
  message?: string;
  errorCode?: RecognitionErrorCode;
};

type RecognizeEquipmentInput = {
  imageBase64?: string;
  imageDataUrl?: string;
  source?: 'camera' | 'album';
};

function uniqueIds(ids: string[]) {
  return ids.filter((id, index) => ids.indexOf(id) === index);
}

function stripDataUrlPrefix(value: string) {
  return value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
}

function applyRecognitionSafetyGuards(result: RecognitionResult): RecognitionResult {
  if (result.topMatchId === 'assisted-pull-up-dip' && result.confidence < 0.95) {
    return {
      topMatchId: null,
      confidence: Math.min(result.confidence, 0.4),
      alternatives: uniqueIds(['pec-deck-fly', 'assisted-pull-up-dip', ...result.alternatives]).slice(0, 3)
    };
  }

  return result;
}

function providerErrorToResponse(error: RecognitionProviderError): RecognitionCoreResponse {
  if (error.code === 'timeout') {
    return {
      status: 'timeout',
      errorCode: 'VISION_TIMEOUT',
      message: '识别服务响应超时，请稍后重试或换一张更清晰的图片。'
    };
  }

  if (error.errorCode) {
    return {
      status: 'error',
      errorCode: error.errorCode,
      message:
        error.errorCode === 'ALIYUN_API_KEY_MISSING'
          ? '识别服务缺少阿里云 API Key，请检查函数计算环境变量。'
          : '识别模型暂时不可用，请稍后重试。'
    };
  }

  return {
    status: 'error',
    errorCode: 'VISION_PROVIDER_FAILED',
    message: '识别模型暂时不可用，请稍后重试。'
  };
}

export async function recognizeEquipment(
  input: RecognizeEquipmentInput,
  options: { recognizer: Recognizer; maxImageBase64Length?: number }
): Promise<RecognitionCoreResponse> {
  const imageBase64 = stripDataUrlPrefix((input.imageBase64 ?? input.imageDataUrl ?? '').trim());
  const maxImageBase64Length = options.maxImageBase64Length ?? MAX_IMAGE_BASE64_LENGTH;

  if (!imageBase64) {
    return {
      status: 'error',
      errorCode: 'IMAGE_REQUIRED',
      message: '请先选择或拍摄一张器械图片。'
    };
  }

  if (imageBase64.length > maxImageBase64Length) {
    return {
      status: 'error',
      errorCode: 'IMAGE_TOO_LARGE',
      message: '图片太大了，请重新拍摄或换一张更清晰但体积更小的图片。'
    };
  }

  let result: RecognitionResult;

  try {
    result = await options.recognizer.recognize({
      imageBase64,
      source: input.source ?? 'album'
    });
  } catch (error) {
    if (error instanceof RecognitionProviderError) {
      return providerErrorToResponse(error);
    }

    return {
      status: 'error',
      errorCode: 'VISION_PROVIDER_FAILED',
      message: '识别服务暂时不可用，请稍后重试。'
    };
  }

  const guardedResult = applyRecognitionSafetyGuards(result);
  const candidates = guardedResult.alternatives;

  if (!guardedResult.topMatchId) {
    return {
      status: 'unsupported',
      confidence: guardedResult.confidence,
      alternatives: candidates,
      candidates,
      message: '这类器械暂未收录，请尝试重新拍摄或查看支持列表。'
    };
  }

  const equipment = resolveEquipmentPayload(guardedResult.topMatchId);
  if (!equipment) {
    return {
      status: 'error',
      errorCode: 'RECOGNITION_MAPPING_FAILED',
      message: '识别结果未能映射到器械内容，请检查目录数据。'
    };
  }

  return {
    status: guardedResult.confidence >= RECOGNIZED_CONFIDENCE_THRESHOLD ? 'recognized' : 'low_confidence',
    equipment,
    equipmentId: equipment.id,
    confidence: guardedResult.confidence,
    alternatives: candidates,
    candidates
  };
}
