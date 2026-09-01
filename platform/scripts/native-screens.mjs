#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { ROOT } from './lib.mjs';
import { runNative } from './run-app.mjs';

const APPS = join(ROOT, 'native-apps');

const configPath = (slug) => join(APPS, slug, 'app-store.json');
export const nativeAppAvailable = (slug) => existsSync(join(APPS, slug, 'Sources'));
export const nativeAppStoreAvailable = (slug) => nativeAppAvailable(slug) && existsSync(configPath(slug));

function sourceFiles(slug) {
  const sourceDir = join(APPS, slug, 'Sources');
  return [
    join(ROOT, 'concepts', slug, 'concept.json'),
    configPath(slug),
    ...readdirSync(sourceDir).filter((file) => file.endsWith('.swift')).sort().map((file) => join(sourceDir, file)),
  ];
}

export function nativeSourceHash(slug) {
  const hash = createHash('sha256');
  for (const path of sourceFiles(slug)) hash.update(path).update('\0').update(readFileSync(path));
  return hash.digest('hex');
}

const run = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${command}: ${(result.stderr || result.stdout || '').trim()}`);
  return result.stdout;
};

export async function captureNativeScreens(slug, screenIds) {
  if (!nativeAppStoreAvailable(slug)) return null;
  const config = JSON.parse(readFileSync(configPath(slug), 'utf8'));
  const missing = screenIds.filter((screen) => !config.screens?.[screen]);
  if (missing.length) throw new Error(`${slug}: SwiftUI App Store mapping не содержит экраны ${missing.join(', ')}`);

  const first = screenIds[0];
  process.env.CAMO_DEVICE = config.device || process.env.CAMO_DEVICE || 'iPhone 17 Pro';
  const built = await runNative(slug, [`-screen:${config.screens[first]}`]);
  run('xcrun', [
    'simctl', 'status_bar', built.device, 'override',
    '--time', '9:41', '--batteryState', 'discharging', '--batteryLevel', '100',
    '--wifiBars', '3', '--cellularBars', '4',
  ]);
  const outDir = join(ROOT, 'concepts', slug, 'assets', 'native-screenshots');
  mkdirSync(outDir, { recursive: true });
  const shots = {};

  for (let index = 0; index < screenIds.length; index++) {
    const screen = screenIds[index];
    if (index > 0) {
      spawnSync('xcrun', ['simctl', 'terminate', built.device, built.bundle]);
      run('xcrun', ['simctl', 'launch', built.device, built.bundle, `-screen:${config.screens[screen]}`]);
    }
    await delay(700);
    const path = join(outDir, `${screen}.png`);
    run('xcrun', ['simctl', 'io', built.device, 'screenshot', path]);
    shots[screen] = readFileSync(path);
  }

  const png = shots[screenIds[0]];
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const manifest = {
    slug,
    source: 'swiftui',
    sourceHash: nativeSourceHash(slug),
    device: built.device,
    size: { width, height },
    screens: screenIds,
    capturedAt: new Date().toISOString(),
  };
  writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return { shots, manifest };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [slug, rawScreens] = process.argv.slice(2);
  if (!slug) throw new Error('использование: node scripts/native-screens.mjs <slug> [screen,screen]');
  const config = JSON.parse(readFileSync(configPath(slug), 'utf8'));
  const screens = rawScreens?.split(',').filter(Boolean) || Object.keys(config.screens || {});
  const result = await captureNativeScreens(slug, screens);
  console.log(JSON.stringify(result?.manifest, null, 2));
}
