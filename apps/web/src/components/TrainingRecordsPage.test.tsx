import { equipmentCatalog } from '@gym-equipment-ai/shared';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFakeStorage } from '../test/fakeStorage.js';
import { getCurrentWeekDays, saveTrainingRecord } from '../utils/trainingRecords.js';
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
    expect(html).toContain('训练日志');
    expect(html).toContain('按日期查看');
    expect(html.indexOf('训练日志')).toBeLessThan(html.indexOf('进步曲线'));
    expect(html).toContain('周一');
    expect(html).toContain('6/1');
    expect(html).toContain('进步曲线');
    expect(html).toContain('记录同一器械 2 次以上，即可看到重量变化曲线');
    expect(html).toContain(equipment.zhName);
    expect(html).toContain('1 条记录');
    expect(html).toContain('3 组 x 10 次 · 20 kg');
    expect(html).toContain('删除记录');
    expect(html).not.toContain('本周快速筛选');
    expect(html).not.toContain('class="block text-xs font-bold text-ink/50">2026-06-01');
    expect(html).not.toContain('导入计划');
    expect(html).not.toContain('该日无计划');
  });

  it('renders grouped records by default and a selected-date empty state', () => {
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

    const selectedDate = getCurrentWeekDays()[2].date;
    const html = renderToStaticMarkup(
      <TrainingRecordsPage
        initialSelectedDate={selectedDate}
        onBack={() => undefined}
        onOpenEquipment={() => undefined}
      />
    );

    expect(html).toContain(`data-selected-date="${selectedDate}"`);
    expect(html).toContain('这一天还没有训练记录');
    expect(html).toContain('识别器械后点击‘记录本次训练’开始记录');
    expect(html).not.toContain('3 组 x 10 次 · 20 kg');
  });
});
