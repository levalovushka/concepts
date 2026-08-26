#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { developProductConcept } from "../lib/product-maturity.mjs";
import { NATIVE_PROJECT_ROOT } from "../lib/project-paths.mjs";

const slug = process.argv[2];
if (!slug) {
  console.error("usage: rederive-product-development.mjs <slug>");
  process.exit(1);
}

const conceptPath = join(NATIVE_PROJECT_ROOT, "concepts", slug, "concept.json");
const concept = JSON.parse(readFileSync(conceptPath, "utf8"));
const development = concept.productDevelopment;
if (!development?.brief || !Array.isArray(development?.candidates)) {
  console.error(`${slug}: explicit Product Brief and candidates are required`);
  process.exit(1);
}

const generator = {
  async generateCandidates() { return structuredClone(development.candidates); },
};
const result = await developProductConcept({ brief: development.brief, generator });
if (!result.ok) {
  for (const item of result.diagnostics) console.error(`✗ ${item.code} · ${item.path}\n  ${item.message}`);
  process.exit(1);
}

concept.productDevelopment = {
  ...development,
  candidates: result.candidates,
  selectionReceipt: result.selectionReceipt,
  productContract: result.productContract,
};
writeFileSync(conceptPath, `${JSON.stringify(concept, null, 2)}\n`);
console.log(`✓ ${slug}: ${result.selectionReceipt.receiptId} → ${result.productContract.contractId}`);
