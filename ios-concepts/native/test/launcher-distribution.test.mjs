import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..", "..");
const generator = readFileSync(join(root, "launcher", "gen", "gen-launcher.mjs"), "utf8");
const distribution = readFileSync(join(root, "launcher", "App", "Distribution.swift"), "utf8");
const detail = readFileSync(join(root, "launcher", "App", "Detail.swift"), "utf8");
const files = readFileSync(join(root, "launcher", "App", "ProjectFiles.swift"), "utf8");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

test("TestFlight launcher is sandboxed and carries an exportable Developer Kit", () => {
  assert.match(generator, /CAMO_DISTRIBUTION/);
  assert.match(generator, /com\.apple\.security\.app-sandbox/);
  assert.match(generator, /com\.apple\.security\.files\.user-selected\.read-write/);
  assert.match(generator, /DeveloperKit in Resources/);
  assert.match(generator, /CAMO_TESTFLIGHT_CATALOG/);
  assert.equal(pkg.scripts["launcher:testflight"].includes("CAMO_DISTRIBUTION=testflight"), true);
  assert.equal(pkg.scripts["launcher:archive:testflight"].includes("archive-testflight.mjs"), true);
});

test("catalog exports source while local launcher retains its toolchain runner", () => {
  assert.match(distribution, /exportKitAndOpen/);
  assert.match(distribution, /xcodeProject/);
  assert.match(detail, /LauncherDistribution\.canRunToolchain/);
  assert.match(detail, /ProjectFilesTab/);
  assert.match(files, /native\/apps/);
  assert.match(files, /native\/build/);
});
