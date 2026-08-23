/** Общее для всех инструментов платформы: пути, чтение спеки, производные данные. */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateConceptQuality, validateUiContract } from './concept-quality.mjs';

export { POSITIONING_MODES } from './concept-quality.mjs';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const KERNEL = join(ROOT, 'kernel');
export const CONCEPTS = join(ROOT, 'concepts');
export const DIST = join(ROOT, 'dist');

/** Один реестр связывает набор доступов, продукт-референс и категорию стора. */
export const TARGET_PRODUCTS = {
  'vk-music': { label: 'ВК Музыка', short: 'Музыка' },
  'vk-video': { label: 'ВК Видео', short: 'Видео' },
  vkontakte: { label: 'ВКонтакте', short: 'ВКонтакте' },
  ok: { label: 'Одноклассники', short: 'ОК' },
};

export const conceptDir = (slug) => join(CONCEPTS, slug);

/** Все концепты, кроме служебного _template. */
export function listConcepts() {
  return readdirSync(CONCEPTS)
    .filter((d) => !d.startsWith('_') && existsSync(join(CONCEPTS, d, 'concept.json')))
    .sort();
}

export function readSpec(slug) {
  const file = join(conceptDir(slug), 'concept.json');
  if (!existsSync(file)) throw new Error('нет спеки: ' + file);
  const spec = JSON.parse(readFileSync(file, 'utf8'));
  validate(spec, slug);
  return spec;
}

/**
 * Спека — единственный источник правды, поэтому ошибки в ней должны падать
 * сразу и внятно, а не всплывать кривым прототипом.
 */
export function validate(spec, slug) {
  const err = [];
  const need = ['slug', 'name', 'start', 'permissions', 'screens', 'brand', 'product', 'positioning'];
  for (const k of need) if (!spec[k]) err.push('нет поля ' + k);
  if (spec.slug !== slug) err.push(`slug «${spec.slug}» не совпадает с папкой «${slug}»`);

  const productFields = ['audience', 'situation', 'problem', 'promise', 'differentiator'];
  for (const field of productFields) if (!spec.product?.[field]?.trim()) err.push(`product.${field} пуст`);
  for (const field of ['coreLoop', 'nonGoals']) {
    if (!Array.isArray(spec.product?.[field]) || !spec.product[field].length) err.push(`product.${field} должен быть непустым списком`);
    else if (spec.product[field].some((item) => typeof item !== 'string' || !item.trim())) err.push(`product.${field} содержит пустой пункт`);
  }
  if (spec.product?.coreLoop?.length < 3) err.push('product.coreLoop: нужно минимум 3 шага');

  const ids = new Set();
  for (const s of spec.screens || []) {
    if (!s.id || !s.title) err.push('экран без id/title');
    if (ids.has(s.id)) err.push('дубль экрана: ' + s.id);
    ids.add(s.id);
  }
  if (spec.start && !ids.has(spec.start)) err.push('стартовый экран отсутствует: ' + spec.start);
  err.push(...validateConceptQuality(spec, ids));

  /* Родитель по IA: должен существовать, цепочка — доходить до корня без петли. */
  const parentOf = Object.fromEntries((spec.screens || []).map((s) => [s.id, s.parent]));
  for (const s of spec.screens || []) {
    if (!s.parent) continue;
    if (!ids.has(s.parent)) { err.push(`${s.id}: родитель ${s.parent} не существует`); continue; }
    const seen = new Set([s.id]);
    for (let cur = s.parent; cur; cur = parentOf[cur]) {
      if (seen.has(cur)) { err.push(`${s.id}: цикл в цепочке родителей`); break; }
      seen.add(cur);
    }
  }

  const keys = new Set();
  const entitlementOnly = new Set(['applesignin', 'appgroups', 'keychain', 'autofill', 'bgtask', 'fetch', 'hotspot', 'wifiinfo']);
  for (const p of spec.permissions || []) {
    if (!p.key || (!p.plist && !entitlementOnly.has(p.key))) err.push('доступ без key/plist');
    if (keys.has(p.key)) err.push('дубль доступа: ' + p.key);
    keys.add(p.key);
    if (!p.alert?.title || !p.alert?.text) err.push(`${p.key}: нет alert.title/text`);
    if (!p.feature) err.push(`${p.key}: нет фичи — доступ без фичи не заявляем`);
    if (!p.fallback) err.push(`${p.key}: нет fallback`);
    if (p.screen && !ids.has(p.screen)) err.push(`${p.key}: экран ${p.screen} не существует`);
    if (p.target && !ids.has(p.target)) err.push(`${p.key}: цель ${p.target} не существует`);
    if (p.conditional && !p.requires) err.push(`${p.key}: условный доступ без поля requires`);
  }
  for (const t of spec.tabs || []) if (!ids.has(t.id)) err.push('вкладка без экрана: ' + t.id);

  err.push(...validateUiContract(spec));

  if (err.length) throw new Error('Спека ' + slug + ':\n  · ' + err.join('\n  · '));
}

/** Заявленное главное действие должно существовать в реальной разметке. */
export function validateUiMarkup(spec, markup) {
  if (spec.uiContractVersion == null) return;
  const problems = [];
  const visibleText = (html) => html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  for (const screen of spec.screens) {
    const action = screen.ui?.primaryAction;
    if (action && !visibleText(markup[screen.id] || '').includes(action)) problems.push(`${screen.id}: главное действие «${action}» не найдено в разметке`);
    if (spec.uiContractVersion >= 3 && action) {
      const html = markup[screen.id] || '';
      const primaryCount = (html.match(/\bdata-primary(?:=|\s|>)/g) || []).length;
      if (primaryCount !== 1) problems.push(`${screen.id}: UI v3 требует ровно один data-primary для главного действия, найдено ${primaryCount}`);
    }
  }
  if (problems.length) throw new Error(`UI-контракт ${spec.slug}:\n  · ${problems.join('\n  · ')}`);
}

/** Разметка всех экранов спеки: {id: html}. Источник карты экранов и прототипа один. */
export function readMarkup(slug, spec) {
  const out = {};
  for (const s of spec.screens) {
    const f = join(conceptDir(slug), 'screens', s.id + '.html');
    if (!existsSync(f)) throw new Error(`${slug}: нет разметки экрана ${s.id} (${f})`);
    out[s.id] = readFileSync(f, 'utf8').trimEnd();
  }
  return out;
}

/** Данные, которые движок ждёт в window.__CONCEPT__. */
export function engineData(spec) {
  return {
    start: spec.start,
    perms: spec.permissions.map((p) => {
      const row = [p.key, p.plist, p.alert.title, p.alert.text];
      if (p.alert.deny || p.alert.grant) row.push(p.alert.deny || 'Запретить', p.alert.grant || 'Разрешить');
      return row;
    }),
    titles: Object.fromEntries(spec.screens.map((s) => [s.id, s.title])),
    light: Object.fromEntries(spec.screens.filter((s) => s.light).map((s) => [s.id, 1])),
    tabs: Object.fromEntries((spec.tabs || []).map((t) => [t.id, 1])),
    parent: Object.fromEntries(spec.screens.filter((s) => s.parent).map((s) => [s.id, s.parent])),
    hero: ((spec.prototypes || []).find((p) => p.hero) || (spec.prototypes || [])[0] || {}).id,
    snack: Object.fromEntries(spec.permissions.filter((p) => p.snack).map((p) => [p.key, p.snack])),
    snackOnce: Object.fromEntries(spec.permissions.filter((p) => p.snackOnce).map((p) => [p.key, true])),
    map: spec.screens.map((s) => [s.id, s.title, s.meta || '']),
  };
}

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Подстановка {{СЛОТ}} в несколько проходов — слот может раскрыться в другой слот. */
export function fill(tpl, vars, passes = 3) {
  let out = tpl;
  for (let i = 0; i < passes; i++) {
    const before = out;
    out = out.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
    if (out === before) break;
  }
  return out;
}

export const RISK_LABEL = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };
