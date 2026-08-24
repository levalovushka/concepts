import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const nativeRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const candidateSchema = JSON.parse(readFileSync(join(nativeRoot, "schemas", "concept-candidate.schema.json"), "utf8"));

// Provider-neutral adapter factory. The caller supplies a real model client;
// Camo supplies the bounded operation, deterministic schema, and rubric.
export function createStructuredModelProductGenerator({ model }) {
  if (!model || typeof model.generateStructured !== "function") {
    throw new TypeError("model.generateStructured({ operation, input, schema }) is required");
  }
  return Object.freeze({
    async generateCandidates({ brief, rubric }) {
      const result = await model.generateStructured({
        operation: "camo.product-candidates.v1",
        input: {
          brief,
          rubric,
          instructions: [
            `Return exactly ${brief.candidateCount} materially different Concept Candidates.`,
            "Do not claim evidence that is absent from the Product Brief or an approved evidence connector.",
            "Mark every unsupported claim as an assumption with a validation plan.",
            "A mimicry candidate must explain its natural fit with the reference mental model, not merely copy appearance.",
            "Score every stress axis independently; a failed axis is not repaired by a high average.",
          ],
        },
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["candidates"],
          properties: {
            candidates: {
              type: "array",
              minItems: brief.candidateCount,
              maxItems: brief.candidateCount,
              items: candidateSchema,
            },
          },
        },
      });
      return result?.candidates ? result : { candidates: result };
    },
  });
}
