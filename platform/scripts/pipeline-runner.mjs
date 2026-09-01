import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, SCRIPTS } from './paths.mjs';

export function runScriptStage(script, args = [], { stdio = 'pipe' } = {}) {
  const capture = stdio !== 'inherit';
  const result = spawnSync(process.execPath, [join(SCRIPTS, script), ...args], {
    cwd: ROOT,
    stdio,
    ...(capture ? { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 } : {}),
  });
  return {
    script,
    ok: result.status === 0,
    status: result.status ?? 1,
    output: capture ? `${result.stdout || ''}${result.stderr || ''}`.trim() : '',
  };
}

export function runScriptPipeline(stages) {
  for (const [label, script, args = []] of stages) {
    console.log(`\n━━ ${label} ━━`);
    const result = runScriptStage(script, args, { stdio: 'inherit' });
    if (!result.ok) return result;
  }
  return { ok: true, status: 0, script: null, output: '' };
}
