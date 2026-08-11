#!/usr/bin/env node
/**
 * Скаффолд нового концепта из _template.
 *
 *   node scripts/new-concept.mjs muzloop "Музлуп" vk-music
 *
 * Дальше: заполнить concept.json по PLAYBOOK.md (фазы 0–5), написать экраны,
 * медиа и доки, затем build → capture → test → lint (фазы 7–10).
 */
import { cpSync, existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { CONCEPTS, conceptDir, listConcepts } from './lib.mjs';

const [slug, name, targetSet] = process.argv.slice(2);
if (!slug || !name) {
  console.error('использование: node scripts/new-concept.mjs <slug> "<Название>" [целевой-набор]');
  console.error('существующие концепты:', listConcepts().join(', ') || '—');
  process.exit(1);
}
if (!/^[a-z][a-z0-9-]*$/.test(slug)) { console.error('slug: только строчные латинские, цифры и дефис'); process.exit(1); }

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
    .replaceAll('__TARGET_SET__', targetSet || 'не задан');
  writeFileSync(f, s);
}
mkdirSync(join(dir, 'assets', 'media'), { recursive: true });
mkdirSync(join(dir, 'assets', 'screenshots'), { recursive: true });

console.log(`создан ${dir}

дальше по PLAYBOOK.md:
  1. заполнить concept.json  — доступы, экраны, вкладки, бренд (фазы 0–5)
  2. написать screens/*.html — по файлу на экран
  3. media.mjs, styles.css, sections.html, docs/
  4. node scripts/build.mjs ${slug}
     node scripts/capture.mjs ${slug} --sheet
     node scripts/build.mjs ${slug}          # ещё раз: свежие скриншоты нужны в dist
     node scripts/test-flows.mjs ${slug}
     node scripts/lint-concept.mjs ${slug}`);
