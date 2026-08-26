import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { compileCaptureCatalog } from "./capture-catalog.mjs";
import { compileProductBlueprint } from "./native-blueprint-compiler.mjs";
import { writeLeanDeveloperDocumentation } from "./lean-developer-documentation.mjs";
import { compileLeanProductUIContract, verifyLeanProductUIContract } from "./lean-product-ui-contract.mjs";
import { compileNativeFullBlueprintV2, compileNativeKernelV2 } from "./native-kernel-v2.mjs";
import { shotArtifactDirectory } from "./shot-artifacts.mjs";

const OWNER_SCHEMA_VERSION = 1;
const SIMULATOR = "iPhone 17 Pro";

function json(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function safeSwiftPath(directory, relative, label) {
  if (typeof relative !== "string" || !/^[A-Za-z0-9_/-]+\.swift$/.test(relative) || relative.includes("..")) {
    throw new Error(`${label} has unsafe path ${relative}`);
  }
  const path = resolve(directory, relative);
  if (!path.startsWith(`${resolve(directory)}/`)) throw new Error(`${label} escapes ${directory}`);
  return path;
}

function assertOwnedOrEmpty(appDirectory, slug) {
  if (!existsSync(appDirectory)) return;
  const marker = join(appDirectory, ".camo-native-pipeline.json");
  if (!existsSync(marker)) throw new Error(`Refusing to overwrite existing app ${slug}: it is not owned by Camo Native Pipeline`);
  const owner = JSON.parse(readFileSync(marker, "utf8"));
  if (owner.schemaVersion !== OWNER_SCHEMA_VERSION || owner.slug !== slug) {
    throw new Error(`Refusing to overwrite app ${slug}: ownership marker does not match`);
  }
}

export function materializeNativeConcept({
  projectRoot,
  productCore,
  capabilityPlan,
  fullContract,
  targetProduct = "vkontakte",
  strategy = "mimicry",
}) {
  const root = resolve(projectRoot);
  const nativeRoot = join(root, "native");
  const blueprint = compileNativeFullBlueprintV2({
    productCoreArtifact: productCore, capabilityPlan, fullContract, targetProduct, strategy,
  });
  const compiled = compileProductBlueprint(blueprint, { bundleId: `com.camo.${blueprint.id.replace(/[-_]/g, "")}` });
  if (!compiled.ok) throw new Error(compiled.diagnostics.map(item => `${item.code}: ${item.message}`).join("\n"));
  const kernel = compileNativeKernelV2({ productCoreArtifact: productCore, capabilityPlan, sliceContract: fullContract });
  const capture = compileCaptureCatalog(compiled.manifest, kernel.captureCatalog);
  if (!capture.ok || capture.missing.length) throw new Error([
    ...capture.diagnostics.map(item => `${item.code}: ${item.message}`),
    ...capture.missing.map(item => `capture.missing: ${item.id}`),
  ].join("\n"));

  const appDirectory = join(nativeRoot, "apps", blueprint.id);
  assertOwnedOrEmpty(appDirectory, blueprint.id);
  rmSync(appDirectory, { recursive: true, force: true });
  mkdirSync(join(appDirectory, "UITests"), { recursive: true });
  for (const file of kernel.files) {
    const path = safeSwiftPath(appDirectory, file.path, "Native Kernel app source");
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, file.contents);
  }
  for (const file of kernel.uiTestFiles) {
    const path = safeSwiftPath(join(appDirectory, "UITests"), file.path, "Native Kernel UI test source");
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, file.contents);
  }
  json(join(appDirectory, "capture.json"), kernel.captureCatalog);
  json(join(appDirectory, "product-state-surfaces.json"), {
    product: fullContract.surfaces.map(surface => surface.id), pendingProduct: [], system: ["login"], extensionSurface: [],
  });
  json(join(appDirectory, ".camo-native-pipeline.json"), {
    schemaVersion: OWNER_SCHEMA_VERSION, slug: blueprint.id, sourceHash: kernel.receipt.sourceHash,
  });
  const blueprintPath = join(nativeRoot, "ProductBlueprints", `${blueprint.id}-vk.json`);
  json(blueprintPath, blueprint);
  const uiContract = compileLeanProductUIContract(blueprint, compiled.manifest);
  const uiVerification = verifyLeanProductUIContract(uiContract, blueprint);
  if (!uiVerification.passed) throw new Error(uiVerification.problems.join("\n"));
  const uiContractPath = join(nativeRoot, "ProductUIContracts", `${blueprint.id}.json`);
  json(uiContractPath, uiContract);
  const documentationReceipt = writeLeanDeveloperDocumentation({ projectRoot: root, blueprint, manifest: compiled.manifest });
  return Object.freeze({
    slug: blueprint.id, blueprint, manifest: compiled.manifest, kernel, captureCatalog: capture,
    paths: Object.freeze({ appDirectory, blueprintPath, uiContractPath }), documentationReceipt,
  });
}

function command(commandName, args, { cwd, env = {} }) {
  try {
    return execFileSync(commandName, args, {
      cwd, env: { ...process.env, ...env }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const detail = [error.stderr, error.stdout, error.message].filter(Boolean).map(String).join("\n").trim();
    throw new Error(`${commandName} ${args.join(" ")} failed\n${detail}`);
  }
}

export function executeNativeConcept({ projectRoot, materialized, simulator = SIMULATOR }) {
  const root = resolve(projectRoot);
  const nativeRoot = join(root, "native");
  const { slug, manifest, captureCatalog, documentationReceipt } = materialized;
  const appName = `${slug[0].toUpperCase()}${slug.slice(1)}`;
  const buildRoot = join(nativeRoot, "build", slug);
  const derivedData = join(nativeRoot, "artifacts", slug, "DerivedData");
  command(process.execPath, [join(nativeRoot, "gen", "gen-project.mjs"), slug], { cwd: root });
  for (const gate of ["audit-actions.mjs", "audit-ui.mjs", "audit-permissions.mjs", "audit-interface-anatomy.mjs", "audit-lean-product.mjs"]) {
    command(process.execPath, [join(nativeRoot, "gen", gate), slug], { cwd: root });
  }
  const project = join(buildRoot, `${appName}.xcodeproj`);
  command("/usr/bin/xcodebuild", [
    "-quiet", "-project", project, "-target", appName, "-sdk", "iphonesimulator",
    "-configuration", "Debug", "CODE_SIGNING_ALLOWED=NO", "build",
  ], { cwd: buildRoot });
  command("/usr/bin/xcodebuild", [
    "-quiet", "-project", project, "-scheme", `${appName}Smoke`,
    "-destination", `platform=iOS Simulator,name=${simulator}`, "-derivedDataPath", derivedData, "test",
  ], { cwd: buildRoot });

  const requested = captureCatalog.drivers
    .filter(item => materialized.kernel.captureCatalog.scope === "full-expansion" || item.state === "populated/default")
    .map(item => item.id);
  const appPath = join(derivedData, "Build", "Products", "Debug-iphonesimulator", `${appName}.app`);
  command(process.execPath, [join(nativeRoot, "gen", "shots.mjs"), slug, ...requested, "--reuse-build"], {
    cwd: root, env: { DEVICE: simulator, APP_PATH: appPath },
  });
  const artifactDirectory = shotArtifactDirectory(nativeRoot, slug);
  const driverById = new Map(captureCatalog.drivers.map(item => [item.id, item]));
  const captures = requested.map(id => {
    const driver = driverById.get(id);
    const path = join(artifactDirectory, `${driver.artifact}.png`);
    if (!existsSync(path) || statSync(path).size < 10_000) throw new Error(`Capture ${id} is missing or too small`);
    return Object.freeze({ id, surface: driver.surface, state: driver.state, path, sha256: sha256(path) });
  });
  const testNames = materialized.kernel.uiTestFiles.flatMap(file => [
    ...file.contents.matchAll(/func\s+(test[A-Za-z0-9_]+)\s*\(/g),
  ].map(match => match[1]));
  return Object.freeze({
    buildReceipt: Object.freeze({ passed: true, projectPath: project, sourceHash: sha256(join(buildRoot, "native-manifest.json")) }),
    interactionReceipt: Object.freeze({ passed: true, testNames, simulator }),
    documentationReceipt,
    captures: Object.freeze(captures),
  });
}
