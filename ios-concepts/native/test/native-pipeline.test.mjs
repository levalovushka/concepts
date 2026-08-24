import test from "node:test";
import assert from "node:assert/strict";
import { createNativePipelinePlan, discoverNativeConcepts, runNativePipeline } from "../lib/native-pipeline.mjs";

test("discovers only concepts that have a native implementation", () => {
  assert.deepEqual(discoverNativeConcepts(), ["dvor", "looks"]);
});

test("build cannot bypass product maturity, docs, compile, generation, or audits", () => {
  assert.deepEqual(createNativePipelinePlan("build", "dvor").map(step => step.label), [
    "product maturity dvor", "compile dvor", "developer docs dvor", "generate dvor", "audit dvor", "build dvor",
  ]);
});

test("pipeline interface supports a recording adapter", () => {
  const calls = [];
  const result = runNativePipeline({ operation: "check", slug: "looks", adapter: { run: step => calls.push(step.label) } });
  assert.equal(result.ok, true);
  assert.deepEqual(calls, ["product maturity looks", "compile looks", "developer docs looks", "generate looks", "audit looks"]);
});

test("unknown concept is rejected before commands execute", () => {
  assert.throws(() => createNativePipelinePlan("check", "ghost"), /нет пары/);
});

test("device matrix covers both concepts on current and small phones", () => {
  const plan = createNativePipelinePlan("matrix");
  assert.equal(plan.filter(step => step.label.startsWith("xcui smoke")).length, 4);
  assert.equal(plan.filter(step => step.label.startsWith("capture ")).length, 4);
  assert.equal(plan.some(step => step.args.includes("platform=iOS Simulator,name=iPhone 17 Pro")), true);
  assert.equal(plan.some(step => step.args.includes("platform=iOS Simulator,name=iPhone 16e")), true);
});
