import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compileProductBlueprint } from "../lib/lean-native-factory.mjs";
import { compileLeanProductUIContract, verifyLeanProductUIContract } from "../lib/lean-product-ui-contract.mjs";

const blueprint = JSON.parse(readFileSync(new URL("../ProductBlueprints/svoi-blueprint-v1-vk.json", import.meta.url)));

test("product UI contract closes recipes, actions, states and capability ownership before Swift", () => {
  const compiled = compileProductBlueprint(blueprint);
  assert.equal(compiled.ok, true);
  const contract = compileLeanProductUIContract(blueprint, compiled.manifest);
  assert.equal(verifyLeanProductUIContract(contract, blueprint).passed, true);
  assert.equal(contract.surfaces.find(item => item.screenId === "feed").recipe, "authoredFeed");
  assert.equal(contract.surfaces.find(item => item.screenId === "comments").recipe, "commentThread");
  assert.equal(contract.surfaces.find(item => item.screenId === "conversation").recipe, "conversation");
  const feed = contract.surfaces.find(item => item.screenId === "feed");
  assert.equal(feed.actions.find(item => item.id === "open_deed").effect.type, "navigate");
  assert.equal(feed.actions.find(item => item.id === "open_deed").effect.targetScreenId, "post_detail");
  assert.equal(feed.actions.find(item => item.id === "support_deed").effect.stateField, "isSupported");
  const camera = contract.surfaces.flatMap(item => item.actions).find(item => item.capabilities.some(capability => capability.key === "camera"));
  assert.equal(camera.capabilities.find(capability => capability.key === "camera").deniedFallback.length > 10, true);
});

test("product UI verifier rejects an action moved to another screen", () => {
  const compiled = compileProductBlueprint(blueprint);
  const contract = structuredClone(compileLeanProductUIContract(blueprint, compiled.manifest));
  contract.surfaces.find(item => item.screenId === "feed").actions = [];
  const result = verifyLeanProductUIContract(contract, blueprint);
  assert.equal(result.passed, false);
  assert.ok(result.problems.some(item => item.includes("feed: action ownership drift")));
});
