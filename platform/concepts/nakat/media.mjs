#!/usr/bin/env node
/**
 * Медиа концепта «Накат». Рисуются только данные: карта кварталов с треком
 * экзаменационного маршрута и матрица QR-кода. Фотографий нет — вместо них
 * плейсхолдер `.ph` в разметке.
 *
 *   node concepts/nakat/media.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { seeded } from '../../kernel/media-primitives.mjs';

const out = join(new URL('.', import.meta.url).pathname, 'assets', 'media');
mkdirSync(out, { recursive: true });

const W = 375;
const H = 238;

/* ——— карта: кварталы, улицы, трек маршрута №3 ——— */
function map() {
  const rnd = seeded(4127);
  const blocks = [];
  /* Сетка кварталов с неровными краями: город не рисуется по линейке. */
  for (let y = -20; y < H + 20; y += 62) {
    for (let x = -20; x < W + 20; x += 74) {
      const dx = Math.round(rnd() * 10);
      const dy = Math.round(rnd() * 8);
      const w = 52 + Math.round(rnd() * 14);
      const h = 40 + Math.round(rnd() * 12);
      blocks.push(`<rect x="${x + dx}" y="${y + dy}" width="${w}" height="${h}" rx="3" fill="#e6e1d7"/>`);
    }
  }
  const streetsV = [92, 214, 318].map((x) => `<path d="M${x} -10V${H + 10}" stroke="#fff" stroke-width="9"/>`);
  const streetsH = [58, 128, 196].map((y) => `<path d="M-10 ${y}H${W + 10}" stroke="#fff" stroke-width="9"/>`);
  /* Трек маршрута №3: Кабельная → Гвардейская → площадь Победы. */
  const route = 'M62 214 L92 214 L92 128 L214 128 L214 58 L318 58';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#f3f0e9"/>
${blocks.join('\n')}
<path d="M-10 172H${W + 10}" stroke="#efe7cf" stroke-width="16"/>
${streetsH.join('\n')}
${streetsV.join('\n')}
<path d="${route}" fill="none" stroke="#1e56a0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>
<path d="${route}" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="7 9" stroke-linecap="round"/>
<g font-family="Inter, system-ui, sans-serif" font-size="9" fill="#8a8578" letter-spacing="0.4">
<text x="98" y="150" transform="rotate(-90 98 150)">Кабельная</text>
<text x="120" y="122">Гвардейская</text>
<text x="228" y="52">пл. Победы</text>
</g>
</svg>
`;
}

/* ——— QR: матрица с тремя finder-паттернами ——— */
function qr(seed) {
  const N = 25;
  const rnd = seeded(seed);
  const cell = 8;
  const on = [];
  const finder = (cx, cy) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        if (edge || core) on.push([cx + x, cy + y]);
      }
    }
  };
  const inFinder = (x, y) =>
    (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (inFinder(x, y)) continue;
      if (rnd() > 0.52) on.push([x, y]);
    }
  }
  finder(0, 0);
  finder(N - 7, 0);
  finder(0, N - 7);
  const rects = on
    .map(([x, y]) => `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}"/>`)
    .join('');
  const side = N * cell;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}" viewBox="0 0 ${side} ${side}">
<rect width="${side}" height="${side}" fill="#fff"/>
<g fill="#111">${rects}</g>
</svg>
`;
}

writeFileSync(join(out, 'map.svg'), map());
writeFileSync(join(out, 'qr.svg'), qr(8831));

console.log('медиа готово:', out);
