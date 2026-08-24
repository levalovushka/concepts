import test from "node:test";
import assert from "node:assert/strict";
import { auditReferenceProfiles, resolveReferenceProfile } from "../lib/reference-profile-catalog.mjs";

test("VK profile is evidence-backed", () => {
  const vk = auditReferenceProfiles().find(profile => profile.id === "vk-ios");
  assert.equal(vk.ready, true, vk.blockers.join("\n"));
  assert.equal(resolveReferenceProfile("vk-ios").swiftSources.length > 0, true);
});

test("music, video and OK stay blocked until real evidence exists", () => {
  for (const id of ["vk-music-ios", "vk-video-ios", "ok-ios"]) {
    const profile = auditReferenceProfiles().find(item => item.id === id);
    assert.equal(profile.ready, false);
    assert.equal(profile.blockers.length > 0, true);
  }
});
