#!/usr/bin/env node
/**
 * Спрайт иконок из Lucide → kernel/icons.svg.
 *
 *   node scripts/gen-icons.mjs
 *
 * Иконки — данные, а не рисунки от руки: набор перечислен в ICONS, геометрия
 * приходит из библиотеки. Итоговый файл самодостаточен (открывается по file://),
 * поэтому CDN не годится — спрайт инлайнится в index.html при сборке.
 *
 * Lucide, ISC License © Lucide Contributors.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { KERNEL, ROOT } from './lib.mjs';

const VERSION = '0.525.0';

/** Набор проекта. Добавляя иконку на экран — впиши её сюда, а не рисуй руками. */
export const ICONS = [
  // навигация и системное
  'chevron-left', 'chevron-right', 'x', 'check', 'plus', 'minus', 'ellipsis',
  'search', 'settings', 'info', 'external-link', 'share', 'lock', 'menu', 'copy',
  // медиа
  'play', 'pause', 'tv-minimal', 'cast', 'volume-2', 'picture-in-picture-2',
  'rotate-ccw', 'rotate-cw', 'mic', 'video',
  // съёмка и распознавание
  'camera', 'scan-line', 'image', 'images',
  // карты и ссылки
  'map-pin', 'link', 'unlink', 'globe', 'bookmark', 'download',
  // разделы приложения
  'book-open', 'layout-grid', 'user', 'bell', 'megaphone', 'shield',
  // состояния
  'circle-alert', 'triangle-alert', 'circle-x', 'search-x', 'loader-circle',
  // соседская сеть: разделы, дом и его инфраструктура
  'house', 'message-circle', 'users', 'wifi', 'qr-code', 'key', 'scan-face',
  'gauge', 'droplets', 'zap', 'trash-2', 'clock', 'calendar', 'calendar-plus',
  // лента и чат
  'heart', 'eye', 'repeat-2', 'pin', 'send', 'paperclip', 'badge-check', 'chevron-down',
];

/** Иконки берём из локального lucide-static: сборка не ходит в сеть. */
function iconSvg(name) {
  const file = join(ROOT, 'node_modules', 'lucide-static', 'icons', name + '.svg');
  if (!existsSync(file)) throw new Error(`нет иконки ${name} в lucide-static — проверьте имя на lucide.dev`);
  return readFileSync(file, 'utf8');
}

/** Внутренности <svg>…</svg> без обёртки: атрибуты штриха задаёт CSS. */
const innerOf = (svg) => svg
  .replace(/[\s\S]*?<svg[^>]*>/, '')
  .replace(/<\/svg>[\s\S]*/, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const symbols = ICONS.map((name) =>
  `<symbol id="i-${name}" viewBox="0 0 24 24">${innerOf(iconSvg(name))}</symbol>`);

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true"><defs>
${symbols.join('\n')}
</defs></svg>`;

writeFileSync(join(KERNEL, 'icons.svg'), sprite + '\n');
console.log(`спрайт готов: kernel/icons.svg · ${symbols.length} иконок · Lucide ${VERSION}`);
