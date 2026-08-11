#!/usr/bin/env node
/**
 * Медиа концепта «Праймер». Фотографий и иллюстраций здесь нет — вместо них
 * плейсхолдер `.ph` в разметке. Кодом рисуются только ДАННЫЕ, без которых
 * фича непонятна:
 *
 *   wave.svg     волновая форма аудиодорожки мастеркласса (что играет и где мы)
 *   barcode.svg  этикетка баночки с настоящим EAN-13 — цель сканирования
 *   recipe.svg   пропорции замеса: из чего и в каких частях получается оттенок
 *
 * Всё детерминированно: seeded-псевдослучай вместо Math.random, поэтому
 * пересборка даёт побайтово тот же результат.
 *
 *   node concepts/primer/media.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { seeded, hex } from '../../kernel/media-primitives.mjs';

const out = join(new URL('.', import.meta.url).pathname, 'assets', 'media');
mkdirSync(out, { recursive: true });

const ACCENT = '#2b6b8f';
const MONO = 'Geist Mono, ui-monospace, monospace';
const FACE = 'Geist, system-ui, sans-serif';

/* ——— волновая форма аудиодорожки ———
   Мастеркласс — это речь: плотная огибающая с паузами между шагами.
   Пройденная часть окрашена акцентом, поэтому дорожка сама показывает позицию. */

function wave({ W = 686, H = 96, bar = 4, gap = 3, played = 0.3, seed = 11 } = {}) {
  const rnd = seeded(seed);
  const n = Math.floor((W + gap) / (bar + gap));
  const bars = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const env = 0.4 + 0.34 * Math.sin(t * Math.PI * 3.1) ** 2 + 0.16 * Math.sin(t * Math.PI * 11);
    const pause = Math.sin(t * Math.PI * 7) > 0.93 ? 0.22 : 1;
    const h = Math.max(4, Math.min(H, env * (0.6 + 0.4 * rnd()) * pause * H));
    const x = i * (bar + gap);
    bars.push(`<rect x="${x}" y="${((H - h) / 2).toFixed(1)}" width="${bar}" height="${h.toFixed(1)}" rx="${bar / 2}" fill="${t <= played ? ACCENT : '#7d756e'}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${bars.join('')}</svg>`;
}

writeFileSync(join(out, 'wave.svg'), wave());

/* ——— этикетка баночки: настоящий EAN-13 ———
   Сканируется штрихкод, а не цвет по снимку, поэтому код должен быть настоящим:
   таблицы L/G/R и контрольная цифра — как в стандарте. */

const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
const R = L.map((s) => [...s].map((b) => (b === '0' ? '1' : '0')).join(''));
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

/** Контрольная цифра EAN-13: чётные позиции с весом 3. */
function ean13Check(d12) {
  const sum = [...d12].reduce((a, c, i) => a + Number(c) * (i % 2 ? 3 : 1), 0);
  return String((10 - (sum % 10)) % 10);
}

/** Строка из 95 модулей: guard · 6 цифр · center · 6 цифр · guard. */
function ean13Modules(code13) {
  const d = [...code13].map(Number);
  const parity = PARITY[d[0]];
  let bits = '101';
  for (let i = 0; i < 6; i++) bits += (parity[i] === 'L' ? L : G)[d[i + 1]];
  bits += '01010';
  for (let i = 0; i < 6; i++) bits += R[d[i + 7]];
  return bits + '101';
}

function potLabel({ brand = 'FERRUM COLORS', name = 'Rust Brown', code = 'FC-4127', vol = '17 ml · acrylic', d12 = '460712804127' } = {}) {
  const ean = d12 + ean13Check(d12);
  const bits = ean13Modules(ean);
  const mod = 2.9;
  const bw = bits.length * mod;
  const x0 = 228, y0 = 150, bh = 66;
  const bars = [];
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '0') continue;
    /* Guard-модули длиннее — как в напечатанном коде. */
    const guard = i < 3 || i >= bits.length - 3 || (i >= 45 && i < 50);
    bars.push(`<rect x="${(x0 + i * mod).toFixed(2)}" y="${y0}" width="${mod.toFixed(2)}" height="${guard ? bh + 10 : bh}" fill="#14181a"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="262" viewBox="0 0 520 262">
  <rect width="520" height="262" rx="10" fill="#f6f2ec"/>
  <rect x="9" y="9" width="502" height="244" rx="6" fill="none" stroke="${ACCENT}" stroke-width="2.5"/>
  <rect x="34" y="34" width="72" height="72" rx="8" fill="#6b3f2a"/>
  <text x="122" y="62" font-family="${FACE}" font-weight="700" font-size="27" fill="#14181a">${name.toUpperCase()}</text>
  <text x="122" y="88" font-family="${FACE}" font-size="15" fill="#6b7278">${brand} · ${vol}</text>
  <text x="34" y="140" font-family="${MONO}" font-size="15" fill="#14181a">${code}</text>
  <text x="34" y="166" font-family="${FACE}" font-size="13" fill="#8b959a">Матовый · база</text>
  <text x="34" y="196" font-family="${FACE}" font-size="13" fill="#8b959a">Взболтать перед</text>
  <text x="34" y="214" font-family="${FACE}" font-size="13" fill="#8b959a">использованием</text>
  <g>${bars.join('')}</g>
  <text x="${x0 + bw / 2}" y="${y0 + bh + 28}" text-anchor="middle" font-family="${MONO}" font-size="15" fill="#14181a" letter-spacing="3">${ean}</text>
</svg>`;
}

writeFileSync(join(out, 'barcode.svg'), potLabel());

/* ——— пропорции замеса ———
   Без пропорций рецепт — просто список красок, поэтому части рисуются
   как площадь: сколько чего в мазке. */

/** Ink по светлоте подложки: цифра должна читаться и на Bone, и на Deep Shade. */
function inkOn(h) {
  const [r, g, b] = hex(h).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.35 ? '#14181a' : '#ffffff';
}

/**
 * Пропорции замеса. Рисуется 1:1 под ширину экрана (375 − 2×16 = 343): если
 * масштабировать, подписи уезжают ниже читаемых 11pt. Названия красок идут
 * строкой в разметке, в картинке — только площади и части.
 */
function recipe(parts, result) {
  const W = 343, H = 76;
  const pad = 8, resW = 58, arrowW = 26, gap = 7;
  const total = parts.reduce((a, p) => a + p.parts, 0);
  const usable = W - pad * 2 - resW - arrowW - gap * (parts.length - 1);
  let x = pad;
  const cols = parts.map((p) => {
    const w = (usable * p.parts) / total;
    const col = `<g>
    <rect x="${x.toFixed(1)}" y="8" width="${w.toFixed(1)}" height="60" rx="8" fill="${p.hex}"/>
    <text x="${(x + w / 2).toFixed(1)}" y="44" text-anchor="middle" font-family="${MONO}" font-size="17" fill="${inkOn(p.hex)}">${p.parts}</text>
  </g>`;
    x += w + gap;
    return col;
  });
  const ax = W - pad - resW - arrowW + 3;
  const rx = W - pad - resW;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  ${cols.join('')}
  <path d="M${ax} 38 h14" stroke="#9aa0a4" stroke-width="2" stroke-linecap="round"/>
  <path d="M${ax + 9} 32 l6 6 -6 6" fill="none" stroke="#9aa0a4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="${rx}" y="8" width="${resW}" height="60" rx="8" fill="${result.hex}"/>
  <text x="${rx + resW / 2}" y="43" text-anchor="middle" font-family="${MONO}" font-size="12" fill="${inkOn(result.hex)}">${result.hex.toUpperCase()}</text>
</svg>`;
}

writeFileSync(join(out, 'recipe.svg'), recipe(
  [
    { hex: '#684030', parts: 3 },
    { hex: '#c9a06a', parts: 1 },
    { hex: '#2b1d16', parts: 1 },
  ],
  { hex: '#6b3f2a' }
));

console.log('медиа готово:', out);
