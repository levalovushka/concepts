import test from "node:test";
import assert from "node:assert/strict";
import { compileActionContracts } from "../lib/action-contract.mjs";

const surface = { id: "home", presentation: "tab" };

function concept(actions, primaryAction = "Открыть дело") {
  return {
    qualityContractVersion: 2,
    screens: [{ id: "home", ui: { primaryAction, actions } }],
  };
}

test("feedback-only buttons are not valid product outcomes", () => {
  const result = compileActionContracts(concept([
    { id: "bell", label: "Уведомления", outcome: { type: "toast" } },
  ]), [surface], []);

  assert.equal(result.diagnostics.some(item => item.code === "action.outcome.invalid"), true);
});

test("primary action must bind to a declared deterministic effect", () => {
  const result = compileActionContracts(concept([
    { id: "open", label: "Что-то другое", outcome: { type: "mutate", state: "opened" } },
  ]), [surface], []);

  assert.equal(result.diagnostics.some(item => item.code === "surface.primary-action.unbound"), true);
});

test("navigation action cannot point to an arbitrary or missing screen", () => {
  const result = compileActionContracts(concept([
    { id: "open", label: "Открыть дело", outcome: { type: "navigate", target: "first-random-item" } },
  ]), [surface], []);

  assert.equal(result.diagnostics.some(item => item.code === "action.target.missing"), true);
});

test("mutation must declare where its result persists", () => {
  const result = compileActionContracts(concept([
    { id: "open", label: "Открыть дело", outcome: { type: "mutate", state: "opened" } },
  ]), [surface], []);

  assert.equal(result.diagnostics.some(item => item.code === "action.persistence.required"), true);
});

test("async action must define complete states, failure copy, and retry", () => {
  const result = compileActionContracts(concept([
    {
      id: "open",
      label: "Открыть дело",
      outcome: { type: "mutate", state: "opened" },
      execution: "async",
      persistence: "server",
      states: ["idle", "loading", "success"],
    },
  ]), [surface], []);

  assert.equal(result.diagnostics.some(item => item.code === "action.async-state.required"), true);
  assert.equal(result.diagnostics.some(item => item.code === "action.failure-message.required"), true);
  assert.equal(result.diagnostics.some(item => item.code === "action.retry.required"), true);
});

test("complete async contract passes the lifecycle gate", () => {
  const result = compileActionContracts(concept([
    {
      id: "open",
      label: "Открыть дело",
      outcome: { type: "mutate", state: "opened" },
      execution: "async",
      persistence: "server",
      states: ["idle", "loading", "success", "error"],
      failure: { message: "Не удалось открыть дело.", retry: true },
    },
  ]), [surface], []);

  assert.equal(result.diagnostics.length, 0);
});
