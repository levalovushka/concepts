export function createStructuredModelProductReviser({ model }) {
  if (!model || typeof model.generateStructured !== "function") throw new TypeError(
    "model.generateStructured({ operation, input, schema }) is required",
  );
  return Object.freeze({
    async revise({ attempt, factoryArtifact, experienceContract, visualDevelopment, delivery, receipt, diagnostics }) {
      return model.generateStructured({
        operation: "camo.native-product-revision.v1",
        input: {
          attempt,
          factoryArtifact,
          experienceContract,
          visualDevelopment,
          delivery: {
            concept: delivery?.concept,
            captures: delivery?.captures,
            interactionReceipts: delivery?.interactionReceipts,
          },
          receipt,
          diagnostics,
          instructions: [
            "Translate every blocking finding into one concrete source-level correction while preserving Product, Experience and Visual Contract identities.",
            "Fix the underlying shared component, layout rule, navigation owner, state model or canonical content binding when the defect repeats across screens.",
            "Do not add features, rename product concepts, weaken acceptance journeys, remove applicable states or lower quality thresholds. Preserve the configured media policy: real assets when supplied, otherwise the canonical neutral gray fallback.",
            "Prioritize product meaning and interaction correctness before optical polish, then fix alignment, safe areas, spacing, icon weight and component consistency.",
            "Return a concise revision brief for a complete clean rebuild; never return source code patches or claim that a finding is fixed without a named change.",
          ],
        },
        schema: {
          type: "object", additionalProperties: false,
          required: ["id", "rootCauses", "changes", "acceptanceChecks"],
          properties: {
            id: { type: "string", minLength: 5 },
            rootCauses: { type: "array", minItems: 1, items: { type: "string", minLength: 16 } },
            changes: {
              type: "array", minItems: 1,
              items: {
                type: "object", additionalProperties: false,
                required: ["owner", "change", "fixes"],
                properties: {
                  owner: { enum: ["product", "navigation", "component", "layout", "content", "state", "accessibility", "visual-system"] },
                  change: { type: "string", minLength: 16 },
                  fixes: { type: "array", minItems: 1, items: { type: "string", minLength: 3 } },
                },
              },
            },
            acceptanceChecks: { type: "array", minItems: 1, items: { type: "string", minLength: 12 } },
          },
        },
      });
    },
  });
}
