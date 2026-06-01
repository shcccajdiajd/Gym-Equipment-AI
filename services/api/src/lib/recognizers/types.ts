export type RecognitionErrorCode =
  | 'ALIYUN_API_KEY_MISSING'
  | 'VISION_PROVIDER_FAILED'
  | 'IMAGE_TOO_LARGE'
  | 'IMAGE_REQUIRED'
  | 'VISION_TIMEOUT'
  | 'INVALID_REQUEST'
  | 'METHOD_NOT_ALLOWED'
  | 'RECOGNITION_MAPPING_FAILED';

export interface RecognitionResult {
  topMatchId: string | null;
  confidence: number;
  alternatives: string[];
}

export class RecognitionProviderError extends Error {
  constructor(
    public readonly code: 'timeout' | 'upstream_error' | 'invalid_response' | 'config_error',
    message: string,
    public readonly errorCode?: RecognitionErrorCode
  ) {
    super(message);
    this.name = 'RecognitionProviderError';
  }
}

export interface Recognizer {
  recognize(input: {
    imageBase64: string;
    source: 'camera' | 'album';
  }): Promise<RecognitionResult>;
}
