const IDEA_AXES = Object.freeze([
  "product-need", "world-coherence", "core-loop", "target-fit", "capability-organicity", "scope-discipline",
]);

function ideaSchema() {
  return {
    type: "object", additionalProperties: false,
    required: ["id", "name", "thesis", "audience", "worldSummary", "coreLoop", "referenceFit", "capabilityStrategy", "nonGoals"],
    properties: {
      id: { type: "string", pattern: "^[a-z][a-z0-9-]{2,30}$" },
      name: { type: "string", minLength: 2 },
      thesis: { type: "string", minLength: 32 },
      audience: { type: "string", minLength: 16 },
      worldSummary: { type: "string", minLength: 32 },
      coreLoop: { type: "array", minItems: 4, maxItems: 4, items: { type: "string", minLength: 8 } },
      referenceFit: { type: "string", minLength: 24 },
      capabilityStrategy: { type: "string", minLength: 32 },
      nonGoals: { type: "array", minItems: 2, maxItems: 3, items: { type: "string", minLength: 8 } },
    },
  };
}

export function leanIdeaPortfolioSchema() {
  return {
    type: "object", additionalProperties: false, required: ["ideas"],
    properties: { ideas: { type: "array", minItems: 3, maxItems: 3, items: ideaSchema() } },
  };
}

export function leanIdeaEvaluationSchema(ids) {
  const axis = {
    type: "object", additionalProperties: false, required: ["id", "score", "rationale"],
    properties: {
      id: { enum: IDEA_AXES }, score: { type: "number", minimum: 0, maximum: 10 }, rationale: { type: "string", minLength: 24 },
    },
  };
  return {
    type: "object", additionalProperties: false, required: ["selectedId", "assessments"],
    properties: {
      selectedId: { enum: ids },
      assessments: {
        type: "array", minItems: 3, maxItems: 3,
        items: {
          type: "object", additionalProperties: false, required: ["ideaId", "axes", "fatalRisks"],
          properties: {
            ideaId: { enum: ids },
            axes: { type: "array", minItems: IDEA_AXES.length, maxItems: IDEA_AXES.length, items: axis },
            fatalRisks: { type: "array", items: { type: "string", minLength: 12 } },
          },
        },
      },
    },
  };
}

function actionSchema() {
  return {
    type: "object", additionalProperties: false, required: ["id", "entityId", "outcome", "effect"],
    properties: {
      id: { type: "string", pattern: "^[a-z][a-z0-9_]{2,50}$" },
      entityId: { type: "string", minLength: 2 }, outcome: { type: "string", minLength: 12 },
      effect: {
        type: "object", additionalProperties: false, required: ["type"],
        properties: {
          type: { enum: ["navigate", "create", "update", "toggle", "append", "delete", "system"] },
          targetScreenId: { type: "string", minLength: 2 },
          stateField: { type: "string", minLength: 2 },
          value: { type: "string", minLength: 1 },
          collectionField: { type: "string", minLength: 2 },
        },
      },
    },
  };
}

export function leanBlueprintModelSchema({ request, target }) {
  const capabilityKeys = target.permissions.map(item => item.key);
  return {
    type: "object", additionalProperties: false,
    required: ["id", "name", "thesis", "audience", "world", "coreLoop", "socialGrammar", "navigation", "capabilities", "localization", "fixtures", "acceptanceScenarios", "delivery"],
    properties: {
      id: { type: "string", pattern: "^[a-z][a-z0-9-]{2,30}$" },
      name: { type: "string", minLength: 2 },
      thesis: { type: "string", minLength: 32 },
      audience: {
        type: "object", additionalProperties: false, required: ["who", "need"],
        properties: { who: { type: "string", minLength: 12 }, need: { type: "string", minLength: 16 } },
      },
      world: {
        type: "object", additionalProperties: false, required: ["entities", "actions"],
        properties: {
          entities: {
            type: "array", minItems: 3, maxItems: 8,
            items: {
              type: "object", additionalProperties: false, required: ["id", "name"],
              properties: { id: { type: "string", minLength: 2 }, name: { type: "string", minLength: 2 } },
            },
          },
          actions: { type: "array", minItems: 12, maxItems: 50, items: actionSchema() },
        },
      },
      coreLoop: {
        type: "object", additionalProperties: false, required: ["actionIds", "returnReason"],
        properties: {
          actionIds: { type: "array", minItems: 4, maxItems: 4, items: { type: "string", minLength: 3 } },
          returnReason: { type: "string", minLength: 20 },
        },
      },
      socialGrammar: {
        type: "object", additionalProperties: false, required: ["primarySurface", "authorship", "feedbackModes", "distribution"],
        properties: {
          primarySurface: { enum: ["feed"] }, authorship: { enum: ["person-or-community"] },
          feedbackModes: { type: "array", minItems: 2, maxItems: 5, items: { enum: ["reaction", "comment", "share", "save"] } },
          distribution: { type: "string", minLength: 16 },
        },
      },
      navigation: {
        type: "object", additionalProperties: false, required: ["rootTabs", "screens"],
        properties: {
          rootTabs: {
            type: "array", minItems: 5, maxItems: 5,
            items: {
              type: "object", additionalProperties: false, required: ["screenId", "title", "icon"],
              properties: {
                screenId: { type: "string", minLength: 2 }, title: { type: "string", minLength: 2 }, icon: { type: "string", minLength: 2 },
              },
            },
          },
          screens: {
            type: "array", minItems: 10, maxItems: 16,
            items: {
              type: "object", additionalProperties: false, required: ["id", "title", "presentation", "actionIds"],
              properties: {
                id: { type: "string", minLength: 2 }, title: { type: "string", minLength: 2 },
                presentation: { enum: ["root", "tab", "push", "sheet"] },
                parent: { type: "string", minLength: 2 },
                actionIds: { type: "array", items: { type: "string", minLength: 3 } },
              },
            },
          },
        },
      },
      capabilities: {
        type: "array", minItems: capabilityKeys.length, maxItems: capabilityKeys.length,
        items: {
          type: "object", additionalProperties: false,
          required: ["key", "actionId", "purpose", "requestMoment", "platformEffect", "observableResult", "fallback", "testScenario", "outcome"],
          properties: {
            key: { enum: capabilityKeys }, actionId: { type: "string", minLength: 3 },
            purpose: { type: "string", minLength: 24 },
            requestMoment: { type: "string", minLength: 20 },
            platformEffect: { type: "string", minLength: 20 },
            observableResult: { type: "string", minLength: 12 }, fallback: { type: "string", minLength: 12 },
            testScenario: { type: "string", minLength: 24 },
            outcome: {
              type: "object", additionalProperties: false, required: ["entityId", "stateField", "proof"],
              properties: {
                entityId: { type: "string", minLength: 2 }, stateField: { type: "string", minLength: 3 }, proof: { type: "string", minLength: 12 },
              },
            },
            configuration: {
              type: "object", additionalProperties: false, required: ["domains"],
              properties: { domains: { type: "array", minItems: 1, items: { type: "string", pattern: "^applinks:[a-z0-9.-]+$" } } },
            },
          },
        },
      },
      localization: {
        type: "array", minItems: 20, maxItems: 120,
        items: {
          type: "object", additionalProperties: false, required: ["key", "source", "context", "screenIds"],
          properties: {
            key: { type: "string", pattern: "^[a-z][a-z0-9_.-]{2,80}$" },
            source: { type: "string", minLength: 1 }, context: { type: "string", minLength: 12 },
            screenIds: { type: "array", minItems: 1, items: { type: "string", minLength: 2 } },
          },
        },
      },
      fixtures: {
        type: "array", minItems: 6, maxItems: 30,
        items: {
          type: "object", additionalProperties: false, required: ["id", "entityId", "values", "purpose"],
          properties: {
            id: { type: "string", pattern: "^[a-z][a-z0-9_-]{2,60}$" }, entityId: { type: "string", minLength: 2 },
            purpose: { type: "string", minLength: 12 },
            values: {
              type: "array", minItems: 2, maxItems: 12,
              items: {
                type: "object", additionalProperties: false, required: ["key", "value"],
                properties: { key: { type: "string", minLength: 1 }, value: { type: "string", minLength: 1 } },
              },
            },
          },
        },
      },
      acceptanceScenarios: {
        type: "array", minItems: 6, maxItems: 30,
        items: {
          type: "object", additionalProperties: false, required: ["id", "title", "startScreenId", "actionIds", "observableResult", "failureRecovery"],
          properties: {
            id: { type: "string", pattern: "^[a-z][a-z0-9_-]{2,60}$" }, title: { type: "string", minLength: 8 },
            startScreenId: { type: "string", minLength: 2 },
            actionIds: { type: "array", minItems: 1, maxItems: 8, items: { type: "string", minLength: 3 } },
            observableResult: { type: "string", minLength: 16 }, failureRecovery: { type: "string", minLength: 16 },
          },
        },
      },
      delivery: {
        type: "object", additionalProperties: false,
        required: ["accessibility", "privacy", "analytics", "risks", "assumptions"],
        properties: {
          accessibility: { type: "array", minItems: 5, maxItems: 12, items: { type: "string", minLength: 12 } },
          privacy: {
            type: "object", additionalProperties: false, required: ["data", "principles", "retention"],
            properties: {
              data: { type: "array", minItems: 2, maxItems: 12, items: { type: "string", minLength: 8 } },
              principles: { type: "array", minItems: 3, maxItems: 10, items: { type: "string", minLength: 12 } },
              retention: { type: "string", minLength: 20 },
            },
          },
          analytics: {
            type: "object", additionalProperties: false, required: ["events", "successMetrics"],
            properties: {
              events: { type: "array", minItems: 5, maxItems: 20, items: { type: "string", minLength: 8 } },
              successMetrics: { type: "array", minItems: 3, maxItems: 10, items: { type: "string", minLength: 12 } },
            },
          },
          risks: { type: "array", minItems: 3, maxItems: 10, items: { type: "string", minLength: 12 } },
          assumptions: { type: "array", minItems: 2, maxItems: 10, items: { type: "string", minLength: 12 } },
        },
      },
    },
  };
}

function validateEvaluation(evaluation, ideas, floor) {
  const ids = new Set(ideas.map(item => item.id));
  const assessments = new Map((evaluation?.assessments || []).map(item => [item.ideaId, item]));
  if (!ids.has(evaluation?.selectedId) || assessments.size !== ideas.length) throw new Error("Lean evaluator must assess every idea and select one known idea");
  for (const idea of ideas) {
    const assessment = assessments.get(idea.id);
    const axes = new Map((assessment?.axes || []).map(item => [item.id, item]));
    if (axes.size !== IDEA_AXES.length || IDEA_AXES.some(id => !axes.has(id))) throw new Error(`Lean evaluator omitted axes for ${idea.id}`);
  }
  const selected = assessments.get(evaluation.selectedId);
  const failed = selected.fatalRisks.length || selected.axes.filter(axis => axis.score < floor);
  if (failed.length) throw new Error(`Selected idea ${evaluation.selectedId} does not clear the ${floor}/10 product floor`);
}

function humanize(id) {
  const value = String(id || "entity").replaceAll(/[-_]+/g, " ");
  return value[0].toUpperCase() + value.slice(1);
}

const canonicalNavigationTargets = Object.freeze({
  open_feed: "feed", open_deed: "post_detail", open_post: "post_detail", open_comments: "comments",
  open_messages: "messages", open_conversation: "conversation", open_profile: "profile", open_saved: "saved",
  open_settings: "settings", open_accesses: "accesses", open_notifications: "notifications",
});

function inferredToggleField(id) {
  if (id.startsWith("support_")) return "isSupported";
  if (id.startsWith("follow_")) return "isFollowing";
  if (id.startsWith("save_")) return "isSaved";
  if (id.startsWith("thank_")) return "helpersThanked";
  return `${id.replace(/^(?:save|follow|support|thank)_/, "")}Enabled`;
}

function inferActionEffect(action, screens, capability) {
  const id = action.id;
  if (capability?.outcome?.stateField) {
    return { type: "update", stateField: capability.outcome.stateField, value: "enabled" };
  }
  const target = canonicalNavigationTargets[id]
    || (id.startsWith("open_") && screens.has(id.slice(5)) ? id.slice(5) : null)
    || (id.startsWith("open_") && ["deed", "comment", "notification", "search_result"].includes(action.entityId) ? "post_detail" : null);
  if (target) return { type: "navigate", targetScreenId: target };
  if (/^create_/.test(id)) return { type: "create", collectionField: `${action.entityId}s` };
  if (/^(?:publish|send|respond|add|offer|share|take)_/.test(id)) {
    return { type: "append", collectionField: `${action.entityId}s` };
  }
  if (/^(?:save|follow|support|thank)_/.test(id)) {
    return { type: "toggle", stateField: inferredToggleField(id) };
  }
  if (/^(?:delete|remove)_/.test(id)) return { type: "delete", collectionField: `${action.entityId}s` };
  if (/^(?:edit|complete|mark|verify|set|change)_/.test(id)) return { type: "update", stateField: `${id}_state`, value: "completed" };
  return { type: "system", stateField: `${id}_result`, value: "completed" };
}

export function normalizeLeanActionEffects(body, { force = false } = {}) {
  const screens = new Set((body.navigation?.screens || []).map(screen => screen.id));
  const capabilities = new Map((body.capabilities || []).map(item => [item.actionId, item]));
  for (const action of body.world?.actions || []) if (force || !action.effect) {
    action.effect = inferActionEffect(action, screens, capabilities.get(action.id));
  }
  return body;
}

export function normalizeLeanBlueprintBody(source) {
  const body = structuredClone(source);
  body.world ||= { entities: [], actions: [] };
  body.navigation ||= { rootTabs: [], screens: [] };
  body.capabilities ||= [];
  body.localization ||= [];
  body.fixtures ||= [];
  body.acceptanceScenarios ||= [];

  const screenIds = new Set(body.navigation.screens.map(screen => screen.id));
  if (!screenIds.has("post_detail")) {
    const candidate = body.navigation.screens.find(screen => /(?:post|deed|item)_detail/.test(screen.id));
    if (candidate) {
      const old = candidate.id;
      candidate.id = "post_detail";
      for (const tab of body.navigation.rootTabs) if (tab.screenId === old) tab.screenId = "post_detail";
      for (const screen of body.navigation.screens) if (screen.parent === old) screen.parent = "post_detail";
      for (const item of body.localization) item.screenIds = (item.screenIds || []).map(id => id === old ? "post_detail" : id);
      for (const scenario of body.acceptanceScenarios) if (scenario.startScreenId === old) scenario.startScreenId = "post_detail";
    }
  }

  const actions = new Map(body.world.actions.map(action => [action.id, action]));
  for (const capability of body.capabilities) if (!actions.has(capability.actionId)) {
    const action = {
      id: capability.actionId,
      entityId: capability.outcome.entityId,
      outcome: capability.observableResult,
    };
    body.world.actions.push(action);
    actions.set(action.id, action);
  }

  const screens = new Map(body.navigation.screens.map(screen => [screen.id, screen]));
  const actionOwners = new Map();
  for (const screen of screens.values()) for (const actionId of screen.actionIds || []) {
    if (!actionOwners.has(actionId)) actionOwners.set(actionId, []);
    actionOwners.get(actionId).push(screen.id);
  }
  const screenForEntity = entityId => {
    for (const screen of screens.values()) if ((screen.actionIds || []).some(actionId => actions.get(actionId)?.entityId === entityId)) return screen;
    return screens.get("post_detail") || screens.get("feed") || screens.values().next().value;
  };
  for (const action of actions.values()) if (!actionOwners.has(action.id)) {
    const owner = screenForEntity(action.entityId);
    if (owner) (owner.actionIds ||= []).push(action.id);
  }
  if (actions.has("open_comments") && screens.has("feed")) {
    for (const screen of screens.values()) screen.actionIds = (screen.actionIds || []).filter(id => id !== "open_comments");
    screens.get("feed").actionIds.push("open_comments");
  }
  if (actions.has("respond_to_post") && screens.has("post_detail")) {
    for (const screen of screens.values()) screen.actionIds = (screen.actionIds || []).filter(id => id !== "respond_to_post");
    screens.get("post_detail").actionIds.push("respond_to_post");
  }

  const entityIds = new Set(body.world.entities.map(entity => entity.id));
  const referencedEntities = new Set([
    ...body.world.actions.map(action => action.entityId),
    ...body.capabilities.map(capability => capability.outcome?.entityId),
    ...body.fixtures.map(fixture => fixture.entityId),
  ].filter(Boolean));
  for (const id of referencedEntities) if (!entityIds.has(id)) body.world.entities.push({ id, name: humanize(id) });

  const localizedScreens = new Set(body.localization.flatMap(item => item.screenIds || []));
  for (const screen of body.navigation.screens) if (!localizedScreens.has(screen.id)) body.localization.push(
    { key: `screen.${screen.id}.title`, source: screen.title, context: `Заголовок экрана ${screen.title}`, screenIds: [screen.id] },
    { key: `screen.${screen.id}.empty`, source: `Здесь пока ничего нет`, context: `Пустое состояние экрана ${screen.title}`, screenIds: [screen.id] },
  );
  return normalizeLeanActionEffects(body);
}

export function createStructuredModelLeanArchitect({ ideaModel, evaluatorModel, qualityFloor = 8.5, reservedIds = [] }) {
  if (!ideaModel?.generateStructured || !evaluatorModel?.generateStructured) throw new TypeError("Lean architect needs idea and evaluator structured models");
  if (ideaModel === evaluatorModel) throw new TypeError("Lean idea generator and evaluator must be independent model clients");
  const reserved = new Set(reservedIds);
  return Object.freeze({
    async design({ request, target, reference }) {
      const portfolio = await ideaModel.generateStructured({
        operation: "camo.lean-product-portfolio.v1",
        input: {
          request,
          reservedProductIds: [...reserved].sort(),
          target: { id: target.id, name: target.name, productGrammar: target.productGrammar || null, capabilities: target.permissions },
          reference: reference ? { id: reference.id, evidence: reference.evidence, componentFamilies: reference.componentFamilies } : null,
          instructions: [
            "Return exactly three substantially different product ideas, not feature variations.",
            "Start from a coherent world model and repeatable social loop. Do not start from screens or permissions.",
            "For VK mimicry the primary value must live in an authored feed and remain visually/product-wise close to VK.",
            "Capabilities must strengthen already useful features; never create a feature only to consume a permission.",
            "Keep the application complete without a backend but deliberately bounded: no onboarding and no App Store materials.",
            "Choose a new product id that is not present in reservedProductIds.",
          ],
        },
        schema: leanIdeaPortfolioSchema(),
      });
      const ideas = portfolio?.ideas || [];
      if (ideas.length !== 3 || new Set(ideas.map(item => item.id)).size !== 3) throw new Error("Lean product portfolio must contain exactly three unique ideas");
      const collision = ideas.find(item => reserved.has(item.id));
      if (collision) throw new Error(`Lean product portfolio reuses reserved product id ${collision.id}`);
      const evaluation = await evaluatorModel.generateStructured({
        operation: "camo.lean-product-evaluation.v1",
        input: { request, target: target.id, ideas, axes: IDEA_AXES, qualityFloor },
        schema: leanIdeaEvaluationSchema(ideas.map(item => item.id)),
      });
      validateEvaluation(evaluation, ideas, qualityFloor);
      const selected = ideas.find(item => item.id === evaluation.selectedId);
      const blueprintBody = await ideaModel.generateStructured({
        operation: "camo.lean-product-blueprint.v1",
        input: {
          request, selectedIdea: selected, evaluation, target,
          reference: reference ? { id: reference.id, tokens: reference.tokens, componentFamilies: reference.componentFamilies } : null,
          instructions: [
            "Expand only the selected idea into one coherent executable Product Blueprint.",
            "Every visible control needs one distinct action and observable entity-owned outcome.",
            "Every action also needs a machine-readable effect. Use navigate for a route, create/append/delete for collection mutations, update/toggle for state changes, and system only for a real platform operation.",
            "Comments require separate open_comments navigation and respond_to_post mutation actions.",
            "Capability-rich products need settings and accesses screens, but permissions stay contextual to useful features.",
            "Use exactly five meaningful VK root tabs. No decorative filters, segments, duplicate profile entries or dead chevrons.",
            "Map every target capability exactly once. Associated Domains must include a concrete applinks domain.",
            "Give every capability its own product action. Specify why it exists, the exact request moment, the real iOS effect, persisted success outcome, denied fallback and executable test scenario.",
            "A permission prompt or granted badge is never a product outcome. The feature must still do useful work after access is granted.",
            "Produce the complete developer specification in the same blueprint: all UI copy, deterministic fixture records, executable acceptance scenarios, accessibility, privacy, analytics, risks and assumptions.",
            "UI copy is sentence case and plain Russian. The renderer may not invent product terms or controls outside this catalog.",
          ],
        },
        schema: leanBlueprintModelSchema({ request, target }),
      });
      if (reserved.has(blueprintBody.id)) throw new Error(`Lean Product Blueprint reuses reserved product id ${blueprintBody.id}`);
      const normalizedBlueprintBody = normalizeLeanBlueprintBody(blueprintBody);
      return Object.freeze({
        schemaVersion: 1,
        ...normalizedBlueprintBody,
        targetProduct: request.targetProduct,
        strategy: request.strategy,
        states: normalizedBlueprintBody.navigation.screens.map(screen => ({
          screenId: screen.id, variants: ["loading", "populated/default", "empty", "error", "offline"],
        })),
        selectionReceipt: Object.freeze({ qualityFloor, selectedId: selected.id, ideas, evaluation }),
      });
    },
  });
}

export { IDEA_AXES as LEAN_IDEA_AXES };
