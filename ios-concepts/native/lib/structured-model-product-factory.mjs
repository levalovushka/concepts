import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { USER_CONSENT_CAPABILITY_KEYS } from "./capability-catalog.mjs";

const nativeRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const candidateSchema = JSON.parse(readFileSync(join(nativeRoot, "schemas", "concept-candidate.schema.json"), "utf8"));
const worldModelSchema = JSON.parse(readFileSync(join(nativeRoot, "schemas", "world-model.schema.json"), "utf8"));
const proposalCandidateSchema = structuredClone(candidateSchema);
proposalCandidateSchema.required = proposalCandidateSchema.required.filter(key => key !== "permissions");
delete proposalCandidateSchema.properties.permissions;
proposalCandidateSchema.required = proposalCandidateSchema.required.filter(key => key !== "stressTest");
delete proposalCandidateSchema.properties.stressTest;
delete proposalCandidateSchema.properties.factoryQuality;
proposalCandidateSchema.required = proposalCandidateSchema.required.filter(key => key !== "delivery");
delete proposalCandidateSchema.properties.delivery;
for (const key of ["contentSupply", "socialGraphLeverage", "coldStart", "activation", "habitLoop", "retention", "trustSafety", "privacy", "businessLogic"]) {
  proposalCandidateSchema.required = proposalCandidateSchema.required.filter(item => item !== key);
  delete proposalCandidateSchema.properties[key];
}

const discoverySchema = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: ["audience", "context"],
  properties: {
    audience: {
      type: "object",
      additionalProperties: false,
      required: ["primary", "needs"],
      properties: {
        primary: { type: "string", minLength: 8 },
        needs: { type: "array", minItems: 1, items: { type: "string", minLength: 8 } },
        exclusions: { type: "array", items: { type: "string", minLength: 3 } },
      },
    },
    context: {
      type: "object",
      additionalProperties: false,
      required: ["situations", "constraints"],
      properties: {
        situations: { type: "array", minItems: 2, items: { type: "string", minLength: 8 } },
        constraints: { type: "array", items: { type: "string", minLength: 8 } },
      },
    },
  },
});

const REQUIRED_DEMO_STATES = Object.freeze(["loading", "populated", "empty", "error", "offline"]);
const ideaSeedSchema = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: ["id", "name", "thesis", "job", "coreMechanism", "primaryContent", "contribution", "reward", "referenceFit", "observableDifference", "whyDistinct", "nonGoals", "risks", "permissionFit"],
  properties: {
    id: { type: "string", minLength: 3 },
    name: { type: "string", minLength: 2 },
    thesis: { type: "string", minLength: 24 },
    job: { type: "string", minLength: 16 },
    coreMechanism: { type: "string", minLength: 16 },
    primaryContent: { type: "string", minLength: 3 },
    contribution: { type: "string", minLength: 12 },
    reward: { type: "string", minLength: 12 },
    referenceFit: { type: "string", minLength: 16 },
    observableDifference: { type: "string", minLength: 16 },
    whyDistinct: { type: "string", minLength: 16 },
    nonGoals: { type: "array", minItems: 2, maxItems: 3, items: { type: "string", minLength: 8 } },
    risks: { type: "array", minItems: 2, maxItems: 3, items: { type: "string", minLength: 8 } },
    permissionFit: {
      type: "array", minItems: 1,
      items: {
        type: "object", additionalProperties: false, required: ["key", "action", "whyNatural"],
        properties: {
          key: { type: "string", minLength: 2 }, action: { type: "string", minLength: 8 }, whyNatural: { type: "string", minLength: 12 },
        },
      },
    },
  },
});

export function normalizeGeneratedPortfolio(result, target) {
  const normalized = structuredClone(result);
  for (const proposal of normalized?.proposals || []) {
    const model = proposal?.worldModel;
    if (!model || !proposal?.candidate?.id) continue;
    model.id = proposal.candidate.id;
    if (model.authentication) {
      model.authentication.method = target.authentication.method;
      const entities = new Set((model.entities || []).map(item => item.id));
      if (!entities.has(model.authentication.sessionEntity)) {
        model.authentication.sessionEntity = (model.entities || []).find(item => item.ownership === "user")?.id
          || model.authentication.sessionEntity;
      }
      model.authentication.persistence ||= "Keychain-backed local demo session";
    }
    for (const adapter of model.runtime?.demoAdapters || []) adapter.states = [...REQUIRED_DEMO_STATES];
  }
  return normalized;
}

export function createStructuredModelProductFactory({ model }) {
  if (!model || typeof model.generateStructured !== "function") {
    throw new TypeError("model.generateStructured({ operation, input, schema }) is required");
  }
  const discoverProduct = async ({ request, target }) => model.generateStructured({
        operation: "camo.native-product-discovery.v2",
        input: {
          request,
          target: { id: target.id, name: target.name, referenceFamily: target.referenceFamily, productGrammar: target.productGrammar || null },
          instructions: [
            "Infer a specific audience and concrete situations from the short request; do not require them from the user.",
            "Keep discovery concise, specific and falsifiable. Do not design screens, features or permission coverage.",
          ],
        },
        schema: discoverySchema,
      });
  const proposalInstructions = ({ request, target }) => [
            "For each proposal, define its World Model first: entities, relationships, lifecycle states, actions, invariants, authentication, persistence and demo adapters. Derive the candidate from that model, never from a screen list.",
            target.productGrammar
              ? `Target product grammar ${target.productGrammar.id} is mandatory. Use the exact enum value primarySurfaceRole=${target.productGrammar.primarySurfaceRole}. Fill experienceGrammar with authored content identity, feed distribution, at least ${target.productGrammar.minimumFeedbackModes} distinct social feedback modes, and at least ${target.productGrammar.minimumRetentionActions} distinct return actions in retentionLoopActionIds. Do not repeat distribution or feedback actions merely to satisfy retention. A utility wrapped in target colors is not mimicry.`
              : "Do not invent a reference-family product grammar when the target does not define one.",
            "For every proposal, worldModel.id must exactly equal candidate.id. Authentication must use target.authentication.method exactly, name an existing session entity, and state durable local persistence.",
            "Every runtime.demoAdapters item must declare all five observable states verbatim: loading, populated, empty, error, offline. These are adapter states, not entity lifecycle labels.",
            "The first screen after authentication must expose the product's primary value and primary action immediately; do not begin with settings, service directories, dashboards, or administrative lists unless that is the product itself.",
            "Use the smallest coherent feature set. Every surface and action must advance the core loop, an essential supporting task, trust, or recovery; omit speculative tabs and decorative mechanics.",
            "Use plain product language that a first-time user understands without a glossary. Do not invent labels such as remix, swap, hub, pulse, space, or AI action unless the domain model gives them one unambiguous user-visible meaning.",
            "Seed believable canonical content with distinct people, objects, timestamps and media ownership. Never reuse one asset as unrelated content or let identity facts drift between surfaces.",
            "Design one coherent product mechanism before grounding permissions. Bind every capability to an existing World Model action and observable result. Never create a disconnected feature merely to mention a capability.",
            request.capabilityPolicy === "all"
              ? "The final app must implement every user-consent permission listed in requiredUserConsentPermissions. Bind each one to an existing core or supporting action with a contextual system request and useful denied fallback. Platform capabilities are optional and must not create disconnected features."
              : "Select only capabilities that causally support an existing core or supporting action; do not invent a feature merely to include a capability.",
            "Authentication is mandatory. The product must work without a custom backend through explicit local demo adapters and persistent local state.",
            request.strategy === "mimicry"
              ? "Stay product-close and visually close to the selected reference product. Product-close means preserving its content, identity, distribution and feedback grammar before borrowing its visual patterns; a themed utility must be rejected."
              : "Use native iOS compositions and controls. Avoid decorative gradients, generic hero cards, icon placeholders, and template-like card stacks.",
            "Do not claim interviews, market demand, validation, retention, or supply evidence that was not supplied.",
      ];
  const generateIdeaPortfolio = async ({ request, target, rubric, discovery }) => {
    const ideation = await model.generateStructured({
        operation: "camo.native-product-ideation.v3",
        input: {
          request,
          target: { id: target.id, name: target.name, referenceFamily: target.referenceFamily, productGrammar: target.productGrammar || null },
          requiredUserConsentPermissions: request.capabilityPolicy === "all"
            ? target.permissions.filter(item => USER_CONSENT_CAPABILITY_KEYS.has(item.key))
            : [],
          discovery,
          count: rubric.candidateCount,
          instructions: [
            "Create one comparative portfolio, not three paraphrases of the same app. Decide all candidates together so their primary content unit, contribution and reward mechanisms are materially different.",
            "Each seed must describe one coherent product mechanism, not a feature bundle or a list of screens.",
            "For mimicry, every seed must genuinely belong to the target product grammar while solving a different user job. Familiar visual chrome alone is not reference fit.",
            "Use plain Russian product language. Ban unexplained labels, speculative tabs, administrative dashboards and features invented to consume permissions.",
            "Keep the app deliberately small enough to implement completely without a backend. State explicit non-goals and fatal risks.",
            request.capabilityPolicy === "all"
              ? "permissionFit must cover every requiredUserConsentPermissions key exactly once through natural product actions. Prefer an idea whose core domain naturally uses media, place, people and scheduled moments; do not bolt on permission demo screens."
              : "permissionFit may contain only permissions that naturally support the proposed mechanism.",
          ],
        },
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["seeds"],
          properties: { seeds: { type: "array", minItems: rubric.candidateCount, maxItems: rubric.candidateCount, items: ideaSeedSchema } },
        },
      });
    return ideation.seeds || [];
  };
  const expandIdea = async ({ request, target, rubric, discovery, assignedSeed, completePortfolio, slot = 1 }) => {
      const proposalSchema = {
        type: "object",
        additionalProperties: false,
        required: ["candidate", "worldModel"],
        properties: { candidate: proposalCandidateSchema, worldModel: worldModelSchema },
      };
      const proposal = await model.generateStructured({
        operation: `camo.native-product-proposal.v3.selected-${slot}`,
        input: {
          request,
          target,
          requiredUserConsentPermissions: request.capabilityPolicy === "all"
            ? target.permissions.filter(item => USER_CONSENT_CAPABILITY_KEYS.has(item.key))
            : [],
          rubric,
          discovery,
          assignedSeed,
          completePortfolio,
          slot: {
            index: slot,
            total: rubric.candidateCount,
            diversityInstruction: `Expand only assignedSeed. candidate.id and worldModel.id must exactly equal assignedSeed.id. Preserve its distinct mechanism; do not merge features from the other seeds.`,
          },
          instructions: proposalInstructions({ request, target }),
        },
        schema: proposalSchema,
      });
      return normalizeGeneratedPortfolio({ proposals: [proposal] }, target).proposals[0];
  };
  return Object.freeze({
    discoverProduct,
    generateIdeaPortfolio,
    expandIdea,
    async generatePortfolio({ request, target, rubric }) {
      const discovery = await discoverProduct({ request, target });
      const seeds = await generateIdeaPortfolio({ request, target, rubric, discovery });
      const slots = Array.from({ length: rubric.candidateCount }, (_, index) => index);
      const proposals = await Promise.all(slots.map(index => expandIdea({
        request, target, rubric, discovery, assignedSeed: seeds[index], completePortfolio: seeds, slot: index + 1,
      })));
      return normalizeGeneratedPortfolio({ discovery, proposals }, target);
    },
  });
}
