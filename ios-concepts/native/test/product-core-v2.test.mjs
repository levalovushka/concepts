import assert from "node:assert/strict";
import test from "node:test";
import { createProductCoreArtifact, validateProductCoreV2, validateProductPortfolio } from "../lib/product-core-v2.mjs";
import { portfolio, strongCore } from "../fixtures/native-pipeline/strong-product.mjs";

test("Product Core v2 closes the product mechanism before permissions or screens", () => {
  assert.deepEqual(validateProductCoreV2(strongCore), []);
  const result = createProductCoreArtifact({ request: { id: "request-1" }, core: strongCore, portfolio });
  assert.equal(result.ok, true);
  assert.equal(result.artifact.selectedBy, "human");
  assert.match(result.artifact.artifactId, /^product-core-/);
  assert.equal(Object.hasOwn(result.artifact.core, "permissions"), false);
  assert.equal(Object.hasOwn(result.artifact.core, "navigation"), false);
});

test("Product Core v2 rejects screen-first and permission-first products", () => {
  const broken = structuredClone(strongCore);
  broken.permissions = [{ key: "camera" }];
  broken.world.actions[0].effect = { type: "navigate", targetScreenId: "feed" };
  const codes = validateProductCoreV2(broken).map(item => item.code);
  assert.ok(codes.includes("product-core.capability-leak"));
  assert.ok(codes.includes("product-core.action.effect"));
});

test("portfolio recommendation cannot hide one failed quality axis", () => {
  const weak = structuredClone(portfolio);
  weak.assessments[0].axes.push({ id: "return", score: 8.4 });
  assert.ok(validateProductPortfolio(weak).some(item => item.code === "portfolio.recommendation-floor"));
});
