#!/usr/bin/env node
// Native capability gate. It verifies the compiled manifest and generated build
// artifacts; source-code names alone are never proof that an iOS capability exists.

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileNativeConcept } from "../lib/compile-concept.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const nativeRoot = join(here, "..");
const projectRoot = join(nativeRoot, "..");
const slug = process.argv[2];
if (!slug) {
  console.error("usage: audit-permissions.mjs <slug>");
  process.exit(1);
}

const conceptPath = join(projectRoot, "concepts", slug, "concept.json");
const blueprintPath = join(nativeRoot, "ProductBlueprints", `${slug}-vk.json`);
const specPath = existsSync(conceptPath) ? conceptPath : blueprintPath;
if (!existsSync(specPath)) { console.error(`missing concept or Product Blueprint for ${slug}`); process.exit(1); }
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const compiled = compileNativeConcept(spec);
const problems = compiled.diagnostics
  .filter(item => item.severity === "error")
  .map(item => `✗ spec ${item.code}: ${item.message}`);
const manifest = compiled.manifest;

const appDir = join(nativeRoot, "apps", slug);
function swiftSources(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return swiftSources(path);
    return entry.name.endsWith(".swift") ? [readFileSync(path, "utf8")] : [];
  });
}
const appSources = swiftSources(appDir).join("\n");
const manifestAdapterSource = appSources.includes("ManifestConceptRootView")
  ? readFileSync(join(nativeRoot, "DesignSystem", "ManifestConcept.swift"), "utf8")
  : "";
const contractSurfacePath = join(nativeRoot, "DesignSystem", "NativeContractSurface.swift");
const contractSurfaceSource = appSources.includes("NativeCapabilityControls") && existsSync(contractSurfacePath)
  ? readFileSync(contractSurfacePath, "utf8") : "";
const permissionAdapterSource = manifestAdapterSource + "\n" + contractSurfaceSource;
const genericPermissionBinding = permissionAdapterSource.includes("ForEach(surfacePermissions)")
  && permissionAdapterSource.includes("permissions.request(PermissionKey(rawValue: permission.key))")
  && permissionAdapterSource.includes("NativeConceptSpec.permissions.filter { $0.screen == surfaceID }");
const runtimeSource = readFileSync(join(nativeRoot, "Runtime", "Permissions.swift"), "utf8");
const lifecycleSource = readFileSync(join(nativeRoot, "Runtime", "AppLifecycle.swift"), "utf8");
const buildDir = join(nativeRoot, "build", slug);
const appName = slug[0].toUpperCase() + slug.slice(1);

function readPlist(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(execFileSync("plutil", ["-convert", "json", "-o", "-", path], { encoding: "utf8" }));
}

function stable(value) {
  if (Array.isArray(value)) return [...value].map(stable).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stable(item)]));
  }
  return value;
}

function expectedPlist() {
  const entries = Object.fromEntries(manifest.capabilities.info.map(item => [item.key, item.value]));
  if (manifest.capabilities.backgroundModes.length) entries.UIBackgroundModes = manifest.capabilities.backgroundModes;
  return entries;
}

function expectedEntitlements() {
  return Object.fromEntries(manifest.capabilities.entitlements.map(item => [item.key, item.value]));
}

const builtInfo = readPlist(join(buildDir, "Info.plist"));
const builtEntitlements = readPlist(join(buildDir, `${appName}.entitlements`));
const projectSource = existsSync(join(buildDir, `${appName}.xcodeproj`, "project.pbxproj"))
  ? readFileSync(join(buildDir, `${appName}.xcodeproj`, "project.pbxproj"), "utf8")
  : "";
const directGesturePatterns = {
  applesignin: /SignInWithAppleButton\s*\(/g,
};
const lifecyclePatterns = {
  remotenotif: /didReceiveRemoteNotification[\s\S]*fetchCompletionHandler/,
  fetch: /performFetchWithCompletionHandler/,
  bgtask: /BGTaskScheduler\.shared\.register[\s\S]*BGAppRefreshTask/,
};
if (!builtInfo) problems.push("✗ generated Info.plist is missing; run gen-project first");
else if (JSON.stringify(stable(builtInfo)) !== JSON.stringify(stable(expectedPlist()))) {
  problems.push("✗ generated Info.plist does not equal the native manifest");
}
if (!builtEntitlements) problems.push("✗ generated entitlements are missing; run gen-project first");
else if (JSON.stringify(stable(builtEntitlements)) !== JSON.stringify(stable(expectedEntitlements()))) {
  problems.push("✗ generated entitlements do not equal the native manifest");
}

for (const permission of manifest.permissions) {
  if (permission.activation === "app-lifecycle") {
    const pattern = lifecyclePatterns[permission.key];
    if (!pattern || !pattern.test(lifecycleSource)) {
      problems.push(`✗ ${permission.key}: capability is declared but its app-lifecycle handler is missing`);
    }
    continue;
  }
  if (permission.activation === "build-artifact") continue;
  const requestPattern = new RegExp(`request\\(\\.${permission.key}(?:\\s*,|\\s*\\))`, "g");
  const requestHits = (appSources.match(requestPattern) || []).length;
  const genericHelperHits = appSources.includes("permissions.request(key")
    ? (appSources.match(new RegExp(`(?:key:\\s*|run\\()\\.${permission.key}(?:\\s*,|\\s*\\))`, "g")) || []).length
    : 0;
  const directPattern = directGesturePatterns[permission.key];
  const directHits = directPattern ? (appSources.match(directPattern) || []).length : 0;
  const hits = genericPermissionBinding ? 1 : requestHits + genericHelperHits + directHits;
  if (hits === 0) {
    problems.push(`✗ ${permission.key}: no product gesture calls the capability adapter`);
  }
  if (hits > 1) problems.push(`✗ ${permission.key}: ${hits} request points; expected exactly one`);

  // Calling request() is valid only when Runtime has an explicit adapter. Falling
  // through a generic branch is not an implementation.
  if ((requestHits > 0 || genericPermissionBinding) && !new RegExp(`case\\s+[^\\n]*"${permission.key}"`).test(runtimeSource)) {
    problems.push(`✗ ${permission.key}: request exists but Runtime has no explicit adapter`);
  }
}

for (const extension of manifest.capabilities.extensions) {
  const targetDir = join(buildDir, "Extensions", extension.id);
  const productName = `${appName}${extension.productSuffix}`;
  if (!existsSync(targetDir)) {
    problems.push(`✗ ${extension.id}: required extension target was not generated`);
    continue;
  }
  const extensionInfo = readPlist(join(targetDir, "Info.plist"));
  if (extensionInfo?.NSExtension?.NSExtensionPointIdentifier !== extension.extensionPoint) {
    problems.push(`✗ ${extension.id}: generated Info.plist has the wrong extension point`);
  }
  if (!existsSync(join(targetDir, extension.sourceFile))) {
    problems.push(`✗ ${extension.id}: generated extension has no implementation source`);
  }
  if (!projectSource.includes(`name = ${productName}`)
      || !projectSource.includes('productType = "com.apple.product-type.app-extension"')) {
    problems.push(`✗ ${extension.id}: Xcode app-extension target is missing`);
  }
  if (!projectSource.includes(`${productName}.appex in Embed Foundation Extensions`)) {
    problems.push(`✗ ${extension.id}: extension is not embedded in the main application`);
  }
}

console.log(`Native capabilities for “${spec.name}”\n`);
console.log(`  Info.plist keys: ${manifest.capabilities.info.length}`);
console.log(`  Entitlements: ${manifest.capabilities.entitlements.length}`);
console.log(`  Background modes: ${manifest.capabilities.backgroundModes.length}`);
console.log(`  Extension targets: ${manifest.capabilities.extensionTargets.length}`);
console.log(`  Runtime adapters: ${manifest.capabilities.runtimeAdapters.length}`);

if (problems.length) {
  console.log("\nBlockers:\n");
  for (const problem of problems) console.log("  " + problem);
  console.log(`\nBLOCKERS: ${problems.length}`);
  process.exit(1);
}

console.log("\nCapability manifest, build artifacts, product gestures, and adapters agree.");
