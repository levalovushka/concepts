export function createStructuredModelVisualDirectionEvaluator({ model }) {
  if (!model || typeof model.generateStructured !== "function") throw new TypeError(
    "model.generateStructured({ operation, input, schema }) is required",
  );
  return Object.freeze({
    async evaluateDirections({ productContract, experienceContract, directions, calibration, rubric }) {
      const axisSchema = {
        type: "object",
        additionalProperties: false,
        required: ["id", "score", "rationale"],
        properties: {
          id: { enum: rubric.axes },
          score: { type: "number", minimum: rubric.scoreRange[0], maximum: rubric.scoreRange[1] },
          rationale: { type: "string", minLength: 24 },
        },
      };
      return model.generateStructured({
        operation: "camo.native-visual-direction-evaluator.v1",
        input: {
          productContract,
          experienceContract,
          directions,
          calibration,
          rubric,
          instructions: [
            "Act as an independent product UI critic. Do not preserve generator preference and do not average away a failed axis.",
            "Evaluate hierarchy, native coherence, cross-screen consistency, all declared states, strategy fidelity and concrete visual risk from the supplied contracts only.",
            "Reject template composition, duplicate components for the same role, decorative placeholders, inconsistent navigation chrome and unearned controls.",
            "A score at or above the release floor requires a concrete rationale grounded in the proposed direction and upstream experience.",
          ],
        },
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["assessments"],
          properties: {
            assessments: {
              type: "array", minItems: 3, maxItems: 3,
              items: {
                type: "object", additionalProperties: false, required: ["directionId", "axes"],
                properties: {
                  directionId: { type: "string", minLength: 3 },
                  axes: { type: "array", minItems: rubric.axes.length, maxItems: rubric.axes.length, items: axisSchema },
                },
              },
            },
          },
        },
      });
    },
  });
}
