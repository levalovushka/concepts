import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { compileNativeConcept } from "../lib/compile-concept.mjs";

const source = JSON.parse(readFileSync(join(import.meta.dirname, "../../concepts/dvor/concept.json"), "utf8"));

function strictConcept() {
  const concept = structuredClone(source);
  // This test replaces the complete screen/action source. Drop the selected
  // product and explicit UX so the legacy compatibility compiler can derive a
  // matching test-only UX instead of correctly reporting source drift.
  delete concept.productDevelopment;
  delete concept.ux;
  concept.qualityContractVersion = 2;
  concept.uiContractVersion = 3;
  const roleFamilies = {
    "house-matters": "social-feed",
    "house-matter": "matter-summary",
    "incident-report": "form",
    infrastructure: "service-list",
    metering: "form",
    "house-access": "access-data",
    "yard-chronicle": "collection",
  };
  for (const screen of concept.screens) {
    if (["системная поверхность", "чужое приложение"].includes(screen.type)) continue;
    const isRoot = screen.type.includes("tab");
    const pattern = isRoot ? "collection" : "detail";
    screen.ui = {
      pattern,
      purpose: screen.native?.purpose,
      primaryAction: `Выполнить задачу экрана ${screen.id}`,
      hierarchy: { primary: `Главная задача ${screen.id}`, secondary: `Поддерживающая информация ${screen.id}` },
      density: "medium",
      componentFamilies: [roleFamilies[screen.native?.role] || (isRoot ? "collection" : "summary")],
      actions: [{
        id: `complete-${screen.id}`,
        label: `Выполнить задачу экрана ${screen.id}`,
        outcome: { type: "mutate", state: `completed-${screen.id}` },
        persistence: "local",
      }],
      contentCases: [
        { kind: "typical", example: `Обычные данные экрана ${screen.id}` },
        { kind: "stress", example: `Длинные данные и крупный текст экрана ${screen.id}` },
        { kind: "failure", example: `Ошибка или отказ на экране ${screen.id}` },
      ],
    };
  }
  return concept;
}

test("quality contract v2 blocks native generation without UI v3 intent", () => {
  const concept = structuredClone(source);
  concept.qualityContractVersion = 2;
  concept.uiContractVersion = 3;
  delete concept.screens.find(screen => screen.id === "settings").ui;
  const result = compileNativeConcept(concept);

  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "surface.ui-contract.required"), true);
});

test("surface contracts turn product roles into bounded compositions", () => {
  const result = compileNativeConcept(strictConcept());
  assert.equal(result.ok, true, result.diagnostics.map(item => item.message).join("\n"));

  const home = result.manifest.design.surfaceContracts.find(item => item.surface === "home");
  assert.deepEqual(home.composition, ["root-header", "context", "filters", "primary-feed"]);
  assert.equal(home.aboveFold.maxPreludeLayers, 2);
  assert.equal(home.aboveFold.mustExpose, "primary-feed");
  assert.equal(home.forbiddenFamilies.includes("stories"), true);
  assert.equal(home.source, "explicit-ui-v3");
});

test("reference mimicry cannot add an unearned component family", () => {
  const concept = strictConcept();
  concept.screens.find(screen => screen.id === "home").ui.componentFamilies = ["stories"];
  const result = compileNativeConcept(concept);

  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "surface.component-family.unearned"), true);
});

test("strict native generation rejects a composition without a proven recipe", () => {
  const concept = strictConcept();
  const screen = concept.screens.find(item => item.id === "settings");
  screen.ui.pattern = "dashboard-of-random-cards";
  const result = compileNativeConcept(concept);

  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "surface.composition-recipe.required"), true);
});

test("strict native generation rejects accidental component selection", () => {
  const concept = strictConcept();
  concept.screens.find(item => item.id === "settings").ui.componentFamilies = [];
  const result = compileNativeConcept(concept);

  assert.equal(result.ok, false);
  assert.equal(result.diagnostics.some(item => item.code === "surface.component-family.required"), true);
});
