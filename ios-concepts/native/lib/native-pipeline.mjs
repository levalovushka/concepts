import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { auditReferenceProfiles } from "./reference-profile-catalog.mjs";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function command(label, executable, args, cwd = projectRoot) {
  return Object.freeze({ label, executable, args: Object.freeze(args), cwd, env: Object.freeze({}) });
}

function commandWithEnv(label, executable, args, env, cwd = projectRoot) {
  return Object.freeze({ label, executable, args: Object.freeze(args), cwd, env: Object.freeze(env) });
}

export function discoverNativeConcepts(root = projectRoot) {
  const concepts = join(root, "concepts");
  const apps = join(root, "native", "apps");
  if (!existsSync(concepts) || !existsSync(apps)) return [];
  const appSlugs = new Set(readdirSync(apps, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name));
  return readdirSync(concepts, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && appSlugs.has(entry.name) && existsSync(join(concepts, entry.name, "concept.json")))
    .map(entry => entry.name)
    .sort();
}

function testCommands(root) {
  const testRoot = join(root, "native", "test");
  const tests = readdirSync(testRoot).filter(file => file.endsWith(".test.mjs")).sort().map(file => join(testRoot, file));
  return [command("native tests", process.execPath, ["--test", ...tests], root)];
}

export function createNativePipelinePlan(operation, slug, options = {}) {
  const root = options.projectRoot || projectRoot;
  const native = join(root, "native");
  const productGate = target => command(`product maturity ${target}`, process.execPath, [join(native, "gen", "gate-product.mjs"), target], root);
  const compile = target => command(`compile ${target}`, process.execPath, [join(native, "gen", "compile-concept.mjs"), target, "--write"], root);
  const docs = target => command(`developer docs ${target}`, process.execPath, [join(native, "gen", "developer-docs.mjs"), target, "--check"], root);
  const generate = target => command(`generate ${target}`, process.execPath, [join(native, "gen", "gen-project.mjs"), target], root);
  const audit = target => command(`audit ${target}`, process.execPath, [join(native, "gen", "audit-native.mjs"), target], root);
  const build = target => {
    const name = target[0].toUpperCase() + target.slice(1);
    const directory = join(native, "build", target);
    return command(`build ${target}`, "/usr/bin/xcodebuild", ["-project", join(directory, `${name}.xcodeproj`), "-target", name, "-sdk", "iphonesimulator", "-configuration", "Debug", "build"], directory);
  };
  const capture = target => command(`capture ${target}`, process.execPath, [join(native, "gen", "shots.mjs"), target], root);
  const critic = target => command(`critic ${target}`, process.execPath, [join(native, "gen", "critic.mjs"), target], root);
  const smoke = (target, device = process.env.DEVICE || "iPhone 17 Pro") => {
    const name = target[0].toUpperCase() + target.slice(1);
    const directory = join(native, "build", target);
    return command(`xcui smoke ${target}`, "/usr/bin/xcodebuild", [
      "-project", join(directory, `${name}.xcodeproj`), "-scheme", `${name}Smoke`,
      "-destination", `platform=iOS Simulator,name=${device}`,
      "-derivedDataPath", join(directory, "SmokeDerivedData"), "test",
    ], directory);
  };

  if (operation === "profiles") return [];
  if (operation === "matrix") {
    const matrix = JSON.parse(readFileSync(join(native, "device-matrix.json"), "utf8"));
    return matrix.devices.flatMap(device => Object.entries(matrix.concepts).flatMap(([target, config]) => {
      const capture = commandWithEnv(
        `capture ${target} on ${device.id}`,
        process.execPath,
        [join(native, "gen", "shots.mjs"), target, ...config.captures],
        { DEVICE: device.name, ARTIFACT_VARIANT: device.id },
        root,
      );
      return [productGate(target), compile(target), docs(target), generate(target), audit(target), smoke(target, device.name), capture];
    }));
  }
  if (operation === "test") return testCommands(root);
  if (operation === "check-all") return [
    ...testCommands(root),
    ...discoverNativeConcepts(root).flatMap(target => [productGate(target), compile(target), docs(target), generate(target), audit(target)]),
  ];
  if (!slug) throw new Error(`${operation}: нужен slug концепта`);
  if (!discoverNativeConcepts(root).includes(slug)) throw new Error(`нет пары concepts/${slug} + native/apps/${slug}`);
  if (operation === "product-gate") return [productGate(slug)];
  if (operation === "compile") return [productGate(slug), compile(slug)];
  if (operation === "check") return [productGate(slug), compile(slug), docs(slug), generate(slug), audit(slug)];
  if (operation === "build") return [productGate(slug), compile(slug), docs(slug), generate(slug), audit(slug), build(slug)];
  if (operation === "capture") return [productGate(slug), compile(slug), docs(slug), audit(slug), capture(slug)];
  if (operation === "smoke") {
    return [productGate(slug), compile(slug), docs(slug), generate(slug), audit(slug), smoke(slug)];
  }
  if (operation === "release") return [productGate(slug), compile(slug), docs(slug), generate(slug), audit(slug), build(slug), capture(slug), critic(slug)];
  throw new Error(`неизвестная операция: ${operation}`);
}

export function runNativePipeline({ operation, slug, adapter, root = projectRoot }) {
  if (operation === "profiles") {
    const profiles = auditReferenceProfiles();
    return { ok: profiles.every(profile => profile.ready), profiles, steps: [] };
  }
  const steps = createNativePipelinePlan(operation, slug, { projectRoot: root });
  const runner = adapter || { run(step) { execFileSync(step.executable, step.args, { cwd: step.cwd, stdio: "inherit", env: { ...process.env, ...step.env } }); } };
  for (const step of steps) runner.run(step);
  if (!adapter) {
    const receiptDirectory = join(root, "native", "artifacts", "receipts");
    mkdirSync(receiptDirectory, { recursive: true });
    const id = slug ? `${operation}-${slug}` : operation;
    writeFileSync(join(receiptDirectory, `${id}.json`), JSON.stringify({
      schemaVersion: 1,
      operation,
      slug: slug || null,
      completedAt: new Date().toISOString(),
      steps: steps.map(step => ({ label: step.label, executable: step.executable, args: step.args, env: step.env })),
    }, null, 2) + "\n");
  }
  return { ok: true, steps };
}

export const NATIVE_PROJECT_ROOT = projectRoot;
