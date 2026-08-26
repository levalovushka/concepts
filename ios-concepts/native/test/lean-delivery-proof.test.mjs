import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createLeanDeliveryProof, selectCoreProofSurfaces } from "../lib/lean-delivery-proof.mjs";

const manifest = {
  slug: "sample",
  product: { evidenceScreens: ["feed", "detail", "compose", "settings"] },
  navigation: { tabs: [{ screen: "feed" }] },
  surfaces: ["feed", "detail", "compose", "settings"].map(id => ({ id, presentation: id === "compose" ? "sheet" : "tab" })),
};

function png(seed) {
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(10_100, seed)]);
}

test("core proof selection follows product evidence instead of arbitrary screen count", () => {
  assert.deepEqual(selectCoreProofSurfaces(manifest), ["feed", "detail", "compose", "settings"]);
});

test("delivery proof records current distinct PNG evidence but never impersonates visual review", () => {
  const directory = mkdtempSync(join(tmpdir(), "lean-proof-"));
  const captures = ["feed", "detail", "compose", "settings"].map((surface, index) => {
    const path = join(directory, `${surface}.png`);
    writeFileSync(path, png(index + 1));
    return { id: `${surface}--populated/default`, surface, path };
  });
  const result = createLeanDeliveryProof({ manifest, buildReceipt: { passed: true }, captures, durationMs: 123.7 });
  assert.equal(result.passed, true);
  assert.equal(result.deliveryLevel, "engineered-preview");
  assert.equal(result.independentVisualReview.passed, false);
  assert.equal(result.captures.length, 4);
  assert.equal(result.durationMs, 124);
});

test("delivery proof fails closed for reused pixels and absent build evidence", () => {
  const directory = mkdtempSync(join(tmpdir(), "lean-proof-"));
  const path = join(directory, "same.png");
  writeFileSync(path, png(1));
  const result = createLeanDeliveryProof({
    manifest,
    buildReceipt: { passed: false },
    captures: ["feed", "detail", "compose"].map(surface => ({ id: surface, surface, path })),
  });
  assert.equal(result.passed, false);
  assert.equal(result.diagnostics.some(item => item.code === "proof.build.required"), true);
  assert.equal(result.diagnostics.some(item => item.code === "proof.capture.duplicate"), true);
});
