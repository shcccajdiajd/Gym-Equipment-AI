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

  it('keeps similar equipment links inside the launch catalog', () => {
    const ids = new Set(equipmentCatalog.map((item) => item.id));

    for (const item of equipmentCatalog) {
      for (const similarId of item.similarEquipmentIds) {
        expect(ids.has(similarId)).toBe(true);
      }
    }
  });
});
