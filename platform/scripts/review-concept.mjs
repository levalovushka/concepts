#!/usr/bin/env node
/** Полная приёмка одного концепта после ручных visual passes. */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, readSpec } from './lib.mjs';

const [slug] = process.argv.slice(2);
if (!slug) {
  console.error('использование: npm run review -- <slug>');
  process.exit(1);
}
readSpec(slug);

const stages = [
  ['Readiness', 'pipeline-proof.mjs', [slug]],
  ['Сборка', 'build.mjs', [slug]],
  ['Скриншоты', 'capture.mjs', [slug]],
  ['Структура и anti-slop', 'lint-concept.mjs', [slug]],
  ['Геометрия и навигация', 'audit-visual.mjs', [slug]],
  ['Интерактивные сценарии', 'test-flows.mjs', [slug]],
];

for (const [label, script, args] of stages) {
  console.log(`\n━━ ${label} ━━`);
  const result = spawnSync(process.execPath, [join(ROOT, 'scripts', script), ...args], { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(`\n✓ ${slug}: готов к интеграции`);
