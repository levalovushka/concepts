#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileNativeConcept } from "../lib/compile-concept.mjs";
import { compileCaptureCatalog } from "../lib/capture-catalog.mjs";
import { compileCaptureSurfaceOwnership } from "../lib/capture-surface-ownership.mjs";

const nativeRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const projectRoot = join(nativeRoot, "..");
const slug = process.argv[2];
if (!slug) { console.error("usage: audit-captures.mjs <slug>"); process.exit(1); }
const concept = JSON.parse(readFileSync(join(projectRoot, "concepts", slug, "concept.json"), "utf8"));
const capturePath = join(nativeRoot, "apps", slug, "capture.json");
if (!existsSync(capturePath)) { console.error(`нет capture catalog: ${capturePath}`); process.exit(1); }
const manifest = compileNativeConcept(concept).manifest;
const catalog = compileCaptureCatalog(manifest, JSON.parse(readFileSync(capturePath, "utf8")));
for (const item of catalog.diagnostics) console.error(`✗ ${item.code}: ${item.message}`);
if (catalog.missing.length) {
  console.error(`✗ не покрыто screenshot states: ${catalog.missing.map(item => item.id).join(", ")}`);
}
if (!catalog.ok || catalog.missing.length) process.exit(1);

// A migrated app-owned surface must be driven through the real screen state
// seam. Registering it here makes returning to a synthetic capture view a
// build-breaking regression.
const productStatePath = join(nativeRoot, "apps", slug, "product-state-surfaces.json");
if (existsSync(productStatePath)) {
  const registry = JSON.parse(readFileSync(productStatePath, "utf8"));
  const ownership = compileCaptureSurfaceOwnership(catalog, registry);
  const captureStatePath = join(nativeRoot, "apps", slug, "CaptureStates.swift");
  const captureStateSource = existsSync(captureStatePath) ? readFileSync(captureStatePath, "utf8") : "";
  const appSource = readFileSync(join(nativeRoot, "apps", slug, "App.swift"), "utf8");
  const secondaryPath = join(nativeRoot, "DesignSystem", "NativeContractSurface.swift");
  const secondarySource = appSource.includes("NativeSecondarySurface") && existsSync(secondaryPath)
    ? readFileSync(secondaryPath, "utf8") : "";
  const manifestAdapterSource = appSource.includes("ManifestConceptRootView")
    ? readFileSync(join(nativeRoot, "DesignSystem", "ManifestConcept.swift"), "utf8")
    : "";
  const genericProductState = manifestAdapterSource.includes("productState(for: surfaceID)")
    && manifestAdapterSource.includes("ManifestCaptureMode.productState");
  const violations = [...ownership.diagnostics];
  const coreSurfaces = new Set(concept.native?.deliveryIdentity?.coreSurfaces || []);
  for (const surface of ownership.product) {
    const escaped = surface.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`"${escaped}\\.[^"]+"\\s*:`).test(captureStateSource)) {
      violations.push(`${surface}: снова объявлен synthetic capture presentation`);
    }
    const ownedCoreState = appSource.includes(`productState(for: "${surface}")`);
    const ownedSecondaryState = !coreSurfaces.has(surface)
      && secondarySource.includes("NativeProductCaptureState.productState(for: surfaceID)");
    if (!genericProductState && !ownedCoreState && !ownedSecondaryState) {
      violations.push(`${surface}: реальный экран не получает product state`);
    }
  }
  if (violations.length) {
    for (const violation of violations) console.error(`✗ ${violation}`);
    process.exit(1);
  }
  if (ownership.pendingProduct.length) {
    console.log(`  → pending real-screen migrations: ${ownership.pendingProduct.join(", ")}`);
  }
}
console.log(`Снимки «${slug}»: ${catalog.drivers.length} состояний, ${catalog.distinctGroups.length} групп обязаны визуально различаться.`);
