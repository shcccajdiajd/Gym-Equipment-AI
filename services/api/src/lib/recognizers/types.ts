export interface RecognitionResult {
  topMatchId: string | null;
  confidence: number;
  alternatives: string[];
}

export class RecognitionProviderError extends Error {
  constructor(
    public readonly code: 'timeout' | 'upstream_error' | 'invalid_response',
    message: string
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
