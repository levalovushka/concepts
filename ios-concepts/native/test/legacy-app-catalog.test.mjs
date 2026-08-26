import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadLegacyApp, loadLegacyCatalog } from "../lib/legacy-app-catalog.mjs";
import { auditVisualCalibrationCatalog } from "../lib/visual-calibration-catalog.mjs";

const nativeRoot = join(import.meta.dirname, "..");

test("all pre-refactor Swift applications remain isolated and discoverable", () => {
  const catalog = loadLegacyCatalog(nativeRoot);
  assert.deepEqual(catalog.map(item => item.slug), [
    "circles", "dvor", "looks", "nakat", "peresmenka", "tails", "today", "vk-neighbor-help",
  ]);
  assert.deepEqual(readdirSync(join(nativeRoot, "apps")), ["estafeta"]);
  for (const entry of catalog) assert.equal(existsSync(entry.appPath), true);
});

test("Looks is the explicit, complete VK mimicry reference", () => {
  const looks = loadLegacyApp(nativeRoot, "looks");
  assert.equal(looks.name, "Образы");
  assert.equal(looks.isMimicryReference, true);
  assert.equal(looks.mode, "mimicry");
  assert.equal(looks.tabs.length, 5);
  assert.equal(auditVisualCalibrationCatalog().length, 0);
});

test("launcher separates legacy discovery and build from the active pipeline", () => {
  const model = readFileSync(join(nativeRoot, "../launcher/App/Model.swift"), "utf8");
  const runner = readFileSync(join(nativeRoot, "../launcher/App/Runner.swift"), "utf8");
  assert.match(model, /Legacy-приложения/);
  assert.match(model, /vk-mimicry-golden/);
  assert.match(runner, /concept\.isLegacy \? "gen-legacy-project\.mjs" : "gen-project\.mjs"/);
});
