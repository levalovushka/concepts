import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compileProductBlueprint } from "../lib/lean-native-factory.mjs";
import { compileLeanProductUIContract } from "../lib/lean-product-ui-contract.mjs";
import { compileLeanSwiftUIRecipes } from "../lib/lean-swiftui-recipe-compiler.mjs";

const blueprint = JSON.parse(readFileSync(new URL("../ProductBlueprints/svoi-blueprint-v1-vk.json", import.meta.url)));

test("SwiftUI recipe compiler owns typed routes and every product reducer without a model", () => {
  const compiled = compileProductBlueprint(blueprint);
  const contract = compileLeanProductUIContract(blueprint, compiled.manifest);
  const output = compileLeanSwiftUIRecipes({ blueprint, contract });
  const model = output.files.find(item => item.path === "GeneratedProductModel.swift").contents;
  assert.equal(output.receipt.modelGeneratedSwift, false);
  assert.equal(output.receipt.modelOwnedReducers, blueprint.world.actions.length);
  assert.match(model, /case openDeed = "open_deed"/);
  assert.match(model, /case \.openDeed:\n\s+route = \.postDetail/);
  assert.match(model, /case \.respondToPost:\n\s+collections\["comments", default: \[\]\]\.append/);
  assert.match(model, /case \.supportDeed:\n\s+flags\["isSupported", default: false\]\.toggle/);
  assert.match(model, /case \.captureDeedPhoto:\n\s+values\["localImagePath"\] = "enabled"/);
});

test("SwiftUI recipe compiler rejects navigation drift before source generation", () => {
  const broken = structuredClone(blueprint);
  broken.world.actions.find(item => item.id === "open_deed").effect.targetScreenId = "missing";
  const compiled = compileProductBlueprint(blueprint);
  const contract = compileLeanProductUIContract(blueprint, compiled.manifest);
  assert.throws(() => compileLeanSwiftUIRecipes({ blueprint: broken, contract }), /missing screen/);
});
