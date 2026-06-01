import type { EquipmentCard } from '@gym-equipment-ai/shared';

export type RecognitionStatus = 'recognized' | 'low_confidence' | 'unsupported';
export type RecognitionFailureStatus = 'timeout' | 'error' | 'invalid_request';
export type RecognitionApiStatus = RecognitionStatus | RecognitionFailureStatus;

export type RecognitionPayload = {
  status: RecognitionApiStatus;
  equipment?: EquipmentCard;
  equipmentId?: string;
  confidence?: number;
  alternatives?: string[];
  candidates?: string[];
  message?: string;
  errorCode?:
    | 'ALIYUN_API_KEY_MISSING'
    | 'VISION_PROVIDER_FAILED'
    | 'IMAGE_TOO_LARGE'
    | 'IMAGE_REQUIRED'
    | 'VISION_TIMEOUT'
    | 'INVALID_REQUEST'
    | 'METHOD_NOT_ALLOWED'
    | 'RECOGNITION_MAPPING_FAILED';
};

export type HistoryItem = {
  id: string;
  zhName: string;
  enName: string;
  confidence?: number;
  searchQuery: string;
  createdAt: string;
};

export type WrongPrediction = {
  predictedId?: string;
  correctedId: string;
  createdAt: string;
};
