import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const nativeRoot = join(import.meta.dirname, "..");

test("VK push surfaces own their navigation chrome instead of inheriting glass toolbars", () => {
  const components = readFileSync(join(nativeRoot, "ReferenceProfiles/vk-ios/Components.swift"), "utf8");
  const screens = readFileSync(join(nativeRoot, "apps/looks/Screens.swift"), "utf8");

  assert.match(components, /struct VKNavigationChrome</,
    "the VK profile must own reusable push-screen navigation chrome");
  assert.match(screens, /\.vkNavigation\("\u0421\u0432\u043e\u043f\u044b \u0440\u044f\u0434\u043e\u043c"\)/,
    "nearby must use profile navigation");
  assert.match(screens, /\.vkNavigation\("\u0413\u0430\u0440\u0434\u0435\u0440\u043e\u0431"/,
    "wardrobe must use profile navigation");
  assert.doesNotMatch(screens, /navigationTitle\("\u0421\u0432\u043e\u043f\u044b \u0440\u044f\u0434\u043e\u043c"\)/,
    "native glass navigation must not leak onto nearby");
});
