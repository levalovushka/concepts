import { readFileSync } from "node:fs";

const blueprint = JSON.parse(readFileSync(new URL("../../ProductBlueprints/circles-vk.json", import.meta.url), "utf8"));

export const architect = Object.freeze({
  async design({ request }) {
    return { ...structuredClone(blueprint), targetProduct: request.targetProduct, strategy: request.strategy };
  },
});

export const builder = Object.freeze({
  async build({ blueprint: product }) {
    return {
      slug: product.id,
      buildReceipt: { passed: true, projectPath: "/fixture/Circles.xcodeproj", sourceHash: "fixture-source" },
      interactionReceipt: { passed: true, testNames: ["auth", "core-loop", "capabilities"] },
      documentationReceipt: { passed: true, directory: "/fixture/Documentation", files: [] },
      captures: product.navigation.screens.map(({ id: surface }) => ({ surface, path: `/fixture/${surface}.png` })),
      proof: { passed: true, diagnostics: [] },
    };
  },
});

export const reviewer = Object.freeze({
  async review() { return { passed: true, blockers: [], receipt: { reviewer: "fixture-independent-reviewer" } }; },
});
