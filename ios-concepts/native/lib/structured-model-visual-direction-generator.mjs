import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const nativeRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(readFileSync(join(nativeRoot, "schemas", "visual-direction.schema.json"), "utf8"));

export function visualDirectionGeneratorModelSchema(count = 3) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["directions"],
    properties: { directions: { type: "array", minItems: count, maxItems: count, items: structuredClone(schema) } },
  };
}

export function createStructuredModelVisualDirectionGenerator({ model }) {
  if (!model || typeof model.generateStructured !== "function") throw new TypeError(
    "model.generateStructured({ operation, input, schema }) is required",
  );
  return Object.freeze({
    autoRepairDirection: true,
    async generateDirections({ productContract, experienceContract, strategy, referenceProfileId, calibration }) {
      const result = await model.generateStructured({
        operation: "camo.native-visual-direction-generator.v1",
        input: {
          productContract,
          experienceContract,
          strategy,
          referenceProfileId,
          calibration,
          instructions: [
            strategy === "mimicry"
              ? "Create exactly one implementation direction derived from the approved golden calibration. Do not invent an alternative style or reinterpret the reference grammar."
              : "Create exactly three materially different visual directions for the same verified product and experience; do not change actions, navigation, copy meaning or product scope.",
            "Give every screen one explicit native component recipe and cover every applicable state from the Experience Contract.",
            strategy === "mimicry"
              ? "Remain visually close to the selected reference product. Use reference-flat chrome and bundled Lucide assets with semibold or bold weight."
              : "Use system navigation chrome, SF Symbols, native containers and restrained semantic color. Explicitly forbid decorative gradients, colored icon placeholders, generic hero cards, universal done copy and card-stack defaults.",
            "Prefer content hierarchy and native controls over decoration. Every token and component decision must cite product or experience evidence.",
            "Never score or select your own directions.",
          ],
        },
        schema: visualDirectionGeneratorModelSchema(strategy === "mimicry" ? 1 : 3),
      });
      return result.directions;
    },
  });
}
