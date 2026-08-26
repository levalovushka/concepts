#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { runFactoryPipeline } from "./lib/factory-pipeline.mjs";

const requestPath = process.argv[2];
const option = name => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
};
const adapterPath = option("--adapter");
const outputDirectory = option("--out");
const productFailurePath = option("--resume-product");
const benchmarkMode = process.argv.includes("--benchmark") || process.env.CAMO_FACTORY_BENCHMARK === "1";
if (!requestPath || !adapterPath || !outputDirectory) {
  console.error("usage: factory-run-cli.mjs <factory-request.json> --adapter <factory-pipeline-adapter.mjs> --out <artifact-directory>");
  process.exit(1);
}
const absolute = path => isAbsolute(path) ? path : resolve(process.cwd(), path);
const request = JSON.parse(readFileSync(absolute(requestPath), "utf8"));
const adapters = await import(pathToFileURL(absolute(adapterPath)));
const progress = event => {
  if (event.type === "stage-start") console.error(`→ ${event.stage}`);
  if (event.type === "stage-complete") console.error(`${event.status === "completed" ? "✓" : "✗"} ${event.stage} · ${Math.round(event.durationMs)} ms`);
};
const result = await runFactoryPipeline({
  request,
  adapters,
  productFailure: productFailurePath ? JSON.parse(readFileSync(absolute(productFailurePath), "utf8")) : null,
  benchmark: benchmarkMode ? { manualInterventions: 0 } : null,
  onProgress: progress,
});
const destination = absolute(outputDirectory);
mkdirSync(destination, { recursive: true });
const files = {
  factoryRequest: "01-factory-request.json",
  factoryDevelopment: "02-product-development.json",
  experienceContract: "03-experience-contract.json",
  visualDevelopment: "04-visual-development.json",
  release: "05-release.json",
  productFailure: "02-product-failure.json",
};
for (const [key, filename] of Object.entries(files)) if (result.artifacts[key]) writeFileSync(
  join(destination, filename), JSON.stringify(result.artifacts[key], null, 2) + "\n",
);
writeFileSync(join(destination, "pipeline-result.json"), JSON.stringify({
  schemaVersion: 2, ok: result.ok, stage: result.stage, diagnostics: result.diagnostics, metrics: result.metrics,
}, null, 2) + "\n");
if (benchmarkMode) writeFileSync(join(destination, "06-benchmark.json"), JSON.stringify({
  schemaVersion: 1,
  requestId: request.id,
  passed: result.ok && result.metrics.manualInterventions === 0,
  readyForDeveloperHandoff: result.ok,
  ...result.metrics,
}, null, 2) + "\n");
console.log(`${result.ok ? "✓" : "✗"} factory ${result.stage} · ${Math.round(result.metrics.wallClockMs)} ms → ${destination}`);
if (!result.ok) process.exit(1);
