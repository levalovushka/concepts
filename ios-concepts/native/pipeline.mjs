#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { generateNativeConcept } from "./lib/concept-generator.mjs";
import { NATIVE_PROJECT_ROOT } from "./lib/project-paths.mjs";

const input = process.argv[2];
if (!input) {
  console.error("usage: npm run generate -- native/specs/<concept>.json [--review review.json]");
  process.exit(1);
}
const reviewIndex = process.argv.indexOf("--review");
const visualReview = reviewIndex >= 0 ? JSON.parse(readFileSync(resolve(process.argv[reviewIndex + 1]), "utf8")) : null;
const spec = JSON.parse(readFileSync(resolve(input), "utf8"));
const result = generateNativeConcept({ projectRoot: NATIVE_PROJECT_ROOT, spec, visualReview });
let visualReviewPacketPath = null;
if (result.visualReviewPacket) {
  const packetPath = join(NATIVE_PROJECT_ROOT, "native", "artifacts", spec.id, "visual-review-request.json");
  mkdirSync(dirname(packetPath), { recursive: true });
  writeFileSync(packetPath, `${JSON.stringify(result.visualReviewPacket, null, 2)}\n`);
  visualReviewPacketPath = packetPath;
}
if (!result.ok) {
  for (const item of result.diagnostics) console.error(`✗ ${item.code} · ${item.path}\n  ${item.message}`);
  for (const item of result.visualReviewResult?.repairBrief || []) console.error(`→ ${item.code}: ${item.recommendation}`);
  process.exit(1);
}
console.log(JSON.stringify({
  app: result.materialized.paths.appDirectory,
  xcode: result.delivery.buildReceipt.projectPath,
  permissions: result.capabilityPlan.bindings.length,
  tests: result.delivery.interactionReceipt.testNames.length,
  captures: result.delivery.captures.length,
  docs: result.materialized.documentationReceipt.directory,
  visualReview: result.visualReviewResult
    ? { status: "passed", floor: result.visualReviewResult.floor }
    : {
      status: "agent-must-inspect-and-repair",
      packet: visualReviewPacketPath,
      maxRepairIterations: result.visualReviewPacket.agentLoop.maxRepairIterations,
    },
}, null, 2));
