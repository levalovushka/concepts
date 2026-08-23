import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { compileNativeConcept } from "../lib/compile-concept.mjs";
import { compileCaptureCatalog } from "../lib/capture-catalog.mjs";

test("Dvor capture catalog covers every declared screenshot state", () => {
  const concept = JSON.parse(readFileSync(join(import.meta.dirname, "../../concepts/dvor/concept.json"), "utf8"));
  const source = JSON.parse(readFileSync(join(import.meta.dirname, "../apps/dvor/capture.json"), "utf8"));
  const compiled = compileNativeConcept(concept);
  const catalog = compileCaptureCatalog(compiled.manifest, source);

  assert.equal(catalog.ok, true, JSON.stringify(catalog.diagnostics, null, 2));
  assert.deepEqual(catalog.missing.map(item => item.id), []);
  assert.equal(catalog.drivers.some(item => item.surface === "scan" && item.supplemental), true);
});
