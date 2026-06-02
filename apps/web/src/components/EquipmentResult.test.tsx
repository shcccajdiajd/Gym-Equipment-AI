import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { equipmentCatalog } from '@gym-equipment-ai/shared';
import { EquipmentResult } from './EquipmentResult.js';
import { UnsupportedResult } from './UnsupportedResult.js';

describe('result rendering', () => {
  it('renders equipment information and tutorial search controls', () => {
    const equipment = equipmentCatalog.find((item) => item.id === 'pec-deck-fly') ?? equipmentCatalog[0];
    const html = renderToStaticMarkup(
      <EquipmentResult
        candidates={[]}
        confidence={0.88}
        equipment={equipment}
        onRetake={() => undefined}
        onSelectCandidate={() => undefined}
        onWrongPrediction={() => undefined}
      />
    );

    expect(html).toContain(equipment.zhName);
    expect(html).toContain('Pec Deck Chest Fly');
    expect(html).toContain('你想用它练哪里？');
    expect(html).toContain('data-exercise-variant-id="pec-deck-chest-fly"');
    expect(html).toContain('data-exercise-variant-id="pec-deck-rear-delt-fly"');
    expect(html).toContain('直接去搜教程');
    expect(html).toContain('蝴蝶机夹胸 正确使用 教学');
    expect(html).toContain('B站搜索');
    expect(html).toContain('识别错了？');
  });

  it('renders clickable candidate equipment cards', () => {
    const candidates = equipmentCatalog.slice(0, 2);
    const html = renderToStaticMarkup(
      <UnsupportedResult
        candidates={candidates}
        onRetake={() => undefined}
        onSelectCandidate={() => undefined}
      />
    );

    expect(html).toContain('你看到的可能是');
    expect(html).toContain(`data-equipment-id="${candidates[0].id}"`);
    expect(html).toContain(candidates[1].zhName);
  });
});
