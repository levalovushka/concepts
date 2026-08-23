const ROLE_RECIPES = Object.freeze({
  "house-matters": {
    pattern: "priority-feed",
    composition: ["root-header", "context", "filters", "primary-feed"],
    primaryRegion: "primary-feed",
    maxPreludeLayers: 2,
    allowed: ["root-header", "filters", "social-feed", "post"],
    forbidden: ["stories", "secondary-feature-row", "promo-hero"],
  },
  "house-matter": {
    pattern: "detail-thread",
    composition: ["navigation", "matter-summary", "thread", "next-action"],
    primaryRegion: "matter-summary",
    maxPreludeLayers: 1,
    allowed: ["matter-summary", "thread", "next-action"],
    forbidden: ["stories", "service-grid", "promo-hero"],
  },
  "incident-report": {
    pattern: "task-form",
    composition: ["navigation", "task-intro", "form", "privacy-note", "primary-action"],
    primaryRegion: "form",
    maxPreludeLayers: 1,
    allowed: ["task-intro", "form", "privacy-note", "primary-action"],
    forbidden: ["stories", "feed", "service-grid"],
  },
  infrastructure: {
    pattern: "context-services",
    composition: ["root-header", "spatial-context", "service-list"],
    primaryRegion: "spatial-context",
    maxPreludeLayers: 1,
    allowed: ["spatial-context", "service-list"],
    forbidden: ["stories", "social-feed", "promo-hero"],
  },
  metering: {
    pattern: "task-form",
    composition: ["navigation", "deadline", "form", "primary-action", "history"],
    primaryRegion: "form",
    maxPreludeLayers: 1,
    allowed: ["deadline", "form", "primary-action", "history"],
    forbidden: ["stories", "feed", "service-grid"],
  },
  "house-access": {
    pattern: "task-detail",
    composition: ["navigation", "task-intro", "access-data", "primary-action", "fallback-action"],
    primaryRegion: "access-data",
    maxPreludeLayers: 1,
    allowed: ["task-intro", "access-data", "primary-action", "fallback-action"],
    forbidden: ["stories", "feed", "promo-hero"],
  },
  "yard-chronicle": {
    pattern: "private-collection",
    composition: ["navigation", "privacy-context", "collection", "primary-action"],
    primaryRegion: "collection",
    maxPreludeLayers: 1,
    allowed: ["privacy-context", "collection", "primary-action"],
    forbidden: ["stories", "promo-hero", "service-grid"],
  },
});

const UI_RECIPES = Object.freeze({
  auth: ["navigation", "value", "form", "primary-action", "secondary-action"],
  collection: ["root-header", "context", "filters", "collection"],
  feed: ["root-header", "context", "filters", "primary-feed"],
  form: ["navigation", "task-intro", "form", "primary-action"],
  detail: ["navigation", "summary", "content", "next-action"],
  chat: ["chat-header", "message-list", "composer"],
  services: ["root-header", "service-list"],
});

const UI_ALLOWED_FAMILIES = Object.freeze({
  auth: ["auth-form", "primary-action", "secondary-action"],
  collection: ["collection", "filters"],
  feed: ["social-feed", "post", "filters"],
  form: ["task-intro", "form", "primary-action"],
  detail: ["summary", "content", "next-action"],
  chat: ["chat", "message-list", "composer"],
  services: ["service-list"],
});

function diagnostic(code, message, path) {
  return { code, message, path, severity: "error" };
}

function fallbackRecipe(surface) {
  if (surface.presentation === "tab") return {
    pattern: "root-collection",
    composition: ["root-header", "context", "primary-content"],
    primaryRegion: "primary-content",
    maxPreludeLayers: 1,
    allowed: ["primary-content"],
    forbidden: ["stories", "promo-hero"],
  };
  return {
    pattern: "task-detail",
    composition: ["navigation", "primary-content", "next-action"],
    primaryRegion: "primary-content",
    maxPreludeLayers: 1,
    allowed: ["primary-content", "next-action"],
    forbidden: ["stories", "promo-hero"],
  };
}

/**
 * Deep module at the product→composition seam. It turns one product task into
 * a small, measurable contract consumed by generation and quality gates.
 * Reference products may influence tokens and component language, but cannot
 * introduce a family that the product task did not explicitly earn.
 */
export function compileSurfaceContracts(concept, surfaces) {
  const diagnostics = [];
  const strict = (concept?.qualityContractVersion || 1) >= 2;
  const uiVersion = concept?.uiContractVersion || 0;
  const sourceById = new Map((concept?.screens || []).map(screen => [screen.id, screen]));

  const contracts = surfaces.map(surface => {
    const source = sourceById.get(surface.id) || {};
    const ui = source.ui;
    if (strict && !["system", "external", "state"].includes(surface.presentation) && !ui) {
      diagnostics.push(diagnostic(
        "surface.ui-contract.required",
        `Surface ${surface.id} needs a UI v3 contract before native generation`,
        `screens.${surface.id}.ui`,
      ));
    }
    if (strict && ui && uiVersion < 3) diagnostics.push(diagnostic(
      "surface.ui-contract.version",
      `Surface ${surface.id} uses UI intent, but uiContractVersion must be 3`,
      "uiContractVersion",
    ));

    const roleRecipe = ROLE_RECIPES[surface.role];
    const uiComposition = ui?.pattern ? UI_RECIPES[ui.pattern] : null;
    if (strict && ui && !roleRecipe && !uiComposition) diagnostics.push(diagnostic(
      "surface.composition-recipe.required",
      `Surface ${surface.id} has no proven composition recipe for role ${surface.role} or pattern ${ui.pattern}`,
      `screens.${surface.id}.ui.pattern`,
    ));
    const recipe = roleRecipe || (uiComposition ? {
      pattern: ui.pattern,
      composition: uiComposition,
      primaryRegion: uiComposition.at(-1),
      maxPreludeLayers: surface.presentation === "tab" ? 2 : 1,
      allowed: UI_ALLOWED_FAMILIES[ui.pattern],
      forbidden: ["stories", "promo-hero"],
    } : fallbackRecipe(surface));

    if (strict && ui) {
      if (!ui.primaryAction && !["system", "external", "state"].includes(surface.presentation)) diagnostics.push(diagnostic(
        "surface.primary-action.required",
        `Surface ${surface.id} must name its primary action`,
        `screens.${surface.id}.ui.primaryAction`,
      ));
      if (!ui.hierarchy?.primary || !ui.hierarchy?.secondary) diagnostics.push(diagnostic(
        "surface.hierarchy.required",
        `Surface ${surface.id} must define primary and secondary regions`,
        `screens.${surface.id}.ui.hierarchy`,
      ));
      const cases = new Set((ui.contentCases || []).map(item => item.kind));
      for (const kind of ["typical", "stress", "failure"]) {
        if (!cases.has(kind)) diagnostics.push(diagnostic(
          "surface.content-case.required",
          `Surface ${surface.id} is missing the ${kind} content case`,
          `screens.${surface.id}.ui.contentCases`,
        ));
      }
    }

    const requestedFamilies = ui?.componentFamilies || [];
    if (strict && !["system", "external", "state"].includes(surface.presentation) && requestedFamilies.length === 0) {
      diagnostics.push(diagnostic(
        "surface.component-family.required",
        `Surface ${surface.id} must intentionally select component families from its recipe`,
        `screens.${surface.id}.ui.componentFamilies`,
      ));
    }
    const forbidden = new Set(recipe.forbidden);
    const allowed = new Set(recipe.allowed || []);
    for (const family of requestedFamilies) {
      if (forbidden.has(family) || (allowed.size && !allowed.has(family))) diagnostics.push(diagnostic(
        "surface.component-family.unearned",
        `${surface.id} requests ${family}, but its product task and composition recipe do not earn that family`,
        `screens.${surface.id}.ui.componentFamilies`,
      ));
    }

    return {
      surface: surface.id,
      job: surface.purpose,
      primaryAction: ui?.primaryAction || null,
      hierarchy: ui?.hierarchy || { primary: recipe.primaryRegion, secondary: "supporting-content" },
      density: ui?.density || "reference",
      pattern: recipe.pattern,
      composition: recipe.composition,
      primaryRegion: recipe.primaryRegion,
      aboveFold: {
        maxPreludeLayers: recipe.maxPreludeLayers,
        mustExpose: recipe.primaryRegion,
      },
      forbiddenFamilies: [...forbidden],
      allowedFamilies: [...allowed],
      contentCases: ui?.contentCases || [],
      source: ui ? (uiVersion >= 3 ? "explicit-ui-v3" : "explicit-transition") : "derived-legacy",
    };
  });

  return { ok: diagnostics.length === 0, diagnostics, contracts };
}
