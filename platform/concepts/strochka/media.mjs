#!/usr/bin/env node
/** Медиа «Строчки»: обложки, партитуры и документальная репетиция. */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(new URL('.', import.meta.url).pathname, 'assets', 'media');
const assets = ['covers-v2.png', 'scores-v2.png', 'rehearsal-v2.png'];
for (const asset of assets) {
  const path = join(dir, asset);
  if (!existsSync(path)) throw new Error(`Нет assets/media/${asset}`);
}
console.log('медиа готово:', assets.join(', '));
