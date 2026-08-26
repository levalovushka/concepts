export function createStructuredModelProductEvaluator({ model }) {
  if (!model || typeof model.generateStructured !== "function") {
    throw new TypeError("model.generateStructured({ operation, input, schema }) is required");
  }
  return Object.freeze({
    async selectIdeaPortfolio({ request, target, discovery, seeds }) {
      const axes = ["product-coherence", "reference-fit", "distinct-mechanism", "scope-discipline", "capability-fit"];
      return model.generateStructured({
        operation: "camo.native-product-idea-selector.v1",
        input: {
          request, target, discovery, seeds, axes,
          instructions: [
            "Select one idea independently. Prefer one understandable causal mechanism over breadth or novelty language.",
            "For mimicry, reject a concept that only borrows colors or navigation; its authored content, identity, distribution and feedback loop must naturally belong to the reference product.",
            request.capabilityPolicy === "all"
              ? "Every seed.permissionFit must integrate all required user-consent permissions into existing core or supporting flows without becoming a bundle of unrelated utilities. Platform capabilities are not a coverage target."
              : "Do not reward capability count; selected capabilities must belong to existing product flows.",
            "Penalize unexplained labels, redundant destinations, speculative mechanics, weak first-session value and a product that would require a backend to feel complete.",
            "Score only supplied fields. Do not invent research evidence or improve the seeds while evaluating them.",
          ],
        },
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["selectedSeedId", "assessments", "winnerRationale"],
          properties: {
            selectedSeedId: { type: "string", minLength: 3 },
            winnerRationale: { type: "string", minLength: 32 },
            assessments: {
              type: "array", minItems: seeds.length, maxItems: seeds.length,
              items: {
                type: "object", additionalProperties: false, required: ["seedId", "axes", "fatalRisks"],
                properties: {
                  seedId: { type: "string", minLength: 3 },
                  axes: {
                    type: "array", minItems: axes.length, maxItems: axes.length,
                    items: {
                      type: "object", additionalProperties: false, required: ["id", "score", "rationale"],
                      properties: {
                        id: { enum: axes }, score: { type: "integer", minimum: 0, maximum: 4 },
                        rationale: { type: "string", minLength: 16 },
                      },
                    },
                  },
                  fatalRisks: { type: "array", items: { type: "string", minLength: 8 } },
                },
              },
            },
          },
        },
      });
    },
    async evaluatePortfolio({ request, target, proposals, rubric }) {
      const axisSchema = {
        type: "object",
        additionalProperties: false,
        required: ["id", "score", "rationale", "evidenceRefs", "failureModes"],
        properties: {
          id: { enum: rubric.axes },
          score: { type: "integer", minimum: rubric.scoreRange[0], maximum: rubric.scoreRange[1] },
          rationale: { type: "string", minLength: 24 },
          evidenceRefs: { type: "array", minItems: 1, items: { type: "string", minLength: 2 } },
          failureModes: { type: "array", minItems: 1, items: { type: "string", minLength: 8 } },
        },
      };
      return model.generateStructured({
        operation: "camo.native-product-evaluator.v1",
        input: {
          request,
          target,
          proposals,
          rubric,
          instructions: [
            "Act as an independent product evaluator. Do not preserve the generator's preferred candidate and do not invent validation evidence.",
            "For every axis, evidenceRefs may contain only exact ids already present in that proposal's candidate.evidence array. Cite candidate.* and worldModel.* field paths inside rationale, never inside evidenceRefs.",
            "Score every rubric axis from observable proposal, World Model and supplied evidence only; one failed axis must reject the candidate.",
            "This is a concept-factory maturity review, not a claim that market demand has already been proven. Do not fail audience-need, business-viability, retention, core-loop, observable-differentiation, or evidence solely because external research was not supplied.",
            "An unvalidated claim can score 3/4 only when it is specific, internally coherent, explicitly labelled as an assumption, falsifiable, and paired with a concrete evidence plan. Reserve 4/4 for claims supported by observed, validated, or approved evidence. Score below 3 when provenance is hidden, the claim is generic, the validation plan cannot falsify it, or the World Model cannot deliver it.",
            "Treat a capability that does not naturally belong to an existing core or supporting product action as a rejection, even when its copy is complete.",
            "Do not reward capability count. Penalize candidates whose scope grows to cover more target permissions.",
            request.capabilityPolicy === "all"
              ? "The user explicitly requires every user-consent permission. Do not lower feature-economy or permission-cohesion merely because all required permissions exist. Judge whether each permission is contextual inside an existing surface, has a useful denied fallback, and avoids a new root destination. A transparent promoted-content measurement action and biometric protection of already-private product data are supporting states, not separate products. Still reject permission demo screens, fake outcomes, unrelated tabs, or capabilities that change the core thesis."
              : "Capability breadth is not a product benefit.",
            "Prefer coherent simple products over feature count, novelty language or implementation volume.",
            "Reject a proposal when its home screen does not communicate the core value and next action in one glance.",
            "Reject unexplained product jargon, duplicate destinations, ornamental actions, fake social mechanics, implausible seeded content, identity drift, or media without a stable owner.",
            "For world-model-coherence, feature-economy, first-screen-value, semantic-clarity and content-credibility, cite concrete proposal or World Model fields; generic praise cannot receive a passing score.",
          ],
        },
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["assessments"],
          properties: {
            assessments: {
              type: "array",
              minItems: rubric.candidateCount,
              maxItems: rubric.candidateCount,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["candidateId", "axes"],
                properties: {
                  candidateId: { type: "string", minLength: 3 },
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
