#!/usr/bin/env node
/**
 * Медиа «Строчки» — единый растровый sprite реалистичных хоровых материалов:
 * ноты на фортепиано, папка программы, репетиционный зал и крупный фрагмент партитуры.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const asset = join(new URL('.', import.meta.url).pathname, 'assets', 'media', 'choir-materials.png');
if (!existsSync(asset)) throw new Error('Нет assets/media/choir-materials.png');
console.log('медиа готово:', asset);
