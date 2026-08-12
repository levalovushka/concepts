#!/usr/bin/env node
/**
 * Медиа концепта «Радиус» лежат в assets/media.
 * Это оригинальные проектные кадры; стоковые изображения не используются.
 *
 *   node concepts/radius/media.mjs
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const out = join(new URL('.', import.meta.url).pathname, 'assets', 'media');
mkdirSync(out, { recursive: true });

console.log('медиа готово:', out);
