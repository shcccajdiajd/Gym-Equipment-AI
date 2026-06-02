import { equipmentCatalog } from '@gym-equipment-ai/shared';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFakeStorage } from '../test/fakeStorage.js';
import { saveTrainingRecord } from '../utils/trainingRecords.js';
import { TrainingRecordsPage } from './TrainingRecordsPage.js';

describe('training records page', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders empty progress state when fewer than two weighted records exist', () => {
    const storage = createFakeStorage();
    const equipment = equipmentCatalog[0];
    saveTrainingRecord(
      {
        equipmentId: equipment.id,
        equipmentName: equipment.zhName,
        exerciseName: equipment.zhName,
        date: '2026-06-01',
        sets: 3,
        reps: 10,
        weight: 20,
        weightUnit: 'kg'
      },
      storage
    );
    vi.stubGlobal('localStorage', storage);

    const html = renderToStaticMarkup(
      <TrainingRecordsPage onBack={() => undefined} onOpenEquipment={() => undefined} />
    );

    expect(html).toContain('我的训练记录');
    expect(html).toContain('进步曲线');
    expect(html).toContain('继续记录几次后即可看到进步曲线');
    expect(html).toContain(equipment.zhName);
    expect(html).toContain('3 组 x 10 次 · 20 kg');
    expect(html).toContain('删除记录');
  });
});
