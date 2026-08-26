import test from "node:test";
import assert from "node:assert/strict";
import { resolveProductTarget } from "../lib/product-target-catalog.mjs";
import { compileProductBlueprint, verifyProductBlueprint } from "../lib/native-blueprint-compiler.mjs";

const request = { schemaVersion: 1, request: "A coherent social network", targetProduct: "vkontakte", strategy: "mimicry", capabilityPolicy: "all" };
const target = resolveProductTarget("vkontakte");
const blueprint = {
  schemaVersion: 1, id: "circles", name: "Круги", thesis: "Люди публикуют живой прогресс в малых кругах и получают конкретный ответ.",
  targetProduct: "vkontakte", strategy: "mimicry",
  audience: { who: "Люди в небольших знакомых кругах", need: "Получать конкретный ответ на живой прогресс" },
  world: {
    entities: [{ id: "person" }, { id: "circle" }, { id: "post" }],
    actions: [
      { id: "publish", entityId: "post", outcome: "Post appears in the selected circle feed" },
      { id: "open_comments", entityId: "post", outcome: "Comment thread opens with the response field focused" },
      { id: "respond_to_post", entityId: "post", outcome: "Response is attached to the original post" },
      { id: "return", entityId: "circle", outcome: "Unread circle activity becomes visible" },
    ],
  },
  coreLoop: { actionIds: ["publish", "respond_to_post", "return"], returnReason: "A useful response changes the author’s next step" },
  socialGrammar: { primarySurface: "feed", authorship: "person-or-community", feedbackModes: ["reaction", "comment"] },
  navigation: {
    rootTabs: ["feed", "discover", "create", "messages", "menu"].map(screenId => ({ screenId })),
    screens: [
      { id: "feed", actionIds: ["publish", "open_comments", "return"] },
      { id: "post_detail", actionIds: ["respond_to_post"] },
      { id: "discover", actionIds: [] }, { id: "create", actionIds: [] }, { id: "messages", actionIds: [] }, { id: "menu", actionIds: [] },
    ],
  },
  capabilities: target.permissions.map(item => ({
    key: item.key,
    actionId: "publish",
    observableResult: "The published post retains the capability result",
    fallback: "The post remains publishable without this capability",
    outcome: { entityId: "post", stateField: `${item.key}Result`, proof: "The result is persisted on the published post" },
    ...(item.key === "associateddomains" ? { configuration: { domains: ["applinks:circles.test"] } } : {}),
  })),
  states: ["feed", "post_detail", "discover", "create", "messages", "menu"].map(screenId => ({ screenId, variants: ["loading", "populated/default", "empty", "error", "offline"] })),
};

test("one Product Blueprint closes product, UX and complete target capability ownership", () => {
  assert.deepEqual(verifyProductBlueprint(blueprint, request, target), []);
  const missing = structuredClone(blueprint);
  missing.capabilities.pop();
  assert.match(verifyProductBlueprint(missing, request, target).at(-1).message, /Capability/);

  const permissionOnly = structuredClone(blueprint);
  delete permissionOnly.capabilities[0].outcome;
  assert.match(
    verifyProductBlueprint(permissionOnly, request, target).find(item => item.path === "capabilities.camera").message,
    /world entity/,
  );
});

test("blueprint compiler produces one native manifest without orchestration adapters", () => {
  const result = compileProductBlueprint(blueprint);
  assert.equal(result.ok, true);
  assert.equal(result.manifest.slug, "circles");
  assert.equal(result.manifest.capabilities.plans.length, target.permissions.length);
});
