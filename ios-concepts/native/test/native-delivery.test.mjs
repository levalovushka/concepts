import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { verifyNativeDelivery } from "../lib/native-delivery.mjs";

function concept() {
  return {
    native: { navigation: { tabs: [{ id: "home", systemImage: "house" }] }, deliveryIdentity: {
      coreSurfaces: ["home"], requiredVocabulary: ["питомец", "прогул"],
      forbiddenVocabulary: ["тренч"], firstFrame: { surface: "home", mustExpose: ["прогул"] },
    } },
    ux: { fixtures: [{ surface: "home", state: "default", data: { headline: "Питомец ищет прогулку рядом" } }] },
  };
}

test("native delivery rejects a specification viewer as production UI", () => {
  const directory = mkdtempSync(join(tmpdir(), "camo-delivery-"));
  writeFileSync(join(directory, "App.swift"), "struct App { var body: some View { ManifestConceptRootView() } }\n");
  const result = verifyNativeDelivery(concept(), directory);
  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "delivery.generic-renderer.forbidden"), true);
});

test("differentiation cannot silently inherit the VK product shell", () => {
  const directory = mkdtempSync(join(tmpdir(), "camo-delivery-"));
  writeFileSync(join(directory, "App.swift"), "struct TodayHome: View { var body: some View { VKTabHeader(title: \"Сегодня\") {}.nativeSurface(\"home\") } }\n");
  const input = concept();
  input.native.design = { strategy: "differentiation" };
  const result = verifyNativeDelivery(input, directory);
  assert.equal(result.diagnostics.some(item => item.code === "delivery.differentiation.reference-shell-forbidden"), true);
});

test("native delivery fails closed on cross-product fixtures and unrealized core surfaces", () => {
  const directory = mkdtempSync(join(tmpdir(), "camo-delivery-"));
  writeFileSync(join(directory, "App.swift"), "struct TailsHome: View { var body: some View { Text(\"Хвосты\") } }\n");
  const input = concept();
  input.ux.fixtures[0].data.headline = "Тренч для питомца";
  const result = verifyNativeDelivery(input, directory);
  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "delivery.fixture.cross-product-contamination"), true);
  assert.equal(result.diagnostics.some(item => item.code === "delivery.core-surface.unrealized"), true);
  assert.equal(result.diagnostics.some(item => item.code === "delivery.first-frame.promise-missing"), true);
});

test("owned product realization passes through the small delivery interface", () => {
  const directory = mkdtempSync(join(tmpdir(), "camo-delivery-"));
  writeFileSync(join(directory, "App.swift"), "struct TailsHome: View { var body: some View { Text(\"Прогулка\").nativeSurface(\"home\") } }\n");
  const result = verifyNativeDelivery(concept(), directory);
  assert.equal(result.ok, true, JSON.stringify(result.diagnostics));
});

test("native delivery rejects placeholder tab symbols", () => {
  const directory = mkdtempSync(join(tmpdir(), "camo-delivery-"));
  writeFileSync(join(directory, "App.swift"), "struct Home: View { var body: some View { Text(\"Прогулка\").nativeSurface(\"home\") } }\n");
  const input = concept();
  input.native.navigation.tabs[0].systemImage = "circle";
  const result = verifyNativeDelivery(input, directory);
  assert.equal(result.diagnostics.some(item => item.code === "delivery.navigation.placeholder-icon"), true);
});

test("native delivery rejects a raw permission pre-prompt in the first frame", () => {
  const directory = mkdtempSync(join(tmpdir(), "camo-delivery-"));
  writeFileSync(join(directory, "App.swift"), "struct Home: View { var body: some View { NativeCapabilityControls(surfaceID: \"home\").nativeSurface(\"home\") } }\n");
  const result = verifyNativeDelivery(concept(), directory);
  assert.equal(result.diagnostics.some(item => item.code === "delivery.first-frame.permission-preprompt"), true);
});
