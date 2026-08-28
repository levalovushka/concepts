#!/usr/bin/env node
/** Собрать концепт, поставить в симулятор и запустить. Аргументы после слага уходят в приложение. */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './lib.mjs';
import { buildApp } from './build-app.mjs';

const DEVICE = process.env.CAMO_DEVICE || 'iPhone 17 Pro';

const run = (cmd, args, cwd) => {
  const result = spawnSync(cmd, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.slice(0, 3).join(' ')}\n${(result.stderr || result.stdout || '').split('\n').filter((l) => /error|Error/.test(l)).slice(0, 12).join('\n')}`);
  }
  return result.stdout;
};

export async function runNative(slug, appArgs = []) {
  const built = buildApp(slug);
  const dir = join(ROOT, 'native-dist', slug);

  run('xcodebuild', ['-project', `${slug}.xcodeproj`, '-scheme', slug, '-sdk', 'iphonesimulator',
    '-destination', 'generic/platform=iOS Simulator', '-derivedDataPath', 'build',
    'CODE_SIGNING_ALLOWED=NO', 'build'], dir);

  const products = join(dir, 'build', 'Build', 'Products', 'Debug-iphonesimulator');
  const { readdirSync } = await import('node:fs');
  const app = readdirSync(products).find((f) => f.endsWith('.app'));
  const bundle = `app.camo.${slug}`;

  spawnSync('xcrun', ['simctl', 'boot', DEVICE]); // уже загруженный симулятор возвращает ошибку — это не сбой
  run('xcrun', ['simctl', 'install', DEVICE, join(products, app)], dir);
  run('xcrun', ['simctl', 'launch', DEVICE, bundle, ...appArgs], dir);

  return { ...built, app: join(products, app), bundle, device: DEVICE };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [slug, ...appArgs] = process.argv.slice(2);
  if (!slug) {
    console.error('использование: node scripts/run-native.mjs <slug> [-grant:key,key] [-deny:key]');
    process.exit(1);
  }
  try {
    console.log(JSON.stringify(await runNative(slug, appArgs), null, 2));
  } catch (error) {
    console.error(`✗ ${error.message}`);
    process.exit(1);
  }
}
