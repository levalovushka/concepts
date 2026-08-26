#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const absolute = path => isAbsolute(path) ? path : resolve(process.cwd(), path);
const option = name => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
};
const failurePath = process.argv[2];
const selectedSeedId = option("--select");
const adapterPath = option("--adapter");
const outputPath = option("--out");
if (!failurePath || !selectedSeedId || !adapterPath || !outputPath) {
  console.error("usage: factory-expand-selected-cli.mjs <product-failure.json> --select <seed-id> --adapter <adapter.mjs> --out <resumable-failure.json>");
  process.exit(1);
}
const failure = JSON.parse(readFileSync(absolute(failurePath), "utf8"));
const adapters = await import(pathToFileURL(absolute(adapterPath)));
const seeds = failure.explorationReceipt?.seeds || [];
const selectedIndex = seeds.findIndex(item => item.id === selectedSeedId);
if (selectedIndex < 0) throw new Error(`Unknown seed ${selectedSeedId}`);
const request = JSON.parse(readFileSync(absolute("native/FactoryRequests/vk-cold-start.json"), "utf8"));
const proposal = await adapters.productFactoryGenerator.expandIdea({
  request,
  target: failure.target,
  rubric: { candidateCount: seeds.length, minimumAxisScore: 3 },
  discovery: failure.discovery,
  assignedSeed: seeds[selectedIndex],
  completePortfolio: seeds,
  slot: selectedIndex + 1,
});
const receiptBody = { ...failure.explorationReceipt, selectedSeedId };
delete receiptBody.receiptId;
const explorationReceipt = {
  receiptId: `ideas-${createHash("sha256").update(JSON.stringify(receiptBody)).digest("hex").slice(0, 16)}`,
  ...receiptBody,
};
writeFileSync(absolute(outputPath), JSON.stringify({
  ...failure,
  ok: false,
  diagnostics: [],
  candidates: [proposal.candidate],
  worldModels: [proposal.worldModel],
  explorationReceipt,
}, null, 2) + "\n");
console.log(`✓ expanded ${selectedSeedId} → ${absolute(outputPath)}`);
