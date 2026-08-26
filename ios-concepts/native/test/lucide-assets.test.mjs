import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadLucideSource, materializeLucideTabAssets } from "../lib/lucide-asset-catalog.mjs";
import { resolveReferenceProfile } from "../lib/reference-profile-catalog.mjs";

test("vendored Lucide source is pinned, local, safe and licensed", () => {
  const source = loadLucideSource();
  assert.equal(source.manifest.version, "0.525.0");
  assert.equal(source.manifest.license, "ISC");
  assert.deepEqual(Object.keys(source.icons).sort(), ["circle-play", "house", "layout-grid", "menu", "message-circle", "search"]);
});

test("VK tab assets regenerate deterministically as template vectors", () => {
  const first = mkdtempSync(join(tmpdir(), "lucide-assets-a-"));
  const second = mkdtempSync(join(tmpdir(), "lucide-assets-b-"));
  const config = resolveReferenceProfile("vk-ios").native.iconography;
  const namesA = materializeLucideTabAssets(first, config);
  const namesB = materializeLucideTabAssets(second, config);
  assert.equal(namesA.length, 12);
  assert.deepEqual(namesA, namesB);
  for (const name of namesA) {
    const a = readFileSync(join(first, `${name}.imageset`, `${name}.svg`), "utf8");
    const b = readFileSync(join(second, `${name}.imageset`, `${name}.svg`), "utf8");
    assert.equal(a, b);
    const metadata = JSON.parse(readFileSync(join(first, `${name}.imageset`, "Contents.json"), "utf8"));
    assert.equal(metadata.properties["template-rendering-intent"], "template");
    assert.equal(metadata.properties["preserves-vector-representation"], true);
  }
  assert.equal(config.tabRoles["house-matters"], "house");
  assert.equal(config.tabRoles.infrastructure, "layout-grid");
  const source = readFileSync(join(import.meta.dirname, "../apps/estafeta/NativeV2ProductScreens.swift"), "utf8");
  assert.match(source, /requiredTabIconAsset/);
  assert.doesNotMatch(source, /Label\([^\n]+systemImage:/, "generated tab bar must not fall back to SF Symbols");
});

test("selected Lucide tab glyphs are optically heavier without changing the 24pt box", () => {
  const out = mkdtempSync(join(tmpdir(), "lucide-weight-"));
  const config = resolveReferenceProfile("vk-ios").native.iconography;
  materializeLucideTabAssets(out, config);
  const regular = readFileSync(join(out, "lucide.tab.house.regular.imageset", "lucide.tab.house.regular.svg"), "utf8");
  const selected = readFileSync(join(out, "lucide.tab.house.selected.imageset", "lucide.tab.house.selected.svg"), "utf8");
  assert.match(regular, /viewBox="0 0 24 24"/);
  assert.match(selected, /viewBox="0 0 24 24"/);
  assert.match(regular, /stroke-width="2"/);
  assert.match(selected, /stroke-width="2.5"/);
});

test("differentiation does not materialize Lucide product chrome", () => {
  const out = mkdtempSync(join(tmpdir(), "lucide-differentiation-"));
  assert.deepEqual(materializeLucideTabAssets(out, null), []);
});
