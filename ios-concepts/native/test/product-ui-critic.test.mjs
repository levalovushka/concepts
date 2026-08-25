import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCT_UI_CRITIC_AXES, reviewProductUI } from "../lib/product-ui-critic.mjs";

const concept = {
  slug: "tails",
  native: { design: { strategy: "mimicry", referenceProfile: "vk-ios", qualityFloor: 8 }, deliveryIdentity: { coreSurfaces: ["home"] } },
  productDevelopment: { productContract: { contractId: "product-tails", productThesis: "Питомец находит совместимую прогулку", delivery: { criticalFlows: [] } } },
};
const captures = [{ id: "home--default", path: "shots/home--default.png", sha256: "abc" }];

function cleanReviewer(score = 9) {
  return { async review(request) { return {
    reviewer: { kind: "fixture", name: "deterministic-test-reviewer" },
    verdict: "clean",
    reviews: request.captures.map(capture => ({
      captureId: capture.id,
      axes: PRODUCT_UI_CRITIC_AXES.map(id => ({ id, score, rationale: `Grounded rationale for ${id} on the visible product frame.`, evidence: "Visible first frame evidence" })),
      findings: [],
    })),
  }; } };
}

test("critic fails closed when no real reviewer adapter is connected", async () => {
  const result = await reviewProductUI({ concept, captures });
  assert.equal(result.ok, false);
  assert.equal(result.diagnostics[0].code, "critic.reviewer.required");
});

test("critic rejects missing capture coverage and one failed axis without averaging", async () => {
  const reviewer = cleanReviewer();
  reviewer.review = async request => ({ reviewer: { kind: "fixture" }, verdict: "clean", reviews: [{
    captureId: request.captures[0].id,
    axes: PRODUCT_UI_CRITIC_AXES.map((id, index) => ({ id, score: index ? 10 : 4, rationale: `Grounded rationale for ${id} on the visible product frame.`, evidence: "Visible first frame evidence" })),
    findings: [],
  }] });
  const result = await reviewProductUI({ concept, captures: [...captures, { id: "nearby--default", path: "x", sha256: "def" }], reviewer });
  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "critic.axis.below-floor"), true);
  assert.equal(result.diagnostics.some(item => item.code === "critic.capture.unreviewed"), true);
});

test("critic produces a stable clean receipt through the reviewer seam", async () => {
  const first = await reviewProductUI({ concept, captures, reviewer: cleanReviewer() });
  const second = await reviewProductUI({ concept, captures, reviewer: cleanReviewer() });
  assert.equal(first.ok, true, JSON.stringify(first.diagnostics));
  assert.equal(first.receipt.receiptId, second.receipt.receiptId);
});
