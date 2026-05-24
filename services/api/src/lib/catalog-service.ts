import { getEquipmentCard, getSupportedEquipmentIds } from '@gym-equipment-ai/shared';

export function resolveEquipmentPayload(id: string) {
  return getEquipmentCard(id);
}

export function isSupportedEquipment(id: string) {
  return getSupportedEquipmentIds().includes(id);
}
