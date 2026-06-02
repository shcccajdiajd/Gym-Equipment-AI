import type { ProgressPoint, ProgressSummary, TrainingRecord, TrainingRecordInput } from '../types.js';

const TRAINING_RECORDS_KEY = 'gym-equipment-ai:training-records';
const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function readJsonArray<T>(storage: Storage, key: string): T[] {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function sortRecords(records: TrainingRecord[]) {
  return [...records].sort((a, b) => {
    const dateDiff = b.date.localeCompare(a.date);
    return dateDiff === 0 ? b.createdAt.localeCompare(a.createdAt) : dateDiff;
  });
}

function createRecordId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `training-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentWeekDays(baseDate = new Date()) {
  const mondayOffset = (baseDate.getDay() + 6) % 7;
  const monday = new Date(baseDate);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(baseDate.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);

    return {
      date: toDateKey(day),
      weekday: WEEKDAY_LABELS[day.getDay()],
      dayLabel: `${day.getMonth() + 1}/${day.getDate()}`
    };
  });
}

export function readTrainingRecords(storage: Storage = localStorage): TrainingRecord[] {
  return sortRecords(readJsonArray<TrainingRecord>(storage, TRAINING_RECORDS_KEY));
}

export function saveTrainingRecord(input: TrainingRecordInput, storage: Storage = localStorage): TrainingRecord[] {
  const record: TrainingRecord = {
    ...input,
    id: createRecordId(),
    createdAt: new Date().toISOString()
  };
  const next = sortRecords([record, ...readTrainingRecords(storage)]);
  storage.setItem(TRAINING_RECORDS_KEY, JSON.stringify(next));
  return next;
}

export function deleteTrainingRecord(id: string, storage: Storage = localStorage): TrainingRecord[] {
  const next = readTrainingRecords(storage).filter((record) => record.id !== id);
  storage.setItem(TRAINING_RECORDS_KEY, JSON.stringify(next));
  return next;
}

export function filterTrainingRecordsByEquipment(records: TrainingRecord[], equipmentId: string) {
  return equipmentId ? records.filter((record) => record.equipmentId === equipmentId) : records;
}

export function filterTrainingRecordsByDate(records: TrainingRecord[], date: string) {
  return date ? records.filter((record) => record.date === date) : records;
}

export function groupTrainingRecordsByDate(records: TrainingRecord[]) {
  const grouped = new Map<string, TrainingRecord[]>();

  for (const record of records) {
    grouped.set(record.date, [...(grouped.get(record.date) ?? []), record]);
  }

  return Array.from(grouped.entries())
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, dateRecords]) => ({
      date,
      records: sortRecords(dateRecords)
    }));
}

export function buildProgressSeries(records: TrainingRecord[]): {
  points: ProgressPoint[];
  summary: ProgressSummary | null;
} {
  const points = records
    .filter((record) => typeof record.weight === 'number' && record.weight > 0)
    .map((record) => ({
      date: record.date,
      weight: Number(record.weight)
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (points.length < 2) {
    return { points: [], summary: null };
  }

  const firstWeight = points[0].weight;
  const latestWeight = points[points.length - 1].weight;
  const maxWeight = Math.max(...points.map((point) => point.weight));

  return {
    points,
    summary: {
      latestWeight,
      maxWeight,
      improvement: latestWeight - firstWeight
    }
  };
}
