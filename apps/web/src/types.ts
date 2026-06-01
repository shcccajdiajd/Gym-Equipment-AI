import type { EquipmentCard } from '@gym-equipment-ai/shared';

export type RecognitionStatus = 'recognized' | 'low_confidence' | 'unsupported';
export type RecognitionFailureStatus = 'timeout' | 'error' | 'invalid_request';
export type RecognitionApiStatus = RecognitionStatus | RecognitionFailureStatus;

export type RecognitionPayload = {
  status: RecognitionApiStatus;
  equipment?: EquipmentCard;
  confidence?: number;
  alternatives?: string[];
  message?: string;
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
