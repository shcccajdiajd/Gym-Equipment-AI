import { describe, expect, it } from 'vitest';

import {
  equipmentCatalog,
  getEquipmentCard,
  getSupportedEquipmentIds
} from './catalog.js';

describe('equipment catalog', () => {
  it('contains the complete V1 launch set without duplicate ids', () => {
    const ids = getSupportedEquipmentIds();

    expect(ids).toHaveLength(20);
    expect(new Set(ids).size).toBe(20);
    expect(ids).toContain('seated-chest-press');
    expect(ids).not.toContain('smith-machine');
  });

  it('returns the chest press card with curated teaching content', () => {
    const card = getEquipmentCard('seated-chest-press');

    expect(card?.zhName).toBe('坐姿推胸机');
    expect(card?.primaryMuscles).toEqual(['胸大肌']);
    expect(card?.videoRecommendation.searchQuery).toContain('坐姿推胸机');
  });

  it('models all multi-use equipment with exercise variants', () => {
    const multiUseEquipmentIds = [
      'pec-deck-fly',
      'lat-pulldown',
      'seated-row',
      'leg-press',
      'back-extension-machine',
      'assisted-pull-up-dip',
      'hack-squat-machine'
    ];

    for (const id of multiUseEquipmentIds) {
      const card = getEquipmentCard(id);

      expect(card?.exerciseVariants?.length, `${id} should offer multiple exercise modes`).toBeGreaterThanOrEqual(2);
    }
  });

  it('keeps pec deck reverse fly as a distinct exercise variant', () => {
    const card = getEquipmentCard('pec-deck-fly');

    expect(card?.exerciseVariants).toHaveLength(2);
    expect(card?.exerciseVariants?.map((variant) => variant.id)).toEqual([
      'pec-deck-chest-fly',
      'pec-deck-rear-delt-fly'
    ]);
    expect(card?.exerciseVariants?.[1].primaryMuscles).toContain('三角肌后束');
    expect(card?.exerciseVariants?.[1].videoRecommendation.searchQuery).toContain('后束');
  });

  it('keeps similar equipment links inside the launch catalog', () => {
    const ids = new Set(equipmentCatalog.map((item) => item.id));

    for (const item of equipmentCatalog) {
      for (const similarId of item.similarEquipmentIds) {
        expect(ids.has(similarId)).toBe(true);
      }
    }
  });
});
