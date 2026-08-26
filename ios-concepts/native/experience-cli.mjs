#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { developExperienceContract } from "./lib/experience-contract.mjs";

const factoryPath = process.argv[2];
const option = name => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
};
const adapterPath = option("--adapter");
const outputPath = option("--out");
if (!factoryPath || !adapterPath || !outputPath) {
  console.error("usage: experience-cli.mjs <factory-artifact.json> --adapter <experience-adapter.mjs> --out <experience-contract.json>");
  process.exit(1);
}
const absolute = path => isAbsolute(path) ? path : resolve(process.cwd(), path);
const factoryArtifact = JSON.parse(readFileSync(absolute(factoryPath), "utf8"));
const adapter = await import(pathToFileURL(absolute(adapterPath)));
const result = await developExperienceContract({ factoryArtifact, planner: adapter.experiencePlanner || adapter.default });
if (!result.ok) {
  const destination = absolute(outputPath);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, JSON.stringify(result, null, 2) + "\n");
  for (const item of result.diagnostics) console.error(`✗ ${item.code} · ${item.path}\n  ${item.message}`);
  process.exit(1);
}
const destination = absolute(outputPath);
mkdirSync(dirname(destination), { recursive: true });
writeFileSync(destination, JSON.stringify(result.contract, null, 2) + "\n");
console.log(`✓ Experience Contract ${result.contract.experienceContractId} → ${destination}`);
