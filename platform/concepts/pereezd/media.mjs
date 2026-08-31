#!/usr/bin/env node
/**
 * Медиа концепта «Переезд». Всё рисуется кодом — стоковых фото нет.
 * Общие примитивы — в kernel/media-primitives.mjs.
 *
 *   node concepts/pereezd/media.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { mix, dark, lite, seeded } from '../../kernel/media-primitives.mjs';

const out = join(new URL('.', import.meta.url).pathname, 'assets', 'media');
mkdirSync(out, { recursive: true });

console.log('медиа готово:', out);
