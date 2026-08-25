import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(
  join(import.meta.dirname, "../ReferenceProfiles/vk-ios/Components.swift"),
  "utf8",
);
const mosaic = source.slice(source.indexOf("struct VKMosaic: View"), source.indexOf("private struct VKOptionalNativeAction"));
const model = readFileSync(join(import.meta.dirname, "../apps/looks/Model.swift"), "utf8");

test("search mosaic completes rows without shorter-column holes", () => {
  assert.doesNotMatch(mosaic, /offset % columns/,
    "independent modulo columns leave a white notch when the visible row has unequal heights");
  assert.match(mosaic, /private var rows: \[\[VKMosaicItem\]\]/);
  assert.match(mosaic, /let rowHeight = row\.map\(\\\.height\)\.max\(\)/);
  assert.match(mosaic, /VKMedia\(assetName: it\.assetName, height: rowHeight/);
});

test("search mosaic derives every cell from available width", () => {
  assert.match(mosaic, /GeometryReader \{ proxy in/);
  assert.match(mosaic, /proxy\.size\.width - gap \* CGFloat\(columns - 1\)/);
  assert.match(mosaic, /\.frame\(width: cellWidth\)/);
  assert.doesNotMatch(mosaic, /\.frame\(maxWidth: \.infinity\)/,
    "an unconstrained media label can make the three-column row wider than the screen");
});

test("repeated search matches do not collapse onto one photograph", () => {
  assert.match(model, /value \+ value \/ discovery\.count/,
    "media and outfit cycles must not alias every repeated query match to the same asset");
});
