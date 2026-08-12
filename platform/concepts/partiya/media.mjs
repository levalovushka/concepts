#!/usr/bin/env node
/**
 * Медиа концепта «Партия». Своих ассетов нет: всё, что было бы фотографией
 * (страница нот, обложка номера, снимок с репетиции), — плейсхолдер .ph.
 * Данные, которые нужно видеть, нарисованы в разметке и CSS: линейка тактов
 * по репетиционным буквам, рамка сканера, столбцы прогонов по неделям.
 *
 *   node concepts/partiya/media.mjs
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const out = join(new URL('.', import.meta.url).pathname, 'assets', 'media');
mkdirSync(out, { recursive: true });

console.log('медиа готово:', out);
