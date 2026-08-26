import test from "node:test";
import assert from "node:assert/strict";
import { auditVKGoldenImplementation } from "../lib/vk-golden-implementation.mjs";

test("VK golden implementation rejects the generic profile produced by the failed cold run", () => {
  const diagnostics = auditVKGoldenImplementation({
    strategy: "mimicry",
    referenceProfile: "vk-ios",
    swiftSource: `
      struct ProfileView: View {
        var body: some View {
          Form { Text("Profile") }
            .navigationTitle("Profile")
        }
      }
    `,
  });
  assert.equal(diagnostics.some(item => item.message.includes("SwiftUI Form")), true);
  assert.equal(diagnostics.some(item => item.message.includes("automatic navigationTitle")), true);
  assert.equal(diagnostics.some(item => item.message.includes("VKGroup")), true);
});

test("VK golden implementation accepts the calibrated component family", () => {
  const diagnostics = auditVKGoldenImplementation({
    strategy: "mimicry",
    referenceProfile: "vk-ios",
    swiftSource: "VKRootSurface VKTabHeader VKAuthoredPost VKPostActions VKNavigationChrome VKModalChrome VKPrimaryActionArea VKGroup VKRow",
  });
  assert.deepEqual(diagnostics, []);
});

test("vertical slice requires only primitives applicable to its three proof surfaces", () => {
  const diagnostics = auditVKGoldenImplementation({
    strategy: "mimicry", referenceProfile: "vk-ios", deliveryMode: "slice",
    swiftSource: "VKRootSurface VKTabHeader VKAuthoredPost VKPrimaryActionArea VKGroup VKRow",
  });
  assert.deepEqual(diagnostics, []);
});

test("VK navigation modifier is the public use of the golden navigation chrome", () => {
  const diagnostics = auditVKGoldenImplementation({
    strategy: "mimicry", referenceProfile: "vk-ios", deliveryMode: "full",
    applicability: { recipes: ["authoredFeed", "publicationEditor"], presentations: ["tab", "push"] },
    swiftSource: "VKRootSurface VKTabHeader VKAuthoredPost VKPostActions .vkNavigation( VKModalChrome VKPrimaryActionArea VKGroup VKRow",
  });
  assert.deepEqual(diagnostics, []);
});
