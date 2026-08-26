export function createStructuredVisionProductUICritic({ model, reviewerName }) {
  if (!model || typeof model.reviewStructuredVisuals !== "function") throw new TypeError(
    "model.reviewStructuredVisuals({ operation, input, schema }) is required; text-only generation is not a visual review",
  );
  if (typeof reviewerName !== "string" || reviewerName.trim().length < 3) throw new TypeError("reviewerName is required");
  return Object.freeze({
    async review(request) {
      const axisSchema = {
        type: "object", additionalProperties: false, required: ["id", "score", "rationale", "evidence"],
        properties: {
          id: { enum: request.rubric.axes },
          score: { type: "number", minimum: 0, maximum: 10 },
          rationale: { type: "string", minLength: 24 },
          evidence: { type: "string", minLength: 12 },
        },
      };
      const result = await model.reviewStructuredVisuals({
        operation: "camo.native-product-ui-critic.v3",
        input: {
          ...request,
          instructions: [
            ...request.rubric.instructions,
            "Open and inspect every referenced capture. Do not score from filenames, hashes, contracts or implementation claims alone.",
            "Use concrete visible evidence: name the element, relationship, alignment or state shown in the frame.",
            "Return a blocker for ambiguous navigation, detached controls, clipping, unsafe insets, inconsistent components, generic placeholder visuals or a state that does not visibly differ.",
            "Actively compare every visible tab, segment, filter, chevron, avatar, badge and button with the acceptance journeys. If it has no distinct visible outcome or duplicates another destination, report a blocker.",
            "Cross-check visible people, products, facts and media subjects against canonicalContent across all captures. Never infer that inconsistent media is acceptable.",
            "When product.visualCalibration.goldenCaptures is present, open those images too and make reference-fidelity evidence a direct visible comparison, not a claim inferred from tokens or source names.",
          ],
        },
        schema: {
          type: "object", additionalProperties: false, required: ["verdict", "axes", "reviews"],
          properties: {
            verdict: { enum: ["clean", "blockers"] },
            axes: { type: "array", minItems: request.rubric.axes.length, maxItems: request.rubric.axes.length, items: axisSchema },
            reviews: {
              type: "array", minItems: request.captures.length, maxItems: request.captures.length,
              items: {
                type: "object", additionalProperties: false, required: ["captureId", "summary", "evidence", "findings"],
                properties: {
                  captureId: { enum: request.captures.map(item => item.id) },
                  summary: { type: "string", minLength: 24 },
                  evidence: { type: "string", minLength: 16 },
                  findings: {
                    type: "array",
                    items: {
                      type: "object", additionalProperties: false, required: ["severity", "message"],
                      properties: { severity: { enum: ["blocker", "warning"] }, message: { type: "string", minLength: 12 } },
                    },
                  },
                },
              },
            },
          },
        },
      });
      return {
        reviewer: { kind: "structured-vision-model", name: reviewerName, independentFromGenerator: true, captureInspection: "vision" },
        verdict: result.verdict,
        axes: result.axes,
        reviews: result.reviews,
      };
    },
  });
}
