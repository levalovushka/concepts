#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assessConceptReadiness } from './concept-quality.mjs';
import { CONCEPTS, listConcepts, readSpec, validate } from './lib.mjs';

for (const slug of listConcepts()) readSpec(slug);

const dvor = readSpec('dvor');
const rejects = (mutate, pattern) => {
  const candidate = structuredClone(dvor);
  mutate(candidate);
  assert.throws(() => validate(candidate, 'dvor'), pattern);
};

rejects((spec) => { spec.product.returnReasons = ['Только одна']; }, /returnReasons/);
rejects((spec) => { spec.product.verticalSlice.result = 'missing'; }, /verticalSlice\.result/);
rejects((spec) => { spec.positioning.evidenceScreens = ['home', 'chats', 'missing']; }, /evidenceScreens/);
rejects((spec) => { spec.positioning.referencePatterns[0] = 'unknown-pattern'; }, /referencePatterns/);
rejects((spec) => { spec.appStore.category = { primary: 'Utilities', secondary: 'Lifestyle' }; }, /Social Networking/);

const template = readFileSync(join(CONCEPTS, '_template', 'concept.json'), 'utf8');
const materialize = (mode, targetSet, category, patterns) => JSON.parse(template
  .replaceAll('__SLUG__', `smoke-${mode}`)
  .replaceAll('__NAME__', 'Проверка')
  .replaceAll('__TARGET_SET__', targetSet)
  .replaceAll('__POSITIONING_MODE__', mode)
  .replaceAll('__APP_STORE_CATEGORY__', category)
  .replaceAll('__REFERENCE_PATTERN_1__', patterns[0])
  .replaceAll('__REFERENCE_PATTERN_2__', patterns[1])
  .replaceAll('__REFERENCE_PATTERN_3__', patterns[2]));

const draftMimicry = materialize('mimicry', 'vk-video', 'Photo & Video', ['video-feed', 'vertical-clips', 'immersive-player']);
const draftDifferentiation = materialize('differentiation', 'vk-music', 'Utilities', ['Паттерн 1', 'Паттерн 2', 'Паттерн 3']);
validate(draftMimicry, 'smoke-mimicry');
validate(draftDifferentiation, 'smoke-differentiation');
assert.ok(assessConceptReadiness(draftMimicry).issues.length > 5, 'черновой scaffold не должен считаться готовым');
assert.ok(assessConceptReadiness(draftDifferentiation).issues.length > 5, 'черновая отстройка не должна считаться готовой');

const ready = materialize('mimicry', 'vk-video', 'Photo & Video', ['video-feed', 'vertical-clips', 'immersive-player']);
Object.assign(ready.product, {
  audience: 'Зрители локальных концертов, которые следят за конкретными артистами',
  situation: 'Пользователь открывает приложение перед эфиром или после пропущенного выступления',
  problem: 'Полная запись, короткие моменты и канал артиста разбросаны по разным поверхностям',
  promise: 'Найти выступление, начать просмотр и сохранить конкретный момент за две минуты',
  differentiator: 'Единицей каталога становится выступление с сетлистом, эфиром и моментами',
  returnReasons: ['Новая премьера подписанного артиста', 'Продолжение недосмотренного концерта', 'Сохранённые моменты из выступлений'],
  coreLoop: ['Открыть выступление из подписок', 'Посмотреть эфир или запись', 'Сохранить момент и вернуться к артисту'],
  nonGoals: ['Не публиковать произвольные пользовательские ролики', 'Не продавать билеты и мерч'],
});
ready.tabs = [
  { id: 'home', label: 'Главная', role: 'home' },
  { id: 'home', label: 'Подписки', role: 'subscriptions' },
  { id: 'home', label: 'Профиль', role: 'profile' },
];
ready.positioning.referenceEvidence = [
  { pattern: 'video-feed', screen: 'home', behavior: 'Первый доступный концерт запускается прямо из контентной главной' },
  { pattern: 'vertical-clips', screen: 'home', behavior: 'Короткий момент сохраняет автора и ведёт в полное выступление' },
  { pattern: 'immersive-player', screen: 'home', behavior: 'Плеер сохраняет канал артиста, действия и продолжение просмотра' },
];
ready.readiness = {
  status: 'reviewed',
  referenceResearch: [
    { source: 'Официальное приложение VK Видео', observation: 'Главная начинает сценарий с контента, а не с объяснения продукта', decision: 'Первый концерт и кнопка просмотра находятся в первом viewport' },
    { source: 'Официальная документация Apple HIG', observation: 'Корневые разделы сохраняют стабильную навигацию', decision: 'Три root-роли одинаковы на всех корневых экранах' },
  ],
  productCritique: [
    { objection: 'Концепт может оказаться обычным видеокаталогом', resolution: 'Выступление объединяет эфир, запись, сетлист и моменты', evidenceScreens: ['home'] },
    { objection: 'Подписка на артиста может быть декоративной', resolution: 'Подписки становятся отдельной точкой возврата к премьерам', evidenceScreens: ['home'] },
    { objection: 'Короткие ролики могут оторваться от основного продукта', resolution: 'Каждый момент ведёт в таймкод полного выступления', evidenceScreens: ['home'] },
  ],
  visualPasses: [
    { name: 'Иерархия и композиция', screensReviewed: 'all', found: 7, fixed: 7, blockersOpen: 0, majorOpen: 0 },
    { name: 'Повторная приёмка', screensReviewed: 'all', found: 0, fixed: 0, blockersOpen: 0, majorOpen: 0 },
  ],
};
assert.deepEqual(assessConceptReadiness(ready).issues, []);
const readinessRejects = (mutate, pattern) => {
  const candidate = structuredClone(ready);
  mutate(candidate);
  assert.match(assessConceptReadiness(candidate).issues.join('\n'), pattern);
};
readinessRejects((spec) => { spec.product.promise = 'Какой наблюдаемый результат даёт продукт'; }, /product\.promise/);
readinessRejects((spec) => { spec.tabs = spec.tabs.filter((tab) => tab.role !== 'subscriptions'); }, /subscriptions/);
readinessRejects((spec) => { spec.positioning.referenceEvidence[0].behavior = 'Как пользователь узнаёт паттерн'; }, /behavior/);
readinessRejects((spec) => { spec.readiness.visualPasses = spec.readiness.visualPasses.slice(0, 1); }, /visualPasses/);
readinessRejects((spec) => { spec.readiness.productCritique = []; }, /productCritique/);

const badDensity = materialize('differentiation', 'vk-music', 'Utilities', ['Паттерн 1', 'Паттерн 2', 'Паттерн 3']);
badDensity.screens[0].ui.density = 'high';
assert.throws(() => validate(badDensity, 'smoke-differentiation'), /density/);
const missingState = materialize('differentiation', 'vk-music', 'Utilities', ['Паттерн 1', 'Паттерн 2', 'Паттерн 3']);
missingState.screens[0].ui.states = ['default'];
assert.throws(() => validate(missingState, 'smoke-differentiation'), /требует состояние/);

const staleAge = materialize('differentiation', 'vk-music', 'Utilities', ['Паттерн 1', 'Паттерн 2', 'Паттерн 3']);
staleAge.appStore.ageRating = '12+';
assert.throws(() => validate(staleAge, 'smoke-differentiation'), /актуальную шкалу/);
const belowTargetAge = materialize('differentiation', 'vk-music', 'Utilities', ['Паттерн 1', 'Паттерн 2', 'Паттерн 3']);
belowTargetAge.appStore.ageRating = '9+';
assert.throws(() => validate(belowTargetAge, 'smoke-differentiation'), /ниже 13\+ у ВК Музыка/);

console.log(`контракт качества: ${listConcepts().length} концептов · 14 негативных evals · legal age floor · readiness v2 · UI v3`);
