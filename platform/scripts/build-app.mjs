#!/usr/bin/env node
/**
 * Сборка приложения, написанного руками, из платформенных фактов концепта.
 *
 * Swift лежит в native-apps/<slug>/Sources и пишется человеком. Отсюда приходит
 * только то, что выводится из concept.json без потери смысла: Info.plist с
 * настоящими текстами промптов, entitlements, фоновые режимы и Xcode-проект.
 */
import { readdirSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, readSpec, validate } from './lib.mjs';
import { platformFiles, writeInfoPlist, writeEntitlements, writeProject } from './native-platform.mjs';

const APPS = join(ROOT, 'native-apps');
const RUNTIME = join(ROOT, 'native-runtime');
const OUT = join(ROOT, 'native-dist');

export function buildApp(slug) {
  const sourceDir = join(APPS, slug, 'Sources');
  if (!existsSync(sourceDir)) throw new Error(`нет исходников: ${sourceDir}`);

  const spec = readSpec(slug);
  validate(spec, slug);

  const compiled = {
    slug: spec.slug,
    name: spec.name,
    permissions: spec.permissions.map((p) => ({ key: p.key, alertText: p.alert.text })),
  };

  const outDir = join(OUT, slug);
  rmSync(outDir, { recursive: true, force: true });
  const sources = join(outDir, 'Sources');
  mkdirSync(sources, { recursive: true });
  // Общий только рантайм доступов: в нём нет ни одного дизайнерского решения.
  // Всё визуальное принадлежит концепту — концепты слишком разные.
  for (const file of readdirSync(RUNTIME)) cpSync(join(RUNTIME, file), join(sources, file));
  for (const file of readdirSync(sourceDir)) cpSync(join(sourceDir, file), join(sources, file));

  const platform = platformFiles(compiled);
  writeInfoPlist(sources, compiled, platform);
  const hasEntitlements = writeEntitlements(sources, platform);
  const files = readdirSync(sources).filter((f) => f.endsWith('.swift')).sort();
  writeProject(outDir, compiled, platform, hasEntitlements, files);

  return {
    slug,
    project: join(outDir, `${slug}.xcodeproj`),
    swiftFiles: files.length,
    runtimeFiles: readdirSync(RUNTIME).length,
    permissions: compiled.permissions.length,
    usageKeys: Object.keys(platform.usage).length,
    entitlements: Object.keys(platform.entitlements).length,
    backgroundModes: platform.backgroundModes,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const slug = process.argv[2];
  if (!slug) { console.error('использование: node scripts/build-app.mjs <slug>'); process.exit(1); }
  try { console.log(JSON.stringify(buildApp(slug), null, 2)); }
  catch (error) { console.error(`✗ ${error.message}`); process.exit(1); }
}
