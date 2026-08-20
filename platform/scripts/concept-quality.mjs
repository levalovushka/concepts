import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const readJson = (file) => JSON.parse(readFileSync(join(ROOT, 'kernel', file), 'utf8'));
const RECIPES = readJson('screen-recipes.json');
const ARCHETYPES = Object.fromEntries(['vk-music', 'vk-video', 'vkontakte', 'ok'].map((id) => [id, readJson(`archetypes/${id}.json`)]));

export const POSITIONING_MODES = {
  mimicry: { label: 'Мимикрия', description: 'Знакомая грамматика продукта-референса в собственной нише' },
  differentiation: { label: 'Отстройка', description: 'Самостоятельный продукт на том же наборе доступов' },
};

export const archetypeFor = (targetSet) => ARCHETYPES[targetSet] || null;

const nonEmptyList = (value, min = 1) => Array.isArray(value)
  && value.length >= min
  && value.every((item) => typeof item === 'string' && item.trim());

const PLACEHOLDER = /(?:заполн|замен|пример|паттерн\s*\d|как\s+пользователь\s+узна[её]т\s+паттерн|причина\s+вернуться\s*\d|шаг\s*\d|ось\s+отстройки|одна\s+фраза|кто\s+конкретно|в\s+какой\s+наблюдаемой|что\s+сейчас|какой\s+наблюдаемый|почему\s+это|что\s+продукт\s+сознательно|какая\s+соседняя\s+задача|действие,\s+которому)/i;
const vague = (value) => typeof value !== 'string' || value.trim().length < 18 || PLACEHOLDER.test(value);
const itemList = (value, min = 1) => Array.isArray(value) && value.length >= min && value.every((item) => item && typeof item === 'object');

/**
 * Один внешний seam для приёмки готовности. Структурный validate отвечает на
 * «можно ли прочитать спеку», readiness — на «имеем ли мы право назвать её
 * готовым продуктом». Это позволяет собирать draft, но не публиковать его.
 */
export function assessConceptReadiness(spec, ids = new Set((spec.screens || []).map((screen) => screen.id))) {
  if ((spec.qualityContractVersion || 1) < 2) return { issues: [], summary: { contract: 'legacy' } };
  const issues = [];
  const add = (message) => issues.push(message);
  const product = spec.product || {};
  for (const field of ['audience', 'situation', 'problem', 'promise', 'differentiator']) {
    if (vague(product[field])) add(`product.${field}: нужна конкретная проверяемая формулировка, не placeholder`);
  }
  for (const [field, min] of [['returnReasons', 3], ['coreLoop', 3], ['nonGoals', 2]]) {
    if (!nonEmptyList(product[field], min) || product[field].some(vague)) add(`product.${field}: нужно минимум ${min} конкретных пунктов без шаблонного текста`);
  }

  const readiness = spec.readiness || {};
  if (readiness.status !== 'reviewed') add('readiness.status: перед публикацией ожидается reviewed');
  if (!itemList(readiness.referenceResearch, 2)) add('readiness.referenceResearch: нужно минимум 2 наблюдения из первичных источников');
  else readiness.referenceResearch.forEach((row, index) => {
    for (const field of ['source', 'observation', 'decision']) if (vague(row[field])) add(`readiness.referenceResearch[${index}].${field}: недостаточно конкретно`);
  });
  if (!itemList(readiness.productCritique, 3)) add('readiness.productCritique: нужно минимум 3 возражения с решениями и экранами-доказательствами');
  else readiness.productCritique.forEach((row, index) => {
    if (vague(row.objection) || vague(row.resolution)) add(`readiness.productCritique[${index}]: возражение и решение должны быть конкретными`);
    if (!nonEmptyList(row.evidenceScreens, 1)) add(`readiness.productCritique[${index}].evidenceScreens пуст`);
    else row.evidenceScreens.forEach((id) => { if (!ids.has(id)) add(`readiness.productCritique[${index}]: экран «${id}» не существует`); });
  });
  if (!itemList(readiness.visualPasses, 2)) add('readiness.visualPasses: нужны минимум 2 полных визуальных прохода');
  else readiness.visualPasses.forEach((pass, index) => {
    if (pass.screensReviewed !== 'all') add(`readiness.visualPasses[${index}]: screensReviewed должен быть all`);
    for (const field of ['found', 'fixed', 'blockersOpen', 'majorOpen']) if (!Number.isInteger(pass[field]) || pass[field] < 0) add(`readiness.visualPasses[${index}].${field}: ожидается неотрицательное целое`);
    if (pass.fixed < pass.found) add(`readiness.visualPasses[${index}]: исправлено меньше дефектов, чем найдено`);
    if (pass.blockersOpen || pass.majorOpen) add(`readiness.visualPasses[${index}]: остались blocker/major дефекты`);
  });

  const archetype = archetypeFor(spec.targetSet);
  if (spec.positioning?.mode === 'mimicry' && archetype) {
    const evidence = spec.positioning.referenceEvidence;
    if (!itemList(evidence, 3)) add('positioning.referenceEvidence: для мимикрии нужно минимум 3 связи pattern → screen → behavior');
    else evidence.forEach((row, index) => {
      if (!archetype.patterns[row.pattern]) add(`positioning.referenceEvidence[${index}].pattern: «${row.pattern}» отсутствует в архетипе`);
      if (!ids.has(row.screen)) add(`positioning.referenceEvidence[${index}].screen: «${row.screen}» не существует`);
      if (vague(row.behavior)) add(`positioning.referenceEvidence[${index}].behavior: нужно наблюдаемое поведение`);
    });
    const navRoles = new Set((spec.tabs || []).map((tab) => tab.role));
    for (const role of archetype.requiredNavigationRoles || []) if (!navRoles.has(role)) add(`tabs: мимикрия ${spec.targetSet} не покрывает обязательную роль «${role}»`);
  }
  return { issues, summary: { contract: 2, research: readiness.referenceResearch?.length || 0, critiques: readiness.productCritique?.length || 0, passes: readiness.visualPasses?.length || 0 } };
}

export function validateConceptQuality(spec, ids) {
  const err = [];
  const product = spec.product || {};
  if (![1, 2].includes(spec.qualityContractVersion)) err.push('qualityContractVersion: ожидается 1 или 2');
  if (!nonEmptyList(product.returnReasons, 3)) err.push('product.returnReasons: нужно минимум 3 конкретные причины вернуться');

  const slice = product.verticalSlice;
  if (!slice) err.push('product.verticalSlice отсутствует');
  else {
    const sliceIds = ['entry', 'action', 'result'].map((role) => slice[role]);
    for (const [index, role] of ['entry', 'action', 'result'].entries()) {
      if (!ids.has(sliceIds[index])) err.push(`product.verticalSlice.${role}: экран «${sliceIds[index]}» не существует`);
    }
    if (new Set(sliceIds).size < 3) err.push('product.verticalSlice: нужны три разных экрана');
  }

  const positioning = spec.positioning;
  if (!positioning) return err;
  if (!POSITIONING_MODES[positioning.mode]) err.push(`positioning.mode «${positioning.mode}» не поддерживается`);
  if (!positioning.categoryFit?.trim()) err.push('positioning.categoryFit пуст');
  for (const field of ['familiarPatterns', 'distinctions']) {
    if (!nonEmptyList(positioning[field], 3)) err.push(`positioning.${field}: нужно минимум 3 непустых пункта`);
  }
  if (!nonEmptyList(positioning.evidenceScreens, 3)) err.push('positioning.evidenceScreens: нужно минимум 3 экрана-доказательства');
  else for (const id of positioning.evidenceScreens) if (!ids.has(id)) err.push(`positioning.evidenceScreens: экран «${id}» не существует`);

  const archetype = archetypeFor(spec.targetSet);
  if (positioning.mode === 'mimicry') {
    const categories = [spec.appStore?.category?.primary, spec.appStore?.category?.secondary];
    if (!archetype) err.push(`для мимикрии неизвестен продукт-референс ${spec.targetSet}`);
    else {
      if (!categories.includes(archetype.category)) err.push(`мимикрия под ${spec.targetSet}: категория App Store должна включать ${archetype.category}`);
      if (!nonEmptyList(positioning.referencePatterns, 3)) err.push('positioning.referencePatterns: для мимикрии нужно минимум 3 паттерна референса');
      else for (const pattern of positioning.referencePatterns) if (!archetype.patterns[pattern]) err.push(`positioning.referencePatterns: «${pattern}» отсутствует в профиле ${spec.targetSet}`);
    }
  }
  return err;
}

export function validateUiContract(spec) {
  const err = [];
  if (spec.uiContractVersion == null) return err;
  if (![1, 2, 3].includes(spec.uiContractVersion)) return [`uiContractVersion ${spec.uiContractVersion} не поддерживается`];
  const states = new Set(['default', 'empty', 'loading', 'error', 'denied', 'success', 'offline']);
  for (const screen of spec.screens || []) {
    const ui = screen.ui;
    if (!ui) { err.push(`${screen.id}: нет ui-контракта`); continue; }
    const recipe = RECIPES[ui.pattern];
    if (!recipe) err.push(`${screen.id}: неизвестный ui.pattern «${ui.pattern}»`);
    if (!ui.purpose?.trim()) err.push(`${screen.id}: ui.purpose пуст`);
    if (ui.primaryAction !== null && !ui.primaryAction?.trim()) err.push(`${screen.id}: ui.primaryAction должен быть строкой или null`);
    if (!Array.isArray(ui.states) || !ui.states.length) err.push(`${screen.id}: ui.states пуст`);
    else for (const state of ui.states) if (!states.has(state)) err.push(`${screen.id}: неизвестное ui-состояние «${state}»`);
    if (spec.uiContractVersion >= 2) {
      if (!recipe?.densities.includes(ui.density)) err.push(`${screen.id}: density «${ui.density}» не подходит рецепту ${ui.pattern}`);
      for (const state of recipe?.requiredStates || []) if (!ui.states?.includes(state)) err.push(`${screen.id}: рецепт ${ui.pattern} требует состояние «${state}»`);
      if (spec.uiContractVersion === 2 && !nonEmptyList(ui.contentCases, 3)) err.push(`${screen.id}: ui.contentCases — нужно минимум 3 случая данных`);
    }
    if (spec.uiContractVersion >= 3) {
      if (!['root', 'push', 'modal', 'fullscreen', 'system'].includes(ui.navigation)) err.push(`${screen.id}: ui.navigation должен быть root/push/modal/fullscreen/system`);
      if (!ui.hierarchy || vague(ui.hierarchy.primary) || vague(ui.hierarchy.secondary)) err.push(`${screen.id}: ui.hierarchy должен называть primary и secondary regions`);
      const cases = ui.contentCases;
      if (!itemList(cases, 3)) err.push(`${screen.id}: UI v3 требует объектные contentCases typical/stress/failure`);
      else {
        const kinds = new Set(cases.map((item) => item.kind));
        for (const kind of ['typical', 'stress', 'failure']) if (!kinds.has(kind)) err.push(`${screen.id}: contentCases не содержит ${kind}`);
        cases.forEach((item, index) => { if (vague(item.example)) err.push(`${screen.id}: contentCases[${index}].example недостаточно конкретен`); });
      }
    }
  }
  return err;
}

export function qualitySummary(spec) {
  const archetype = archetypeFor(spec.targetSet);
  return {
    mode: POSITIONING_MODES[spec.positioning.mode]?.label || spec.positioning.mode,
    reference: archetype?.label || spec.targetSet,
    category: spec.appStore?.category?.primary,
    returnReasons: spec.product.returnReasons.length,
    verticalSlice: spec.product.verticalSlice,
    evidenceScreens: spec.positioning.evidenceScreens.length,
    referencePatterns: spec.positioning.referencePatterns?.length || 0,
    uiContract: spec.uiContractVersion || 'legacy',
    readiness: spec.qualityContractVersion >= 2 ? assessConceptReadiness(spec).summary : null,
  };
}
