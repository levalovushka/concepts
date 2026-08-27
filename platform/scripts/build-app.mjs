#!/usr/bin/env node
/**
 * Сборка приложения, написанного руками, из платформенных фактов концепта.
 *
 * Swift лежит в native-apps/<slug>/Sources и пишется человеком. Отсюда приходит
 * только то, что выводится из concept.json без потери смысла: Info.plist с
 * настоящими текстами промптов, entitlements, фоновые режимы и Xcode-проект.
 */
import { readdirSync, mkdirSync, rmSync, cpSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, readSpec, validate } from './lib.mjs';
import { platformFiles, writeInfoPlist, writeEntitlements, writeProject } from './native-platform.mjs';

const APPS = join(ROOT, 'native-apps');
const RUNTIME = join(ROOT, 'native-runtime');
const OUT = join(ROOT, 'native-dist');

/**
 * Демо-данные концепта попадают в приложение как есть. Один источник для
 * HTML-прототипа и нативной сборки: контент, скопированный в Swift руками,
 * разъезжается с концептом на первой же правке.
 */
function writeFixtures(dir, spec) {
  const fixtures = spec.fixtures || {};
  const json = JSON.stringify(fixtures, null, 1);
  writeFileSync(join(dir, 'Fixtures.swift'),
`// Сгенерировано из fixtures в concepts/${spec.slug}/concept.json. Не править руками.
import Foundation

enum Fixtures {
    /// Секция демо-данных по имени. Падение здесь означает, что спека и
    /// модель в коде разошлись, — это должно быть видно сразу.
    static func load<T: Decodable>(_ key: String, as type: T.Type = T.self) -> T {
        let root = (try! JSONSerialization.jsonObject(with: Data(raw.utf8))) as! [String: Any]
        guard let section = root[key] else {
            fatalError("fixtures: нет секции \\(key) в concept.json")
        }
        let data = try! JSONSerialization.data(withJSONObject: section, options: [.fragmentsAllowed])
        return try! JSONDecoder().decode(T.self, from: data)
    }

    static let raw = #"""
${json}
"""#
}
`);
  return Object.keys(fixtures).length;
}

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

  const fixtureSections = writeFixtures(sources, spec);
  const platform = platformFiles(compiled);
  writeInfoPlist(sources, compiled, platform);
  const hasEntitlements = writeEntitlements(sources, platform);
  const files = readdirSync(sources).filter((f) => f.endsWith('.swift')).sort();
  writeProject(outDir, compiled, platform, hasEntitlements, files);

  return {
    slug,
    project: join(outDir, `${slug}.xcodeproj`),
    swiftFiles: files.length,
    fixtureSections,
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
