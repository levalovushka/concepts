#!/usr/bin/env node
/**
 * Медиа концепта «Шеллак»: шеллачные диски с бумажными этикетками, бумажные
 * конверты, крупная этикетка под сканер, стол с пластинкой и вертушка.
 *
 * Всё рисуется кодом — стоковых фото нет, поэтому вопросов по правам не
 * возникает. Общие примитивы — в kernel/media-primitives.mjs.
 *
 *   node concepts/shellac/media.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mix, dark, lite, seeded } from '../../kernel/media-primitives.mjs';

const out = join(fileURLToPath(new URL('.', import.meta.url)), 'assets', 'media');
mkdirSync(out, { recursive: true });
const legacyScenes = process.argv.includes('--legacy-scenes');

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const n = (v) => Number(v.toFixed(1));

/* Шеллак — не чёрный, а тёмно-коричневый: смола с наполнителем. */
const SHELLAC = '#020203';
const FACE = 'Inter, system-ui, sans-serif';
const DISPLAY = 'Iowan Old Style, Georgia, serif';
const MONO = 'Geist Mono, ui-monospace, monospace';

/**
 * Каталог этикеток. Названия вымышленные: концепт не изображает существующий
 * лейбл, а записи в паке — общественное достояние.
 */
const RECORDS = [
  ['d1', '#8c1f22', 'ЛИРА', 'Чёрные глаза', 'А. Вертинскій', '2213-А', '1927'],
  ['d2', '#1d5a49', 'ГРАМОФОНЪ', 'Прощай, радость', 'Хоръ Кузнецова', '1841-Б', '1925'],
  ['d3', '#2b4b7a', 'АРТЕЛЬ ЗВУКЪ', 'Полька-мазурка', 'Оркестръ Гольдберга', '3097-А', '1928'],
  ['d4', '#7a4a12', 'ЭХО', 'Гай-да тройка', 'Н. Плевицкая', '0642-А', '1922'],
  ['d5', '#5c2350', 'ЛИРА', 'Вальсъ «Осень»', 'Салонный оркестръ', '2740-Б', '1926'],
  ['d6', '#3f4a1e', 'ЗВУКОЗАПИСЬ', 'Ямщикъ, не гони', 'М. Сокольскій', '1509-А', '1924'],
];

/* ——— этикетка: дуги текста по кругу, как на настоящих пластинках ——— */

/** Дуга под textPath. sweep=1 — верхняя (улыбка вверх), sweep=0 — нижняя. */
const arc = (id, cx, cy, r, up) =>
  `<path id="${id}" d="M${cx - r} ${cy} A${r} ${r} 0 0 ${up ? 1 : 0} ${cx + r} ${cy}" fill="none"/>`;

const onArc = (href, text, size, weight, fill, letter = '.12em') =>
  `<text font-family="${FACE}" font-size="${size}" font-weight="${weight}" fill="${fill}"
    letter-spacing="${letter}"><textPath href="#${href}" startOffset="50%" text-anchor="middle">${text}</textPath></text>`;

/**
 * Бумажная этикетка. R — радиус; suffix разводит id внутри одного файла.
 * Кегли заданы от R, поэтому одна функция обслуживает и превью 400×400,
 * и крупный кадр сканера 520×520.
 *
 * Раскладка как на настоящих пластинках: лейбл дугой сверху, название над
 * шпиндельным отверстием, исполнитель под ним, матрица дугой снизу. Центр
 * занят отверстием, поэтому строк по центру быть не может.
 */
function labelFace(cx, cy, R, { color, label, title, artist, matrix, year }, suffix = '') {
  const k = R / 78;
  const ink = dark(color, 0.66);
  const paper = lite(color, 0.06);
  const s = (v) => n(v * k);
  const y = (t) => n(cy + R * t);
  return `
  <defs>
    <radialGradient id="lp${suffix}" cx="42%" cy="34%" r="72%">
      <stop offset="0%" stop-color="${lite(paper, 0.16)}"/>
      <stop offset="72%" stop-color="${paper}"/>
      <stop offset="100%" stop-color="${dark(paper, 0.16)}"/>
    </radialGradient>
    <filter id="paper${suffix}" x="-12%" y="-12%" width="124%" height="124%">
      <feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" seed="17" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0" result="gray"/>
      <feComposite in="gray" in2="SourceAlpha" operator="in" result="maskedNoise"/>
      <feComponentTransfer in="maskedNoise" result="softNoise"><feFuncA type="table" tableValues="0 .18"/></feComponentTransfer>
      <feBlend in="SourceGraphic" in2="softNoise" mode="soft-light"/>
    </filter>
    ${arc(`at${suffix}`, cx, cy, R * 0.79, true)}
    ${arc(`ab${suffix}`, cx, cy, R * 0.81, false)}
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#lp${suffix})" filter="url(#paper${suffix})"/>
  <circle cx="${cx}" cy="${cy}" r="${n(R * 0.91)}" fill="none" stroke="${ink}" stroke-width="${s(1.1)}" stroke-opacity=".5"/>
  <circle cx="${cx}" cy="${cy}" r="${n(R * 0.87)}" fill="none" stroke="${ink}" stroke-width="${s(0.5)}" stroke-opacity=".3"/>
  <circle cx="${cx}" cy="${cy}" r="${n(R * 0.72)}" fill="none" stroke="${ink}" stroke-width="${s(0.45)}" stroke-opacity=".18"/>
  ${onArc(`at${suffix}`, label, s(10.5), 700, ink, '.2em')}
  ${onArc(`ab${suffix}`, `${matrix} · ${year}`, s(7.5), 600, mix(ink, paper, 0.14), '.14em')}
  <g text-anchor="middle" font-family="${FACE}" fill="${ink}">
    <text x="${cx}" y="${y(-0.24)}" font-family="${DISPLAY}" font-size="${s(12.6)}" font-weight="700" letter-spacing="-.015em">${title}</text>
    <text x="${cx}" y="${y(0.34)}" font-size="${s(8.5)}" font-weight="500" letter-spacing=".01em"
      fill="${mix(ink, paper, 0.12)}">${artist}</text>
    <text x="${cx}" y="${y(0.53)}" font-size="${s(6.5)}" font-weight="600"
      letter-spacing=".1em" fill="${mix(ink, paper, 0.3)}">78 ОБ/МИН · ЭЛЕКТРО</text>
  </g>
  <g fill="${ink}" opacity=".52">
    <path d="M${n(cx - R * .18)} ${y(-.55)} h${s(8)} l${s(4)} ${s(4)} l-${s(4)} ${s(4)} h-${s(8)} l-${s(4)} -${s(4)}z"/>
    <path d="M${n(cx + R * .18)} ${y(-.55)} h-${s(8)} l-${s(4)} ${s(4)} l${s(4)} ${s(4)} h${s(8)} l${s(4)} -${s(4)}z"/>
  </g>
  <text x="${cx}" y="${y(.72)}" text-anchor="middle" font-family="${FACE}" font-size="${s(4.6)}" font-weight="600" letter-spacing=".13em" fill="${ink}" opacity=".55">ЗАПИСАНО ВЪ С.-ПЕТЕРБУРГѢ</text>
  <path d="M${n(cx - R * 0.34)} ${y(-0.13)} H${n(cx + R * 0.34)}" stroke="${ink}" stroke-width="${s(0.6)}" stroke-opacity=".28"/>
  <path d="M${n(cx - R * 0.28)} ${y(0.44)} H${n(cx + R * 0.28)}" stroke="${ink}" stroke-width="${s(0.5)}" stroke-opacity=".2"/>
  <circle cx="${cx}" cy="${cy}" r="${n(R * 0.055)}" fill="${dark(SHELLAC, 0.2)}"/>
  <circle cx="${cx}" cy="${cy}" r="${n(R * 0.055)}" fill="none" stroke="${dark(paper, 0.3)}" stroke-width="${s(0.6)}"/>`;
}

/* ——— диск ——— */

/**
 * Дорожки: концентрические канавки с редкими светлыми разделителями между
 * произведениями. Плотность выбрана так, чтобы на 74 px превью читалась
 * текстура, а не превращалась в серую заливку.
 */
function grooves(cx, cy, rOuter, rInner, seed) {
  const rnd = seeded(seed);
  const g = [];
  for (let r = rInner; r < rOuter; r += 2.1) {
    const o = 0.012 + rnd() * 0.032;
    g.push(`<circle cx="${cx}" cy="${cy}" r="${n(r)}" fill="none" stroke="#c9b7a6" stroke-opacity="${o.toFixed(3)}" stroke-width="1"/>`);
  }
  /* Разделители дорожек — чуть шире и светлее, по ним пластинку и «читают». */
  for (const t of [0.24, 0.63]) {
    const r = rInner + (rOuter - rInner) * t;
    g.push(`<circle cx="${cx}" cy="${cy}" r="${n(r)}" fill="none" stroke="#b9b0cf" stroke-opacity=".1" stroke-width="2"/>`);
  }
  return g.join('');
}

function disc(size, rec, { seed = 9, sheen = true } = {}) {
  const [, color, label, title, artist, matrix, year] = rec;
  const cx = size / 2, cy = size / 2;
  const R = size * 0.49;
  const meta = { color, label, title, artist, matrix, year };
  const rnd = seeded(seed + 101);
  const dust = Array.from({ length: 28 }, () => {
    const a = rnd() * Math.PI * 2;
    const rr = R * (0.45 + rnd() * 0.5);
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(.35 + rnd() * .75)}" fill="#ead9c2" opacity="${(.06 + rnd() * .12).toFixed(3)}"/>`;
  }).join('');
  const scuffs = Array.from({ length: 5 }, (_, i) => {
    const rr = R * (.55 + rnd() * .34);
    const start = 210 + i * 23 + rnd() * 18;
    const end = start + 13 + rnd() * 26;
    const p = (deg) => [n(cx + Math.cos(deg * Math.PI / 180) * rr), n(cy + Math.sin(deg * Math.PI / 180) * rr)];
    const [x1,y1] = p(start), [x2,y2] = p(end);
    return `<path d="M${x1} ${y1} A${n(rr)} ${n(rr)} 0 0 1 ${x2} ${y2}" fill="none" stroke="#f3e7db" stroke-width="${n(.45 + rnd() * .55)}" stroke-opacity="${(.08 + rnd() * .11).toFixed(3)}"/>`;
  }).join('');
  return svg(size, size, `
  <defs>
    <radialGradient id="dg" cx="38%" cy="30%" r="78%">
      <stop offset="0%" stop-color="${lite(SHELLAC, 0.08)}"/>
      <stop offset="62%" stop-color="${SHELLAC}"/>
      <stop offset="100%" stop-color="#010101"/>
    </radialGradient>
    <linearGradient id="sh" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d7c9ff" stop-opacity=".2"/>
      <stop offset="32%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="67%" stop-color="#ffdcb8" stop-opacity=".1"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="dc"><circle cx="${cx}" cy="${cy}" r="${n(R)}"/></clipPath>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${n(R)}" fill="url(#dg)"/>
  <g clip-path="url(#dc)">
    ${grooves(cx, cy, R * 0.97, R * 0.43, seed)}
    ${sheen ? `<rect width="${size}" height="${size}" fill="url(#sh)"/>` : ''}
    ${dust}${scuffs}
  </g>
  <circle cx="${cx}" cy="${cy}" r="${n(R)}" fill="none" stroke="${lite(SHELLAC, 0.22)}" stroke-width="${n(size * 0.006)}" stroke-opacity=".7"/>
  <circle cx="${cx}" cy="${cy}" r="${n(R * 0.995)}" fill="none" stroke="#000" stroke-width="${n(size * 0.004)}" stroke-opacity=".5"/>
  ${labelFace(cx, cy, R * 0.4, meta)}`);
}

for (const rec of RECORDS) {
  writeFileSync(join(out, `${rec[0]}.svg`), disc(400, rec, { seed: 7 + rec[0].charCodeAt(1) * 3 }));
}

/* ——— крупная этикетка: цель сканера ——— */

/**
 * Кадр сканера — сама этикетка почти во всю ширину: приложение читает
 * лейбл, название и матричный номер, а не обложку.
 */
const scanLabel = (() => {
  const S = 520, cx = S / 2, cy = S / 2, R = S * 0.455;
  const rec = RECORDS[0];
  const meta = { color: rec[1], label: rec[2], title: rec[3], artist: rec[4], matrix: rec[5], year: rec[6] };
  const rnd = seeded(31);
  /* Пятна и потёртости: этикетке сто лет, ровной бумаги не бывает. */
  const wear = Array.from({ length: 16 }, () => {
    const a = rnd() * Math.PI * 2, rr = R * (0.3 + rnd() * 0.62);
    return `<ellipse cx="${n(cx + Math.cos(a) * rr)}" cy="${n(cy + Math.sin(a) * rr)}"
      rx="${n(4 + rnd() * 16)}" ry="${n(3 + rnd() * 11)}" fill="#6b4a22" opacity="${(0.03 + rnd() * 0.05).toFixed(3)}"
      transform="rotate(${n(rnd() * 180)} ${n(cx + Math.cos(a) * rr)} ${n(cy + Math.sin(a) * rr)})"/>`;
  }).join('');
  return svg(S, S, `
  <defs>
    <radialGradient id="bg" cx="46%" cy="38%" r="74%">
      <stop offset="0%" stop-color="${lite(SHELLAC, 0.16)}"/>
      <stop offset="70%" stop-color="${SHELLAC}"/>
      <stop offset="100%" stop-color="${dark(SHELLAC, 0.4)}"/>
    </radialGradient>
  </defs>
  <rect width="${S}" height="${S}" fill="url(#bg)"/>
  ${grooves(cx, cy, S * 0.72, R * 1.06, 19)}
  ${labelFace(cx, cy, R, meta, 'S')}
  ${wear}
  <circle cx="${cx}" cy="${cy}" r="${n(R)}" fill="none" stroke="${dark(rec[1], 0.5)}" stroke-width="1.4" stroke-opacity=".5"/>`);
})();
writeFileSync(join(out, 'label.svg'), scanLabel);

/* ——— бумажный конверт ——— */

/**
 * Конверт с вырезом под этикетку — так пластинку и опознают на полке.
 * Кольцевой след внутри: за сто лет диск отпечатывается в бумаге.
 */
function sleeve(size, rec, { paper = '#c9b393', seed = 5 } = {}) {
  const [, color, label, title, artist, matrix, year] = rec;
  const rnd = seeded(seed);
  const cx = size / 2, cy = size * 0.5;
  const hole = size * 0.19;
  const fibres = Array.from({ length: 46 }, () => {
    const x = rnd() * size, y = rnd() * size;
    return `<path d="M${n(x)} ${n(y)} l${n(6 + rnd() * 22)} ${n((rnd() - 0.5) * 7)}"
      stroke="${dark(paper, 0.3)}" stroke-opacity="${(0.05 + rnd() * 0.09).toFixed(3)}" stroke-width="${(0.6 + rnd()).toFixed(1)}"/>`;
  }).join('');
  const corner = `M0 0 l${n(size * 0.1)} 0 l-${n(size * 0.1)} ${n(size * 0.08)} Z`;
  return svg(size, size, `
  <defs>
    <linearGradient id="pp" x1="0" y1="0" x2=".4" y2="1">
      <stop offset="0%" stop-color="${lite(paper, 0.14)}"/>
      <stop offset="58%" stop-color="${paper}"/>
      <stop offset="100%" stop-color="${dark(paper, 0.2)}"/>
    </linearGradient>
    <radialGradient id="vg" cx="50%" cy="46%" r="70%">
      <stop offset="58%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity=".3"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#pp)"/>
  ${fibres}
  <circle cx="${cx}" cy="${cy}" r="${n(size * 0.4)}" fill="none" stroke="${dark(paper, 0.34)}" stroke-width="${n(size * 0.012)}" stroke-opacity=".3"/>
  <circle cx="${cx}" cy="${cy}" r="${n(size * 0.395)}" fill="none" stroke="${lite(paper, 0.4)}" stroke-width="1.4" stroke-opacity=".4"/>
  <circle cx="${cx}" cy="${cy}" r="${n(hole * 1.04)}" fill="${dark(SHELLAC, 0.1)}"/>
  ${labelFace(cx, cy, hole, { color, label, title, artist, matrix, year }, 'V')}
  <circle cx="${cx}" cy="${cy}" r="${n(hole * 1.02)}" fill="none" stroke="#000" stroke-opacity=".34" stroke-width="${n(size * 0.012)}"/>
  <g text-anchor="middle" font-family="${FACE}" fill="${dark(paper, 0.58)}">
    <text x="${cx}" y="${n(size * 0.115)}" font-size="${n(size * 0.043)}" font-weight="700" letter-spacing=".22em">${label}</text>
    <text x="${cx}" y="${n(size * 0.155)}" font-size="${n(size * 0.026)}" font-weight="500" letter-spacing=".1em" opacity=".8">ПЛАСТИНКА 10″ · 78 ОБ/МИН</text>
    <text x="${cx}" y="${n(size * 0.925)}" font-size="${n(size * 0.028)}" font-weight="500" font-family="${MONO}" letter-spacing=".04em" opacity=".75">${matrix}</text>
  </g>
  <path d="${corner}" fill="${lite(paper, 0.5)}" opacity=".7"/>
  <rect width="${size}" height="${size}" fill="url(#vg)"/>`);
}

const SLEEVES = [
  ['s1', RECORDS[0], '#c9b393'],
  ['s2', RECORDS[1], '#b8a888'],
  ['s3', RECORDS[3], '#d2c0a4'],
];
for (const [name, rec, paper] of SLEEVES) {
  writeFileSync(join(out, `${name}.svg`), sleeve(400, rec, { paper, seed: 5 + name.charCodeAt(1) }));
}

/* ——— стол: подложка для камеры и превью ——— */

const wood = '#6b4a30';

const grain = (W, H, seed) => {
  const rnd = seeded(seed);
  return Array.from({ length: Math.round(H / 46) + 5 }, () => {
    const y = rnd() * H;
    return `<path d="M-20 ${n(y)} Q ${W / 2} ${n(y + (rnd() - 0.5) * 30)} ${W + 20} ${n(y + (rnd() - 0.5) * 20)}"
      fill="none" stroke="${dark(wood, 0.5)}" stroke-opacity="${(0.06 + rnd() * 0.08).toFixed(3)}" stroke-width="${(1 + rnd() * 2.6).toFixed(1)}"/>`;
  }).join('');
};

const tableDefs = (W, H) => `
  <linearGradient id="wd" x1="0" y1="0" x2=".28" y2="1">
    <stop offset="0%" stop-color="${lite(wood, 0.18)}"/>
    <stop offset="56%" stop-color="${wood}"/>
    <stop offset="100%" stop-color="${dark(wood, 0.34)}"/>
  </linearGradient>
  <radialGradient id="key" cx="46%" cy="26%" r="64%">
    <stop offset="0%" stop-color="#ffe7c4" stop-opacity=".3"/>
    <stop offset="100%" stop-color="#ffe7c4" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="vg" cx="50%" cy="46%" r="70%">
    <stop offset="56%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity=".46"/>
  </radialGradient>
  <filter id="dsh" x="-40%" y="-40%" width="180%" height="180%">
    <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity=".45"/>
  </filter>`;

/** Диск на столе: без блика-полосы, тень отдельным фильтром. */
function discOn(cx, cy, r, rec, suffix) {
  const [, color, label, title, artist, matrix, year] = rec;
  return `<g filter="url(#dsh)">
    <circle cx="${cx}" cy="${cy}" r="${n(r)}" fill="${SHELLAC}"/>
    <circle cx="${cx}" cy="${cy}" r="${n(r)}" fill="none" stroke="${lite(SHELLAC, 0.2)}" stroke-width="1.6" stroke-opacity=".7"/>
  </g>
  <g clip-path="url(#dclip${suffix})">${grooves(cx, cy, r * 0.97, r * 0.44, 13)}</g>
  <defs><clipPath id="dclip${suffix}"><circle cx="${cx}" cy="${cy}" r="${n(r)}"/></clipPath></defs>
  <g transform="translate(${n(cx - r)} ${n(cy - r)}) scale(${n(r / 200)})">
    <svg width="400" height="400" viewBox="0 0 400 400" overflow="visible">
      ${labelFace(200, 200, 80, { color, label, title, artist, matrix, year }, suffix)}
    </svg>
  </g>`;
}

/** Вертикальная сцена 390×844 — превью камеры на экране «Этикетка». */
writeFileSync(join(out, 'scene-table.svg'), svg(390, 844, `
  <defs>${tableDefs(390, 844)}</defs>
  <rect width="390" height="844" fill="url(#wd)"/>
  ${grain(390, 844, 21)}
  <rect width="390" height="844" fill="url(#key)"/>
  <g transform="rotate(-7 130 300)">
    <rect x="34" y="196" width="228" height="228" rx="4" fill="${dark('#b8a888', 0.06)}" filter="url(#dsh)"/>
    <circle cx="148" cy="310" r="46" fill="${dark('#b8a888', 0.5)}"/>
    ${labelFace(148, 310, 42, {
      color: RECORDS[1][1], label: RECORDS[1][2], title: RECORDS[1][3],
      artist: RECORDS[1][4], matrix: RECORDS[1][5], year: RECORDS[1][6],
    }, 'Q')}
  </g>
  ${discOn(214, 566, 158, RECORDS[0], 'T')}
  <rect width="390" height="844" fill="url(#vg)"/>`));

/** Широкие сцены 390×260 — карточка «Продолжить» и превью в списках. */
writeFileSync(join(out, 'wide-table.svg'), svg(390, 260, `
  <defs>${tableDefs(390, 260)}</defs>
  <rect width="390" height="260" fill="url(#wd)"/>
  ${grain(390, 260, 33)}
  <rect width="390" height="260" fill="url(#key)"/>
  <g transform="rotate(7 320 120)">
    <rect x="248" y="26" width="168" height="168" rx="4" fill="${dark('#c9b393', 0.04)}" filter="url(#dsh)"/>
    <circle cx="332" cy="110" r="33" fill="${dark(SHELLAC, 0.1)}"/>
    ${labelFace(332, 110, 31, {
      color: RECORDS[3][1], label: RECORDS[3][2], title: RECORDS[3][3],
      artist: RECORDS[3][4], matrix: RECORDS[3][5], year: RECORDS[3][6],
    }, 'R')}
  </g>
  ${discOn(138, 134, 104, RECORDS[0], 'W')}
  <rect width="390" height="260" fill="url(#vg)"/>`));

/** Artwork плеера: не голый круг, а физический релиз — конверт и выдвинутая пластинка. */
writeFileSync(join(out, 'player-art.svg'), svg(400, 400, `
  <defs>
    <linearGradient id="pa" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#342d3a"/>
      <stop offset="52%" stop-color="#201b24"/>
      <stop offset="100%" stop-color="#100f12"/>
    </linearGradient>
    <radialGradient id="pal" cx="24%" cy="16%" r="78%">
      <stop offset="0%" stop-color="#d2baff" stop-opacity=".2"/>
      <stop offset="100%" stop-color="#d2baff" stop-opacity="0"/>
    </radialGradient>
    <filter id="pash" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity=".55"/>
    </filter>
    <filter id="dsh" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000" flood-opacity=".5"/>
    </filter>
  </defs>
  <rect width="400" height="400" fill="url(#pa)"/>
  <rect width="400" height="400" fill="url(#pal)"/>
  <g transform="rotate(5 287 197)" filter="url(#pash)">
    <rect x="172" y="70" width="250" height="250" rx="5" fill="#c7b18f"/>
    <circle cx="297" cy="195" r="100" fill="none" stroke="#77634d" stroke-width="5" stroke-opacity=".22"/>
    <circle cx="297" cy="195" r="50" fill="${dark(SHELLAC, .1)}"/>
    ${labelFace(297, 195, 47, {
      color: RECORDS[0][1], label: RECORDS[0][2], title: RECORDS[0][3],
      artist: RECORDS[0][4], matrix: RECORDS[0][5], year: RECORDS[0][6],
    }, 'PA')}
    <text x="297" y="98" text-anchor="middle" font-family="${FACE}" font-size="13" font-weight="700" letter-spacing=".18em" fill="#514231">ЛИРА</text>
  </g>
  <g transform="rotate(-7 145 218)">${discOn(145, 218, 166, RECORDS[0], 'PA2')}</g>
  <path d="M-8 286 Q104 226 267 118" fill="none" stroke="#d8ccff" stroke-width="30" stroke-linecap="round" opacity=".07"/>
  <path d="M-10 330 Q145 265 410 150" fill="none" stroke="#d9c8ff" stroke-width="38" stroke-linecap="round" opacity=".045"/>
  <rect width="400" height="400" fill="none" stroke="#fff" stroke-opacity=".06"/>
`));

/**
 * Ящик с пластинками: конверты стоят лицом и перекрывают друг друга, как когда
 * их перебирают. Корешки не годятся — ряд корешков читается как полка книг;
 * пластинку опознаёт именно круглый вырез под этикетку.
 */
/* Старые сценические ассеты оставлены как справочник генерации, но новый UI
   использует квадратные конверты и рисует проигрыватель компонентами. */
if (legacyScenes) writeFileSync(join(out, 'wide-shelf.svg'), (() => {
  const rnd = seeded(57);
  const cards = [
    [-14, 3, RECORDS[3], '#a98d6a'],
    [76, -2, RECORDS[5], '#c6b18e'],
    [166, 2, RECORDS[2], '#9c8763'],
    [256, -3, RECORDS[1], '#d5c3a4'],
  ].map(([x, tilt, rec, p], i) => {
    const S = 150, y = 44;
    const cx = x + S / 2, cy = y + S / 2, hole = S * 0.2;
    const [, color, label, title, artist, matrix, year] = rec;
    const fibres = Array.from({ length: 12 }, () => {
      const fx = x + rnd() * S, fy = y + rnd() * S;
      return `<path d="M${n(fx)} ${n(fy)} l${n(5 + rnd() * 16)} ${n((rnd() - 0.5) * 6)}"
        stroke="${dark(p, 0.3)}" stroke-opacity="${(0.06 + rnd() * 0.08).toFixed(3)}" stroke-width="1"/>`;
    }).join('');
    return `<g transform="rotate(${tilt} ${n(cx)} ${n(y + S)})">
      <rect x="${n(x)}" y="${y}" width="${S}" height="${S}" rx="3" fill="${p}" filter="url(#dsh)"/>
      ${fibres}
      <rect x="${n(x)}" y="${y}" width="${S}" height="${S}" rx="3" fill="none" stroke="${dark(p, 0.34)}" stroke-width="1.2"/>
      <circle cx="${n(cx)}" cy="${n(cy)}" r="${n(S * 0.4)}" fill="none" stroke="${dark(p, 0.32)}" stroke-width="2.4" stroke-opacity=".3"/>
      <circle cx="${n(cx)}" cy="${n(cy)}" r="${n(hole * 1.05)}" fill="${dark(SHELLAC, 0.1)}"/>
      ${labelFace(cx, cy, hole, { color, label, title, artist, matrix, year }, 'H' + i)}
      <circle cx="${n(cx)}" cy="${n(cy)}" r="${n(hole * 1.02)}" fill="none" stroke="#000" stroke-opacity=".34" stroke-width="2.4"/>
      <rect x="${n(x)}" y="${y}" width="12" height="${S}" fill="#000" opacity=".13"/>
    </g>`;
  }).join('');
  /* Передняя стенка ящика: без неё конверты висят в воздухе. */
  return svg(390, 260, `
  <defs>${tableDefs(390, 260)}</defs>
  <rect width="390" height="260" fill="url(#wd)"/>
  ${grain(390, 260, 77)}
  ${cards}
  <rect x="-4" y="196" width="398" height="64" rx="3" fill="${dark(wood, 0.3)}"/>
  <rect x="-4" y="196" width="398" height="4" fill="${lite(wood, 0.22)}" opacity=".7"/>
  <g transform="translate(0 196)">${grain(390, 64, 91)}</g>
  <rect width="390" height="260" fill="url(#key)" opacity=".5"/>
  <rect width="390" height="260" fill="url(#vg)"/>`);
})());

/* ——— вертушка: главный кадр плеера ——— */

/**
 * Диск на мате с тонармом и иглой. Игла стоит на первой трети стороны —
 * ровно то, что показывает шкала под ней: сторону не листают, она доигрывает.
 */
if (legacyScenes) writeFileSync(join(out, 'turntable.svg'), (() => {
  const S = 390, cx = 195, cy = 195, R = 168;
  const rec = RECORDS[0];
  /* Ось тонарма — за краем диска справа, игла стоит на первой трети стороны
     (внешние дорожки играются первыми). Так видно, сколько ещё осталось. */
  const armX = 356, armY = 54;
  const tipX = 296, tipY = 128;
  return svg(S, S, `
  <defs>
    <radialGradient id="mat" cx="46%" cy="34%" r="72%">
      <stop offset="0%" stop-color="#4a3a2c"/>
      <stop offset="100%" stop-color="#241a12"/>
    </radialGradient>
    <radialGradient id="dg" cx="38%" cy="28%" r="80%">
      <stop offset="0%" stop-color="${lite(SHELLAC, 0.14)}"/>
      <stop offset="60%" stop-color="${SHELLAC}"/>
      <stop offset="100%" stop-color="${dark(SHELLAC, 0.42)}"/>
    </radialGradient>
    <linearGradient id="arm" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e6e2da"/>
      <stop offset="45%" stop-color="#b9b2a6"/>
      <stop offset="100%" stop-color="#8d8579"/>
    </linearGradient>
    <linearGradient id="sh" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity=".14"/>
      <stop offset="42%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="72%" stop-color="#fff" stop-opacity=".06"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="dc"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath>
    <filter id="ds" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#000" flood-opacity=".55"/>
    </filter>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="184" fill="url(#mat)"/>
  ${Array.from({ length: 22 }, (_, i) =>
    `<circle cx="${cx}" cy="${cy}" r="${182 - i * 8}" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="1"/>`).join('')}
  <g filter="url(#ds)">
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#dg)"/>
  </g>
  <g clip-path="url(#dc)">
    ${grooves(cx, cy, R * 0.97, R * 0.42, 43)}
    <rect width="${S}" height="${S}" fill="url(#sh)"/>
  </g>
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${lite(SHELLAC, 0.24)}" stroke-width="2" stroke-opacity=".75"/>
  ${labelFace(cx, cy, R * 0.4, {
    color: rec[1], label: rec[2], title: rec[3], artist: rec[4], matrix: rec[5], year: rec[6],
  })}
  <g filter="url(#ds)">
    <path d="M${armX} ${armY} L${tipX} ${tipY}" stroke="url(#arm)" stroke-width="10" stroke-linecap="round"/>
    <circle cx="${armX}" cy="${armY}" r="20" fill="#2a2521"/>
    <circle cx="${armX}" cy="${armY}" r="20" fill="none" stroke="#6e6660" stroke-width="2"/>
    <circle cx="${armX}" cy="${armY}" r="7.5" fill="#8d8579"/>
    <g transform="rotate(51 ${tipX} ${tipY})">
      <rect x="${tipX - 15}" y="${tipY - 9}" width="30" height="19" rx="4" fill="#1f1c19"/>
      <rect x="${tipX - 15}" y="${tipY - 9}" width="30" height="19" rx="4" fill="none" stroke="#7d7570" stroke-width="1.4"/>
      <rect x="${tipX - 10}" y="${tipY - 5}" width="16" height="5" rx="2" fill="#c0392b" opacity=".9"/>
      <path d="M${tipX - 12} ${tipY + 10} L${tipX - 14} ${tipY + 17}" stroke="#e6e2da" stroke-width="2.6" stroke-linecap="round"/>
    </g>
  </g>
  <circle cx="${n(tipX - 16)}" cy="${n(tipY + 14)}" r="10" fill="#ffd9a0" opacity=".16"/>`);
})());

console.log('медиа готово:', out);
console.log(
  'диски:', RECORDS.length,
  '· конверты:', SLEEVES.length,
  '· этикетка под сканер · стол (вертикальный + широкий)'
);
