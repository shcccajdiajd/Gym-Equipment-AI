import type { EquipmentCard, EquipmentExerciseVariant } from '@gym-equipment-ai/shared';

export type TutorialSearchQueries = {
  basicZh: string;
  beginnerZh: string;
  muscleZh: string;
  mistakesZh: string;
  english: string;
};

export function buildTutorialSearchQueries(
  equipment: EquipmentCard,
  variant?: EquipmentExerciseVariant
): TutorialSearchQueries {
  const title = variant?.zhName ?? equipment.zhName;
  const englishTitle = variant?.enName ?? equipment.enName;
  const primaryMuscles = variant?.primaryMuscles ?? equipment.primaryMuscles;
  const shortName = title.replace(/机$/, '');
  const mainMuscle = primaryMuscles[0] ?? '目标肌群';

  return {
    basicZh: `${title} 教程`,
    beginnerZh: `${shortName} 新手教学`,
    muscleZh: `${shortName} ${mainMuscle}发力`,
    mistakesZh: `${shortName} 常见错误`,
    english: `${englishTitle.toLowerCase()} tutorial`
  };
}

export function getPrimarySearchQuery(equipment: EquipmentCard, variant?: EquipmentExerciseVariant) {
  return variant?.videoRecommendation.searchQuery || equipment.videoRecommendation.searchQuery || buildTutorialSearchQueries(equipment, variant).basicZh;
}
