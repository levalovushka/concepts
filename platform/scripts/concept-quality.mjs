import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const readJson = (file) => JSON.parse(readFileSync(join(ROOT, 'kernel', file), 'utf8'));
const RECIPES = readJson('screen-recipes.json');
const ARCHETYPES = Object.fromEntries(['vk-music', 'vk-video', 'vkontakte'].map((id) => [id, readJson(`archetypes/${id}.json`)]));

export const POSITIONING_MODES = {
  mimicry: { label: 'Мимикрия', description: 'Знакомая грамматика продукта-референса в собственной нише' },
  differentiation: { label: 'Отстройка', description: 'Самостоятельный продукт на том же наборе доступов' },
};

export const archetypeFor = (targetSet) => ARCHETYPES[targetSet] || null;

const nonEmptyList = (value, min = 1) => Array.isArray(value)
  && value.length >= min
  && value.every((item) => typeof item === 'string' && item.trim());

export function validateConceptQuality(spec, ids) {
  const err = [];
  const product = spec.product || {};
  if (spec.qualityContractVersion !== 1) err.push('qualityContractVersion: ожидается 1');
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
  if (![1, 2].includes(spec.uiContractVersion)) return [`uiContractVersion ${spec.uiContractVersion} не поддерживается`];
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
      if (!nonEmptyList(ui.contentCases, 3)) err.push(`${screen.id}: ui.contentCases — нужно минимум 3 случая данных`);
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
  };
}
