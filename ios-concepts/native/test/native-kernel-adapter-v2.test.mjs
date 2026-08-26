import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { compileCapabilityPlanV2 } from "../lib/capability-plan-v2.mjs";
import { createProductCoreArtifact } from "../lib/product-core-v2.mjs";
import { createNativeKernelAdapterV2, materializeNativeFullV2, materializeNativeSliceV2 } from "../lib/native-kernel-adapter-v2.mjs";
import { portfolio, strongCapabilityProposal, strongCore, strongFullContract, strongSlice } from "../fixtures/pipeline-v2/strong-product.mjs";

function contracts() {
  const productCore = createProductCoreArtifact({ request: { id: "adapter-test" }, core: strongCore, portfolio }).artifact;
  const capabilityPlan = compileCapabilityPlanV2({
    productCoreArtifact: productCore, target: { permissions: [{ key: "camera" }] },
    proposal: strongCapabilityProposal, bundleId: "com.camo.neighbourpromises",
  }).plan;
  return { productCore, capabilityPlan, sliceContract: strongSlice };
}

test("materializer owns a complete compiler-generated vertical slice and refuses foreign app sources", () => {
  const projectRoot = mkdtempSync(join(tmpdir(), "native-v2-materializer-"));
  const output = materializeNativeSliceV2({ projectRoot, ...contracts() });
  assert.equal(output.documentationReceipt.passed, true);
  assert.equal(JSON.parse(readFileSync(join(output.paths.appDirectory, "capture.json"))).schemaVersion, 1);
  assert.match(
    readFileSync(join(output.paths.appDirectory, "NativeV2ProductStore.swift"), "utf8"),
    /permissions\.request\(PermissionKey\(rawValue: "camera"\)\)/,
  );
  writeFileSync(join(output.paths.appDirectory, ".native-pipeline-v2.json"), "{}\n");
  assert.throws(() => materializeNativeSliceV2({ projectRoot, ...contracts() }), /ownership marker/);
});

test("kernel adapter returns evidence from an injected executor through its single build seam", async () => {
  const projectRoot = mkdtempSync(join(tmpdir(), "native-v2-adapter-"));
  let received;
  const adapter = createNativeKernelAdapterV2({ projectRoot, executor(input) {
    received = input.materialized;
    return {
      buildReceipt: { passed: true }, interactionReceipt: { passed: true },
      documentationReceipt: input.materialized.documentationReceipt,
      captures: strongSlice.surfaces.map(surface => ({ id: `${surface.id}--populated/default` })),
    };
  } });
  const delivery = await adapter.buildSlice(contracts());
  assert.equal(delivery.buildReceipt.passed, true);
  assert.equal(received.kernel.receipt.modelGeneratedSwift, false);
  assert.equal(delivery.captures.length, 3);
});

test("full materializer replaces preview tabs with five contracted roots and explicit state captures", () => {
  const projectRoot = mkdtempSync(join(tmpdir(), "native-v2-full-"));
  const output = materializeNativeFullV2({ projectRoot, ...contracts(), fullContract: strongFullContract });
  assert.equal(output.blueprint.deliveryMode, "full");
  assert.equal(output.blueprint.navigation.rootTabs.length, 5);
  assert.equal(output.kernel.captureCatalog.scope, "full-expansion");
  assert.deepEqual(
    output.captureCatalog.drivers.map(item => item.id),
    strongFullContract.verification.captures.map(item => item.id),
  );
});
