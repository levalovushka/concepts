import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "../..");
const read = path => readFileSync(join(root, path), "utf8");

test("README download button and release script share one stable asset", () => {
  const readme = read("README.md");
  const release = read("launcher/RELEASE.md");
  const script = read("launcher/gen/package-release.mjs");
  const asset = "releases/latest/download/Camo-macOS.zip";
  assert.match(readme, new RegExp(asset.replaceAll(".", "\\.")));
  assert.match(release, new RegExp(asset.replaceAll(".", "\\.")));
  assert.match(script, /Camo-macOS\.zip/);
  assert.match(script, /CAMO_DEVELOPER_ID/);
  assert.match(script, /CAMO_NOTARY_PROFILE/);
  assert.match(script, /notarytool/);
  assert.match(script, /spctl/);
});
