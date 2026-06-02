import { equipmentCatalog } from '@gym-equipment-ai/shared';
import { describe, expect, it } from 'vitest';
import { buildTutorialSearchQueries, getPrimarySearchQuery } from './searchQueries.js';

describe('tutorial search queries', () => {
  it('uses exercise variants when a machine supports multiple training goals', () => {
    const pecDeck = equipmentCatalog.find((item) => item.id === 'pec-deck-fly');
    const rearDelt = pecDeck?.exerciseVariants?.find((variant) => variant.id === 'pec-deck-rear-delt-fly');

    expect(pecDeck).toBeDefined();
    expect(rearDelt).toBeDefined();

    const queries = buildTutorialSearchQueries(pecDeck!, rearDelt);

    expect(getPrimarySearchQuery(pecDeck!, rearDelt)).toContain('后束');
    expect(queries.basicZh).toBe('反向蝴蝶机飞鸟 教程');
    expect(queries.muscleZh).toContain('三角肌后束发力');
    expect(queries.english).toContain('reverse pec deck rear delt fly');
  });
});
