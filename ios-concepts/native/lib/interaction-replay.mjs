const ENABLEMENT = new Map([
  ["always", () => true],
  ["input.email.valid", state => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(state.input?.email || "")],
  ["input.code.complete", state => /^\d{4}$/.test(state.input?.code || "")],
  ["input.message.nonEmpty", state => Boolean(state.input?.message?.trim())],
  ["venueNetworkJoined && !checking", state => state.product.venueNetworkJoined === true && state.checking !== true],
]);

function clone(value) { return JSON.parse(JSON.stringify(value)); }

/**
 * Deterministic interaction driver over the same contract seams as the app:
 * capability adapters, navigation, product mutation and persistence. It does
 * not pretend to verify UIKit hit-testing or TCC alert chrome.
 */
export function createInteractionReplay(manifest, adapters = {}) {
  const actions = new Map(manifest.interactions.actions.map(action => [`${action.surface}.${action.id}`, action]));
  const persisted = new Map(Object.entries(adapters.persisted || {}));
  const state = { input: {}, product: Object.fromEntries(persisted), phase: {}, route: null, handoff: null, checking: false };

  async function invoke(id) {
    const action = actions.get(id);
    if (!action) throw new Error(`unknown action ${id}`);
    const enabled = ENABLEMENT.get(action.enabledWhen);
    if (!enabled) throw new Error(`unsupported enabledWhen ${action.enabledWhen} for ${id}`);
    if (!enabled(state)) { state.phase[id] = "disabled"; return snapshot(); }

    if (action.execution === "async") {
      state.phase[id] = "loading";
      state.checking = true;
      const granted = await adapters.request?.(action.outcome.capability, id);
      state.checking = false;
      if (!granted) { state.phase[id] = "error"; return snapshot(); }
      applyOutcome(action.successOutcome || action.outcome);
      state.phase[id] = "success";
      return snapshot();
    }
    applyOutcome(action.outcome, action.persistence);
    state.phase[id] = "success";
    return snapshot();
  }

  function applyOutcome(outcome, persistence) {
    if (!outcome) return;
    if (outcome.type === "navigate") state.route = outcome.target;
    if (outcome.type === "dismiss") state.route = "dismissed";
    if (outcome.type === "external") state.handoff = { type: "external", destination: outcome.destination };
    if (outcome.type === "request") state.handoff = { type: "system", capability: outcome.capability };
    if (outcome.type === "mutate") {
      state.product[outcome.state] = true;
      if ((outcome.persistence || persistence) === "local") persisted.set(outcome.state, true);
    }
  }

  function fallback(id) {
    const action = actions.get(id);
    if (state.phase[id] !== "error") throw new Error(`fallback for ${id} requires error state`);
    const value = action?.failure?.fallback;
    if (!value) throw new Error(`missing fallback for ${id}`);
    state.handoff = clone(value);
    return snapshot();
  }

  function restore() {
    state.product = Object.fromEntries(persisted);
    state.phase = {};
    state.route = null;
    state.handoff = null;
    return snapshot();
  }

  function snapshot() { return clone(state); }
  return { state, persisted, invoke, fallback, restore, snapshot };
}
export async function replayScenario(manifest, scenario, adapters = {}) {
  const driver = createInteractionReplay(manifest, adapters);
  const frames = [];
  for (const step of scenario.steps) {
    if (step.do === "input") Object.assign(driver.state.input, step.value);
    else if (step.do === "product") Object.assign(driver.state.product, step.value);
    else if (step.do === "invoke") await driver.invoke(step.action);
    else if (step.do === "fallback") driver.fallback(step.action);
    else if (step.do === "restore") driver.restore();
    else if (step.do === "assert") {
      const parts = step.path.split(".");
      let actual = driver.state;
      while (parts.length && actual != null) {
        const joined = parts.join(".");
        if (Object.hasOwn(actual, joined)) { actual = actual[joined]; break; }
        actual = actual[parts.shift()];
      }
      if (JSON.stringify(actual) !== JSON.stringify(step.equals)) {
        throw new Error(`${scenario.id}: expected ${step.path} = ${JSON.stringify(step.equals)}, got ${JSON.stringify(actual)}`);
      }
    }
    else throw new Error(`unknown replay step ${step.do}`);
    frames.push(driver.snapshot());
  }
  return { driver, frames };
}
