#!/usr/bin/env node
/**
 * Медиа концепта «Стук». Фотографий и иллюстраций здесь нет — вместо них
 * плейсхолдер .ph. Кодом рисуются только данные, без которых фича непонятна:
 *
 *   wave-ref.svg   эталонная запись симптома из каталога
 *   wave-mine.svg  запись пользователя — её и сравнивают с эталоном
 *   wave-live.svg  дорожка в момент записи: пройденное слева, тишина справа
 *   map.svg        схема кварталов под списком «где взять деталь»
 *
 * Псевдослучай детерминированный (seeded вместо Math.random), поэтому
 * пересборка даёт побайтово тот же файл.
 *
 *   node concepts/stuk/media.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { seeded } from '../../kernel/media-primitives.mjs';

const out = join(new URL('.', import.meta.url).pathname, 'assets', 'media');
mkdirSync(out, { recursive: true });

const ACCENT = '#0077ff';
const STEEL = '#3a5a78';
const IDLE = '#c9c2b8';

/* ——— дорожка звука ———
   Стук — это периодические удары поверх ровного гула: в огибающей должны
   читаться и пики, и фон между ними, иначе две дорожки не сравнить глазом.
   period — удары в секунду, jitter — насколько неровно они идут (у живой
   записи неровнее, чем у студийного эталона). */

function wave({ W = 686, H = 88, bar = 3, gap = 2, seed = 7, period = 9, jitter = 0, hum = 0.16, knock = 0.92, played = 1, color = ACCENT, rest = IDLE } = {}) {
  const rnd = seeded(seed);
  const n = Math.floor((W + gap) / (bar + gap));
  const bars = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const phase = t * Math.PI * 2 * period + jitter * Math.sin(t * 17.3);
    const hit = Math.max(0, Math.sin(phase)) ** 14;
    const noise = hum * (0.55 + 0.45 * rnd());
    const h = Math.max(3, Math.min(H, (noise + hit * knock) * H));
    bars.push(`<rect x="${i * (bar + gap)}" y="${((H - h) / 2).toFixed(1)}" width="${bar}" height="${h.toFixed(1)}" rx="${bar / 2}" fill="${t <= played ? color : rest}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${bars.join('')}</svg>`;
}

writeFileSync(join(out, 'wave-ref.svg'), wave({ seed: 3, period: 9, jitter: 0, hum: 0.12, color: STEEL }));
writeFileSync(join(out, 'wave-mine.svg'), wave({ seed: 11, period: 9, jitter: 0.9, hum: 0.21, color: ACCENT }));
writeFileSync(join(out, 'wave-live.svg'), wave({ seed: 23, period: 8, jitter: 1.4, hum: 0.24, played: 0.68, color: ACCENT }));

/* Миниатюра в списке записей: та же дорожка, но крупным штрихом — на 82 пикселях
   ширины полоски полноразмерной дорожки сливаются в шум. Четыре характера звука:
   стук, тишина после ремонта, ровный гул подшипника, частый цокот. */
const thumb = (o) => wave({ W: 156, H: 62, bar: 3, gap: 3, ...o });
writeFileSync(join(out, 'wave-thumb-mine.svg'), thumb({ seed: 11, period: 3.2, jitter: 0.9, hum: 0.21 }));
writeFileSync(join(out, 'wave-thumb-quiet.svg'), thumb({ seed: 41, period: 3.2, jitter: 1.1, hum: 0.19, knock: 0.12 }));
writeFileSync(join(out, 'wave-thumb-hum.svg'), thumb({ seed: 57, period: 1.1, jitter: 0, hum: 0.42, knock: 0.18 }));
writeFileSync(join(out, 'wave-thumb-tick.svg'), thumb({ seed: 67, period: 6.4, jitter: 0.4, hum: 0.15, knock: 0.55 }));

/* ——— карта кварталов ———
   Подложка списка «где взять деталь»: без неё расстояния до точек —
   просто числа. Дороги, промзона и гаражный массив в духе Карт Apple. */

function mapTile(W = 780, H = 520) {
  const rnd = seeded(29);
  const casing = (d, w) => `<path d="${d}" fill="none" stroke="#e0dbd1" stroke-width="${w + 3}" stroke-linecap="round"/>`;
  const road = (d, w) => `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="${w}" stroke-linecap="round"/>`;

  const lines = [
    ['M-20 118 Q 220 96 440 126 T 800 108', 15],
    ['M-20 296 Q 250 320 470 296 T 800 314', 24],
    ['M-20 452 Q 240 432 500 458 T 800 442', 13],
    ['M148 -20 Q 164 180 144 380 T 166 540', 18],
    ['M392 -20 Q 408 160 396 360 T 410 540', 21],
    ['M614 -20 Q 628 180 610 380 T 624 540', 12],
  ];

  const blocks = Array.from({ length: 22 }, () => {
    const x = rnd() * W, y = rnd() * H;
    const w = 30 + rnd() * 58, h = 24 + rnd() * 40;
    return `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="3" fill="#e9e5db"/>`;
  }).join('');

  /* Гаражный массив: ровные ряды боксов — по ним квартал и узнаётся. */
  const garages = Array.from({ length: 3 }, (_, r) =>
    Array.from({ length: 11 }, (_, c) =>
      `<rect x="${466 + c * 21}" y="${368 + r * 26}" width="17" height="20" rx="2" fill="#ded8cc"/>`).join('')).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#f4f1ea"/>
  <rect x="40" y="150" width="250" height="120" rx="6" fill="#eae6da"/>
  <ellipse cx="676" cy="150" rx="104" ry="72" fill="#dbe8cb"/>
  ${blocks}
  <rect x="458" y="356" width="252" height="96" rx="6" fill="#efeade"/>
  ${garages}
  ${lines.map(([d, w]) => casing(d, w)).join('')}
  ${lines.map(([d, w]) => road(d, w)).join('')}
  <g font-family="Manrope, sans-serif" font-size="13" fill="#8d867a">
    <text x="60" y="176">Промзона</text>
    <text x="640" y="154">Парк</text>
    <text x="470" y="350">ГСК «Восход»</text>
    <text x="300" y="290" transform="rotate(-4 300 290)">Индустриальный пр.</text>
    <text x="156" y="240" transform="rotate(-84 156 240)">ул. Кузнечная</text>
  </g>
</svg>`;
}

writeFileSync(join(out, 'map.svg'), mapTile());

console.log('медиа готово:', out);
