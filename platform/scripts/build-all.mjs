#!/usr/bin/env node
/**
 * Сборка всех концептов + галерея в корне.
 *
 * Один сайт, концепты по подпутям: /petlya/, /<slug>/. Ссылку на конкретный
 * концепт можно отдавать отдельно, но деплой и операционка — одни на всех.
 *
 *   node scripts/build-all.mjs
 */
import { writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { DIST, ROOT, conceptDir, readSpec, listConcepts, esc } from './lib.mjs';
import { build } from './build.mjs';

/**
 * Состав архива только считаем для лога — собирает его `packDocs` внутри
 * build.mjs. Раньше сборка архива была продублирована здесь, и дубль затирал
 * работу оригинала: build() вызывается после, поэтому в архив попадали только
 * доки, сколько бы файлов ни насчитал этот код.
 */
function countKit(slug) {
  const dir = conceptDir(slug);
  const docs = join(dir, 'docs');
  if (!existsSync(docs)) return null;
  const shotsDir = join(dir, 'assets', 'screenshots');
  return {
    docs: readdirSync(docs).filter((f) => f.endsWith('.md')).length,
    shots: existsSync(shotsDir) ? readdirSync(shotsDir).filter((f) => f.endsWith('.png')).length : 0,
  };
}

const gallery = (items) => `<!doctype html>
<html lang="ru" data-theme="light">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Концепты iOS</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  :root { --bg:#e8f3f0; --card:#fff; --ink:#14181a; --dim:#667078; --line:#d8e0e2; --accent:#0d8a7a;
          --face:'Outfit',system-ui,sans-serif; --mono:'IBM Plex Mono',ui-monospace,monospace; }
  @media (prefers-color-scheme: dark) { :root { --bg:#0c1211; --card:#171b1d; --ink:#eef2f3; --dim:#93a0a6; --line:#2a3134; --accent:#3dd6c0; } }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font:400 15.5px/1.6 var(--face); }
  .wrap { max-width:1100px; margin:0 auto; padding:56px 20px 96px; }
  .eyebrow { font:600 11px/1.3 var(--mono); letter-spacing:.09em; text-transform:uppercase; color:var(--dim); }
  h1 { font:700 clamp(28px,4vw,40px)/1.08 var(--face); letter-spacing:-.026em; margin:12px 0 10px; }
  .deck { margin:0 0 44px; color:var(--dim); max-width:64ch; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:24px; }
  .card { display:block; text-decoration:none; color:inherit; border:1px solid var(--line);
          border-radius:22px; background:var(--card); overflow:hidden; transition:border-color .15s, transform .15s; }
  .card:hover { border-color:var(--accent); transform:translateY(-2px); }
  /* 340, а не 300: на 300 срез приходился на поле ввода номера у концептов,
     где над ним есть своя шапка — в кадр попадала верхняя половина цифр. */
  .shot { height:340px; background:#0f0f0f; overflow:hidden; }
  .shot img { width:100%; height:100%; object-fit:cover; object-position:top; display:block; }
  .meta { padding:16px 18px 18px; }
  .name { font:700 19px/1.2 var(--face); letter-spacing:-.02em; }
  .tag { font:400 13px/1.4 var(--face); color:var(--dim); margin-top:6px; }
  .chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:12px; }
  .chip { font:600 10px/1.4 var(--mono); letter-spacing:.04em; padding:4px 8px; border-radius:999px;
          background:color-mix(in srgb, var(--accent) 12%, transparent); color:var(--accent); }
  .empty { color:var(--dim); }
</style>
<div class="wrap">
  <div class="eyebrow">iOS · концепты под целевые наборы доступов</div>
  <h1>Концепты</h1>
  <p class="deck">Каждый концепт — нишевое приложение, где каждый доступ заслужен фичей, достижимой за 2–3 тапа. Все клиентские: своего бэкенда нет.</p>
  <div class="grid">
${items.length ? items.map((i) => `    <a class="card" href="./${i.slug}/">
      <div class="shot"><img src="./${i.slug}/assets/screenshots/${i.start}.png" alt="${esc(i.name)}" loading="lazy"></div>
      <div class="meta">
        <div class="name">${esc(i.name)}</div>
        <div class="tag">${esc(i.tagline)}</div>
        <div class="chips"><span class="chip">${i.perms} доступов</span><span class="chip">${i.screens} экранов</span><span class="chip">${esc(i.targetSet)}</span></div>
      </div>
    </a>`).join('\n') : '    <p class="empty">Пока ни одного концепта.</p>'}
  </div>
</div>
</html>
`;

const slugs = listConcepts();
if (!slugs.length) { console.error('нет концептов в concepts/'); process.exit(1); }

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

const items = [];
for (const slug of slugs) {
  const { spec, bytes } = build(slug);
  const n = countKit(slug);
  items.push({
    slug, name: spec.name, tagline: spec.tagline, start: spec.start,
    perms: spec.permissions.length, screens: spec.screens.length, targetSet: spec.targetSet || '—',
  });
  const archive = n ? ` · архив: доки ${n.docs}, скриншоты ${n.shots}` : '';
  console.log(`  ${slug}: ${(bytes / 1024).toFixed(0)} КБ · ${spec.screens.length} экранов · ${spec.permissions.length} доступов${archive}`);
}

writeFileSync(join(DIST, 'index.html'), gallery(items));
writeFileSync(join(DIST, '_headers'), `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`);
console.log(`\nгалерея: ${join(DIST, 'index.html')} · концептов: ${items.length}`);
