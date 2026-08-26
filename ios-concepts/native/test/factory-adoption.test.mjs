import test from "node:test";
import assert from "node:assert/strict";
import { auditFactoryAdoption, FACTORY_ADOPTION_CATALOG, planFactoryAdoption } from "../lib/factory-adoption.mjs";

test("every existing native concept has a stable non-destructive factory adoption decision", () => {
  assert.deepEqual(auditFactoryAdoption(), []);
  assert.deepEqual(FACTORY_ADOPTION_CATALOG.map(item => item.slug).sort(), ["dvor", "looks", "nakat", "peresmenka", "tails", "today", "vk-neighbor-help"]);
  assert.equal(FACTORY_ADOPTION_CATALOG.some(item => item.status === "factory-native"), false);
});

test("Dvor is first, Looks remains calibration, and weak differentiation is not promoted", () => {
  const dvor = planFactoryAdoption("dvor");
  assert.equal(dvor.order, 1);
  assert.equal(dvor.status, "next");
  assert.equal(dvor.requestPath, "native/FactoryRequests/dvor.json");
  assert.equal(dvor.mayMutateCompatibilitySource, false);
  assert.equal(planFactoryAdoption("looks").status, "calibration-source");
  assert.equal(planFactoryAdoption("today").status, "product-rework-required");
  assert.equal(planFactoryAdoption("nakat").status, "product-rework-required");
});
