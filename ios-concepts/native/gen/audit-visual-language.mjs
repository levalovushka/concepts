#!/usr/bin/env node
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { auditVisualLanguage } from "../lib/visual-language-audit.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const nativeRoot = join(here, "..");
const slug = process.argv[2];
if (!slug) {
  console.error("usage: audit-visual-language.mjs <slug>");
  process.exit(1);
}

const diagnostics = auditVisualLanguage(join(nativeRoot, "apps", slug), slug);
if (diagnostics.length) {
  console.error(`Визуальный язык «${slug}»:`);
  for (const item of diagnostics) console.error(`  ✗ ${item}`);
  process.exit(1);
}
console.log(`Визуальный язык «${slug}»: единый seam, локального token drift нет.`);
