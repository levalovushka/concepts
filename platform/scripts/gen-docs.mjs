#!/usr/bin/env node
/**
 * Пересборка таблиц в docs/*.md из concept.json.
 *
 *   node scripts/gen-docs.mjs petlya
 *
 * Обновляются только блоки между маркерами:
 *   <!-- @generated:<имя> -->  …  <!-- @end -->
 * Всё остальное в документе — ручной текст, его не трогаем.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { conceptDir, readSpec, readMarkup, RISK_LABEL, listConcepts } from './lib.mjs';
import { screenGraph, iaTreeMd, transitionTableMd, screenActionsMd } from './screen-map.mjs';
import { prepareEmailRegistration } from './build.mjs';

const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/<code>|<\/code>/g, '`');
const effectiveConcept = (slug) => {
  const sourceSpec = readSpec(slug);
  return prepareEmailRegistration(sourceSpec, readMarkup(slug, sourceSpec));
};

const BLOCKS = {
  /* Дерево IA и таблица переходов — из разметки экранов: рукописная карта
     расходится с прототипом первой же правкой, эта расходиться не умеет. */
  'ia-tree': (spec, g) => iaTreeMd(g),
  'transitions': (spec, g) => transitionTableMd(g),

  /* Каждый элемент каждого экрана: что делает и куда ведёт. Нужен разработке,
     чтобы не выяснять назначение кнопок и вкладок по разметке руками. */
  'actions': (spec, g, markup) => screenActionsMd(spec, markup),

  /* Таблица концептов в корневом README: держалась руками, отставала от кода
     на десяток концептов и врала числами. Выводим из спек. */
  'concepts': () => {
    const rows = listConcepts().map((slug) => effectiveConcept(slug).spec);
    return [
      '| Концепт | Слаг | Целевой набор | Доступов | Экранов | Прототипов | УТП |',
      '|---|---|---|---|---|---|---|',
      ...rows.map((c) => `| ${cell(c.name)} | \`${c.slug}\` | \`${c.targetSet}\` | ${c.permissions.length} | ${c.screens.length} | ${(c.prototypes || []).length} | ${cell(c.tagline || '')} |`),
    ];
  },

  'screen-map': (spec) => [
    '| ID | Название | Тип | Доступы |',
    '|---|---|---|---|',
    ...spec.screens.map((s) => {
      const on = spec.permissions.filter((p) => p.screen === s.id)
        .map((p) => p.key + (p.activate ? ' (activate)' : '')).join(', ') || '—';
      return `| \`${s.id}\` | ${cell(s.title)} | ${cell(s.type)} | ${cell(on)} |`;
    }),
  ],
  'perm-matrix': (spec) => [
    '| Ключ | Жест пользователя | Экран | Если отказ | Риск Review |',
    '|---|---|---|---|---|',
    ...spec.permissions.map((p) => {
      const screen = spec.screens.find((s) => s.id === p.screen)?.title || p.screen;
      const risk = p.conditional ? `**Условный** — ${cell(p.requires)}` : RISK_LABEL[p.risk] || p.risk;
      return `| \`${p.plist}\` | ${cell(p.gesture)} | ${cell(screen)} | ${cell(p.fallback)} | ${risk} |`;
    }),
  ],
  'store-meta': (spec) => {
    const a = spec.appStore;
    const row = (k, v, limit) => `| ${k} | ${cell(v)} | ${limit ? `${[...String(v)].length} / ${limit}` : '—'} |`;
    return [
      '| Поле | Значение | Знаков |',
      '|---|---|---|',
      row('App Name', a.name, 30),
      row('Subtitle', a.subtitle, 30),
      row('Promotional Text', a.promo, 170),
      row('Keywords', a.keywords, 100),
      row('Primary Category', a.category.primary),
      row('Secondary Category', a.category.secondary),
      row('Age Rating', a.ageRating),
      row('Price', a.price),
      row('Support URL', a.urls.support),
      row('Marketing URL', a.urls.marketing),
      row('Privacy Policy URL', a.urls.privacy),
      row('Encryption', a.encryption),
    ];
  },

  'store-privacy': (spec) => [
    '| Что собираем | Тип в App Privacy | Зачем | Связано с пользователем | Трекинг |',
    '|---|---|---|---|---|',
    ...spec.appStore.privacy.map((p) =>
      `| ${cell(p.type)} | \`${p.apple}\` | ${cell(p.why)} | ${p.linked ? 'Да' : 'Нет'} | ${p.tracking ? '**Да**' : 'Нет'} |`),
  ],

  'store-review': (spec) => [
    '| Ключ | Что написать ревьюеру |',
    '|---|---|',
    ...spec.permissions.filter((p) => p.reviewNote).map((p) => `| \`${p.plist}\` | ${cell(p.reviewNote)} |`),
  ],

  backendless: (spec) => [
    '| Требовало бы сервера | Решение без сервера |',
    '|---|---|',
    ...spec.backendless.map((b) => `| ${cell(b.needs)} | ${cell(b.solution)} |`),
  ],
};

function sync(slug) {
  const sourceSpec = readSpec(slug);
  const sourceMarkup = readMarkup(slug, sourceSpec);
  const { spec, markup } = prepareEmailRegistration(sourceSpec, sourceMarkup);
  const graph = screenGraph(spec, markup);
  const dir = join(conceptDir(slug), 'docs');
  if (!existsSync(dir)) return [];
  const touched = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const path = join(dir, file);
    const src = readFileSync(path, 'utf8');
    let out = src;
    for (const [name, build] of Object.entries(BLOCKS)) {
      const re = new RegExp(`(<!-- @generated:${name} -->\\n)[\\s\\S]*?(<!-- @end -->)`, 'g');
      out = out.replace(re, (_m, head, tail) => head + build(spec, graph, markup).join('\n') + '\n' + tail);
    }
    if (out !== src) { writeFileSync(path, out); touched.push(file); }
  }
  return touched;
}

/* Корневой README живёт вне концептов, но таблица в нём — те же данные. */
function syncRoot() {
  const path = join(conceptDir('_template'), '..', '..', '..', 'README.md');
  if (!existsSync(path)) return false;
  const src = readFileSync(path, 'utf8');
  const re = /(<!-- @generated:concepts -->\n)[\s\S]*?(<!-- @end -->)/g;
  const out = src.replace(re, (_m, head, tail) => head + BLOCKS.concepts().join('\n') + '\n' + tail);
  if (out === src) return false;
  writeFileSync(path, out);
  return true;
}

const slugs = process.argv[2] ? [process.argv[2]] : listConcepts();
for (const slug of slugs) {
  const touched = sync(slug);
  console.log(`${slug}: ${touched.length ? 'обновлены ' + touched.join(', ') : 'таблицы уже в актуальном виде'}`);
}
if (!process.argv[2]) console.log(syncRoot() ? 'README: таблица концептов обновлена' : 'README: таблица уже в актуальном виде');
