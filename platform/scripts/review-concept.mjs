#!/usr/bin/env node
/** Полная приёмка одного концепта после ручных visual passes. */
import { readSpec } from './lib.mjs';
import { runScriptPipeline } from './pipeline-runner.mjs';

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

const result = runScriptPipeline(stages);
if (!result.ok) process.exitCode = result.status;
else console.log(`\n✓ ${slug}: готов к интеграции`);
