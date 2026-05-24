import { Buffer } from 'node:buffer';
import type { Recognizer } from './types.js';

const fixtureMap: Record<string, { id: string; confidence: number; alternatives: string[] }> = {
  chest: {
    id: 'seated-chest-press',
    confidence: 0.88,
    alternatives: ['pec-deck-fly', 'shoulder-press-machine']
  },
  back: {
    id: 'lat-pulldown',
    confidence: 0.91,
    alternatives: ['assisted-pull-up-dip', 'seated-row']
  },
  legs: {
    id: 'leg-press',
    confidence: 0.9,
    alternatives: ['hack-squat-machine', 'leg-extension']
  }
};

export const mockRecognizer: Recognizer = {
  async recognize({ imageBase64 }) {
    const decoded = Buffer.from(imageBase64, 'base64').toString('utf8').toLowerCase();

    if (decoded.includes('chest')) {
      return {
        topMatchId: fixtureMap.chest.id,
        confidence: fixtureMap.chest.confidence,
        alternatives: fixtureMap.chest.alternatives
      };
    }

    if (decoded.includes('back')) {
      return {
        topMatchId: fixtureMap.back.id,
        confidence: fixtureMap.back.confidence,
        alternatives: fixtureMap.back.alternatives
      };
    }

    if (decoded.includes('legs')) {
      return {
        topMatchId: fixtureMap.legs.id,
        confidence: fixtureMap.legs.confidence,
        alternatives: fixtureMap.legs.alternatives
      };
    }

    return {
      topMatchId: null,
      confidence: 0.12,
      alternatives: []
    };
  }
};
