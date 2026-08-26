import { reviewProductUI } from "./product-ui-critic.mjs";

export function createLeanDeliveryReviewer({ critic }) {
  if (!critic?.review) throw new TypeError("Lean delivery reviewer needs an independent visual critic");
  return Object.freeze({
    async review({ blueprint, delivery, reference, calibration }) {
      const concept = {
        slug: blueprint.id,
        native: { design: { strategy: blueprint.strategy, referenceProfile: reference?.id || null, qualityFloor: 8.5 } },
        productDevelopment: {
          productContract: {
            contractId: `lean-${blueprint.id}`,
            productThesis: blueprint.thesis,
            delivery: { criticalFlows: blueprint.coreLoop.actionIds },
          },
        },
      };
      const result = await reviewProductUI({
        concept,
        captures: delivery.captures,
        integrityContract: {
          content: null,
          screenBlueprints: blueprint.navigation.screens.map(screen => ({ screenId: screen.id, actionIds: screen.actionIds })),
          entryPoints: blueprint.navigation.rootTabs,
          journeys: [{ id: "core-loop", actionIds: blueprint.coreLoop.actionIds }],
          calibration,
        },
        reviewer: critic,
      });
      return Object.freeze({
        passed: result.ok,
        receipt: result.receipt,
        blockers: result.diagnostics.map(item => `${item.code}: ${item.message}`),
      });
    },
  });
}
