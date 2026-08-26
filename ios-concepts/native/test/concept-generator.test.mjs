import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { generateNativeConcept, verifyNativeConceptSpec } from "../lib/concept-generator.mjs";

const spec = JSON.parse(readFileSync(new URL("../specs/estafeta.json", import.meta.url)));

test("one ConceptSpec compiles the full VK capability pack and native handoff", () => {
  assert.deepEqual(verifyNativeConceptSpec(spec), []);
  const projectRoot = mkdtempSync(join(tmpdir(), "camo-concept-"));
  const result = generateNativeConcept({ projectRoot, spec, execute: false });
  assert.equal(result.ok, true, result.diagnostics.map(item => item.message).join("\n"));
  assert.equal(result.capabilityPlan.bindings.length, 22);
  assert.deepEqual(
    new Set(result.capabilityPlan.bindings.map(item => item.key)),
    new Set(result.materialized.blueprint.capabilities.map(item => item.key)),
  );
  assert.equal(result.fullContract.rootTabs.length, 5);
  assert.equal(result.materialized.blueprint.navigation.screens.find(item => item.id === "services").recipe, "serviceMenu");
  assert.equal(result.materialized.blueprint.navigation.screens.find(item => item.id === "profile").recipe, "ownedProfile");
  assert.equal(result.materialized.blueprint.localization.length, result.fullContract.surfaces.length * 2);
  assert.equal(result.materialized.blueprint.fixtures.length, result.fullContract.surfaces.length);
  assert.equal(result.fullContract.surfaces.some(item => item.id === "accesses"), false);
  for (const binding of result.capabilityPlan.bindings) {
    const owner = result.fullContract.surfaces.find(item => item.actionIds.includes(binding.actionId));
    assert.ok(owner, `${binding.key} must be requested by a product feature`);
  }
  const screens = readFileSync(join(result.materialized.paths.appDirectory, "NativeV2ProductScreens.swift"), "utf8");
  assert.match(screens, /outcome\.permission\.keychain\.granted/);
  assert.match(screens, /outcome\.permission\.calendar\.granted/);
  assert.equal(result.sliceContract.surfaces.length, 3);
  assert.equal(result.materialized.documentationReceipt.passed, true);
});
