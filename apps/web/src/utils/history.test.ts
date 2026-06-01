import { describe, expect, it } from 'vitest';
import { equipmentCatalog } from '@gym-equipment-ai/shared';
import { addHistoryItem, readHistory, recordWrongPrediction, readWrongPredictions } from './history.js';
import { createFakeStorage } from '../test/fakeStorage.js';

describe('history storage', () => {
  it('writes and reads compact recognition history', () => {
    const storage = createFakeStorage();
    const equipment = equipmentCatalog[0];

    addHistoryItem(equipment, 0.91, storage);

    expect(readHistory(storage)).toMatchObject([
      {
        id: equipment.id,
        zhName: equipment.zhName,
        confidence: 0.91
      }
    ]);
    expect(JSON.stringify(readHistory(storage))).not.toContain('base64');
  });

  it('records local wrong-prediction feedback', () => {
    const storage = createFakeStorage();

    recordWrongPrediction('pec-deck-fly', 'assisted-pull-up-dip', storage);

    expect(readWrongPredictions(storage)[0]).toMatchObject({
      predictedId: 'assisted-pull-up-dip',
      correctedId: 'pec-deck-fly'
    });
  });
});
