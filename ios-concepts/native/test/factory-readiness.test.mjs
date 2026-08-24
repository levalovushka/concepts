import test from "node:test";
import assert from "node:assert/strict";
import { createFactoryReadinessReport } from "../lib/factory-readiness.mjs";

test("factory readiness separates automated confidence from human score", () => {
  const report = createFactoryReadinessReport();
  for (const value of Object.values(report.evaluations)) {
    assert.equal(typeof value.automatedConfidence, "number");
    assert.equal(typeof value.humanScore, "number");
    assert.equal(value.humanScore < 10, true);
  }
});

test("completed independent review cannot close physical or VoiceOver gates", () => {
  const report = createFactoryReadinessReport();
  assert.equal(report.factoryReady, false);
  assert.equal(report.humanReview.independentReviewComplete, true);
  assert.equal(report.humanReview.reviewerKind, "independent-product-visual-review");
  assert.deepEqual(report.blockers.manual.sort(), ["physical-device", "voiceover"]);
});
