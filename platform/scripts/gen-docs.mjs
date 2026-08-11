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
import { screenGraph, iaTreeMd, transitionTableMd } from './screen-map.mjs';

const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/<code>|<\/code>/g, '`');

const BLOCKS = {
  /* Дерево IA и таблица переходов — из разметки экранов: рукописная карта
     расходится с прототипом первой же правкой, эта расходиться не умеет. */
  'ia-tree': (spec, g) => iaTreeMd(g),
  'transitions': (spec, g) => transitionTableMd(g),

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
  const spec = readSpec(slug);
  const graph = screenGraph(spec, readMarkup(slug, spec));
  const dir = join(conceptDir(slug), 'docs');
  if (!existsSync(dir)) return [];
  const touched = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const path = join(dir, file);
    const src = readFileSync(path, 'utf8');
    let out = src;
    for (const [name, build] of Object.entries(BLOCKS)) {
      const re = new RegExp(`(<!-- @generated:${name} -->\\n)[\\s\\S]*?(<!-- @end -->)`, 'g');
      out = out.replace(re, (_m, head, tail) => head + build(spec, graph).join('\n') + '\n' + tail);
    }
    if (out !== src) { writeFileSync(path, out); touched.push(file); }
  }
  return touched;
}

const slugs = process.argv[2] ? [process.argv[2]] : listConcepts();
for (const slug of slugs) {
  const touched = sync(slug);
  console.log(`${slug}: ${touched.length ? 'обновлены ' + touched.join(', ') : 'таблицы уже в актуальном виде'}`);
}
