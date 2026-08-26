#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { releaseFactoryProduct } from "./lib/factory-release.mjs";

const [factoryPath, experiencePath, visualPath] = process.argv.slice(2);
const option = name => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
};
const adapterPath = option("--adapter");
const outputPath = option("--out");
if (!factoryPath || !experiencePath || !visualPath || !adapterPath || !outputPath) {
  console.error("usage: factory-release-cli.mjs <factory-artifact.json> <experience-contract.json> <visual-development.json> --adapter <release-adapter.mjs> --out <release-receipt.json>");
  process.exit(1);
}
const absolute = path => isAbsolute(path) ? path : resolve(process.cwd(), path);
const factoryArtifact = JSON.parse(readFileSync(absolute(factoryPath), "utf8"));
const experienceContract = JSON.parse(readFileSync(absolute(experiencePath), "utf8"));
const visualDevelopment = JSON.parse(readFileSync(absolute(visualPath), "utf8"));
const adapter = await import(pathToFileURL(absolute(adapterPath)));
const result = await releaseFactoryProduct({
  factoryArtifact,
  experienceContract,
  visualDevelopment,
  renderer: adapter.factoryRenderer,
  critic: adapter.productUICritic,
  reviser: adapter.productRevisionAdapter,
});
const receipt = {
  schemaVersion: 1,
  ok: result.ok,
  productContractId: factoryArtifact.productDevelopment?.productContract?.contractId || null,
  experienceContractId: experienceContract.experienceContractId || null,
  visualDirectionContractId: visualDevelopment.visualDirectionContract?.visualDirectionContractId || null,
  attempts: result.attempts,
  renderAttempts: result.renderAttempts || [],
  diagnostics: result.diagnostics,
  finalCaptures: result.delivery?.captures || [],
};
const destination = absolute(outputPath);
mkdirSync(dirname(destination), { recursive: true });
writeFileSync(destination, JSON.stringify(receipt, null, 2) + "\n");
console.log(`${result.ok ? "✓" : "✗"} factory release · ${result.attempts.length}/3 review attempts → ${destination}`);
if (!result.ok) process.exit(1);
