#!/usr/bin/env node
/**
 * Фотографии концепта из Openverse → concepts/<slug>/assets/photos.
 *
 *   node scripts/fetch-photos.mjs petlya
 *
 * Берём только то, что можно использовать коммерчески И перерабатывать:
 * cc0 / pdm / by. Кадрируем под нужные пропорции, складываем локально —
 * итоговый файл обязан открываться офлайн, внешних ссылок в нём нет.
 * Авторы и лицензии пишутся в assets/photos/CREDITS.md.
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { conceptDir } from './lib.mjs';

const slug = process.argv[2];
if (!slug) { console.error('нужен slug: node scripts/fetch-photos.mjs petlya'); process.exit(1); }

/* Кадры, которые нужны экранам. w×h — целевой размер после кадрирования.
   skip — сколько первых кандидатов пропустить (чтобы соседние кадры не совпали). */
const SHOTS = [
  /* Кадры, отобранные вручную: поиск по ключевым словам сюда попадает мимо. */
  { name: 'lesson-wide',  pin: 'https://pd.w.org/2023/05/9226466641a7b0d42.31111690-2048x1536.jpg',
    credit: { title: 'Knitting needles and yarn', creator: 'WordPress Photo Directory', license: 'cc0 1.0', source: 'https://wordpress.org/photos/' }, w: 780, h: 520 },
  { name: 'course-lace',  q: ['knitted lace shawl', 'lace knitting wool', 'knitted shawl'],       w: 780, h: 520 },
  { name: 'course-socks', q: ['knitted socks wool', 'wool socks'],                                w: 780, h: 520 },
  { name: 'course-cable', q: ['cable knit sweater', 'knitted sweater wool'],                      w: 780, h: 520 },
  { name: 'link-cover',   q: ['hands knitting wool', 'woman knitting', 'knitting hands'],         w: 780, h: 520 },
  { name: 'article',      pin: 'https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdXB3azYxODAyMTgzLXdpa2ltZWRpYS1pbWFnZS1rb3dibnVqMy5qcGc.jpg',
    credit: { title: 'Knitting with notebook', creator: 'rawpixel', license: 'cc0 1.0', source: 'https://www.rawpixel.com' }, w: 780, h: 520 },
  { name: 'swatch',       q: ['knitted wool texture', 'knitting stitch texture'],                 w: 600, h: 600 },
  { name: 'yarn-balls',   q: ['ball of yarn wool', 'wool yarn ball'],                             w: 600, h: 600 },
  { name: 'progress',     q: ['knitting needles wool project', 'half finished knitting', 'knitting needles yarn', 'wool crafting'], w: 600, h: 600 },
  { name: 'record',       q: ['hands knitting close up', 'knitting needles hands'],               w: 780, h: 1040 },
  { name: 'scene',        q: ['wool yarn needles table', 'knitting basket wool'],                 w: 780, h: 1040 },
];
/* Галерея системного пикера — разные мотки и полотна. */
/* Галерея добирается последней: крупные кадры экранов важнее. */
const GQ = ['yarn ball wool', 'knitted texture wool', 'wool skein', 'knitting wool', 'wool thread', 'knitted blanket'];
for (let i = 1; i <= 21; i++) SHOTS.push({ name: `g${i}`, q: [GQ[i % GQ.length], 'wool yarn'], w: 400, h: 400 });

const API = 'https://api.openverse.org/v1/images/';
/* Только то, что не требует атрибуции и разрешает переработку. Курируемые стоки —
   качество на голову выше любительского пула, поэтому источник сужен. */
const OK_LICENSE = new Set(['cc0', 'pdm']);
const SOURCES = 'rawpixel,stocksnap';

async function query(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'camo-concept-builder/1.0' } });
  if (!res.ok) throw new Error(`Openverse ${res.status}`);
  return ((await res.json()).results || []).filter((r) => OK_LICENSE.has(r.license) && r.url);
}
async function pick(queries) {
  const out = [];
  for (const q of [].concat(queries)) {
    const base = `${API}?q=${encodeURIComponent(q)}&license=cc0,pdm`
      + '&license_type=commercial,modification&mature=false&page_size=20&extension=jpg';
    out.push(...await query(`${base}&source=${SOURCES}`));
    out.push(...await query(base));
  }
  return out;
}
/* Один кадр не должен повториться в двух местах — иначе экраны выглядят как копии. */
const used = new Set();

const outDir = join(conceptDir(slug), 'assets', 'photos');
mkdirSync(outDir, { recursive: true });

/* sips есть в macOS из коробки — отдельная зависимость не нужна.
   Кроп «cover»: сначала масштаб по короткой стороне, потом обрезка по центру. */
const dims = (file) => {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file]).toString();
  return { w: +out.match(/pixelWidth: (\d+)/)[1], h: +out.match(/pixelHeight: (\d+)/)[1] };
};
function crop(src, dst, w, h) {
  execFileSync('sips', ['-s', 'format', 'jpeg', src, '--out', dst], { stdio: 'ignore' });
  const d = dims(dst);
  if (d.w / d.h > w / h) execFileSync('sips', ['--resampleHeight', String(h), dst], { stdio: 'ignore' });
  else execFileSync('sips', ['--resampleWidth', String(w), dst], { stdio: 'ignore' });
  execFileSync('sips', ['-c', String(h), String(w), dst], { stdio: 'ignore' });
  execFileSync('sips', ['-s', 'formatOptions', '80', dst], { stdio: 'ignore' });
}

const credits = [];
for (const shot of SHOTS) {
  const candidates = shot.pin
    ? [{ url: shot.pin, ...shot.credit }]
    : (await pick(shot.q)).filter((c) => !used.has(c.url));
  if (!candidates.length) { console.warn(`— ${shot.name}: ничего не нашлось`); continue; }

  let saved = false;
  for (const c of candidates) {
    try {
      const res = await fetch(c.url, { headers: { 'User-Agent': 'camo-concept-builder/1.0' } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 40_000) continue;
      const tmp = join(outDir, `.tmp-${shot.name}.jpg`);
      writeFileSync(tmp, buf);
      const dst = join(outDir, `${shot.name}.jpg`);
      crop(tmp, dst, shot.w, shot.h);
      execFileSync('rm', ['-f', tmp]);
      used.add(c.url);
      credits.push({ file: `${shot.name}.jpg`, title: c.title, creator: c.creator,
        license: c.license_version ? `${c.license} ${c.license_version}` : c.license,
        source: c.foreign_landing_url || c.source });
      console.log(`ok ${shot.name} · ${c.license} · ${c.creator}`);
      saved = true;
      break;
    } catch { /* следующий кандидат */ }
  }
  if (!saved) console.warn(`— ${shot.name}: ни один кандидат не скачался`);
}

writeFileSync(join(outDir, 'CREDITS.md'), `# Фотографии концепта

Источник — [Openverse](https://openverse.org), курируемые стоки rawpixel и StockSnap.
Отобраны только **CC0 / Public Domain Mark**: коммерческое использование и переработка
разрешены, атрибуция не требуется. Таблица ниже — для порядка, а не по обязанности.
Файлы кадрированы под нужные пропорции и лежат локально: итоговый \`index.html\`
не ходит в интернет.

| Файл | Работа | Автор | Лицензия | Источник |
|---|---|---|---|---|
${credits.map((c) => `| \`${c.file}\` | ${(c.title || '—').replace(/\|/g, '/')} | ${c.creator || '—'} | ${c.license.toUpperCase()} | ${c.source || '—'} |`).join('\n')}
`);
console.log(`\nготово: ${outDir} · ${credits.length} фото · CREDITS.md записан`);
