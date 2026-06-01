import type { EquipmentCard } from '@gym-equipment-ai/shared';

export type TutorialSearchQueries = {
  basicZh: string;
  beginnerZh: string;
  muscleZh: string;
  mistakesZh: string;
  english: string;
};

export function buildTutorialSearchQueries(equipment: EquipmentCard): TutorialSearchQueries {
  const shortName = equipment.zhName.replace(/机$/, '');
  const mainMuscle = equipment.primaryMuscles[0] ?? '目标肌群';

  return {
    basicZh: `${equipment.zhName} 教程`,
    beginnerZh: `${shortName} 新手教学`,
    muscleZh: `${shortName} ${mainMuscle}发力`,
    mistakesZh: `${shortName} 常见错误`,
    english: `${equipment.enName.toLowerCase()} tutorial`
  };
}

export function getPrimarySearchQuery(equipment: EquipmentCard) {
  return equipment.videoRecommendation.searchQuery || buildTutorialSearchQueries(equipment).basicZh;
}
