#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createFactoryDevelopmentArtifact, developProductFactory } from "./lib/product-factory.mjs";

const [operation, requestPath] = process.argv.slice(2);
if (operation !== "develop" || !requestPath) {
  console.error("usage: node native/factory-cli.mjs develop <factory-request.json> --adapter <factory-adapter.mjs> --out <product-development.json>");
  process.exit(1);
}
const option = name => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
};
const adapterPath = option("--adapter");
const outputPath = option("--out");
if (!adapterPath || !outputPath) {
  console.error("factory develop requires --adapter and --out");
  process.exit(1);
}

const absolute = path => isAbsolute(path) ? path : resolve(process.cwd(), path);
const request = JSON.parse(readFileSync(absolute(requestPath), "utf8"));
const module = await import(pathToFileURL(absolute(adapterPath)));
const generator = module.productFactoryGenerator || module.default;
const evaluator = module.productFactoryEvaluator;
const result = await developProductFactory({ request, generator, evaluator });
if (!result.ok) {
  for (const item of result.diagnostics) console.error(`✗ ${item.code} · ${item.path}\n  ${item.message}`);
  process.exit(1);
}
const artifact = createFactoryDevelopmentArtifact({ request, result });
writeFileSync(absolute(outputPath), JSON.stringify(artifact, null, 2) + "\n");
console.log(`✓ product factory selected ${result.selectionReceipt.selectedCandidateId} → ${absolute(outputPath)}`);
