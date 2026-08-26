import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { auditLightStatusBarScreenshot } from "../lib/capture-pixel-audit.mjs";

test("dvor root captures render a genuinely light status-bar surface", { skip: !existsSync(join(import.meta.dirname, "../artifacts/dvor/shots/home-default.png")) }, () => {
  for (const artifact of ["home-default", "chats-default", "yard-default", "menu-default"]) {
    const result = auditLightStatusBarScreenshot(join(import.meta.dirname, `../artifacts/dvor/shots/${artifact}.png`));
    assert.equal(result.ok, true, `${artifact}: only ${Math.round(result.whiteRatio * 100)}% of the status background is white`);
  }
});
