import test from "node:test";
import assert from "node:assert/strict";
import {
  collectPassedTestNames, createNeutralMediaPlaceholderProvider, createNoMediaAssetProvider, NATIVE_RENDERER_INSTRUCTIONS, validateNativeSourceBundle,
  nativeRendererModelSchema,
} from "../lib/structured-model-native-renderer.mjs";
import { toStrictOutputSchema } from "../lib/codex-cli-structured-model.mjs";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const experience = {
  journeys: [
    { id: "read", actionIds: ["open"] },
    { id: "create", actionIds: ["compose", "publish"] },
    { id: "recover", actionIds: ["retry"] },
  ],
  states: [{
    screenId: "home",
    variants: [
      { id: "populated/default", applicable: true },
      { id: "empty", applicable: true },
      { id: "loading", applicable: false },
    ],
  }],
  content: { media: [{ id: "photo" }] },
};

function bundle() {
  return {
    slug: "new-concept",
    concept: { slug: "new-concept" },
    appFiles: [
      { path: "App.swift", contents: "import SwiftUI\n".repeat(8) },
      { path: "Home.swift", contents: "import SwiftUI\n".repeat(8) },
    ],
    uiTestFiles: [{ path: "JourneyTests.swift", contents: "import XCTest\n".repeat(8) }],
    journeyTests: experience.journeys.map(item => ({ journeyId: item.id, testName: `test_${item.id}` })),
    permissionJourneyTests: [],
    captureDrivers: { drivers: [
      { surface: "home", state: "populated/default", artifact: "home-default", requiresLayoutAudit: true, requiresTopSafeArea: true, expectedTopSurface: "light" },
      { surface: "home", state: "empty", artifact: "home-empty", requiresLayoutAudit: true, requiresTopSafeArea: true, expectedTopSurface: "light" },
    ] },
    surfaceOwnership: { product: ["home"] },
    assetBindings: [{ mediaId: "photo", assetName: "FeedPhoto" }],
  };
}

test("native source bundle must cover every journey, state and canonical media item", () => {
  const validate = value => validateNativeSourceBundle(value, experience, { compileConcept: false });
  assert.equal(validate(bundle()).slug, "new-concept");
  const missingJourney = bundle();
  missingJourney.journeyTests.pop();
  assert.throws(() => validate(missingJourney), /recover has no UI test mapping/);
  const missingState = bundle();
  missingState.captureDrivers.drivers.pop();
  assert.throws(() => validate(missingState), /home\|empty/);
  const missingMedia = bundle();
  missingMedia.assetBindings = [];
  assert.throws(() => validate(missingMedia), /photo has no reviewed asset binding/);
  const unauditedLayout = bundle();
  unauditedLayout.captureDrivers.drivers[0].requiresLayoutAudit = false;
  assert.throws(() => validate(unauditedLayout), /horizontal layout audit/);
  const unauditedStatusBar = bundle();
  delete unauditedStatusBar.captureDrivers.drivers[0].expectedTopSurface;
  assert.throws(() => validate(unauditedStatusBar), /status-bar surface audit/);
});

test("no-media provider fails closed instead of creating a visual placeholder", async () => {
  const provider = createNoMediaAssetProvider();
  await provider.materialize({ media: [] });
  await assert.rejects(provider.materialize({ media: [{ id: "photo" }] }), /real semantic media provider/);
});

test("neutral fallback materializes one uniform gray asset per semantic media binding", async () => {
  const root = mkdtempSync(join(tmpdir(), "camo-neutral-media-"));
  try {
    await createNeutralMediaPlaceholderProvider().materialize({
      root, slug: "new-concept", media: [{ id: "photo" }], bindings: [{ mediaId: "photo", assetName: "FeedPhoto" }],
    });
    const imageset = join(root, "native/apps/new-concept/Assets.xcassets/FeedPhoto.imageset");
    assert.equal(existsSync(join(imageset, "Contents.json")), true);
    assert.match(readFileSync(join(imageset, "placeholder.svg"), "utf8"), /fill="#E5E7EB"/);
    assert.doesNotMatch(readFileSync(join(imageset, "placeholder.svg"), "utf8"), /<text|<path|gradient/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("journey evidence counts passed XCUI test cases, not a successful build shell", () => {
  const names = collectPassedTestNames({ testNodes: [{ children: [
    { nodeType: "Test Case", name: "testRead()", result: "Passed" },
    { nodeType: "Test Case", name: "testCreate()", result: "Failed" },
  ] }] });
  assert.deepEqual([...names], ["testRead"]);
});

test("native renderer rejects false affordances before source generation", () => {
  const instructions = NATIVE_RENDERER_INSTRUCTIONS.join("\n");
  assert.match(instructions, /decorative or speculative tabs/);
  assert.match(instructions, /distinct meaningful content\/state/);
  assert.match(instructions, /exercised by an XCUI assertion/);
});

test("native renderer rejects generated-code and VK mimicry leakage", () => {
  const validate = value => validateNativeSourceBundle(value, experience, { compileConcept: false });

  const dense = bundle();
  dense.appFiles[0].contents += `\n${"x".repeat(181)}`;
  assert.throws(() => validate(dense), /180 character readability limit/);

  const internalCopy = bundle();
  internalCopy.appFiles[0].contents += '\nlet subtitle = "Демонстрационный профиль"\n';
  assert.throws(() => validate(internalCopy), /internal demo-data labels/);

  const wrongTabIcons = bundle();
  wrongTabIcons.concept.native = { design: { strategy: "mimicry" } };
  wrongTabIcons.appFiles[0].contents += '\nlet view = TabView { Text("Дом").tabItem { Label("Дом", systemImage: "house") } }\n';
  assert.throws(() => validate(wrongTabIcons), /Lucide asset catalog/);
});

test("native renderer output schema is closed and compatible with strict structured output", () => {
  const strict = toStrictOutputSchema(nativeRendererModelSchema());
  assert.equal(JSON.stringify(strict).includes('"concept":{"type":"object"}'), false);
  assert.equal(strict.properties.conceptJson, undefined);
  assert.equal(strict.properties.captureDrivers, undefined);
  assert.deepEqual(strict.required.sort(), ["appFiles", "journeyTests", "permissionJourneyTests", "uiTestFiles"]);
});
