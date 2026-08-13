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

const [slug, name, targetSet, requestedMode = 'differentiation'] = process.argv.slice(2);
if (!slug || !name) {
  console.error('использование: node scripts/new-concept.mjs <slug> "<Название>" <целевой-набор> [mimicry|differentiation]');
  console.error('существующие концепты:', listConcepts().join(', ') || '—');
  process.exit(1);
}
if (!/^[a-z][a-z0-9-]*$/.test(slug)) { console.error('slug: только строчные латинские, цифры и дефис'); process.exit(1); }
if (!POSITIONING_MODES[requestedMode]) { console.error(`неизвестная стратегия: ${requestedMode}`); process.exit(1); }
if (requestedMode === 'mimicry' && !TARGET_PRODUCTS[targetSet]) { console.error(`для мимикрии неизвестен продукт-референс: ${targetSet}`); process.exit(1); }

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
    .replaceAll('__APP_STORE_CATEGORY__', requestedMode === 'mimicry' ? TARGET_PRODUCTS[targetSet].category : 'Utilities');
  writeFileSync(f, s);
}
mkdirSync(join(dir, 'assets', 'media'), { recursive: true });
mkdirSync(join(dir, 'assets', 'screenshots'), { recursive: true });

console.log(`создан ${dir}

дальше по PLAYBOOK.md:
  1. заполнить concept.json  — продуктовый, позиционный и UI-контракты, доступы, экраны, вкладки, бренд (фазы 0–5)
  2. написать screens/*.html — по файлу на экран
  3. media.mjs, styles.css, sections.html, docs/
  4. node scripts/build.mjs ${slug}
     node scripts/capture.mjs ${slug} --sheet
     npm run check                           # единый приёмочный цикл всех концептов`);
