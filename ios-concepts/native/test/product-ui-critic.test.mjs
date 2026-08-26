import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCT_UI_CRITIC_AXES, reviewProductUI } from "../lib/product-ui-critic.mjs";
import { createStructuredVisionProductUICritic } from "../lib/structured-vision-product-ui-critic.mjs";

const concept = {
  slug: "tails",
  native: { design: { strategy: "mimicry", referenceProfile: "vk-ios", qualityFloor: 8 }, deliveryIdentity: { coreSurfaces: ["home"] } },
  productDevelopment: { productContract: { contractId: "product-tails", productThesis: "Питомец находит совместимую прогулку", delivery: { criticalFlows: [] } } },
};
const captures = [{ id: "home--default", path: "shots/home--default.png", sha256: "abc" }];

function cleanReviewer(score = 9) {
  return { async review(request) { return {
    reviewer: { kind: "fixture", name: "deterministic-test-reviewer", independentFromGenerator: true, captureInspection: "vision" },
    verdict: "clean",
    axes: PRODUCT_UI_CRITIC_AXES.map(id => ({ id, score, rationale: `Grounded rationale for ${id} across the visible product.`, evidence: "Visible cross-screen evidence" })),
    reviews: request.captures.map(capture => ({
      captureId: capture.id,
      summary: "This capture has a coherent visible hierarchy and product task.", evidence: "Visible first frame evidence",
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
  reviewer.review = async request => ({ reviewer: { kind: "fixture" }, verdict: "clean", axes: PRODUCT_UI_CRITIC_AXES.map((id, index) => ({ id, score: index ? 10 : 4, rationale: `Grounded rationale for ${id} across the visible product.`, evidence: "Visible first frame evidence" })), reviews: [{
    captureId: request.captures[0].id,
    summary: "This capture has a coherent visible hierarchy and product task.", evidence: "Visible first frame evidence",
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

test("concept metadata cannot lower the factory quality floor below 8.5", async () => {
  const result = await reviewProductUI({ concept, captures, reviewer: cleanReviewer(8.4) });
  assert.equal(result.ok, false);
  assert.equal(result.receipt.floor, 8.5);
  assert.equal(result.diagnostics.some(item => item.code === "critic.axis.below-floor"), true);
});

test("critic rejects self-review claims and duplicate axis padding", async () => {
  const reviewer = cleanReviewer();
  reviewer.review = async request => ({
    reviewer: { kind: "model", name: "same-generator", independentFromGenerator: false, captureInspection: "metadata" },
    verdict: "clean",
    axes: [...PRODUCT_UI_CRITIC_AXES, PRODUCT_UI_CRITIC_AXES[0]].map(id => ({ id, score: 10, rationale: `Grounded rationale for ${id} across the visible product.`, evidence: "Visible first frame evidence" })),
    reviews: request.captures.map(capture => ({
      captureId: capture.id,
      summary: "This capture has a coherent visible hierarchy and product task.", evidence: "Visible first frame evidence",
      findings: [],
    })),
  });
  const result = await reviewProductUI({ concept, captures, reviewer });
  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "critic.independence.unproven"), true);
  assert.equal(result.diagnostics.some(item => item.code === "critic.axis.duplicate"), true);
});

test("production critic adapter requires a visual model operation and bounded capture schema", async () => {
  assert.throws(() => createStructuredVisionProductUICritic({ model: { generateStructured() {} }, reviewerName: "text-only" }), /reviewStructuredVisuals/);
  let call;
  const reviewer = createStructuredVisionProductUICritic({
    reviewerName: "independent-vision-fixture",
    model: { async reviewStructuredVisuals(request) {
      call = request;
      return {
        verdict: "clean",
        axes: PRODUCT_UI_CRITIC_AXES.map(id => ({ id, score: 9, rationale: `Visible grounded rationale for ${id} across all captures.`, evidence: "Observed pixels and layout" })),
        reviews: captures.map(capture => ({
          captureId: capture.id,
          summary: "The exact capture has a clear product task and stable hierarchy.", evidence: "Observed pixels and layout",
          findings: [],
        })),
      };
    } },
  });
  const result = await reviewProductUI({ concept, captures, reviewer });
  assert.equal(result.ok, true, JSON.stringify(result.diagnostics));
  assert.equal(call.operation, "camo.native-product-ui-critic.v3");
  assert.equal(call.schema.properties.reviews.minItems, captures.length);
  assert.equal(call.input.instructions.some(item => item.includes("Open and inspect every")), true);
  assert.equal(call.input.instructions.some(item => item.includes("no distinct visible outcome")), true);
});
