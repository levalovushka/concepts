#!/usr/bin/env node
/**
 * Медиа концепта «Петля», которое нельзя заменить фотографией:
 * схема вязания, этикетка мотка, карта кварталов.
 *
 * Всё остальное — фотографии CC0 в assets/photos (см. CREDITS.md,
 * добор: node scripts/fetch-photos.mjs petlya).
 *
 *   node concepts/petlya/media.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { seeded } from '../../kernel/media-primitives.mjs';

const out = join(new URL('.', import.meta.url).pathname, 'assets', 'media');
mkdirSync(out, { recursive: true });

/* ——— схема вязания ——— */

function chart({ cols = 11, rows = 13, cell = 34, active = 4 } = {}) {
  const W = cols * cell, H = rows * cell;
  const pad = 26;
  const rnd = seeded(5);
  const sym = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cell, y = r * cell;
      const mid = Math.floor(cols / 2);
      const d = Math.abs(c - mid);
      let kind = 'knit';
      if (r % 2 === 1) kind = 'purl';
      else if (d === 0) kind = 'yo';
      else if (d === 3) kind = c < mid ? 'k2tog' : 'ssk';
      else if (rnd() > 0.82) kind = 'purl';

      const cx = x + cell / 2, cy = y + cell / 2;
      if (kind === 'purl') {
        sym.push(`<circle cx="${cx}" cy="${cy}" r="3.4" fill="#2b3336"/>`);
      } else if (kind === 'yo') {
        sym.push(`<circle cx="${cx}" cy="${cy}" r="7" fill="none" stroke="#2b3336" stroke-width="2"/>`);
      } else if (kind === 'k2tog') {
        sym.push(`<path d="M${cx - 8} ${cy + 8} L${cx + 8} ${cy - 8}" stroke="#2b3336" stroke-width="2.4" stroke-linecap="round"/>`);
      } else if (kind === 'ssk') {
        sym.push(`<path d="M${cx - 8} ${cy - 8} L${cx + 8} ${cy + 8}" stroke="#2b3336" stroke-width="2.4" stroke-linecap="round"/>`);
      }
    }
  }
  const grid = [];
  for (let c = 0; c <= cols; c++)
    grid.push(`<path d="M${c * cell} 0 V${H}" stroke="#c3cdd0" stroke-width="${c % 5 === 0 ? 1.6 : 0.8}"/>`);
  for (let r = 0; r <= rows; r++)
    grid.push(`<path d="M0 ${r * cell} H${W}" stroke="#c3cdd0" stroke-width="${r % 5 === 0 ? 1.6 : 0.8}"/>`);

  const nums = [];
  for (let r = 0; r < rows; r++) {
    const n = rows - r;
    const side = n % 2 === 1;
    nums.push(`<text x="${side ? W + 9 : -9}" y="${r * cell + cell / 2 + 4}" font-family="IBM Plex Mono, ui-monospace, monospace"
      font-size="12" fill="#7c898d" text-anchor="${side ? 'start' : 'end'}">${n}</text>`);
  }

  const ay = (rows - active) * cell;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W + pad * 2}" height="${H + pad * 2}" viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}">
  <rect x="${-pad}" y="${-pad}" width="${W + pad * 2}" height="${H + pad * 2}" fill="#f7f4ee"/>
  <rect width="${W}" height="${H}" fill="#fff"/>
  <rect x="0" y="${ay}" width="${W}" height="${cell}" fill="#0d8a7a" opacity=".12"/>
  <rect x="0" y="${ay}" width="${W}" height="${cell}" fill="none" stroke="#0d8a7a" stroke-width="2"/>
  ${grid.join('')}
  ${sym.join('')}
  ${nums.join('')}
  <rect width="${W}" height="${H}" fill="none" stroke="#8f9b9e" stroke-width="2"/>
</svg>`;
}

writeFileSync(join(out, 'chart.svg'), chart({ rows: 11 }));

/* ——— карта ——— */

/** Подложка для «Пряжи рядом»: светлая схема кварталов в духе Карт Apple. */
function mapTile(W = 780, H = 560) {
  const rnd = seeded(17);
  const road = (d, w, cap = 'round') =>
    `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="${w}" stroke-linecap="${cap}"/>`;
  const casing = (d, w, cap = 'round') =>
    `<path d="${d}" fill="none" stroke="#e2ded4" stroke-width="${w + 3}" stroke-linecap="${cap}"/>`;

  const lines = [
    ['M-20 150 Q 200 128 420 158 T 800 140', 16],
    ['M-20 330 Q 240 352 460 330 T 800 348', 22],
    ['M-20 486 Q 260 466 520 492 T 800 476', 14],
    ['M120 -20 Q 138 200 118 400 T 140 580', 15],
    ['M340 -20 Q 356 180 344 380 T 358 580', 20],
    ['M560 -20 Q 574 200 556 400 T 572 580', 13],
    ['M660 -20 Q 672 160 656 340 T 668 580', 10],
  ];

  const blocks = Array.from({ length: 26 }, () => {
    const x = rnd() * W, y = rnd() * H;
    const w = 26 + rnd() * 54, h = 22 + rnd() * 44;
    return `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="3" fill="#e8e4da"/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#f3f0e9"/>
  <path d="M-20 470 Q 120 430 250 470 Q 380 512 520 468 Q 640 430 800 458 L800 600 L-20 600 Z" fill="#bfdcea"/>
  <ellipse cx="196" cy="212" rx="132" ry="88" fill="#d7e8c8"/>
  <ellipse cx="612" cy="252" rx="96" ry="70" fill="#d7e8c8"/>
  ${blocks}
  ${lines.map(([d, w]) => casing(d, w)).join('')}
  ${lines.map(([d, w]) => road(d, w)).join('')}
  <g font-family="Outfit, sans-serif" font-size="13" fill="#8b8578">
    <text x="150" y="216">Парк</text>
    <text x="576" y="256">Сквер</text>
    <text x="386" y="322" transform="rotate(-3 386 322)">ул. Садовая</text>
    <text x="128" y="300" transform="rotate(-86 128 300)">пр. Мира</text>
  </g>
</svg>`;
}

writeFileSync(join(out, 'map.svg'), mapTile());

/* ——— этикетка мотка ——— */

/** Цель сканирования: состав, метраж, спицы и — главное — номер партии. */
const label = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="300" viewBox="0 0 520 300">
  <defs>
    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fbf8f2"/><stop offset="100%" stop-color="#eee7db"/>
    </linearGradient>
  </defs>
  <rect width="520" height="300" rx="10" fill="url(#pg)"/>
  <rect x="10" y="10" width="500" height="280" rx="6" fill="none" stroke="#0d8a7a" stroke-width="2.5"/>
  <text x="36" y="66" font-family="Outfit, sans-serif" font-weight="700" font-size="30" fill="#14181a">MERINO SOFT</text>
  <text x="36" y="94" font-family="Outfit, sans-serif" font-size="15" fill="#667078">100% меринос · extrafine</text>
  <path d="M36 112 H484" stroke="#cfd6d8" stroke-width="1.5"/>
  <text x="36" y="146" font-family="Outfit, sans-serif" font-weight="600" font-size="17" fill="#14181a">100 г · 320 м</text>
  <text x="36" y="174" font-family="Outfit, sans-serif" font-size="15" fill="#667078">Спицы 3,5 – 4,0 мм · 22 п. × 30 р. = 10 см</text>
  <g font-family="IBM Plex Mono, ui-monospace, monospace" font-size="14" fill="#14181a">
    <text x="36" y="214">ЦВЕТ 4127</text>
    <text x="176" y="214">ПАРТИЯ 23-А</text>
  </g>
  <text x="36" y="262" font-family="Outfit, sans-serif" font-size="13" fill="#8b959a">Ручная стирка 30° · сушить горизонтально</text>
  <g fill="#14181a">
    ${Array.from({ length: 34 }, (_, i) => {
      const w = [1.6, 3, 2, 4.4][i % 4];
      return `<rect x="${330 + i * 5}" y="${196}" width="${w}" height="46"/>`;
    }).join('')}
  </g>
  <text x="330" y="262" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="11" fill="#8b959a">4 607 128 004 127</text>
</svg>`;
writeFileSync(join(out, 'label.svg'), label);

console.log('медиа готово:', out);
