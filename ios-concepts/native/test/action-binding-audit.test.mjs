import test from "node:test";
import assert from "node:assert/strict";
import { auditActionBindings } from "../lib/action-binding-audit.mjs";

const manifest = {
  qualityContractVersion: 2,
  interactions: { actions: [{ surface: "home", id: "open", label: "Открыть", outcome: { type: "navigate", target: "detail" } }] },
};

test("strict apps must bind every declared action to one control", () => {
  const unbound = auditActionBindings(manifest, `Button("Открыть") {}`);
  assert.equal(unbound.includes("action home.open is declared but not bound to a control"), true);
  assert.equal(unbound.some(item => item.includes("dead button")), true);
  assert.deepEqual(auditActionBindings(manifest, `Button("Открыть") { route = "detail" }.nativeAction("home.open")`), []);
});

test("feedback is not accepted as the only product outcome", () => {
  const problems = auditActionBindings(
    { qualityContractVersion: 1, interactions: { actions: [] } },
    `Button("Открыть") { nav.toast("Готово") }`,
  );
  assert.equal(problems.some(item => item.includes("toast cannot be the product outcome")), true);
});

test("empty social callbacks and buttons cannot masquerade as working controls", () => {
  const emptyPost = auditActionBindings(
    { qualityContractVersion: 1, interactions: { actions: [] } },
    `VKPostActions(onLike: { liked.toggle() }, onComment: {}, onShare: {}, onSave: {})`,
  );
  assert.equal(emptyPost.filter(item => item.includes("dead product control")).length, 3);
  assert.equal(auditActionBindings(
    { qualityContractVersion: 1, interactions: { actions: [] } },
    `Button("Открыть") {}`,
  ).some(item => item.includes("dead button")), true);
  assert.equal(auditActionBindings(
    { qualityContractVersion: 1, interactions: { actions: [] } },
    `Button("Отмена", role: .cancel) {}`,
  ).some(item => item.includes("dead button")), false);
});
