import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "../..");

test("repository exposes exactly one native generation command", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const generationCommands = Object.keys(pkg.scripts).filter(name => /native|factory|product|compile|pipeline|generate/.test(name));
  assert.deepEqual(generationCommands, ["generate"]);
  assert.equal(pkg.scripts.generate, "node native/pipeline.mjs");
});

test("legacy generation entry points are absent from the active pipeline", () => {
  for (const path of ["concepts", "native/legacy-adapter", "native/adapters", "native/factory-cli.mjs", "native/pipeline-v2-cli.mjs"]) {
    assert.equal(existsSync(join(root, path)), false, `${path} must stay out of the standalone pipeline`);
  }
  const nativeEntries = readdirSync(join(root, "native")).filter(name => name.endsWith("-cli.mjs") || name === "pipeline.mjs");
  assert.deepEqual(nativeEntries, ["pipeline.mjs"]);
  assert.equal(existsSync(join(root, "native/Legacy/catalog.json")), true, "legacy outputs remain in an isolated read-only catalog");
});
