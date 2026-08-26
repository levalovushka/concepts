import assert from "node:assert/strict";
import test from "node:test";
import { NATIVE_VISUAL_REVIEW_V2_AXES, createNativeVisualReviewPacketV2, verifyNativeVisualReviewV2 } from "../lib/native-visual-review-v2.mjs";

const packet = createNativeVisualReviewPacketV2({
  spec: {
    id: "relay", targetProduct: "vkontakte", strategy: "mimicry",
    product: { name: "Relay", thesis: "A friend passes a visible contribution", audience: { who: "Friends", need: "Continue together" }, coreLoop: { actionIds: ["open", "capture", "pass"] } },
  },
  fullContract: {
    surfaces: [
      { id: "feed", role: "entry", recipe: "authoredFeed", states: ["populated/default"], actionIds: ["open"], content: { headline: "Relay", body: "Open", mediaPlaceholder: "Media" } },
      { id: "capture", role: "result", recipe: "completion", states: ["populated/default"], actionIds: ["capture", "camera", "photos"], content: { headline: "Capture", body: "Add" } },
      { id: "handoff", role: "action", recipe: "recipientPicker", states: ["populated/default"], actionIds: ["pass", "contacts"], content: { headline: "Pass", body: "Choose" } },
      { id: "settings", role: "support", recipe: "settings", states: ["populated/default"], actionIds: ["push"], content: { headline: "Settings", body: "Configure" } },
    ],
    transitions: [
      { from: "feed", to: "capture", actionId: "open" },
      { from: "capture", to: "handoff", actionId: "capture" },
    ],
  },
  capabilityPlan: { bindings: [
    { key: "camera", actionId: "camera" }, { key: "photos", actionId: "photos" },
    { key: "contacts", actionId: "contacts" }, { key: "push", actionId: "push" },
  ] },
  delivery: {
    buildReceipt: { passed: true }, interactionReceipt: { passed: true },
    captures: [
      { id: "feed--populated/default", surface: "feed", state: "populated/default", path: "/tmp/feed.png", sha256: "a" },
      { id: "capture--populated/default", surface: "capture", state: "populated/default", path: "/tmp/capture.png", sha256: "b" },
      { id: "handoff--populated/default", surface: "handoff", state: "populated/default", path: "/tmp/handoff.png", sha256: "c" },
      { id: "settings--populated/default", surface: "settings", state: "populated/default", path: "/tmp/settings.png", sha256: "d" },
    ],
  },
});

function review({ score = 9, independent = true, verdict = "clean", findings = [] } = {}) {
  return {
    mode: "release", iteration: 2, verdict,
    reviewer: { name: "independent-vision", captureInspection: "vision", independentFromGenerator: independent },
    axes: NATIVE_VISUAL_REVIEW_V2_AXES.map(id => ({ id, score, rationale: `Visible evidence supports a coherent ${id} across every capture.` })),
    captures: packet.captures.map(item => ({ captureId: item.id, summary: "The visible task, hierarchy and next action are clear." })),
    findings,
  };
}

test("release review passes only with every real capture and every axis above 8.5", () => {
  const result = verifyNativeVisualReviewV2({ packet, review: review() });
  assert.equal(result.passed, true, JSON.stringify(result.diagnostics));
});

test("visual gate returns a bounded repair brief instead of averaging blockers away", () => {
  const result = verifyNativeVisualReviewV2({ packet, review: review({
    score: 8.4, independent: false, verdict: "blockers",
    findings: [{ code: "media-empty", severity: "major", captureIds: [packet.captures[0].id], problem: "Media has no visible weight", recommendation: "Attach a deterministic media placeholder to the authored post" }],
  }) });
  assert.equal(result.passed, false);
  assert.equal(result.repairBrief[0].code, "media-empty");
  assert.equal(result.diagnostics.some(item => item.code === "review.independence"), true);
});
