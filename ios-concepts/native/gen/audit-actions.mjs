#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileNativeConcept } from "../lib/compile-concept.mjs";
import { auditActionBindings } from "../lib/action-binding-audit.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const nativeRoot = join(here, "..");
const platformRoot = join(nativeRoot, "..");
const slug = process.argv[2];
if (!slug) { console.error("usage: audit-actions.mjs <slug>"); process.exit(1); }

const conceptPath = join(platformRoot, "concepts", slug, "concept.json");
const appDir = join(nativeRoot, "apps", slug);
if (!existsSync(conceptPath) || !existsSync(appDir)) {
  console.error(`missing concept or native app for ${slug}`);
  process.exit(1);
}
const concept = JSON.parse(readFileSync(conceptPath, "utf8"));
const compiled = compileNativeConcept(concept);
let source = readdirSync(appDir).filter(file => file.endsWith(".swift"))
  .map(file => readFileSync(join(appDir, file), "utf8")).join("\n");
if (source.includes("ManifestConceptRootView")) {
  source += "\n" + readFileSync(join(nativeRoot, "DesignSystem", "ManifestConcept.swift"), "utf8");
}
const problems = auditActionBindings(compiled.manifest, source);

console.log(`Действия концепта «${slug}»: ${compiled.manifest.interactions.actions.length} контрактов`);
if (problems.length) {
  for (const problem of problems) console.log(`  ✗ ${problem}`);
  console.log(`\nБЛОКЕРЫ: ${problems.length}`);
  process.exit(1);
}
console.log("  Предсказуемые эффекты связаны с элементами управления; feedback-only заглушек нет.");
