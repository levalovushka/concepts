import test from "node:test";
import assert from "node:assert/strict";
import { auditActionBindings } from "../lib/action-binding-audit.mjs";

const manifest = {
  qualityContractVersion: 2,
  interactions: { actions: [{ surface: "home", id: "open", label: "Открыть", outcome: { type: "navigate", target: "detail" } }] },
};

test("strict apps must bind every declared action to one control", () => {
  assert.deepEqual(auditActionBindings(manifest, `Button("Открыть") {}`), [
    "action home.open is declared but not bound to a control",
  ]);
  assert.deepEqual(auditActionBindings(manifest, `Button("Открыть") {}.nativeAction("home.open")`), []);
});

test("feedback is not accepted as the only product outcome", () => {
  const problems = auditActionBindings(
    { qualityContractVersion: 1, interactions: { actions: [] } },
    `Button("Открыть") { nav.toast("Готово") }`,
  );
  assert.equal(problems.some(item => item.includes("toast cannot be the product outcome")), true);
});
