#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { developProductConcept, verifyProductDevelopmentArtifact } from "./lib/product-maturity.mjs";

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

function printDiagnostics(diagnostics) {
  for (const item of diagnostics) {
    const mark = item.severity === "warning" ? "!" : "✗";
    console.error(`${mark} ${item.code} · ${item.path}\n  ${item.message}`);
  }
}

const [operation, input] = process.argv.slice(2);
if (!operation || !input || !["develop", "verify"].includes(operation)) {
  console.error("usage: product-cli.mjs <develop|verify> <input.json> [--adapter module.mjs] [--out artifact.json]");
  process.exit(1);
}

if (operation === "verify") {
  const parsed = JSON.parse(readFileSync(resolve(input), "utf8"));
  const artifact = parsed.productDevelopment || parsed;
  const diagnostics = verifyProductDevelopmentArtifact(artifact);
  printDiagnostics(diagnostics);
  if (diagnostics.length) process.exit(1);
  console.log(`✓ ${artifact.selectionReceipt.receiptId} → ${artifact.productContract.contractId}`);
  process.exit(0);
}

const adapterPath = option("--adapter");
if (!adapterPath) {
  console.error("develop requires --adapter; Camo does not fabricate model output");
  process.exit(1);
}
const adapterModule = await import(pathToFileURL(resolve(adapterPath)).href);
const generator = adapterModule.productGenerator || adapterModule.default;
const brief = JSON.parse(readFileSync(resolve(input), "utf8"));
const result = await developProductConcept({ brief, generator });
printDiagnostics(result.diagnostics);
const artifact = {
  schemaVersion: 1,
  brief,
  candidates: result.candidates,
  selectionReceipt: result.selectionReceipt,
  productContract: result.productContract,
};
const output = option("--out");
if (output) {
  const path = resolve(output);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(artifact, null, 2) + "\n");
  console.log(`${result.ok ? "product development" : "blocked development receipt"} → ${path}`);
} else {
  process.stdout.write(JSON.stringify(artifact, null, 2) + "\n");
}
if (!result.ok) process.exit(1);
