#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createFactoryDevelopmentArtifact, resumeLeanProductFactory } from "./lib/product-factory.mjs";

const absolute = path => isAbsolute(path) ? path : resolve(process.cwd(), path);
const option = name => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
};
const failurePath = process.argv[2];
const adapterPath = option("--adapter");
const outputPath = option("--out");
if (!failurePath || !adapterPath || !outputPath) {
  console.error("usage: factory-product-resume-cli.mjs <product-failure.json> --adapter <adapter.mjs> --out <factory-development.json>");
  process.exit(1);
}
const request = JSON.parse(readFileSync(absolute("native/FactoryRequests/vk-cold-start.json"), "utf8"));
const failure = JSON.parse(readFileSync(absolute(failurePath), "utf8"));
const adapters = await import(pathToFileURL(absolute(adapterPath)));
const result = await resumeLeanProductFactory({ request, failure, evaluator: adapters.productFactoryEvaluator });
const destination = absolute(outputPath);
mkdirSync(dirname(destination), { recursive: true });
if (!result.ok) {
  writeFileSync(destination, JSON.stringify(result, null, 2) + "\n");
  console.error(`✗ product maturity → ${destination}`);
  process.exit(1);
}
writeFileSync(destination, JSON.stringify(createFactoryDevelopmentArtifact({ request, result }), null, 2) + "\n");
console.log(`✓ product development → ${destination}`);
