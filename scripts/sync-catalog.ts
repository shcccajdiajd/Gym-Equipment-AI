import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { equipmentCatalog } from '../packages/shared/src/catalog.js';

const targetPath = resolve('apps/miniprogram/miniprogram/data/catalog.ts');
const output = `export const equipmentCatalog = ${JSON.stringify(equipmentCatalog, null, 2)} as const;

export function getEquipmentCard(id: string) {
  return equipmentCatalog.find((item) => item.id === id) ?? null;
}
`;

async function main() {
  await mkdir(resolve('apps/miniprogram/miniprogram/data'), { recursive: true });
  await writeFile(targetPath, output, 'utf8');
  console.log(`Catalog synced to ${targetPath}`);
}

void main();
