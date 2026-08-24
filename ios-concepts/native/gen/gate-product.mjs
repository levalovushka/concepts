#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { auditCanonicalProductContract, migrateLegacyProductContract } from "../lib/product-maturity.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const slug = process.argv[2];
if (!slug) {
  console.error("usage: gate-product.mjs <slug>");
  process.exit(1);
}
const concept = JSON.parse(readFileSync(join(root, "concepts", slug, "concept.json"), "utf8"));
const contract = concept.productContract || migrateLegacyProductContract(concept);
const diagnostics = auditCanonicalProductContract(contract, concept);
for (const item of diagnostics) console.error(`✗ ${item.code} · ${item.path}\n  ${item.message}`);
if (diagnostics.length) process.exit(1);
if (!concept.productContract) console.log(`! ${concept.name}: compatibility migration baseline; no original multi-candidate receipt`);
console.log(`✓ product maturity ${contract.contractId} · ${contract.status} · floor ${contract.maturity.minimumAxisScore}/4`);
