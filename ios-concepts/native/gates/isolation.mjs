#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { createNativePipelinePlan, discoverNativeConcepts } from "../lib/native-pipeline.mjs";
import { assertPathInside, isPathInside, NATIVE_PROJECT_ROOT } from "../lib/project-paths.mjs";

const REQUIRED_SCRIPTS = ["test", "check", "check:all", "build", "capture", "release", "launcher"];
const NORMAL_ENTRYPOINTS = [
  "native/cli.mjs",
  "native/product-cli.mjs",
  "native/gen/developer-docs.mjs",
  "native/gen/critic.mjs",
  "native/gen/shots.mjs",
  "native/gen/pipeline.mjs",
  "native/gen/scaffold-app.mjs",
  "native/gates/check-all.mjs",
  "launcher/gen/gen-launcher.mjs",
];
const CANONICAL_AREAS = ["docs", "concepts", "native/artifacts/receipts"];

function fail(message) {
  throw new Error(`isolation gate: ${message}`);
}

function walk(root, predicate = () => true) {
  if (!existsSync(root)) return [];
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (!predicate(path, entry)) continue;
    if (entry.isDirectory()) files.push(...walk(path, predicate));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

function verifyPackageInterface(root) {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  for (const name of REQUIRED_SCRIPTS) {
    const script = pkg.scripts?.[name];
    if (!script) fail(`package command is missing: ${name}`);
    for (const token of script.split(/\s+/).filter(item => item.endsWith(".mjs"))) {
      const target = assertPathInside(root, resolve(root, token), `package command ${name}`);
      if (!existsSync(target)) fail(`package command ${name} does not resolve: ${token}`);
    }
  }
}

function verifyPipelinePaths(root) {
  const concepts = discoverNativeConcepts(root);
  const plans = [
    createNativePipelinePlan("test", null, { projectRoot: root }),
    createNativePipelinePlan("check-all", null, { projectRoot: root }),
    ...concepts.flatMap(slug => ["check", "build", "capture", "release"].map(operation =>
      createNativePipelinePlan(operation, slug, { projectRoot: root }))),
  ];
  for (const step of plans.flat()) {
    if (!isPathInside(root, step.cwd)) fail(`${step.label} cwd escapes project root: ${step.cwd}`);
    for (const arg of step.args) {
      if (isAbsolute(arg) && !isPathInside(root, arg)) fail(`${step.label} argument escapes project root: ${arg}`);
    }
  }
  for (const path of [join(root, "native", "build"), join(root, "native", "artifacts"), join(root, "launcher", "build")]) {
    assertPathInside(root, path, "generated output");
  }
}

function importSpecifiers(source) {
  const values = [];
  const pattern = /(?:from\s*|import\s*)["']([^"']+)["']/g;
  for (const match of source.matchAll(pattern)) values.push(match[1]);
  return values;
}

function resolveModule(from, specifier) {
  if (!specifier.startsWith(".")) return null;
  const path = resolve(dirname(from), specifier);
  return existsSync(path) ? path : existsSync(`${path}.mjs`) ? `${path}.mjs` : null;
}

function verifyNormalImportGraph(root) {
  const tests = walk(join(root, "native", "test")).filter(path => path.endsWith(".test.mjs"));
  const generators = walk(join(root, "native", "gen")).filter(path => path.endsWith(".mjs"));
  const pending = [...NORMAL_ENTRYPOINTS.map(path => join(root, path)), ...generators, ...tests];
  const visited = new Set();
  while (pending.length) {
    const file = pending.pop();
    if (visited.has(file)) continue;
    visited.add(file);
    if (!existsSync(file)) fail(`normal entrypoint is missing: ${relative(root, file)}`);
    const source = readFileSync(file, "utf8");
    if (/(?:\.\.\/)+platform(?:\/|["'])/.test(source)) {
      fail(`normal module contains a platform path dependency: ${relative(root, file)}`);
    }
    for (const specifier of importSpecifiers(source)) {
      if (/(^|\/)platform(\/|$)/.test(specifier)) fail(`normal module imports platform: ${relative(root, file)} -> ${specifier}`);
      const dependency = resolveModule(file, specifier);
      if (!dependency) continue;
      if (!isPathInside(root, dependency)) fail(`normal import escapes project root: ${relative(root, file)} -> ${specifier}`);
      if (relative(root, dependency).split(sep).includes("legacy-adapter")) {
        fail(`normal import reaches optional legacy adapter: ${relative(root, file)} -> ${specifier}`);
      }
      pending.push(dependency);
    }
  }
}

function verifyCanonicalPaths(root) {
  for (const area of CANONICAL_AREAS) {
    for (const file of walk(join(root, area))) {
      if (!/\.(?:json|md|txt|mjs)$/.test(file)) continue;
      const source = readFileSync(file, "utf8");
      if (/\/Users\//.test(source)) fail(`tracked canonical file contains /Users path: ${relative(root, file)}`);
    }
  }
}

function shouldCopy(source) {
  const offset = relative(NATIVE_PROJECT_ROOT, source).split(sep).join("/");
  if (!offset) return true;
  return ![
    "native/build", "native/artifacts", "launcher/build", "DerivedData", ".DS_Store",
  ].some(path => offset === path || offset.startsWith(`${path}/`));
}

function verifyStandaloneCopy() {
  const temporary = mkdtempSync(join(tmpdir(), "ios-concepts-isolation-"));
  const copyRoot = join(temporary, "ios-concepts");
  try {
    cpSync(NATIVE_PROJECT_ROOT, copyRoot, { recursive: true, filter: shouldCopy });
    if (existsSync(join(dirname(copyRoot), "platform"))) fail("standalone fixture unexpectedly contains platform/");
    execFileSync("npm", ["test"], { cwd: copyRoot, stdio: "inherit", env: process.env });
    execFileSync("npm", ["run", "check:all"], {
      cwd: copyRoot,
      stdio: "inherit",
      env: { ...process.env, IOS_CONCEPTS_ISOLATION_CHILD: "1" },
    });
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

verifyPackageInterface(NATIVE_PROJECT_ROOT);
verifyPipelinePaths(NATIVE_PROJECT_ROOT);
verifyNormalImportGraph(NATIVE_PROJECT_ROOT);
verifyCanonicalPaths(NATIVE_PROJECT_ROOT);
verifyStandaloneCopy();
console.log("✓ isolation gate: command, output, import, canonical-path, and standalone-copy contracts pass");
