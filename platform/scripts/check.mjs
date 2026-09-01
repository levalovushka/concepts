#!/usr/bin/env node
/** Единый приёмочный цикл: всё, что должно быть зелёным перед публикацией. */
import { runScriptPipeline } from './pipeline-runner.mjs';

const stages = [
  ['Продуктовые ворота', 'pipeline-proof.mjs'],
  ['Контракт ядра', 'test-quality.mjs'],
  ['Сборка', 'build-all.mjs'],
  ['UX-спеки', 'test-ux-spec.mjs'],
  ['Лаунчер', 'test-launcher.mjs'],
  ['Структура', 'lint-concept.mjs'],
  ['Визуал', 'audit-visual.mjs'],
  ['Сетка списков', 'audit-grid.mjs'],
  ['Сценарии', 'test-flows.mjs'],
];

const result = runScriptPipeline(stages);
if (!result.ok) process.exitCode = result.status;
else console.log('\n✓ Все проверки зелёные');
