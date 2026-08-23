#!/usr/bin/env node
/**
 * Скаффолд нового концепта из _template.
 *
 *   node scripts/new-concept.mjs muzloop "Музлуп" vk-music differentiation
 *
 * Дальше: заполнить concept.json по PLAYBOOK.md (фазы 0–5), написать экраны,
 * медиа и доки, затем capture → check (фазы 7–10).
 */
import { cpSync, existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { CONCEPTS, conceptDir, listConcepts, TARGET_PRODUCTS, POSITIONING_MODES } from './lib.mjs';
import { archetypeFor } from './concept-quality.mjs';

const [slug, name, targetSet, requestedMode = 'differentiation'] = process.argv.slice(2);
const referencePatterns = {
  'vk-music': ['audio-library', 'audio-player', 'background-playback'],
  'vk-video': ['video-feed', 'vertical-clips', 'immersive-player'],
  vkontakte: ['social-feed', 'messaging', 'profile'],
  ok: ['social-feed', 'messaging', 'profile'],
}[targetSet] || ['Знакомый паттерн 1', 'Знакомый паттерн 2', 'Знакомый паттерн 3'];
const nativeReferenceProfiles = {
  'vk-music': 'vk-music-ios',
  'vk-video': 'vk-video-ios',
  vkontakte: 'vk-ios',
  ok: 'ok-ios',
};
if (!slug || !name) {
  console.error('использование: node scripts/new-concept.mjs <slug> "<Название>" <целевой-набор> [mimicry|differentiation]');
  console.error('существующие концепты:', listConcepts().join(', ') || '—');
  process.exit(1);
}
if (!/^[a-z][a-z0-9-]*$/.test(slug)) { console.error('slug: только строчные латинские, цифры и дефис'); process.exit(1); }
if (!POSITIONING_MODES[requestedMode]) { console.error(`неизвестная стратегия: ${requestedMode}`); process.exit(1); }
if (requestedMode === 'mimicry' && !TARGET_PRODUCTS[targetSet]) { console.error(`для мимикрии неизвестен продукт-референс: ${targetSet}`); process.exit(1); }

/* Мимикрия читается с первого экрана как участник категории референса (см.
   positioning-contract.md) — вход по номеру уже даёт этот сигнал синим
   акцентом ВКонтакте (#0077FF), как у большинства mimicry-концептов в репо.
   Отстройка держит нейтральный дефолт шаблона — на разницу с референсом
   работает не akцент, а собственная категория и IA. */
const [accent, accentDark] = requestedMode === 'mimicry' ? ['#0077FF', '#0077FF'] : ['#0d8a7a', '#3dd6c0'];

const dir = conceptDir(slug);
if (existsSync(dir)) { console.error(`концепт ${slug} уже существует: ${dir}`); process.exit(1); }

cpSync(join(CONCEPTS, '_template'), dir, { recursive: true });

/* Подставляем идентичность во все текстовые файлы шаблона. */
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
for (const f of walk(dir)) {
  if (!/\.(json|html|css|mjs|md)$/.test(f)) continue;
  const s = readFileSync(f, 'utf8')
    .replaceAll('__SLUG__', slug)
    .replaceAll('__NAME__', name)
    .replaceAll('__TARGET_SET__', targetSet || 'не задан')
    .replaceAll('__POSITIONING_MODE__', requestedMode)
    .replaceAll('__APP_STORE_CATEGORY__', requestedMode === 'mimicry' ? archetypeFor(targetSet).category : 'Utilities')
    .replaceAll('__ACCENT__', accent)
    .replaceAll('__ACCENT_DARK__', accentDark)
    .replaceAll('__REFERENCE_PATTERN_1__', referencePatterns[0])
    .replaceAll('__REFERENCE_PATTERN_2__', referencePatterns[1])
    .replaceAll('__REFERENCE_PATTERN_3__', referencePatterns[2])
    .replaceAll('__REFERENCE_PROFILE_PROPERTY__', requestedMode === 'mimicry'
      ? `"referenceProfile": "${nativeReferenceProfiles[targetSet]}",`
      : '');
  writeFileSync(f, s);
}
mkdirSync(join(dir, 'assets', 'media'), { recursive: true });
mkdirSync(join(dir, 'assets', 'screenshots'), { recursive: true });

console.log(`создан ${dir}

дальше по PLAYBOOK.md:
  1. НЕ расширять учебный phone → code → home: сначала переписать product brief и вертикальный срез
  2. заполнить referenceResearch, productCritique и pattern → screen → behavior
  3. написать только три экрана среза по UI v3 и проверить их в полном размере
  4. только после принятия среза развернуть IA, медиа, стили и состояния
  5. внести два visualPasses, поставить readiness.status=reviewed и запустить npm run proof -- ${slug}
     node scripts/build.mjs ${slug}
     node scripts/capture.mjs ${slug} --sheet
     npm run check                           # единый приёмочный цикл всех концептов`);
