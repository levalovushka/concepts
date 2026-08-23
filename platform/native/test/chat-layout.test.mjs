import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const nativeRoot = join(import.meta.dirname, "..");

test("VK chat uses the compact profile header and top-flowing message groups", () => {
  const chat = readFileSync(join(nativeRoot, "apps/looks/Messaging.swift"), "utf8");
  const components = readFileSync(join(nativeRoot, "ReferenceProfiles/vk-ios/Components.swift"), "utf8");

  assert.match(components, /struct VKChatHeader:/, "VK profile must own its compact chat header");
  assert.match(chat, /VKChatHeader\(/, "chat must compose the reference header");
  assert.match(chat, /toolbar\(\.hidden, for: \.navigationBar\)/,
    "native glass toolbar must not compete with the VK chat contract");
  assert.doesNotMatch(chat, /minHeight:\s*geometry\.size\.height,\s*alignment:\s*\.bottom/,
    "short conversations must not create a large artificial gap above messages");
  assert.match(chat, /messageSpacingBefore\(/,
    "message groups need a deliberate inter-group rhythm");
});
