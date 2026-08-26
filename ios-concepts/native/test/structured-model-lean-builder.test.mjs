import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createStructuredModelLeanBuilder, implementationBlueprint, repairSwiftBuilderBoundaries,
} from "../lib/structured-model-lean-builder.mjs";

test("repairs only lost SwiftUI result-builder boundaries", () => {
  assert.equal(
    repairSwiftBuilderBoundaries("List { Section { Text(\"A\") } } Section { Text(\"B\") }"),
    "List { Section { Text(\"A\") } }\nSection { Text(\"B\") }",
  );
  assert.equal(
    repairSwiftBuilderBoundaries("Button { submit() } label: { Text(\"Send\") }"),
    "Button { submit() } label: { Text(\"Send\") }",
  );
});

test("renderer context excludes handoff receipts but keeps implementation facts", () => {
  const compact = implementationBlueprint({
    schemaVersion: 1, id: "sample", name: "Sample", thesis: "Need", audience: "People",
    targetProduct: "vkontakte", strategy: "mimicry", world: { entities: [] }, coreLoop: {},
    socialGrammar: {}, navigation: { screens: [] }, capabilities: [], localization: [], fixtures: [],
    acceptanceScenarios: [], states: [], selectionReceipt: { giant: "receipt" }, delivery: { giant: "docs" },
  });
  assert.equal(compact.selectionReceipt, undefined);
  assert.equal(compact.delivery, undefined);
  assert.equal(compact.targetProduct, "vkontakte");
  assert.deepEqual(compact.navigation, { screens: [] });
});
import { resolveProductTarget } from "../lib/product-target-catalog.mjs";
import { resolveReferenceProfile } from "../lib/reference-profile-catalog.mjs";

const blueprint = JSON.parse(readFileSync(new URL("../ProductBlueprints/circles-vk.json", import.meta.url), "utf8"));
const target = resolveProductTarget("vkontakte");
const reference = resolveReferenceProfile(target.mimicryProfileId);

test("lean builder owns source materialization, execution and proof behind one build interface", async () => {
  const root = mkdtempSync(join(tmpdir(), "lean-builder-"));
  const model = { async generateStructured({ operation }) {
    assert.equal(operation, "camo.lean-native-swiftui-builder.v1");
    return {
      appFiles: [
        { path: "App.swift", contents: `import SwiftUI\nstruct ProductRoot: View { var body: some View { TabView { Text("Product") } } }\n// NativeEmailAuth NativeVisualLanguage.resolve CaptureIdentity.report CaptureIdentity.reportLayout\n` },
        { path: "Model.swift", contents: `import Foundation\nstruct ProductRecord: Identifiable { let id = UUID(); var title = "Product record with observable outcome" }\n` },
        { path: "Screens.swift", contents: `import SwiftUI\nstruct ProductScreen: View { var body: some View { Button("Open") { _ = true }.nativeAction("feed.open_post") } }\n` },
      ],
      uiTestFiles: [{ path: "SmokeTests.swift", contents: `import XCTest\nfinal class SmokeTests: XCTestCase { func testProductCoreLoop() { XCTAssertTrue(true) } }\n` }],
      smokeTestNames: ["testLocalAuthentication", "testProductCoreLoop", "testSettingsCapability"],
      screenImplementations: [],
      capabilityImplementations: [],
    };
  } };
  const executor = async ({ manifest, catalog, smokeTestNames }) => ({
    buildReceipt: { passed: true, projectPath: "/tmp/Product.xcodeproj", sourceHash: "abc12345" },
    interactionReceipt: { passed: true, testNames: smokeTestNames },
    captures: manifest.surfaces.map((item, index) => {
      const surface = item.id;
      const path = join(root, `${surface}.png`);
      const bytes = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(10_100, index + 1)]);
      writeFileSync(path, bytes);
      return { id: `${surface}--populated/default`, surface, state: "populated/default", path };
    }),
  });
  const builder = createStructuredModelLeanBuilder({ model, projectRoot: root, executor });
  const delivery = await builder.build({ blueprint: { ...blueprint, selectionReceipt: undefined }, target, reference, calibration: null });
  assert.equal(delivery.proof.passed, true);
  assert.equal(delivery.interactionReceipt.passed, true);
  assert.equal(delivery.documentationReceipt.passed, true);
  assert.ok(delivery.documentationReceipt.files.length >= 23);
  assert.ok(delivery.documentationReceipt.files.some(path => path.endsWith("19-testing-and-evidence.md")));
  assert.ok(delivery.documentationReceipt.files.some(path => path.endsWith("21-file-map.md")));
  assert.equal(delivery.documentationReceipt.files.some(path => path.endsWith("developer-guide.md")), false);
  assert.equal(delivery.captures.length, delivery.manifest.surfaces.length);
  assert.match(readFileSync(join(root, "native/ProductBlueprints/circles-vk.json"), "utf8"), /"selectionReceipt"|"schemaVersion"/);
});
