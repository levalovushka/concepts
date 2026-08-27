#!/usr/bin/env node
/**
 * UX-спецификация концепта одним машиночитаемым файлом.
 *
 * Собирает в один JSON всё, что нужно, чтобы собрать приложение, и ничего
 * сверх того: модель мира, граф навигации, разметку действий, доступы с их
 * жестами и fallback, состояния экранов, токены, локализацию, сценарии
 * приёмки и фикстуры.
 *
 * Часть секций выводится из спеки и разметки, часть заполняется в
 * concept.json человеком. Незаполненное не замалчивается — оно попадает в
 * секцию gaps, чтобы читатель видел, чего в контексте нет.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, DIST, conceptDir, readSpec, readMarkup, validate, listConcepts } from './lib.mjs';
import { screenGraph, screenActions } from './screen-map.mjs';

const CAPABILITIES = JSON.parse(
  readFileSync(join(ROOT, 'native', 'capability-map.json'), 'utf8')
).capabilities;

/**
 * Словарь состояний. Требовать все шесть на каждом экране бессмысленно —
 * поверхности камеры не бывает пустой. Обязательны только два:
 * default везде и permission там, где экран поднимает системный запрос.
 */
const CANONICAL_STATES = ['default', 'loading', 'empty', 'error', 'offline', 'permission'];

/** В спеке состояние отказа исторически называется denied. */
const STATE_ALIASES = { denied: 'permission', populated: 'default', granted: 'default' };
const canonicalState = (value) => STATE_ALIASES[value] || value;

/** Свободный текст type -> контейнер представления iOS. */
function presentationOf(screen) {
  const declared = screen.ui?.navigation;
  const map = { root: 'root', push: 'push', modal: 'sheet', fullscreen: 'fullScreen', system: 'system' };
  if (declared && map[declared]) return map[declared];
  const type = (screen.type || '').toLowerCase();
  if (/старт|onboarding/.test(type)) return 'start';
  if (/tab\s*\(?root|tab root/.test(type)) return 'root';
  if (/систем|system|чуж|внешн/.test(type)) return 'system';
  if (/fullscreen|полноэкран/.test(type)) return 'fullScreen';
  if (/sheet|modal/.test(type)) return 'sheet';
  return 'push';
}

/** Токены концепта: brand из спеки плюс :root из styles.css. */
function tokensOf(slug, spec) {
  const brand = spec.brand || {};
  const out = { accent: brand.accent, accentDark: brand.accentDark, fonts: brand.fonts, custom: {} };
  try {
    const css = readFileSync(join(conceptDir(slug), 'styles.css'), 'utf8');
    const root = css.match(/:root\s*\{([\s\S]*?)\}/);
    if (root) {
      for (const [, name, value] of root[1].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
        out.custom[name.trim()] = value.trim();
      }
    }
  } catch { /* у концепта может не быть своих токенов */ }
  return out;
}

/** Доступ вместе с его платформенными фактами. */
function capabilityOf(permission) {
  const platform = CAPABILITIES[permission.key] || {};
  return {
    key: permission.key,
    plist: permission.plist,
    kind: platform.kind || 'unknown',
    usageKeys: platform.usageKeys || [],
    entitlements: platform.entitlements || {},
    backgroundModes: platform.backgroundModes || [],
    frameworks: platform.frameworks || [],
    feature: permission.feature || null,
    gesture: permission.gesture || null,
    screen: permission.screen,
    target: permission.target,
    fallback: permission.fallback || null,
    alert: { title: permission.alert?.title, text: permission.alert?.text },
    anchor: Boolean(permission.anchor),
    conditional: Boolean(permission.conditional),
    requires: permission.requires || null,
    grounding: permission.grounding || null,
  };
}

/**
 * Связность модели мира. Доступ, не привязанный ни к одному действию, — это
 * ключ без фичи: ровно то, что заворачивает ревью App Store.
 */
function verifyWorld(world, spec) {
  if (!world) return [];
  const problems = [];
  const entities = new Set((world.entities || []).map((e) => e.id));
  const declared = new Set((spec.permissions || []).map((p) => p.key));
  const screens = new Set(spec.screens.map((s) => s.id));
  const bound = new Set();

  for (const entity of world.entities || []) {
    for (const relation of entity.relations || []) {
      if (!entities.has(relation.to)) {
        problems.push(`world: сущность ${entity.id} ссылается на несуществующую ${relation.to}`);
      }
    }
  }
  for (const action of world.actions || []) {
    if (action.entity && !entities.has(action.entity)) {
      problems.push(`world: действие ${action.id} привязано к несуществующей сущности ${action.entity}`);
    }
    if (action.screen && !screens.has(action.screen)) {
      problems.push(`world: действие ${action.id} привязано к несуществующему экрану ${action.screen}`);
    }
    for (const key of action.capabilities || []) {
      bound.add(key);
      if (!declared.has(key)) {
        problems.push(`world: действие ${action.id} использует доступ ${key}, которого нет в наборе`);
      }
    }
  }
  for (const key of declared) {
    if (!bound.has(key)) {
      problems.push(`world: доступ ${key} не привязан ни к одному действию — ключ без фичи`);
    }
  }
  return problems;
}

/**
 * Строки локализации, которыми спека уже владеет: заголовки экранов, тексты
 * системных промптов, жесты и fallback. Заводить под них параллельную таблицу
 * не нужно — она разъедется. Строки из разметки экранов сюда не попадают,
 * их выносит автор в concept.localization.
 */
function derivedStrings(spec) {
  const strings = {};
  for (const screen of spec.screens) {
    strings[`screen.${screen.id}.title`] = screen.title;
    if (screen.ui?.primaryAction) strings[`screen.${screen.id}.primaryAction`] = screen.ui.primaryAction;
  }
  for (const tab of spec.tabs || []) strings[`tab.${tab.id}`] = tab.label;
  for (const permission of spec.permissions || []) {
    if (permission.alert?.title) strings[`access.${permission.key}.alertTitle`] = permission.alert.title;
    if (permission.alert?.text) strings[`access.${permission.key}.alertText`] = permission.alert.text;
    if (permission.fallback) strings[`access.${permission.key}.fallback`] = permission.fallback;
    if (permission.gesture) strings[`access.${permission.key}.gesture`] = permission.gesture.replace(/[«»]/g, '');
    if (permission.snack) strings[`access.${permission.key}.snack`] = permission.snack;
  }
  for (const action of spec.product?.world?.actions || []) {
    strings[`action.${action.id}`] = action.name;
  }
  return strings;
}

export function buildUxSpec(slug) {
  const spec = readSpec(slug);
  validate(spec, slug);
  const markup = readMarkup(slug, spec);
  const graph = screenGraph(spec, markup);
  const actions = screenActions(spec, markup);
  const actionsByScreen = new Map(actions.map((item) => [item.screen.id, item.rows]));

  // Экран, с которого спрашивают доступ, обязан продумать состояние отказа.
  const asksOn = new Set((spec.permissions || [])
    .filter((p) => CAPABILITIES[p.key]?.kind === 'prompt')
    .map((p) => p.screen));

  const screens = spec.screens.map((screen) => {
    const declared = (screen.ui?.states || []).map(canonicalState);
    const covered = new Set(declared);
    const required = ['default', ...(asksOn.has(screen.id) ? ['permission'] : [])];
    return {
      id: screen.id,
      title: screen.title,
      presentation: presentationOf(screen),
      parent: screen.parent || null,
      meta: screen.meta || null,
      light: screen.light !== false,
      purpose: screen.ui?.purpose || null,
      pattern: screen.ui?.pattern || null,
      primaryAction: screen.ui?.primaryAction || null,
      hierarchy: screen.ui?.hierarchy || null,
      density: screen.ui?.density || null,
      states: {
        declared,
        required,
        missingRequired: required.filter((state) => !covered.has(state)),
        notCovered: CANONICAL_STATES.filter((state) => !covered.has(state)),
      },
      contentCases: screen.ui?.contentCases || [],
      actions: (actionsByScreen.get(screen.id) || []).map((row) => ({
        label: row.label,
        role: row.role,
        does: row.does,
        to: row.to === '—' ? null : row.to,
        onDeny: row.onDeny === '—' ? null : row.onDeny,
        keys: row.keys === '—' ? null : row.keys,
      })),
    };
  });

  const transitions = graph.edges.map((edge) => ({
    from: edge.from,
    to: edge.to,
    kind: edge.kind,
    label: edge.label,
  }));

  const world = spec.product?.world || null;
  const gaps = [...verifyWorld(world, spec)];
  if (!world) gaps.push('world: модель мира не описана — нет сущностей, их отношений и действий');
  if (!spec.localization) {
    gaps.push('localization: строки из разметки экранов не вынесены — выведены только те, которыми владеет спека');
  }
  if (!spec.acceptance) {
    gaps.push('acceptance: сценарии приёмки не описаны');
  } else {
    const actions = new Set((world?.actions || []).map((a) => a.id));
    const screenIds = new Set(spec.screens.map((s) => s.id));
    const declaredKeys = new Set((spec.permissions || []).map((p) => p.key));
    const covered = new Set();
    for (const scenario of spec.acceptance) {
      if (scenario.action && actions.size && !actions.has(scenario.action)) {
        gaps.push(`acceptance: сценарий ${scenario.id} ссылается на несуществующее действие ${scenario.action}`);
      }
      for (const id of scenario.screens || []) {
        if (!screenIds.has(id)) gaps.push(`acceptance: сценарий ${scenario.id} ссылается на несуществующий экран ${id}`);
      }
      for (const key of scenario.capabilities || []) covered.add(key);
    }
    const uncovered = [...declaredKeys].filter((key) => !covered.has(key));
    if (uncovered.length) {
      gaps.push(`acceptance: доступы без сценария приёмки — ${uncovered.join(', ')}`);
    }
  }
  if (!spec.fixtures) gaps.push('fixtures: мок-данные не вынесены из разметки');
  const withoutStates = screens.filter((s) => !s.states.declared.length).map((s) => s.id);
  if (withoutStates.length) {
    gaps.push(`states: состояния не продуманы на ${withoutStates.length} экранах — ${withoutStates.join(', ')}`);
  }
  const missingRequired = screens.filter((s) => s.states.declared.length && s.states.missingRequired.length);
  for (const screen of missingRequired) {
    gaps.push(`states: на экране ${screen.id} не хватает обязательных состояний — ${screen.states.missingRequired.join(', ')}`);
  }

  return {
    $schema: 'ux-spec/1',
    generated: 'scripts/ux-spec.mjs — не править руками, источник в concepts/<slug>/',
    slug: spec.slug,
    name: spec.name,
    tagline: spec.tagline || null,
    targetSet: spec.targetSet,
    domain: spec.domain || null,

    product: {
      ...(spec.product || {}),
      insight: spec.insight || null,
      positioning: spec.positioning || null,
    },

    world,

    navigation: {
      start: spec.start,
      tabs: spec.tabs || [],
      screens,
      transitions,
      unreachable: (graph.problems || []).filter((p) => /недостижим/i.test(p)),
    },

    capabilities: (spec.permissions || []).map(capabilityOf),

    tokens: tokensOf(slug, spec),

    localization: {
      language: spec.language || 'ru',
      derived: derivedStrings(spec),
      authored: spec.localization || null,
    },
    acceptance: spec.acceptance || null,
    fixtures: spec.fixtures || null,

    counts: {
      screens: screens.length,
      tabs: (spec.tabs || []).length,
      capabilities: (spec.permissions || []).length,
      transitions: transitions.length,
      prompts: (spec.permissions || []).filter((p) => CAPABILITIES[p.key]?.kind === 'prompt').length,
    },

    gaps,
  };
}

export function writeUxSpec(slug) {
  const data = buildUxSpec(slug);
  const file = join(DIST, slug, 'ux-spec.json');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  return { file, counts: data.counts, gaps: data.gaps.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const slug = process.argv[2];
  const slugs = slug ? [slug] : listConcepts();
  for (const item of slugs) {
    const { file, counts, gaps } = writeUxSpec(item);
    console.log(`${item.padEnd(12)} экранов ${String(counts.screens).padStart(2)} · доступов ${String(counts.capabilities).padStart(2)} · переходов ${String(counts.transitions).padStart(3)} · пробелов ${gaps}`);
    if (slug) console.log(`\n${file}`);
  }
}
