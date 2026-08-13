#!/usr/bin/env node
/** Единый приёмочный цикл: всё, что должно быть зелёным перед публикацией. */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const stages = [
  ['Продуктовые ворота', 'pipeline-proof.mjs'],
  ['Контракт ядра', 'test-quality.mjs'],
  ['Сборка', 'build-all.mjs'],
  ['Лаунчер', 'test-launcher.mjs'],
  ['Структура', 'lint-concept.mjs'],
  ['Визуал', 'audit-visual.mjs'],
  ['Сценарии', 'test-flows.mjs'],
];

for (const [label, script] of stages) {
  console.log(`\n━━ ${label} ━━`);
  const result = spawnSync(process.execPath, [join(ROOT, 'scripts', script)], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('\n✓ Все проверки зелёные');
