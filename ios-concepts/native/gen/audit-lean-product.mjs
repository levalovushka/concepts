#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileProductBlueprint } from "../lib/lean-native-factory.mjs";
import { auditLeanProduct } from "../lib/lean-product-audit.mjs";

const nativeRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2];
if (!slug) { console.error("usage: audit-lean-product.mjs <slug>"); process.exit(1); }
const blueprintPath = join(nativeRoot, "ProductBlueprints", `${slug}-vk.json`);
const appDirectory = join(nativeRoot, "apps", slug);
if (!existsSync(blueprintPath) || !existsSync(appDirectory)) { console.error(`missing Product Blueprint or app for ${slug}`); process.exit(1); }

function sources(directory, includeUITests) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "UITests" && !includeUITests) return [];
      return sources(path, includeUITests);
    }
    return entry.name.endsWith(".swift") ? [readFileSync(path, "utf8")] : [];
  }).join("\n");
}

const blueprint = JSON.parse(readFileSync(blueprintPath, "utf8"));
const compiled = compileProductBlueprint(blueprint);
if (!compiled.ok) { for (const item of compiled.diagnostics) console.log(`✗ ${item.message}`); process.exit(1); }
const swiftSource = sources(appDirectory, false);
const uiTestDirectory = join(appDirectory, "UITests");
const uiTestSource = existsSync(uiTestDirectory) ? sources(uiTestDirectory, true) : "";
const runtimeSource = ["Permissions.swift", "AppLifecycle.swift"].map(file => readFileSync(join(nativeRoot, "Runtime", file), "utf8")).join("\n");
const problems = auditLeanProduct({ blueprint, manifest: compiled.manifest, swiftSource, runtimeSource, uiTestSource });
if (problems.length) {
  for (const problem of problems) console.log(`  ✗ ${problem}`);
  console.log(`\nBLOCKERS: ${problems.length}`);
  process.exit(1);
}
console.log(`✓ ${slug}: product actions and all capability outcomes are executable and tested`);
