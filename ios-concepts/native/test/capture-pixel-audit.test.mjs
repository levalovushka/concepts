import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { auditLightStatusBarScreenshot } from "../lib/capture-pixel-audit.mjs";

const shots = join(import.meta.dirname, "../artifacts/estafeta/shots");

test("generated root captures render a genuinely light status-bar surface", { skip: !existsSync(join(shots, "relay-feed--populated-default.png")) }, () => {
  for (const artifact of ["relay-feed--populated-default", "discover--populated-default", "services--populated-default"]) {
    const result = auditLightStatusBarScreenshot(join(shots, `${artifact}.png`));
    assert.equal(result.ok, true, `${artifact}: only ${Math.round(result.whiteRatio * 100)}% of the status background is white`);
  }
});
