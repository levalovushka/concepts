import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { compileCapabilityPlanV2 } from "../lib/capability-plan-v2.mjs";
import { createProductCoreArtifact } from "../lib/product-core-v2.mjs";
import { materializeNativeConcept } from "../lib/native-delivery.mjs";
import { portfolio, strongCapabilityProposal, strongCore, strongFullContract, strongSlice } from "../fixtures/native-pipeline/strong-product.mjs";

function contracts() {
  const productCore = createProductCoreArtifact({ request: { id: "adapter-test" }, core: strongCore, portfolio }).artifact;
  const capabilityPlan = compileCapabilityPlanV2({
    productCoreArtifact: productCore, target: { permissions: [{ key: "camera" }] },
    proposal: strongCapabilityProposal, bundleId: "com.camo.neighbourpromises",
  }).plan;
  return { productCore, capabilityPlan, sliceContract: strongSlice };
}

test("materializer owns complete compiler-generated output and refuses foreign app sources", () => {
  const projectRoot = mkdtempSync(join(tmpdir(), "camo-materializer-"));
  const output = materializeNativeConcept({ projectRoot, ...contracts(), fullContract: strongFullContract });
  assert.equal(output.documentationReceipt.passed, true);
  assert.equal(JSON.parse(readFileSync(join(output.paths.appDirectory, "capture.json"))).schemaVersion, 1);
  assert.match(
    readFileSync(join(output.paths.appDirectory, "NativeV2ProductStore.swift"), "utf8"),
    /permissions\.request\(PermissionKey\(rawValue: "camera"\)\)/,
  );
  writeFileSync(join(output.paths.appDirectory, ".camo-native-pipeline.json"), "{}\n");
  assert.throws(
    () => materializeNativeConcept({ projectRoot, ...contracts(), fullContract: strongFullContract }),
    /ownership marker/,
  );
});

test("full materializer replaces preview tabs with five contracted roots and explicit state captures", () => {
  const projectRoot = mkdtempSync(join(tmpdir(), "camo-full-"));
  const output = materializeNativeConcept({ projectRoot, ...contracts(), fullContract: strongFullContract });
  assert.equal(output.blueprint.deliveryMode, "full");
  assert.equal(output.blueprint.navigation.rootTabs.length, 5);
  assert.equal(output.kernel.captureCatalog.scope, "full-expansion");
  assert.deepEqual(
    output.captureCatalog.drivers.map(item => item.id),
    strongFullContract.verification.captures.map(item => item.id),
  );
});
