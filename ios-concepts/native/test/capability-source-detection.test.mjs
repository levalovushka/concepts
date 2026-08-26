import assert from "node:assert/strict";
import test from "node:test";
import { countCapabilityRequestHits } from "../lib/capability-source-detection.mjs";

test("permission audit recognizes shorthand and universal runtime-key dispatch", () => {
  assert.equal(countCapabilityRequestHits("await permissions.request(.camera)", "camera"), 1);
  assert.equal(countCapabilityRequestHits(
    'await permissions.request(PermissionKey(rawValue: "associateddomains"))',
    "associateddomains",
  ), 1);
  assert.equal(countCapabilityRequestHits('PermissionKey(rawValue: "camera")', "camera"), 0);
});
