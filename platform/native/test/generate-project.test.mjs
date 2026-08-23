import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const platformRoot = join(import.meta.dirname, "../..");
const buildRoot = join(platformRoot, "native/build/looks");

function plist(path) {
  return JSON.parse(execFileSync("plutil", ["-convert", "json", "-o", "-", path], { encoding: "utf8" }));
}

test("project generation materialises the compiled native manifest", () => {
  execFileSync(process.execPath, ["native/gen/gen-project.mjs", "looks"], { cwd: platformRoot });
  const manifest = JSON.parse(readFileSync(join(buildRoot, "native-manifest.json"), "utf8"));
  const info = plist(join(buildRoot, "Info.plist"));
  const entitlements = plist(join(buildRoot, "Looks.entitlements"));
  const generatedSwift = readFileSync(join(buildRoot, "App/Generated/NativeConceptSpec.swift"), "utf8");
  const designContract = JSON.parse(readFileSync(join(buildRoot, "design-contract.json"), "utf8"));
  const designBrief = readFileSync(join(buildRoot, "DESIGN-BRIEF.md"), "utf8");

  for (const item of manifest.capabilities.info) assert.deepEqual(info[item.key], item.value);
  assert.deepEqual(info.UIBackgroundModes.sort(), manifest.capabilities.backgroundModes.sort());
  for (const item of manifest.capabilities.entitlements) assert.deepEqual(entitlements[item.key], item.value);
  for (const tab of manifest.navigation.tabs) {
    assert.match(generatedSwift, new RegExp(`id: "${tab.id}"`));
    assert.match(generatedSwift, new RegExp(`screen: "${tab.screen}"`));
  }
  for (const contract of manifest.design.surfaceContracts) {
    assert.match(generatedSwift, new RegExp(`surface: "${contract.surface}"`));
    assert.match(generatedSwift, new RegExp(`primaryRegion: "${contract.primaryRegion}"`));
  }
  assert.equal(designContract.qualityFloor, 8);
  assert.equal(designContract.surfaces.length, manifest.surfaces.length);
  assert.match(designBrief, /Полезный контент в первом экране/);
  const project = readFileSync(join(buildRoot, "Looks.xcodeproj/project.pbxproj"), "utf8");
  for (const extension of manifest.capabilities.extensions) {
    const directory = join(buildRoot, "Extensions", extension.id);
    assert.equal(existsSync(join(directory, extension.sourceFile)), true);
    assert.equal(plist(join(directory, "Info.plist")).NSExtension.NSExtensionPointIdentifier, extension.extensionPoint);
    assert.match(project, new RegExp(`Looks${extension.productSuffix}\\.appex in Embed Foundation Extensions`));
  }
});
