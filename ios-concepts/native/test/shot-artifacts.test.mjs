import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { findIndistinguishableArtifacts, prepareShotArtifacts, shotArtifactDirectory } from "../lib/shot-artifacts.mjs";

test("verified screenshots survive project regeneration and partial recapture", () => {
  const root = mkdtempSync(join(tmpdir(), "camo-shot-artifacts-"));
  try {
    const directory = shotArtifactDirectory(root, "looks");
    assert.equal(directory.startsWith(join(root, "artifacts")), true,
      "review artifacts must live outside disposable build output");
    mkdirSync(directory, { recursive: true });
    const chat = join(directory, "chat.png");
    writeFileSync(chat, "verified-chat");

    prepareShotArtifacts(directory, ["profile"]);
    assert.equal(existsSync(chat), true, "partial recapture must preserve unrelated verified frames");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("declared product states cannot pass with byte-identical screenshots", () => {
  const directory = mkdtempSync(join(tmpdir(), "camo-shot-diff-"));
  try {
    writeFileSync(join(directory, "idle.png"), Buffer.from([1, 2, 3]));
    writeFileSync(join(directory, "success.png"), Buffer.from([1, 2, 3]));
    writeFileSync(join(directory, "error.png"), Buffer.from([3, 2, 1]));
    assert.deepEqual(
      findIndistinguishableArtifacts(directory, [["idle", "success", "error"]]),
      [["idle", "success"]],
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("partial recapture compares available states without requiring unrelated groups", () => {
  const directory = mkdtempSync(join(tmpdir(), "camo-shot-partial-diff-"));
  try {
    writeFileSync(join(directory, "phone--default.png"), Buffer.from([1, 2, 3]));
    writeFileSync(join(directory, "phone--error.png"), Buffer.from([1, 2, 3]));
    assert.deepEqual(
      findIndistinguishableArtifacts(directory, [
        ["phone--default", "phone--loading", "phone--error"],
        ["home--default", "home--empty"],
      ]),
      [["phone--default", "phone--error"]],
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
