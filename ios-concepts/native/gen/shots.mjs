#!/usr/bin/env node
// Снимает проверенные состояния концепта в симуляторе.
// concept.json задаёт матрицу требуемых состояний, capture.json честно связывает
// только реализованные драйверы с launch-аргументами. Непокрытые состояния
// остаются в coverage report, а не подменяются кадром другого экрана.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileNativeConcept } from "../lib/compile-concept.mjs";
import { compileCaptureCatalog, selectCaptureDrivers } from "../lib/capture-catalog.mjs";
import { findIndistinguishableArtifacts, prepareShotArtifacts, shotArtifactDirectory } from "../lib/shot-artifacts.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const NATIVE = join(__dir, "..");

const slug = process.argv[2];
if (!slug) { console.error("usage: shots.mjs <slug> [screen ...]"); process.exit(1); }

const DEVICE = process.env.DEVICE || "iPhone 17 Pro";
const OUT = shotArtifactDirectory(NATIVE, slug, process.env.ARTIFACT_VARIANT || null);
const bundleId = `com.camo.${slug.replace(/[-_]/g, "")}`;

const concept = JSON.parse(readFileSync(join(NATIVE, "..", "concepts", slug, "concept.json"), "utf8"));
const compiled = compileNativeConcept(concept);
if (!compiled.ok) {
  console.error("концепт не прошёл native compiler");
  process.exit(1);
}
const captureSourcePath = join(NATIVE, "apps", slug, "capture.json");
if (!existsSync(captureSourcePath)) {
  console.error(`нет capture drivers: ${captureSourcePath}`);
  process.exit(1);
}
const captureSource = JSON.parse(readFileSync(captureSourcePath, "utf8"));
const captureCatalog = compileCaptureCatalog(compiled.manifest, captureSource);
if (!captureCatalog.ok) {
  console.error(captureCatalog.diagnostics.map(item => `${item.code}: ${item.message}`).join("\n"));
  process.exit(1);
}
let CAPTURES;
try {
  CAPTURES = selectCaptureDrivers(captureCatalog, process.argv.slice(3));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
if (!CAPTURES.length) { console.error("не из чего снимать: capture catalog пуст"); process.exit(1); }

const sh = (c, a) => execFileSync(c, a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const simctl = (...a) => { try { return sh("xcrun", ["simctl", ...a]); } catch (e) { return e.stdout || ""; } };
const simctlStrict = (...a) => sh("xcrun", ["simctl", ...a]);
const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

// Проект пересобирается из apps/<slug> ДО того, как заводится папка кадров:
// gen-project чистит build/<slug> целиком и унёс бы её с собой.
// Без этого шага xcodebuild честно собирал вчерашнюю копию исходников.
console.log("• пересобираем проект из исходников");
try {
  execFileSync(process.execPath, [join(__dir, "gen-project.mjs"), slug],
               { stdio: ["ignore", "pipe", "pipe"] });
} catch (e) {
  console.error("генерация проекта упала\n" + String(e.stdout || e));
  process.exit(1);
}

prepareShotArtifacts(OUT, CAPTURES.map(item => item.artifact));

// Кадры обязаны быть свежее исходников: иначе критик разбирает вчерашний интерфейс.
// Этот сбой уже случался — критик заявил об отсутствии фичи, которая была в коде.
const appName = slug[0].toUpperCase() + slug.slice(1);
const projDir = join(NATIVE, "build", slug);
console.log("• пересобираем перед съёмкой");
try {
  execFileSync("/usr/bin/xcodebuild", [
    "-project", join(projDir, `${appName}.xcodeproj`), "-target", appName,
    "-sdk", "iphonesimulator", "-configuration", "Debug", "build",
  ], { cwd: projDir, stdio: ["ignore", "pipe", "pipe"] });
} catch (e) {
  console.error("сборка упала — кадры снимать нечем\n" + String(e.stdout || e));
  process.exit(1);
}

const app = sh("/bin/sh", ["-c",
  `find "${projDir}" -name "*.app" -type d | head -1`]).trim();
if (!app) { console.error("сборки нет"); process.exit(1); }

// страховка: .app должен быть новее самого свежего исходника
const newestSource = Number(sh("/bin/sh", ["-c",
  `find "${join(NATIVE, "apps", slug)}" "${join(NATIVE, "DesignSystem")}" "${join(NATIVE, "Runtime")}" "${join(NATIVE, "ReferenceProfiles")}" ` +
  `-name '*.swift' -newermt '1970-01-01' -exec stat -f '%m' {} + | sort -rn | head -1`]).trim() || 0);
const appTime = Number(sh("/bin/sh", ["-c", `stat -f '%m' "${app}/Info.plist"`]).trim() || 0);
if (appTime < newestSource) {
  console.error("сборка старше исходников — кадры были бы протухшими");
  process.exit(1);
}

simctl("boot", DEVICE);
simctlStrict("bootstatus", DEVICE, "-b");
simctl("uninstall", DEVICE, bundleId);
try {
  simctlStrict("install", DEVICE, app);
} catch (error) {
  console.error("установка приложения в симулятор не прошла\n" + String(error.stderr || error));
  process.exit(1);
}

for (const capture of CAPTURES) {
  const screen = capture.launch;
  simctl("terminate", DEVICE, bundleId);
  const container = simctlStrict("get_app_container", DEVICE, bundleId, "data").trim();
  const identityPath = join(container, "Documents", "capture-identity.json");
  rmSync(identityPath, { force: true });
  sleep(250);
  let launchOutput;
  try {
    launchOutput = simctlStrict("launch", DEVICE, bundleId, "-shot", screen, "-state", capture.state);
  } catch (error) {
    console.error(`запуск ${screen} не прошёл\n` + String(error.stderr || error));
    process.exit(1);
  }
  const pid = Number(launchOutput.match(/:\s*(\d+)/)?.[1]);
  if (!pid) {
    console.error(`запуск ${screen} не вернул process id`);
    process.exit(1);
  }
  sleep(1700);
  try {
    simctlStrict("spawn", DEVICE, "launchctl", "procinfo", String(pid));
  } catch {
    console.error(`приложение завершилось до съёмки ${screen}`);
    process.exit(1);
  }
  if (!existsSync(identityPath)) {
    console.error(`приложение не подтвердило состояние ${capture.id}`);
    process.exit(1);
  }
  const identity = JSON.parse(readFileSync(identityPath, "utf8"));
  if (identity.surface !== capture.surface || identity.state !== capture.state) {
    console.error(`runtime открыл ${identity.surface}--${identity.state} вместо ${capture.id}`);
    process.exit(1);
  }
  if (capture.requiresTopSafeArea === true && !(identity.navigationChromeMinY > 0)) {
    console.error(`capture ${capture.id} потерял верхнюю safe area ` +
      `(chromeMinY=${identity.navigationChromeMinY}, contentMinY=${identity.contentMinY})`);
    process.exit(1);
  }
  simctlStrict("io", DEVICE, "screenshot", join(OUT, `${capture.artifact}.png`));
  console.log(`  ✓ ${capture.id} → ${capture.artifact}.png`);
}
simctl("terminate", DEVICE, bundleId);

const indistinguishable = findIndistinguishableArtifacts(OUT, captureCatalog.distinctGroups || []);
if (indistinguishable.length) {
  console.error("разные состояния дали одинаковый интерфейс:\n" +
    indistinguishable.map(pair => `  ${pair[0]} = ${pair[1]}`).join("\n"));
  process.exitCode = 1;
}

console.log(`\n${CAPTURES.length} кадров → ${OUT}`);
if (captureCatalog.missing.length) {
  console.error(`Не покрыто: ${captureCatalog.missing.length} app-состояний`);
  process.exitCode = 1;
}
