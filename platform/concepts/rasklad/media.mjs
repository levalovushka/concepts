#!/usr/bin/env node
/**
 * Медиа концепта «Расклад» — только данные, нарисованные кодом.
 *
 * Ни фотографий, ни иллюстраций: там, где по макету картинка (аверс карты,
 * фото расклада на столе, превью пака), в разметке стоит плейсхолдер `.ph`.
 * Здесь живёт то, без чего фича непонятна:
 *
 *   wave.svg    волновая форма дорожки размышления с отыгранной частью
 *   series.svg  сетка вечеров практики: где практика была, где пропуск
 *   deck.svg    прогресс по колоде: сколько карт из 44 уже прошли
 *   marker.svg  то, что читает камера: номер и метка в углу карты
 *
 * Псевдослучай детерминированный (seeded), поэтому пересборка даёт побайтово
 * тот же файл.
 *
 *   node concepts/rasklad/media.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { mix, seeded } from '../../kernel/media-primitives.mjs';

const out = join(new URL('.', import.meta.url).pathname, 'assets', 'media');
mkdirSync(out, { recursive: true });

const ACCENT = '#3a5a8c';
const INK = '#1b2330';
const DIM = '#8d97a8';
const IDLE = '#d7dce6';
/* Пустой вечер и непройденная карта обязаны читаться на белой панели:
   слишком светлый серый превращает сетку в шум. */
const EMPTY = '#dfe4ed';
const PAPER = '#f4f2ec';
const FACE = 'Geist, system-ui, sans-serif';
const MONO = 'Geist Mono, ui-monospace, monospace';

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n${body}\n</svg>\n`;

/* ——— волновая форма дорожки ———
   Слушают с закрытыми глазами, поэтому форма нужна не для «покрутить», а чтобы
   на открытом экране было видно: дорожка длинная и ровная, всплесков нет. */

function wave({ W = 660, H = 120, bars = 82, played = 0.29 } = {}) {
  const rnd = seeded(31);
  const gap = 3;
  const bw = (W - gap * (bars - 1)) / bars;
  const mid = H / 2;
  const cut = Math.round(bars * played);
  const items = [];
  for (let i = 0; i < bars; i++) {
    /* Речь: ровная база, редкие вдохи-паузы. Огибающая — не музыкальная. */
    const t = i / (bars - 1);
    const env = 0.42 + 0.3 * Math.sin(t * Math.PI * 1.6) + 0.16 * Math.sin(t * Math.PI * 7.3);
    const pause = rnd() > 0.9 ? 0.28 : 1;
    const h = Math.max(6, Math.min(H - 12, (env + rnd() * 0.28) * pause * (H - 16)));
    const x = i * (bw + gap);
    const fill = i < cut ? ACCENT : IDLE;
    items.push(`  <rect x="${x.toFixed(1)}" y="${(mid - h / 2).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${(bw / 2).toFixed(1)}" fill="${fill}"/>`);
  }
  /* Игла воспроизведения — единственная вертикаль в кадре. */
  const px = cut * (bw + gap) - gap / 2;
  items.push(`  <rect x="${px.toFixed(1)}" y="2" width="2" height="${H - 4}" rx="1" fill="${INK}"/>`);
  return svg(W, H, items.join('\n'));
}

writeFileSync(join(out, 'wave.svg'), wave());

/* ——— серия вечеров ———
   Практика ежевечерняя, поэтому единица измерения — вечер, а не минуты. */

function series({ cols = 7, rows = 5, cell = 34, gap = 9, streak = 12 } = {}) {
  const rnd = seeded(7);
  const pad = 4;
  const head = 22;
  const W = cols * cell + (cols - 1) * gap + pad * 2;
  const H = rows * cell + (rows - 1) * gap + pad * 2 + head;
  const days = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
  const total = cols * rows;
  const items = days.map((d, i) =>
    `  <text x="${pad + i * (cell + gap) + cell / 2}" y="${head - 8}" font-family="${FACE}" font-size="11" font-weight="500" fill="${DIM}" text-anchor="middle">${d}</text>`);
  for (let i = 0; i < total; i++) {
    const x = pad + (i % cols) * (cell + gap);
    const y = head + pad + Math.floor(i / cols) * (cell + gap);
    /* Последние `streak` вечеров подряд — та самая серия; раньше были пропуски. */
    const isStreak = i >= total - streak;
    const done = isStreak || rnd() > 0.42;
    const isToday = i === total - 1;
    const fill = done ? (isStreak ? ACCENT : mix(ACCENT, '#ffffff', 0.52)) : EMPTY;
    items.push(`  <rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="9" fill="${fill}"${isToday ? ` stroke="${INK}" stroke-width="2"` : ''}/>`);
  }
  return svg(W, H, items.join('\n'));
}

writeFileSync(join(out, 'series.svg'), series());

/* ——— прогресс по колоде ———
   44 карты = 44 разных вопроса. Видно, сколько уже задано и сколько ещё нет. */

function deck({ total = 44, done = 12, W = 660, H = 92 } = {}) {
  const pad = 6;
  const gap = 4;
  const bw = (W - pad * 2 - gap * (total - 1)) / total;
  const top = 8;
  const items = [];
  for (let i = 0; i < total; i++) {
    const x = pad + i * (bw + gap);
    const tall = (i + 1) % 10 === 0;
    const h = tall ? 52 : 42;
    const passed = i < done;
    const next = i === done;
    items.push(`  <rect x="${x.toFixed(1)}" y="${top + (52 - h)}" width="${bw.toFixed(1)}" height="${h}" rx="${(bw / 2).toFixed(1)}"`
      + (next ? ` fill="#ffffff" stroke="${ACCENT}" stroke-width="2.4" stroke-dasharray="5 3"` : ` fill="${passed ? ACCENT : '#c6cfdd'}"`) + '/>');
    if (tall) {
      items.push(`  <text x="${(x + bw / 2).toFixed(1)}" y="${top + 72}" font-family="${MONO}" font-size="14" fill="#6d7786" text-anchor="middle">${String(i + 1).padStart(2, '0')}</text>`);
    }
  }
  return svg(W, H, items.join('\n'));
}

writeFileSync(join(out, 'deck.svg'), deck());

/* ——— метка в углу карты ———
   Цель сканирования: номер и детерминированная точечная метка. Рисунок карты
   камера не распознаёт — это было бы обещанием, которого сборка не выполняет. */

function marker({ n = 7, W = 420, H = 260 } = {}) {
  const rnd = seeded(n * 97 + 3);
  const grid = 7;
  const dot = 15;
  const ox = 244;
  const oy = 74;
  const dots = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      /* Рамка метки постоянная, внутренние точки — от номера карты. */
      const edge = r === 0 || c === 0 || r === grid - 1 || c === grid - 1;
      const on = edge ? (r + c) % 2 === 0 : rnd() > 0.45;
      if (!on) continue;
      dots.push(`  <rect x="${ox + c * dot}" y="${oy + r * dot}" width="${dot - 2}" height="${dot - 2}" rx="2" fill="${INK}"/>`);
    }
  }
  return svg(W, H, [
    `  <rect width="${W}" height="${H}" rx="14" fill="${PAPER}"/>`,
    `  <rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="9" fill="none" stroke="${ACCENT}" stroke-width="2"/>`,
    `  <text x="34" y="86" font-family="${MONO}" font-size="64" font-weight="500" fill="${INK}">${String(n).padStart(2, '0')}</text>`,
    `  <text x="34" y="122" font-family="${FACE}" font-size="19" font-weight="600" fill="${INK}">МОСТ</text>`,
    `  <text x="34" y="152" font-family="${FACE}" font-size="14" fill="${DIM}">Базовая колода · 44 карты</text>`,
    `  <path d="M34 176 H${W - 34}" stroke="${IDLE}" stroke-width="1.5"/>`,
    `  <text x="34" y="204" font-family="${MONO}" font-size="13" fill="${DIM}">RSK-BASE-${String(n).padStart(2, '0')}</text>`,
    ...dots,
  ].join('\n'));
}

writeFileSync(join(out, 'marker.svg'), marker());

console.log('медиа готово:', out);
