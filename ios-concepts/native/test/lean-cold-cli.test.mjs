import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const nativeRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

test("cold CLI persists one complete reproducible handoff receipt", () => {
  const output = mkdtempSync(join(tmpdir(), "lean-cold-cli-"));
  execFileSync(process.execPath, [
    join(nativeRoot, "lean-cold-cli.mjs"),
    "--prompt", "Fixture social product",
    "--target", "vkontakte",
    "--strategy", "mimicry",
    "--adapter", join(nativeRoot, "fixtures", "lean-cold", "adapter.mjs"),
    "--out", output,
  ], { encoding: "utf8" });
  const result = JSON.parse(readFileSync(join(output, "pipeline-result.json"), "utf8"));
  assert.equal(result.ok, true);
  assert.equal(result.readyForDeveloperHandoff, true);
  assert.deepEqual(result.measurements.map(item => item.id), ["product-blueprint", "native-build", "delivery-review"]);
  for (const file of ["01-request.json", "02-product-blueprint.json", "03-delivery-receipt.json", "04-visual-review.json"]) {
    assert.doesNotThrow(() => readFileSync(join(output, file), "utf8"));
  }
});
