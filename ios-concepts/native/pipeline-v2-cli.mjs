#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createNativeKernelAdapterV2 } from "./lib/native-kernel-adapter-v2.mjs";
import { runNativeConceptPipeline } from "./lib/native-concept-pipeline-v2.mjs";
import { assertPathInside, NATIVE_PROJECT_ROOT } from "./lib/project-paths.mjs";

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

function printDiagnostics(diagnostics) {
  for (const item of diagnostics || []) console.error(`✗ ${item.code} · ${item.path}\n  ${item.message}`);
}

const input = process.argv[2];
const adapterPath = option("--adapter");
const selectedCandidateId = option("--select");
const output = option("--out");
const mode = option("--mode") || "slice";
if (!input || !adapterPath || !["slice", "full"].includes(mode)) {
  console.error("usage: npm run native:v2 -- request.json --adapter adapters.mjs [--select candidate-id] [--mode slice|full] [--out receipt.json]");
  process.exit(1);
}

const request = JSON.parse(readFileSync(resolve(input), "utf8"));
const module = await import(pathToFileURL(resolve(adapterPath)).href);
const factory = module.createNativePipelineAdapters || module.default;
const external = typeof factory === "function" ? await factory({ request, projectRoot: NATIVE_PROJECT_ROOT }) : (module.adapters || factory);
if (!external || typeof external !== "object") {
  console.error("adapter module must export createNativePipelineAdapters(), adapters, or a default adapter object");
  process.exit(1);
}
const deterministicKernel = createNativeKernelAdapterV2({ projectRoot: NATIVE_PROJECT_ROOT });
const adapters = {
  ...external,
  kernel: {
    ...(external.kernel || {}),
    buildSlice: deterministicKernel.buildSlice,
    buildFull: deterministicKernel.buildFull,
  },
};
const result = await runNativeConceptPipeline({
  request, selectedCandidateId, mode, adapters,
  onProgress(event) {
    if (event.type === "stage-start") console.error(`• ${event.stage}`);
  },
});

if (output) {
  const path = assertPathInside(NATIVE_PROJECT_ROOT, resolve(output), "Native Pipeline v2 receipt");
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(result, null, 2)}\n`);
  console.error(`receipt → ${path}`);
}
if (result.needsSelection) {
  console.log("Choose one product mechanism and repeat with --select:");
  for (const choice of result.choices) console.log(`${choice.id === result.recommendationId ? "★" : " "} ${choice.id} · ${choice.name}\n  ${choice.thesis}`);
  process.exit(0);
}
printDiagnostics(result.diagnostics);
if (!result.ok) process.exit(1);
console.log(`✓ Native Pipeline v2: ${result.stage}; ${result.metrics.wallClockMs} ms`);
