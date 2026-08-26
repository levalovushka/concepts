import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const nativeRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(readFileSync(join(nativeRoot, "schemas", "experience-contract.schema.json"), "utf8"));
const planSchema = structuredClone(schema);
delete planSchema.properties.experienceContractId;
planSchema.required = planSchema.required.filter(item => item !== "experienceContractId");

export function experiencePlannerModelSchema() {
  return structuredClone(planSchema);
}

export function createStructuredModelExperiencePlanner({ model }) {
  if (!model || typeof model.generateStructured !== "function") throw new TypeError(
    "model.generateStructured({ operation, input, schema }) is required",
  );
  const instructions = [
    "Plan product experience before visual design. Do not choose colors, spacing, icons, cards or SwiftUI types.",
    "Every product action must map to an existing World Model action; navigation and denied fallbacks may be non-domain actions with deterministic outcomes.",
    "Authentication is mandatory, restores a local session, and reaches the first product surface without onboarding.",
    "Every screen must declare all nine canonical states, but applicability is sparse: collections may be empty, async product work may load/fail/go offline, and permission states belong only to the contextual request surface. System/external surfaces normally expose only populated/default. Never make all states applicable.",
    "Every capability must keep the exact World Model action, causal request trigger and denied fallback.",
    "Create canonical content records first. Every name, fact and media subject must keep the same record identity on every screen.",
    "Own navigation entry points explicitly. Competing routes to one destination require one primary action and a concrete product rationale for every secondary action.",
    "Give every screen a semantic blueprint: ordered content roles, one contextual primary action, secondary actions and prohibited failure patterns. Do not choose visual geometry.",
    "Define at least three executable end-to-end acceptance journeys. Their action sequence must be reachable and must cover every core World Model action.",
    "Every user-consent permission needs executable acceptance coverage for both its contextual trigger and its denied fallback. Do not treat plist keys, entitlements or adapters as UX evidence.",
  ];
  return Object.freeze({
    autoRepairTopology: true,
    async planExperience({ productContract, worldModel }) {
      return model.generateStructured({
        operation: "camo.native-product-integrity-planner.v2",
        input: {
          productContract,
          worldModel,
          instructions,
        },
        schema: planSchema,
      });
    },
    async reviseExperience({ productContract, worldModel, plan, diagnostics, attempt }) {
      return model.generateStructured({
        operation: "camo.native-product-integrity-reviser.v2",
        input: {
          productContract,
          worldModel,
          plan,
          diagnostics,
          attempt,
          instructions: [
            ...instructions,
            "A UI action belongs to exactly one surface. If the same intent is available on another screen, create a distinct action id owned by that screen.",
            "Multi-step email and OTP flows are valid, but the authenticate World Model action must transition to authentication.successSurface.",
            "Entry-point policies list only actions whose deterministic outcome crosses into that destination; do not list retries, mutation-only actions, back actions, or self-transitions.",
            "Every non-root, non-tab screen must be reachable through a concrete cross-screen action. Native tab destinations are reachable through their parent tab shell.",
            "Every blueprint action must be owned by that screen.",
            "Every consecutive journey action must belong to the screen reached by the previous action.",
            "Revise the complete plan so every supplied diagnostic is eliminated without deleting a core action, canonical state, required capability flow, or acceptance journey.",
            "Do not merely rename an invalid reference. Rebuild route ownership and journey order when necessary, then return the full corrected plan.",
          ],
        },
        schema: planSchema,
      });
    },
  });
}
