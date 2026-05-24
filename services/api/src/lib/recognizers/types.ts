export interface RecognitionResult {
  topMatchId: string | null;
  confidence: number;
  alternatives: string[];
}

export interface Recognizer {
  recognize(input: {
    imageBase64: string;
    source: 'camera' | 'album';
  }): Promise<RecognitionResult>;
}
