import type { EquipmentCard } from '@gym-equipment-ai/shared';
import type { HistoryItem, WrongPrediction } from '../types.js';
import { getPrimarySearchQuery } from './searchQueries.js';

const HISTORY_KEY = 'gym-equipment-ai:history';
const WRONG_PREDICTIONS_KEY = 'gym-equipment-ai:wrong-predictions';
const HISTORY_LIMIT = 12;

function readJsonArray<T>(storage: Storage, key: string): T[] {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function readHistory(storage: Storage = localStorage): HistoryItem[] {
  return readJsonArray<HistoryItem>(storage, HISTORY_KEY);
}

export function addHistoryItem(
  equipment: EquipmentCard,
  confidence?: number,
  storage: Storage = localStorage
): HistoryItem[] {
  const nextItem: HistoryItem = {
    id: equipment.id,
    zhName: equipment.zhName,
    enName: equipment.enName,
    confidence,
    searchQuery: getPrimarySearchQuery(equipment),
    createdAt: new Date().toISOString()
  };
  const next = [nextItem, ...readHistory(storage).filter((item) => item.id !== equipment.id)].slice(0, HISTORY_LIMIT);
  storage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function readWrongPredictions(storage: Storage = localStorage): WrongPrediction[] {
  return readJsonArray<WrongPrediction>(storage, WRONG_PREDICTIONS_KEY);
}

export function recordWrongPrediction(
  correctedId: string,
  predictedId?: string,
  storage: Storage = localStorage
): WrongPrediction[] {
  const next = [
    {
      predictedId,
      correctedId,
      createdAt: new Date().toISOString()
    },
    ...readWrongPredictions(storage)
  ].slice(0, HISTORY_LIMIT);
  storage.setItem(WRONG_PREDICTIONS_KEY, JSON.stringify(next));
  return next;
}
