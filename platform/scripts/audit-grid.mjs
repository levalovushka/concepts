#!/usr/bin/env node
/**
 * Сетка списка: текст всех строк экрана стоит на одном столбце.
 *
 *   node scripts/audit-grid.mjs            — все концепты
 *   node scripts/audit-grid.mjs tails      — один
 *
 * Строка-кнопка и строка-див приходят к отступу разными путями: у кнопки
 * остаётся системный padding, у аватара — авто-поля из ядра, у карточки —
 * собственный внутренний паддинг. Разница в 2–6 пикселей глазами не видна,
 * а список из-за неё выглядит неаккуратным. В числах она видна сразу.
 */
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, readSpec, listConcepts } from './lib.mjs';

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : listConcepts();
const browser = await chromium.launch();
let total = 0;

for (const slug of slugs) {
  const spec = readSpec(slug);
  const file = join(DIST, slug, 'index.html');
  if (!existsSync(file)) { console.log(`\n=== ${slug} ===\n  не собрано`); continue; }
  const page = await browser.newPage({ viewport: { width: 1100, height: 1400 } });
  await page.goto('file://' + file, { waitUntil: 'networkidle' });
  const found = [];
  for (const s of spec.screens) {
    const hits = await page.evaluate((id) => {
      const dev = document.querySelector('.device');
      const scr = dev.querySelector(`[data-screen="${id}"]`);
      if (!scr) return [];
      dev.querySelectorAll('[data-screen]').forEach((e) => e.classList.remove('is-on'));
      scr.classList.add('is-on');
      const base = dev.getBoundingClientRect();
      const rows = [...scr.querySelectorAll('[class*="row"], [class*="setting"], [class*="lesson"]')]
        .filter((e) => {
          const c = getComputedStyle(e), b = e.getBoundingClientRect();
          return c.display === 'flex' && b.width > 200 && b.height > 24 && !e.closest('[class*="tabbar"]');
        });
      /* Сравниваем внутри одного списка: на экране законно бывают строки
         со значком и строки без него — это разные виды строк, а не разъезд. */
      const groups = new Map();
      const listIds = new WeakMap();
      let nextListId = 0;
      for (const row of rows) {
        const label = [...row.querySelectorAll('strong, .t-body, h3')].find((e) => (e.textContent || '').trim());
        if (!label) continue;
        const x = Math.round(label.getBoundingClientRect().left - base.left);
        if (x < 24 || x > 220) continue;
        const hasArt = !!row.querySelector('[class*="row-art"], [class*="avatar"], [class*="lead"], [class*="cover"], [class*="thumb"]');
        const list = row.parentElement || scr;
        if (!listIds.has(list)) listIds.set(list, nextListId++);
        const key = `${listIds.get(list)}|${hasArt}`;
        const g = groups.get(key) || {};
        (g[x] = g[x] || []).push((label.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30));
        groups.set(key, g);
      }
      const out = [];
      for (const cols of groups.values()) {
        const entries = Object.entries(cols).map(([x, v]) => [Number(x), v]).sort((a, b) => b[1].length - a[1].length);
        if (entries.length < 2) continue;
        const main = entries[0];
        for (const [x, names] of entries.slice(1)) {
          if (Math.abs(x - main[0]) < 2) continue;
          out.push({ x, main: main[0], names: names.slice(0, 2), n: names.length });
        }
      }
      return out;
    }, s.id);
    for (const h of hits) found.push({ scr: s.id, ...h });
  }
  await page.close();
  console.log(`\n=== ${slug} ===`);
  if (!found.length) { console.log('  все строки на одном столбце'); continue; }
  total += found.length;
  for (const f of found) console.log(`  ${f.scr}: «${f.names.join('», «')}» на ${f.x}px вместо ${f.main}px (${f.n} строк)`);
}

await browser.close();
if (total) { console.log(`\nстрок вне столбца: ${total}`); process.exitCode = 1; }
