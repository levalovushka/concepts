#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileProductBlueprint } from "../lib/native-blueprint-compiler.mjs";
import { auditActionBindings } from "../lib/action-binding-audit.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const nativeRoot = join(here, "..");
const slug = process.argv[2];
if (!slug) { console.error("usage: audit-actions.mjs <slug>"); process.exit(1); }

const blueprintPath = join(nativeRoot, "ProductBlueprints", `${slug}-vk.json`);
const appDir = join(nativeRoot, "apps", slug);
if (!existsSync(blueprintPath) || !existsSync(appDir)) {
  console.error(`missing Product Blueprint or native app for ${slug}`);
  process.exit(1);
}
const blueprint = JSON.parse(readFileSync(blueprintPath, "utf8"));
const compiled = compileProductBlueprint(blueprint);
function swiftSources(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "UITests" ? [] : swiftSources(path);
    return entry.name.endsWith(".swift") ? [readFileSync(path, "utf8")] : [];
  });
}
let source = swiftSources(appDir).join("\n");
if (source.includes("ManifestConceptRootView")) {
  source += "\n" + readFileSync(join(nativeRoot, "DesignSystem", "ManifestConcept.swift"), "utf8");
}
if (source.includes("NativeContractActionControl")) {
  source += "\n" + readFileSync(join(nativeRoot, "DesignSystem", "NativeContractSurface.swift"), "utf8");
}
const problems = auditActionBindings(compiled.manifest, source);

console.log(`Действия концепта «${slug}»: ${compiled.manifest.interactions.actions.length} контрактов`);
if (problems.length) {
  for (const problem of problems) console.log(`  ✗ ${problem}`);
  console.log(`\nБЛОКЕРЫ: ${problems.length}`);
  process.exit(1);
}
console.log("  Предсказуемые эффекты связаны с элементами управления; feedback-only заглушек нет.");
