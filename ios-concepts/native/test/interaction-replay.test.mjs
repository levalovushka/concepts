import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compileNativeConcept } from "../lib/compile-concept.mjs";
import { replayScenario } from "../lib/interaction-replay.mjs";

const root = new URL("../../", import.meta.url);
const concept = JSON.parse(readFileSync(new URL("concepts/looks/concept.json", root)));
const manifest = compileNativeConcept(concept).manifest;
const replaySource = JSON.parse(readFileSync(new URL("native/apps/looks/interaction-replays.json", root)));

test("Looks replay schema covers every primary action exactly once", () => {
  assert.equal(replaySource.schemaVersion, 2);
  const primary = manifest.interactions.actions
    .filter(action => action.variant === "primary")
    .map(action => `${action.surface}.${action.id}`).sort();
  const covered = replaySource.scenarios.flatMap(item => item.covers || [])
    .filter(id => primary.includes(id)).sort();
  assert.deepEqual(covered, primary);
  for (const scenario of replaySource.scenarios) {
    assert.ok(scenario.steps.some(step => step.do === "assert"), `${scenario.id} has no outcome assertion`);
  }
});

for (const scenario of replaySource.scenarios) {
  test(`replay proves ${scenario.id}`, async () => {
    const answers = [...(scenario.adapterAnswers || [])];
    const result = await replayScenario(manifest, scenario, {
      request: async () => answers.length ? answers.shift() : true,
    });
    assert.ok(result.frames.length > 0);
    assert.equal(answers.length, 0, `${scenario.id} did not exercise every adapter result`);
  });
}
