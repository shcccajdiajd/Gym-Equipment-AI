import { equipmentCatalog, getSupportedEquipmentIds } from '@gym-equipment-ai/shared';

const categoryLabels: Record<string, string> = {
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  legs: 'legs',
  glutes: 'glutes',
  arms: 'arms',
  core: 'core',
  compound: 'compound'
};

export const RECOGNIZED_CONFIDENCE_THRESHOLD = 0.82;

function buildFallbackHints(item: (typeof equipmentCatalog)[number]): string[] {
  return [item.summary, item.adjustment, item.steps[0]];
}

function buildCatalogDescriptor() {
  return equipmentCatalog
    .map((item) => {
      const hints = item.recognitionHints ?? buildFallbackHints(item);
      return [
        `- id: ${item.id}`,
        `zhName: ${item.zhName}`,
        `enName: ${item.enName}`,
        `category: ${categoryLabels[item.category]}`,
        `primaryMuscles: ${item.primaryMuscles.join(', ')}`,
        `recognitionHints: ${hints.join('；')}`,
        `similarConfusions: ${item.similarEquipmentIds.join(', ')}`
      ].join(' | ');
    })
    .join('\n');
}

export function buildRecognitionPrompt(source: 'camera' | 'album') {
  const supportedIds = getSupportedEquipmentIds();

  return [
    'You classify Chinese gym machine photos for beginner-safe fitness guidance.',
    'Use visible machine structure, handle position, seat/chest-pad layout, and expected motion path.',
    'Do not guess from gym context alone.',
    'Be especially careful with confusing pairs: pec-deck-fly vs seated-row, seated-chest-press vs shoulder-press, lat-pulldown vs seated-row.',
    `Choose one id from this list only: ${supportedIds.join(', ')}.`,
    'If the visible machine cannot be distinguished confidently from a similar machine, return topMatchId as null and confidence <= 0.4.',
    'If the image is partial, blurry, or the machine family remains ambiguous, return null instead of guessing.',
    'Return exactly one JSON object with this shape and no extra explanation: {"topMatchId":"one-supported-id-or-null","confidence":0.0,"alternatives":["up-to-3-supported-ids"]}.',
    'Use catalog ids in topMatchId and alternatives, not zhName, enName, or name fields.',
    'Catalog reference:',
    buildCatalogDescriptor(),
    `Source: ${source}. Return JSON only.`
  ].join('\n');
}
