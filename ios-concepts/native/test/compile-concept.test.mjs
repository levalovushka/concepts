import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { compileNativeConcept } from "../lib/compile-concept.mjs";

const looks = JSON.parse(readFileSync(join(import.meta.dirname, "../../concepts/looks/concept.json"), "utf8"));

test("expands product permissions into build artifacts", () => {
  const concept = structuredClone(looks);
  concept.native = {
    schemaVersion: 1,
    platform: { minimumVersion: "26.0" },
    design: { strategy: "mimicry", referenceProfile: "vk-ios" },
    extensions: ["widget"],
  };
  const result = compileNativeConcept(concept);

  assert.equal(result.diagnostics.some(item => item.code === "capability.unsupported"), false);
  assert.deepEqual(
    result.manifest.capabilities.backgroundModes.sort(),
    ["audio", "fetch", "remote-notification", "voip"],
  );
  assert.equal(
    result.manifest.capabilities.entitlements.some(item => item.key === "com.apple.security.application-groups"),
    true,
  );
  assert.deepEqual(result.manifest.capabilities.extensionTargets.sort(), [
    "credential-provider", "notification-service", "share-extension", "widget",
  ]);
});

test("fails instead of silently accepting an unknown capability", () => {
  const concept = structuredClone(looks);
  concept.native = { schemaVersion: 1, design: { strategy: "mimicry", referenceProfile: "vk-ios" } };
  concept.permissions.push({
    key: "telepathy",
    feature: "Read minds",
    screen: "home",
    target: "home",
    alert: { text: "Read minds" },
  });
  const result = compileNativeConcept(concept);

  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "capability.unsupported"), true);
});

test("fails when native navigation points to a missing product surface", () => {
  const concept = structuredClone(looks);
  concept.native = {
    schemaVersion: 1,
    design: { strategy: "mimicry", referenceProfile: "vk-ios" },
    navigation: { tabs: [{ id: "ghost", label: "Ghost", screen: "ghost" }] },
  };
  const result = compileNativeConcept(concept);

  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "navigation.tab.surface-missing"), true);
});

test("requires a reference profile for mimicry but not differentiation", () => {
  const mimicry = structuredClone(looks);
  mimicry.native = { schemaVersion: 1, design: { strategy: "mimicry" } };
  assert.equal(
    compileNativeConcept(mimicry).diagnostics.some(item => item.code === "design.reference.required"),
    true,
  );

  const differentiation = structuredClone(looks);
  differentiation.native = { schemaVersion: 1, design: { strategy: "differentiation", character: ["editorial"] } };
  assert.equal(
    compileNativeConcept(differentiation).diagnostics.some(item => item.code === "design.reference.required"),
    false,
  );
});

test("blocks a mimicry profile until screenshot evidence is ready", () => {
  const concept = structuredClone(looks);
  concept.native.design.referenceProfile = "vk-music-ios";
  const result = compileNativeConcept(concept);
  assert.equal(result.ok, false);
  assert.equal(
    result.diagnostics.some(item => item.code === "design.reference.evidence-incomplete"),
    true,
  );
});

test("compiles every declared surface state into an explicit verification matrix", () => {
  const result = compileNativeConcept(structuredClone(looks));
  const expectedCount = result.manifest.surfaces.reduce(
    (count, surface) => count + surface.states.length,
    0,
  );

  assert.equal(result.manifest.verification.states.length, expectedCount);
  assert.deepEqual(
    result.manifest.verification.states.find(item => item.id === "search--loading"),
    {
      id: "search--loading",
      surface: "search",
      state: "loading",
      method: "screenshot",
      launch: { screen: "search", state: "loading" },
    },
  );
  assert.equal(
    result.manifest.verification.states.find(item => item.surface === "media").method,
    "contract",
  );
});

test("materialises extension copy for the current product", () => {
  const concept = structuredClone(looks);
  concept.name = "Двор";
  concept.slug = "dvor";
  const result = compileNativeConcept(concept);

  for (const extension of result.manifest.capabilities.extensions) {
    assert.equal(extension.displayName.includes("Образ"), false);
    assert.equal(extension.source.includes("Образов"), false);
  }
  assert.equal(
    result.manifest.capabilities.extensions.find(item => item.id === "widget").source.includes("dvor.summary"),
    true,
  );
});
