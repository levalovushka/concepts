#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createVisualDevelopmentArtifact, developVisualDirection } from "./lib/visual-direction.mjs";

const [factoryPath, experiencePath] = process.argv.slice(2);
const option = name => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
};
const adapterPath = option("--adapter");
const outputPath = option("--out");
if (!factoryPath || !experiencePath || !adapterPath || !outputPath) {
  console.error("usage: visual-cli.mjs <factory-artifact.json> <experience-contract.json> --adapter <visual-adapter.mjs> --out <visual-development.json>");
  process.exit(1);
}
const absolute = path => isAbsolute(path) ? path : resolve(process.cwd(), path);
const factoryArtifact = JSON.parse(readFileSync(absolute(factoryPath), "utf8"));
const experienceContract = JSON.parse(readFileSync(absolute(experiencePath), "utf8"));
const adapter = await import(pathToFileURL(absolute(adapterPath)));
const result = await developVisualDirection({
  factoryArtifact,
  experienceContract,
  generator: adapter.visualDirectionGenerator,
  evaluator: adapter.visualDirectionEvaluator,
});
if (!result.ok) {
  for (const item of result.diagnostics) console.error(`✗ ${item.code} · ${item.path}\n  ${item.message}`);
  process.exit(1);
}
const destination = absolute(outputPath);
mkdirSync(dirname(destination), { recursive: true });
writeFileSync(destination, JSON.stringify(createVisualDevelopmentArtifact(result), null, 2) + "\n");
console.log(`✓ Visual Direction ${result.contract.visualDirectionContractId} → ${destination}`);
