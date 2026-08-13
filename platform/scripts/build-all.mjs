#!/usr/bin/env node
/**
 * Сборка всех концептов + лаунчера в корне.
 *
 * Один сайт, концепты по подпутям: /petlya/, /<slug>/.
 *
 *   node scripts/build-all.mjs
 */
import { writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, conceptDir, listConcepts, esc, TARGET_PRODUCTS, POSITIONING_MODES } from './lib.mjs';
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

const APP_STORE_CATEGORIES = {
  Education: 'Образование',
  'Health & Fitness': 'Здоровье и фитнес',
  Lifestyle: 'Образ жизни',
  Music: 'Музыка',
  'Photo & Video': 'Фото и видео',
  Productivity: 'Продуктивность',
  Reference: 'Справочники',
  'Social Networking': 'Социальные сети',
  Sports: 'Спорт',
  Utilities: 'Утилиты',
};

const targetSetMeta = (targetSet) => TARGET_PRODUCTS[targetSet]
  || { label: targetSet || 'Без набора', short: targetSet || 'Другое' };
const categoryLabel = (category) => APP_STORE_CATEGORIES[category] || category || 'Без категории';
const pluralRu = (n, one, few, many) => {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  if (n % 10 === 1) return one;
  if (n % 10 >= 2 && n % 10 <= 4) return few;
  return many;
};

const gallery = (items) => {
  const filters = [...new Set(items.map((item) => item.targetSet))]
    .sort((a, b) => targetSetMeta(a).label.localeCompare(targetSetMeta(b).label, 'ru'));
  const plural = items.length % 10 === 1 && items.length % 100 !== 11 ? 'концепт' : 'концептов';
  const card = (item) => `    <a class="card" href="./${item.slug}/" data-target-set="${esc(item.targetSet)}" data-mode="${item.mode}" aria-label="${esc(item.name)} — ${esc(item.modeLabel)}, ${esc(item.category)}">
      <div class="shot"><img src="./${item.slug}/assets/screenshots/${item.start}.png" alt="Экран «${esc(item.name)}»" loading="lazy"></div>
      <div class="meta">
        <div class="card-kicker"><span class="category">${esc(item.category)}</span><span class="mode-badge ${item.mode}">${esc(item.modeLabel)}</span></div>
        <div class="name-row"><div class="name">${esc(item.name)}</div><span class="arrow" aria-hidden="true">→</span></div>
        <div class="tag">${esc(item.tagline)}</div>
        <div class="chips"><span class="chip">${item.perms} ${pluralRu(item.perms, 'доступ', 'доступа', 'доступов')}</span><span class="chip">${item.screens} ${pluralRu(item.screens, 'экран', 'экрана', 'экранов')}</span><span class="chip secondary">${esc(item.targetSetLabel)}</span></div>
      </div>
    </a>`;
  const group = (mode) => {
    const meta = POSITIONING_MODES[mode];
    const selected = items.filter((item) => item.mode === mode);
    return `  <section class="concept-group" data-mode-group="${mode}">
    <header class="group-head"><div><h2>${meta.label}</h2><p>${meta.description}</p></div><span>${selected.length}</span></header>
    <div class="grid">${selected.map(card).join('\n')}</div>
  </section>`;
  };

  return `<!doctype html>
<html lang="ru">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Концепты iOS</title>
<meta name="description" content="Каталог iOS-концептов под целевые наборы доступов">
<meta name="color-scheme" content="light dark">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --accent:#0d8a7a; --page-bg:#fff; --page-card:#fff; --page-ink:#0a0a0a;
    --page-ink-dim:#666; --page-ink-mute:#999; --page-line:#eaeaea;
    --page-chip:#fafafa; --r-device:32px;
    --face:'Geist',system-ui,sans-serif; --mono:'Geist Mono',ui-monospace,monospace;
  }
  @media (prefers-color-scheme:dark) { :root {
    --accent:#3dd6c0; --page-bg:#000; --page-card:#000; --page-ink:#ededed;
    --page-ink-dim:#a1a1a1; --page-ink-mute:#707070; --page-line:#2e2e2e;
    --page-chip:#0d0d0d;
  } }
  *, *::before, *::after { box-sizing:border-box; }
  body { margin:0; background:var(--page-bg); color:var(--page-ink); font:400 15px/1.6 var(--face); -webkit-font-smoothing:antialiased; letter-spacing:-.005em; }
  :focus-visible { outline:2px solid var(--accent); outline-offset:3px; }
  .topbar { position:sticky; top:0; z-index:10; height:56px; padding:0 24px; display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:16px; border-bottom:1px solid var(--page-line); background:color-mix(in srgb,var(--page-bg) 82%,transparent); backdrop-filter:blur(12px) saturate(180%); -webkit-backdrop-filter:blur(12px) saturate(180%); }
  .brand { font:600 15px/1.2 var(--face); letter-spacing:-.02em; }
  .section-name { color:var(--page-ink); font:500 14px/1.2 var(--face); }
  .concept-count { justify-self:end; color:var(--page-ink-dim); font:400 13px/1.2 var(--face); }
  .wrap { max-width:1180px; margin:0 auto; padding:48px 24px 120px; }
  .hero { margin-bottom:40px; }
  .eyebrow { font:600 11px/1.3 var(--mono); letter-spacing:.09em; text-transform:uppercase; color:var(--page-ink-mute); }
  h1 { font:600 clamp(32px,4vw,44px)/1.06 var(--face); letter-spacing:-.045em; margin:12px 0 14px; }
  .deck { margin:0; color:var(--page-ink-dim); max-width:68ch; font-size:16px; line-height:1.5; }
  .controls { display:flex; align-items:center; justify-content:space-between; gap:24px; margin-bottom:40px; }
  .mode-tabs { display:inline-flex; padding:3px; border:1px solid var(--page-line); border-radius:12px; background:var(--page-chip); }
  .mode-tab { min-height:34px; padding:7px 13px; border:0; border-radius:9px; background:transparent; color:var(--page-ink-dim); cursor:pointer; font:500 13px/1.2 var(--face); }
  .mode-tab.is-on { color:var(--page-ink); background:var(--page-card); box-shadow:0 1px 4px color-mix(in srgb,var(--page-ink) 10%,transparent); }
  .filters { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:8px; margin:0; padding:0; border:0; }
  .filter { min-height:36px; padding:7px 13px; border:1px solid var(--page-line); border-radius:999px; background:var(--page-card); color:var(--page-ink-dim); cursor:pointer; font:500 13px/1.2 var(--face); transition:color 120ms,border-color 120ms,background 120ms; }
  .filter:hover { color:var(--page-ink); border-color:var(--page-ink-mute); }
  .filter.is-on { color:var(--page-bg); border-color:var(--page-ink); background:var(--page-ink); }
  .filter span { margin-left:4px; color:inherit; opacity:.65; font-family:var(--mono); font-size:10px; }
  .concept-group + .concept-group { margin-top:56px; }
  .concept-group[hidden] { display:none; }
  .group-head { display:flex; align-items:end; justify-content:space-between; gap:24px; margin-bottom:18px; padding-bottom:14px; border-bottom:1px solid var(--page-line); }
  .group-head h2 { margin:0; font:600 22px/1.2 var(--face); letter-spacing:-.035em; }
  .group-head p { margin:5px 0 0; color:var(--page-ink-dim); font-size:13px; }
  .group-head>span { color:var(--page-ink-mute); font:600 11px/1 var(--mono); }
  .grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
  .card { min-width:0; display:flex; flex-direction:column; text-decoration:none; color:inherit; border:1px solid var(--page-line); border-radius:var(--r-device); background:var(--page-card); overflow:hidden; overflow:clip; isolation:isolate; transition:border-color 120ms,transform 120ms; }
  .card:hover { border-color:var(--page-ink-mute); transform:translateY(-2px); }
  .card[hidden] { display:none; }
  /* PNG сняты из .device с радиусом 32px. Одинаковый внешний радиус убирает светлые ступеньки в углах на тёмной теме. */
  .shot { aspect-ratio:375/500; overflow:hidden; background:var(--page-chip); border-bottom:1px solid var(--page-line); }
  .shot img { width:100%; height:100%; object-fit:cover; object-position:top; display:block; }
  .meta { flex:1; display:flex; flex-direction:column; padding:18px; }
  .card-kicker { min-height:20px; display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .category { color:var(--page-ink-mute); font:600 10px/1.3 var(--mono); letter-spacing:.07em; text-transform:uppercase; }
  .mode-badge { padding:3px 7px; border-radius:6px; color:var(--page-ink-dim); background:var(--page-chip); font:600 9px/1.3 var(--mono); letter-spacing:.04em; text-transform:uppercase; }
  .mode-badge.mimicry { color:var(--accent); background:color-mix(in srgb,var(--accent) 12%,transparent); }
  .name-row { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:7px; }
  .name { font:600 20px/1.2 var(--face); letter-spacing:-.03em; }
  .arrow { color:var(--page-ink-mute); font:400 20px/1 var(--face); transition:color 120ms,transform 120ms; }
  .card:hover .arrow { color:var(--page-ink); transform:translateX(2px); }
  .tag { flex:1; color:var(--page-ink-dim); margin-top:7px; font:400 13px/1.45 var(--face); }
  .chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:16px; }
  .chip { padding:4px 8px; border-radius:999px; background:color-mix(in srgb,var(--accent) 12%,transparent); color:var(--accent); font:600 10px/1.4 var(--mono); letter-spacing:.03em; }
  .chip.secondary { background:var(--page-chip); color:var(--page-ink-dim); }
  .empty { color:var(--page-ink-dim); }
  @media (max-width:860px) { .controls { align-items:flex-start; flex-direction:column; } .filters { justify-content:flex-start; } .grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
  @media (max-width:560px) { .topbar { grid-template-columns:1fr auto; padding:0 16px; } .section-name { display:none; } .wrap { padding:32px 16px 80px; } .hero { margin-bottom:32px; } .controls { margin-bottom:32px; } .mode-tabs { width:100%; } .mode-tab { flex:1; } .grid { grid-template-columns:1fr; } .filter { flex:1; } }
  @media (prefers-reduced-motion:reduce) { .card,.arrow { transition:none; } }
</style>
<header class="topbar">
  <div class="brand">Camo</div>
  <div class="section-name">Концепты</div>
  <div class="concept-count">${items.length} ${plural}</div>
</header>
<div class="wrap">
  <section class="hero">
    <div>
      <div class="eyebrow">iOS · целевые наборы доступов</div>
      <h1>Концепты</h1>
      <p class="deck">Нишевые приложения, где каждый доступ заслужен достижимой фичей. Без своего бэкенда.</p>
    </div>
  </section>
  <div class="controls">
    <nav class="mode-tabs" aria-label="Стратегия концепта">
      <button class="mode-tab is-on" type="button" data-mode-filter="all" aria-pressed="true">Все</button>
      <button class="mode-tab" type="button" data-mode-filter="mimicry" aria-pressed="false">Мимикрия</button>
      <button class="mode-tab" type="button" data-mode-filter="differentiation" aria-pressed="false">Отстройка</button>
    </nav>
    <nav class="filters" aria-label="Целевой набор доступов">
      <button class="filter is-on" type="button" data-set-filter="all" aria-pressed="true">Все наборы <span>${items.length}</span></button>
${filters.map((targetSet) => `      <button class="filter" type="button" data-set-filter="${esc(targetSet)}" aria-pressed="false">${esc(targetSetMeta(targetSet).label)} <span>${items.filter((item) => item.targetSet === targetSet).length}</span></button>`).join('\n')}
    </nav>
  </div>
  <main id="concept-grid">
${items.length ? ['mimicry', 'differentiation'].map(group).join('\n') : '    <p class="empty">Пока ни одного концепта.</p>'}
  </main>
</div>
<script>
  const modeButtons = [...document.querySelectorAll('[data-mode-filter]')];
  const setButtons = [...document.querySelectorAll('[data-set-filter]')];
  const cards = [...document.querySelectorAll('[data-target-set]')];
  const groups = [...document.querySelectorAll('[data-mode-group]')];
  const applyFilters = (mode, set, updateUrl = true) => {
    const selectedMode = mode === 'all' || cards.some((card) => card.dataset.mode === mode) ? mode : 'all';
    const selectedSet = set === 'all' || cards.some((card) => card.dataset.targetSet === set) ? set : 'all';
    modeButtons.forEach((button) => {
      const active = button.dataset.modeFilter === selectedMode;
      button.classList.toggle('is-on', active);
      button.setAttribute('aria-pressed', String(active));
    });
    setButtons.forEach((button) => {
      const active = button.dataset.setFilter === selectedSet;
      button.classList.toggle('is-on', active);
      button.setAttribute('aria-pressed', String(active));
    });
    cards.forEach((card) => { card.hidden = (selectedMode !== 'all' && card.dataset.mode !== selectedMode) || (selectedSet !== 'all' && card.dataset.targetSet !== selectedSet); });
    groups.forEach((group) => { group.hidden = !group.querySelector('.card:not([hidden])'); });
    if (updateUrl) {
      const url = new URL(location.href);
      selectedMode === 'all' ? url.searchParams.delete('mode') : url.searchParams.set('mode', selectedMode);
      selectedSet === 'all' ? url.searchParams.delete('set') : url.searchParams.set('set', selectedSet);
      history.replaceState(null, '', url);
    }
  };
  modeButtons.forEach((button) => button.addEventListener('click', () => applyFilters(button.dataset.modeFilter, document.querySelector('[data-set-filter].is-on').dataset.setFilter)));
  setButtons.forEach((button) => button.addEventListener('click', () => applyFilters(document.querySelector('[data-mode-filter].is-on').dataset.modeFilter, button.dataset.setFilter)));
  const initial = new URL(location.href).searchParams;
  applyFilters(initial.get('mode') || 'all', initial.get('set') || 'all', false);
</script>
</html>
`;
};

const slugs = listConcepts();
if (!slugs.length) { console.error('нет концептов в concepts/'); process.exit(1); }

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

const items = [];
for (const slug of slugs) {
  const { spec, bytes } = build(slug);
  const n = countKit(slug);
  items.push({
    slug,
    name: spec.name,
    tagline: spec.tagline,
    start: spec.start,
    perms: spec.permissions.length,
    screens: spec.screens.length,
    targetSet: spec.targetSet || '',
    targetSetLabel: targetSetMeta(spec.targetSet).short,
    mode: spec.positioning.mode,
    modeLabel: POSITIONING_MODES[spec.positioning.mode].label,
    category: categoryLabel(spec.appStore?.category?.primary),
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
