import { describe, expect, it } from 'vitest';
import { createFakeStorage } from '../test/fakeStorage.js';
import type { TrainingRecord } from '../types.js';
import {
  buildProgressSeries,
  deleteTrainingRecord,
  filterTrainingRecordsByEquipment,
  readTrainingRecords,
  saveTrainingRecord
} from './trainingRecords.js';

describe('training records storage', () => {
  it('saves and reads training records newest first', () => {
    const storage = createFakeStorage();

    saveTrainingRecord(
      {
        equipmentId: 'pec-deck-fly',
        equipmentName: '蝴蝶机夹胸',
        exerciseName: '蝴蝶机夹胸',
        date: '2026-06-01',
        sets: 3,
        reps: 12,
        weight: 20,
        weightUnit: 'kg',
        note: '动作稳定'
      },
      storage
    );
    saveTrainingRecord(
      {
        equipmentId: 'lat-pulldown',
        equipmentName: '高位下拉',
        exerciseName: '宽握高位下拉',
        date: '2026-06-02',
        sets: 4,
        reps: 10,
        weight: 35,
        weightUnit: 'kg',
        note: ''
      },
      storage
    );

    const records = readTrainingRecords(storage);
    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({
      equipmentId: 'lat-pulldown',
      equipmentName: '高位下拉',
      date: '2026-06-02',
      sets: 4,
      reps: 10,
      weight: 35,
      weightUnit: 'kg'
    });
    expect(records[0].id).toBeTruthy();
    expect(records[0].createdAt).toBeTruthy();
  });

  it('deletes a single training record', () => {
    const storage = createFakeStorage();
    const saved = saveTrainingRecord(
      {
        equipmentId: 'pec-deck-fly',
        equipmentName: '蝴蝶机夹胸',
        exerciseName: '蝴蝶机夹胸',
        date: '2026-06-01',
        sets: 3,
        reps: 12,
        weightUnit: 'kg'
      },
      storage
    )[0];

    deleteTrainingRecord(saved.id, storage);

    expect(readTrainingRecords(storage)).toEqual([]);
  });

  it('filters records by equipment', () => {
    const storage = createFakeStorage();
    saveTrainingRecord(
      {
        equipmentId: 'pec-deck-fly',
        equipmentName: '蝴蝶机夹胸',
        exerciseName: '蝴蝶机夹胸',
        date: '2026-06-01',
        sets: 3,
        reps: 12,
        weight: 20,
        weightUnit: 'kg'
      },
      storage
    );
    saveTrainingRecord(
      {
        equipmentId: 'lat-pulldown',
        equipmentName: '高位下拉',
        exerciseName: '宽握高位下拉',
        date: '2026-06-02',
        sets: 4,
        reps: 10,
        weight: 35,
        weightUnit: 'kg'
      },
      storage
    );

    expect(filterTrainingRecordsByEquipment(readTrainingRecords(storage), 'pec-deck-fly')).toHaveLength(1);
    expect(filterTrainingRecordsByEquipment(readTrainingRecords(storage), '')).toHaveLength(2);
  });

  it('builds chart data and summary from dated weight records', () => {
    const records: TrainingRecord[] = [
      {
        id: 'first',
        equipmentId: 'pec-deck-fly',
        equipmentName: '蝴蝶机夹胸',
        exerciseName: '蝴蝶机夹胸',
        date: '2026-06-01',
        sets: 3,
        reps: 12,
        weight: 20,
        weightUnit: 'kg',
        createdAt: '2026-06-01T10:00:00.000Z'
      },
      {
        id: 'latest',
        equipmentId: 'pec-deck-fly',
        equipmentName: '蝴蝶机夹胸',
        exerciseName: '蝴蝶机夹胸',
        date: '2026-06-05',
        sets: 3,
        reps: 10,
        weight: 27.5,
        weightUnit: 'kg',
        createdAt: '2026-06-05T10:00:00.000Z'
      }
    ];

    const series = buildProgressSeries(records);

    expect(series.points).toEqual([
      { date: '2026-06-01', weight: 20 },
      { date: '2026-06-05', weight: 27.5 }
    ]);
    expect(series.summary).toEqual({
      latestWeight: 27.5,
      maxWeight: 27.5,
      improvement: 7.5
    });
  });

  it('returns an empty progress series when fewer than two weighted records exist', () => {
    const records: TrainingRecord[] = [
      {
        id: 'only',
        equipmentId: 'pec-deck-fly',
        equipmentName: '蝴蝶机夹胸',
        exerciseName: '蝴蝶机夹胸',
        date: '2026-06-01',
        sets: 3,
        reps: 12,
        weight: 20,
        weightUnit: 'kg',
        createdAt: '2026-06-01T10:00:00.000Z'
      }
    ];
    const series = buildProgressSeries(records);

    expect(series.points).toEqual([]);
    expect(series.summary).toBeNull();
  });
});
