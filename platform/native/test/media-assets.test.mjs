import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const nativeRoot = join(import.meta.dirname, "..");

test("content media uses product photographs and never colored icon placeholders", () => {
  const components = readFileSync(join(nativeRoot, "ReferenceProfiles/vk-ios/Components.swift"), "utf8");
  const model = readFileSync(join(nativeRoot, "apps/looks/Model.swift"), "utf8");
  const mediaBlock = components.slice(
    components.indexOf("struct VKMedia:"),
    components.indexOf("// MARK: - Сетка сервисов"),
  );

  assert.match(mediaBlock, /Image\(assetName\)/,
    "media must render a project image asset");
  assert.doesNotMatch(mediaBlock, /LinearGradient|systemName:\s*glyph|let p = \[/,
    "media must not fall back to a colored SF Symbol card");
  assert.match(model, /enum LooksMediaAssets/,
    "product data must own the mapping from content to photographs");
});
