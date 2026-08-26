#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { runLeanNativeFactory } from "./lib/lean-native-factory.mjs";
import { normalizeLeanBlueprintBody } from "./lib/structured-model-lean-architect.mjs";

const args = process.argv.slice(2);
const option = name => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const absolute = path => isAbsolute(path) ? path : resolve(process.cwd(), path);
const prompt = option("--prompt");
const valuedOptions = new Set(["--prompt", "--target", "--strategy", "--adapter", "--out", "--resume-blueprint"]);
const positional = [];
for (let index = 0; index < args.length; index += 1) {
  if (valuedOptions.has(args[index])) { index += 1; continue; }
  if (!args[index].startsWith("--")) positional.push(args[index]);
}
const requestPath = positional.find(value => existsSync(absolute(value))) || null;
const targetProduct = option("--target") || "vkontakte";
const strategy = option("--strategy") || "mimicry";
const adapterPath = option("--adapter") || join(import.meta.dirname, "adapters", "codex-lean-native.mjs");

if (!prompt && !requestPath) {
  console.error("usage: npm run native:cold -- --prompt \"product request\" [--target vkontakte] [--strategy mimicry] [--out directory]");
  console.error("   or: npm run native:cold -- request.json [--out directory]");
  process.exit(1);
}

const request = requestPath
  ? JSON.parse(readFileSync(absolute(requestPath), "utf8"))
  : {
      schemaVersion: 1,
      id: `cold-${Date.now()}`,
      request: prompt,
      targetProduct,
      strategy,
      capabilityPolicy: "all",
      preferences: [],
    };
const outputDirectory = absolute(option("--out") || join("native", "FactoryRuns", request.id));
mkdirSync(outputDirectory, { recursive: true });
writeFileSync(join(outputDirectory, "01-request.json"), `${JSON.stringify(request, null, 2)}\n`);

const adapters = await import(pathToFileURL(absolute(adapterPath)));
const resumeBlueprintPath = option("--resume-blueprint");
let architect = adapters.architect;
if (resumeBlueprintPath) {
  const saved = JSON.parse(readFileSync(absolute(resumeBlueprintPath), "utf8"));
  const { schemaVersion, targetProduct: savedTarget, strategy: savedStrategy, states: _states, selectionReceipt, ...body } = saved;
  const normalized = normalizeLeanBlueprintBody(body);
  const resumed = {
    schemaVersion: schemaVersion || 1,
    ...normalized,
    targetProduct: savedTarget,
    strategy: savedStrategy,
    states: normalized.navigation.screens.map(screen => ({
      screenId: screen.id, variants: ["loading", "populated/default", "empty", "error", "offline"],
    })),
    selectionReceipt,
  };
  architect = Object.freeze({ async design() { return structuredClone(resumed); } });
}
let activeStage = "request";
const progress = event => {
  if (event.type === "stage-start") { activeStage = event.stage; console.error(`→ ${event.stage}`); }
  if (event.type === "stage-complete") console.error(`✓ ${event.stage} · ${Math.round(event.durationMs)} ms`);
};

let result;
try {
  result = await runLeanNativeFactory({
    request,
    architect,
    builder: adapters.builder,
    reviewer: adapters.reviewer,
    onProgress: progress,
  });
} catch (error) {
  result = {
    ok: false,
    stage: activeStage,
    diagnostics: [{ code: "cold.stage.crashed", message: String(error?.message || error), path: activeStage, severity: "error" }],
    artifacts: {},
    measurements: [],
  };
}

if (result.artifacts?.productBlueprint) writeFileSync(
  join(outputDirectory, "02-product-blueprint.json"), `${JSON.stringify(result.artifacts.productBlueprint, null, 2)}\n`,
);
if (result.artifacts?.delivery) {
  const delivery = result.artifacts.delivery;
  writeFileSync(join(outputDirectory, "03-delivery-receipt.json"), `${JSON.stringify({
    slug: delivery.slug,
    buildReceipt: delivery.buildReceipt,
    interactionReceipt: delivery.interactionReceipt,
    documentationReceipt: delivery.documentationReceipt,
    captures: delivery.captures,
    proof: delivery.proof,
  }, null, 2)}\n`);
}
if (result.artifacts?.review) writeFileSync(
  join(outputDirectory, "04-visual-review.json"), `${JSON.stringify(result.artifacts.review, null, 2)}\n`,
);
writeFileSync(join(outputDirectory, "pipeline-result.json"), `${JSON.stringify({
  schemaVersion: 1,
  ok: result.ok,
  stage: result.stage,
  diagnostics: result.diagnostics,
  measurements: result.measurements,
  readyForDeveloperHandoff: result.ok,
}, null, 2)}\n`);

console.log(`${result.ok ? "✓" : "✗"} lean cold factory ${result.stage} → ${outputDirectory}`);
if (!result.ok) {
  for (const diagnostic of result.diagnostics || []) console.error(`${diagnostic.code}: ${diagnostic.message}`);
  process.exit(1);
}
