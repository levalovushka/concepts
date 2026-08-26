#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateNativeConceptV2 } from "./lib/simple-native-concept-v2.mjs";
import { NATIVE_PROJECT_ROOT } from "./lib/project-paths.mjs";

const input = process.argv[2];
if (!input) {
  console.error("usage: npm run native:v2 -- native/ConceptSpecs/<concept>.json");
  process.exit(1);
}
const spec = JSON.parse(readFileSync(resolve(input), "utf8"));
const result = generateNativeConceptV2({ projectRoot: NATIVE_PROJECT_ROOT, spec });
if (!result.ok) {
  for (const item of result.diagnostics) console.error(`✗ ${item.code} · ${item.path}\n  ${item.message}`);
  process.exit(1);
}
console.log(JSON.stringify({
  app: result.materialized.paths.appDirectory,
  xcode: result.delivery.buildReceipt.projectPath,
  permissions: result.capabilityPlan.bindings.length,
  tests: result.delivery.interactionReceipt.testNames.length,
  captures: result.delivery.captures.length,
  docs: result.materialized.documentationReceipt.directory,
}, null, 2));
