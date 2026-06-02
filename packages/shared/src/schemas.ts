import { z } from 'zod';

export const videoRecommendationSchema = z.object({
  platform: z.string().min(1),
  title: z.string().min(1),
  searchQuery: z.string().min(1)
});

export const equipmentExerciseVariantSchema = z.object({
  id: z.string().min(1),
  zhName: z.string().min(1),
  enName: z.string().min(1),
  targetLabel: z.string().min(1),
  primaryMuscles: z.array(z.string().min(1)).min(1),
  secondaryMuscles: z.array(z.string().min(1)).default([]),
  summary: z.string().min(1),
  adjustment: z.string().min(1),
  steps: z.array(z.string().min(1)).min(3),
  safety: z.array(z.string().min(1)).min(2),
  commonErrors: z.array(z.string().min(1)).min(2),
  beginnerTip: z.string().min(1),
  videoRecommendation: videoRecommendationSchema
});

export const equipmentCardSchema = z.object({
  id: z.string().min(1),
  zhName: z.string().min(1),
  enName: z.string().min(1),
  category: z.enum([
    'chest',
    'back',
    'shoulders',
    'legs',
    'glutes',
    'arms',
    'core',
    'compound'
  ]),
  primaryMuscles: z.array(z.string().min(1)).min(1),
  secondaryMuscles: z.array(z.string().min(1)).default([]),
  summary: z.string().min(1),
  adjustment: z.string().min(1),
  steps: z.array(z.string().min(1)).min(3),
  safety: z.array(z.string().min(1)).min(2),
  commonErrors: z.array(z.string().min(1)).min(2),
  beginnerTip: z.string().min(1),
  recognitionHints: z.array(z.string().min(1)).min(2).optional(),
  exerciseVariants: z.array(equipmentExerciseVariantSchema).optional(),
  videoRecommendation: videoRecommendationSchema,
  similarEquipmentIds: z.array(z.string().min(1)).min(1)
});

export type EquipmentCard = z.infer<typeof equipmentCardSchema>;
export type EquipmentExerciseVariant = z.infer<typeof equipmentExerciseVariantSchema>;
