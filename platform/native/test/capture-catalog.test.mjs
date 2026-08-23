import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { compileNativeConcept } from "../lib/compile-concept.mjs";
import { compileCaptureCatalog, selectCaptureDrivers } from "../lib/capture-catalog.mjs";

const nativeRoot = join(import.meta.dirname, "..");
const looks = JSON.parse(readFileSync(join(nativeRoot, "../concepts/looks/concept.json"), "utf8"));
const source = JSON.parse(readFileSync(join(nativeRoot, "apps/looks/capture.json"), "utf8"));

test("capture drivers bind app launch routes to declared product states", () => {
  const manifest = compileNativeConcept(looks).manifest;
  const catalog = compileCaptureCatalog(manifest, source);

  assert.equal(catalog.ok, true);
  assert.equal(selectCaptureDrivers(catalog, ["chat"])[0].id, "chat--default");
  assert.equal(selectCaptureDrivers(catalog, ["wardrobe--populated"])[0].artifact, "wardrobe");
  assert.equal(catalog.missing.some(item => item.id === "search--loading"), true);
});
