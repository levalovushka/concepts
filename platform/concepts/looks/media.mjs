#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const out = join(fileURLToPath(new URL('.', import.meta.url)), 'assets', 'media');
const photos = ['photo-1.jpg', 'photo-2.jpg', 'photo-3.jpg', 'photo-4.jpg'];
const missing = photos.filter((name) => !existsSync(join(out, name)));

if (missing.length) {
  throw new Error(`Не хватает фото: ${missing.join(', ')}`);
}

console.log('медиа готово:', out);
