import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { compileCaptureCatalog, selectCaptureDrivers } from "../lib/capture-catalog.mjs";
import { compileProductBlueprint } from "../lib/native-blueprint-compiler.mjs";

const nativeRoot = join(import.meta.dirname, "..");
const blueprint = JSON.parse(readFileSync(join(nativeRoot, "ProductBlueprints/estafeta-vk.json"), "utf8"));
const source = JSON.parse(readFileSync(join(nativeRoot, "apps/estafeta/capture.json"), "utf8"));

test("generated capture drivers cover the compiled native blueprint", () => {
  const compiled = compileProductBlueprint(blueprint);
  assert.equal(compiled.ok, true);
  const catalog = compileCaptureCatalog(compiled.manifest, source);
  assert.equal(catalog.ok, true);
  assert.equal(catalog.missing.length, 0);
  assert.equal(selectCaptureDrivers(catalog, ["profile"])[0].surface, "profile");
});
