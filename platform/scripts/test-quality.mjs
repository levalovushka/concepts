#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assessConceptReadiness } from './concept-quality.mjs';
import { CONCEPTS, listConcepts, readSpec, validate } from './lib.mjs';
import { runScriptStage } from './pipeline-runner.mjs';
import { CONSISTENCY_FAMILIES, detectCrossScreenSignals, detectHeuristicSignals, validateHumanReview, validateIterationReview, VISUAL_LENSES } from './quality-review.mjs';
import { requiresPreviousReview } from './quality-review-contract.mjs';

const ROOT_FIXTURE = join(fileURLToPath(new URL('.', import.meta.url)), 'fixtures', 'quality-review');

const successfulStage = runScriptStage('fixtures/tooling/stage-ok.mjs', ['fixture']);
assert.equal(successfulStage.ok, true, successfulStage.output);
assert.equal(successfulStage.output, 'stage-ok:fixture');
const missingStage = runScriptStage('fixtures/tooling/missing.mjs');
assert.equal(missingStage.ok, false, 'missing pipeline stage must fail');
assert.equal(missingStage.status, 1);

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
readinessRejects((spec) => { spec.readiness.productCritique = []; }, /productCritique/);

assert.equal(ready.qualityContractVersion, 3, 'новый scaffold должен использовать hash-bound quality contract v3');
assert.equal('visualPasses' in ready.readiness, true, 'тестовый ready ещё содержит legacy-поле, но v3 не доверяет ему');
const intentionalFixture = JSON.parse(readFileSync(join(ROOT_FIXTURE, 'intentional.json'), 'utf8'));
const slopFixture = JSON.parse(readFileSync(join(ROOT_FIXTURE, 'slop.json'), 'utf8'));
assert.deepEqual(detectHeuristicSignals(intentionalFixture), [], 'намеренный system border не должен быть hard-coded aesthetic failure');
const slopKinds = new Set(detectHeuristicSignals(slopFixture).map((signal) => signal.kind));
for (const kind of ['all-caps-copy', 'terminal-control-period', 'author-voice', 'nested-surfaces', 'border-pressure', 'effect-without-role', 'formula-copy', 'alignment-drift', 'baseline-drift', 'spacing-outlier']) assert.ok(slopKinds.has(kind), `fixture должен давать signal ${kind}`);
const surfaceShift = detectCrossScreenSignals([
  { screen: 'phone', summary: { surfaceLuminance: 1, primary: { height: 50, radius: 14, bbox: {} } } },
  { screen: 'home', summary: { surfaceLuminance: 0, heading: { size: 28, weight: 600 }, primary: { height: 50, radius: 25, bbox: {} }, actions: [{ target: 'result', label: 'Открыть результат', height: 50, radius: 25, disabled: false }] } },
  { screen: 'result', summary: { surfaceLuminance: .1, heading: { size: 42, weight: 900 }, actions: [{ target: 'result', label: 'Итог', height: 36, radius: 8, disabled: true }] } },
], { system: ['phone'], product: ['home', 'result'] }, { auth: { entryTarget: 'home' } });
for (const kind of ['cross-screen-surface-shift', 'cross-screen-primary-geometry', 'cross-screen-semantic-typography', 'cross-screen-object-naming', 'cross-screen-control-consistency']) assert.ok(surfaceShift.some((signal) => signal.kind === kind), `journey detector должен давать ${kind}`);

const reviewManifest = { screens: { product: ['home', 'result'], system: ['phone'] } };
const reviewFindings = { signals: [{ id: 'signal-1' }] };
const superficialReview = {
  reviewer: { role: 'critic', id: 'visual-reviewer-session', method: 'Независимый просмотр полноразмерных PNG и contact sheets.' },
  product: { verdict: 'accepted', strengths: ['ok'], noChangeRationale: 'В целом продукт выглядит достаточно хорошо.' },
  visual: { verdict: 'accepted', contactSheetJudgment: {}, lenses: [], screenReviews: [], consistency: [], systemScreensReviewed: ['phone'], systemFit: 'Всё согласовано достаточно хорошо.', findings: [] },
  iteration: { outcome: 'accepted', changes: [] }, signals: [{ id: 'signal-1', decision: 'intentional', reason: 'Так задумано.' }],
};
const superficialIssues = validateHumanReview(reviewManifest, reviewFindings, superficialReview);
for (const fragment of ['firstImpression', 'visual.lenses.typography', 'home: product screen', 'visual.consistency.primary-action', 'noFindingsRationale', 'heuristic signal']) assert.ok(superficialIssues.some((issue) => issue.includes(fragment)), `rubber-stamp review должен падать по ${fragment}`);

const acceptedReview = structuredClone(superficialReview);
acceptedReview.product.strengths = ['Вертикальный срез показывает действие и наблюдаемый результат на двух связанных экранах.'];
acceptedReview.visual.contactSheetJudgment = {
  firstImpression: 'Главное действие считывается первым, а служебные метрики остаются вторым уровнем.',
  strongestScreen: 'result: результат отделён от ввода и показывает изменение через одну доминантную диаграмму.',
  weakestScreen: 'home: нижняя часть плотнее результата, но порядок чтения не ломается на полном PNG.',
  repetitionRisk: 'Карточные контейнеры не повторяют один шаблон: вход, результат и системный экран собраны по разным ролям.',
};
acceptedReview.visual.lenses = VISUAL_LENSES.map((lens) => ({ lens, verdict: 'accepted', evidenceScreens: ['home', 'result'], observation: `${lens}: конкретное наблюдение связано с видимой иерархией двух продуктовых PNG.`, decision: `${lens}: решение сохранено, потому что оно поддерживает главное действие и результат.` }));
acceptedReview.visual.screenReviews = ['home', 'result'].map((screen) => ({ screen, verdict: 'accepted', evidence: `${screen}: проверен полный PNG, включая первый viewport и нижнюю навигацию.`, hierarchy: 'Один доминантный заголовок и одно главное действие образуют устойчивый порядок чтения.', typography: 'Размеры текста различают заголовок, данные и подписи без микротипографики.', color: 'Акцент используется только для действия и состояния, нейтрали сохраняют контраст.', composition: 'Композиция опирается на один смысловой центр и не распадается на одинаковые карточки.' }));
acceptedReview.visual.consistency = CONSISTENCY_FAMILIES.map((family) => ({ family, verdict: 'accepted', systemScreens: ['phone'], productScreens: ['home'], observation: `${family}: одинаковая роль сравнена на соседних auth и product PNG, включая геометрию и типографику.`, decision: `${family}: различие оставлено только там, где меняется функциональная роль контрола или поверхности.` }));
acceptedReview.visual.systemFit = 'phone проверен отдельно: системный auth не оценивается на оригинальность, но согласован с продуктом по тону и акценту.';
acceptedReview.visual.noFindingsRationale = 'После полноразмерного просмотра двух product PNG новых blocker или major дефектов не обнаружено.';
acceptedReview.signals[0].reason = 'Сигнал относится к системной границе контрола и соответствует его интерактивной роли.';
assert.deepEqual(validateHumanReview(reviewManifest, reviewFindings, acceptedReview), [], 'полный evidence-backed review должен проходить');
const unresolvedSignalReview = structuredClone(acceptedReview);
unresolvedSignalReview.signals[0].decision = 'defect';
assert.ok(validateHumanReview(reviewManifest, reviewFindings, unresolvedSignalReview).some((issue) => issue.includes('fixed visual finding')), 'defect signal без исправления должен блокировать acceptance');
assert.equal(acceptedReview.iteration.previousRunId, undefined, 'первый чистый review не обязан выдумывать предыдущий run');
assert.equal(requiresPreviousReview(acceptedReview), false, 'чистый первый review не требует critique bundle');
const fixedMajorReview = structuredClone(acceptedReview);
fixedMajorReview.visual.findings = [{ severity: 'major', status: 'fixed' }];
assert.equal(requiresPreviousReview(fixedMajorReview), true, 'исправленный major требует предыдущий critique bundle');
const beforeManifest = { hashes: { sources: { styles: 'before' } } };
const afterManifest = { hashes: { sources: { styles: 'after' } } };
const rejectedReview = { iteration: { outcome: 'revise' }, visual: { findings: [{ severity: 'major', status: 'open' }] } };
acceptedReview.iteration.changes = ['Пересобрана иерархия главного экрана после critique.'];
assert.deepEqual(validateIterationReview(beforeManifest, rejectedReview, afterManifest, acceptedReview), [], 'critique → changed sources → accepted должен проходить');
assert.ok(validateIterationReview(afterManifest, rejectedReview, afterManifest, acceptedReview).some((issue) => issue.includes('source hashes')), 'самодекларация без изменения исходников должна падать');
assert.ok(validateIterationReview(beforeManifest, { iteration: { outcome: 'accepted' }, visual: { findings: [] } }, afterManifest, acceptedReview).length >= 2, 'предыдущий rubber-stamp run не считается critique');

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

console.log(`контракт качества: ${listConcepts().length} концептов · 13 негативных evals · detector fixtures · readiness v2/v3 · UI v3`);
