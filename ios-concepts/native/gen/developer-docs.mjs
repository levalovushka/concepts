#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileNativeConcept } from "../lib/compile-concept.mjs";
import { auditDeveloperDocumentation, writeDeveloperDocumentation } from "../lib/developer-documentation.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const slug = args.find(item => !item.startsWith("--"));
const mode = args.includes("--write") ? "--write" : "--check";
if (!slug || !["--check", "--write"].includes(mode)) {
  console.error("usage: developer-docs.mjs <slug> [--check|--write]");
  process.exit(1);
}

const concept = JSON.parse(readFileSync(join(root, "concepts", slug, "concept.json"), "utf8"));
const compiled = compileNativeConcept(concept);
if (!compiled.ok) {
  for (const item of compiled.diagnostics) if (item.severity === "error") console.error(`✗ ${item.code} · ${item.path}\n  ${item.message}`);
  process.exit(1);
}

const result = mode === "--write"
  ? writeDeveloperDocumentation({ root, concept, manifest: compiled.manifest })
  : auditDeveloperDocumentation({ root, concept, manifest: compiled.manifest });
for (const item of result.diagnostics) console.error(`✗ ${item.code} · ${item.path}\n  ${item.message}`);
if (!result.ok) process.exit(1);
console.log(`${mode === "--write" ? "developer guide →" : "✓ developer guide"} ${result.path}`);
