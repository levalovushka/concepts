const OUTCOME_TYPES = new Set(["navigate", "mutate", "request", "dismiss", "external"]);
const EXECUTION_TYPES = new Set(["sync", "async"]);
const PERSISTENCE_TYPES = new Set(["none", "local", "system", "server"]);
const ASYNC_STATES = ["idle", "loading", "success", "error"];
const ACTION_VARIANTS = new Set(["primary", "secondary", "destructive", "quiet", "icon", "row"]);
const ACTION_PLACEMENTS = new Set(["body", "toolbar", "menu", "row"]);
const ALLOWED_PLACEMENTS = new Map([
  ["primary", new Set(["body"])],
  ["secondary", new Set(["body"])],
  ["destructive", new Set(["body", "menu", "row"])],
  ["quiet", new Set(["body", "toolbar", "menu"])],
  ["icon", new Set(["body", "toolbar"])],
  ["row", new Set(["row"])],
]);

function diagnostic(code, message, path) {
  return { code, message, path, severity: "error" };
}

/**
 * Compiles user intent into deterministic effects. A toast is feedback, never
 * an outcome: every action must navigate, mutate product state, request a
 * declared capability, dismiss a presented task, or hand off externally.
 */
export function compileActionContracts(concept, surfaces, permissions) {
  const diagnostics = [];
  const strict = (concept?.qualityContractVersion || 1) >= 2
    || (concept?.native?.actionContractVersion || 0) >= 1;
  const semanticStrict = (concept?.native?.actionContractVersion || 0) >= 3;
  const surfaceIds = new Set(surfaces.map(item => item.id));
  const permissionKeys = new Set(permissions.map(item => item.key));
  const sourceById = new Map((concept?.screens || []).map(screen => [screen.id, screen]));
  const actions = [];

  for (const surface of surfaces) {
    const source = sourceById.get(surface.id) || {};
    const ui = source.ui;
    const rows = ui?.actions || source.native?.actions || [];
    const interactive = !["system", "external", "state"].includes(surface.presentation);

    if (strict && interactive && rows.length === 0) diagnostics.push(diagnostic(
      "surface.actions.required",
      `Surface ${surface.id} must declare predictable user actions`,
      `screens.${surface.id}.ui.actions`,
    ));

    const ids = new Set();
    const labels = new Set();
    for (const [index, action] of rows.entries()) {
      const path = `screens.${surface.id}.ui.actions[${index}]`;
      if (!action.id?.trim()) diagnostics.push(diagnostic("action.id.required", "Action id is required", `${path}.id`));
      else if (ids.has(action.id)) diagnostics.push(diagnostic("action.id.duplicate", `Duplicate action ${action.id}`, `${path}.id`));
      ids.add(action.id);

      if (!action.label?.trim()) diagnostics.push(diagnostic("action.label.required", "Action label is required", `${path}.label`));
      else if (labels.has(action.label)) diagnostics.push(diagnostic("action.label.duplicate", `Duplicate action label ${action.label}`, `${path}.label`));
      labels.add(action.label);

      const outcome = action.outcome || {};
      if (!OUTCOME_TYPES.has(outcome.type)) diagnostics.push(diagnostic(
        "action.outcome.invalid",
        `Action ${action.id || index} needs a deterministic outcome, not feedback-only behaviour`,
        `${path}.outcome.type`,
      ));
      if (outcome.type === "navigate" && !surfaceIds.has(outcome.target)) diagnostics.push(diagnostic(
        "action.target.missing",
        `Action ${action.id} points to missing surface ${outcome.target}`,
        `${path}.outcome.target`,
      ));
      if (outcome.type === "request" && !permissionKeys.has(outcome.capability)) diagnostics.push(diagnostic(
        "action.capability.missing",
        `Action ${action.id} requests undeclared capability ${outcome.capability}`,
        `${path}.outcome.capability`,
      ));
      if (outcome.type === "mutate" && !outcome.state?.trim()) diagnostics.push(diagnostic(
        "action.state.required",
        `Action ${action.id} must name the product state it changes`,
        `${path}.outcome.state`,
      ));
      if (outcome.type === "external" && !outcome.destination?.trim()) diagnostics.push(diagnostic(
        "action.destination.required",
        `Action ${action.id} must name its external destination`,
        `${path}.outcome.destination`,
      ));

      const execution = action.execution || (outcome.type === "request" ? "async" : "sync");
      if (!EXECUTION_TYPES.has(execution)) diagnostics.push(diagnostic(
        "action.execution.invalid",
        `Action ${action.id} must declare sync or async execution`,
        `${path}.execution`,
      ));
      const persistence = action.persistence || "none";
      if (!PERSISTENCE_TYPES.has(persistence)) diagnostics.push(diagnostic(
        "action.persistence.invalid",
        `Action ${action.id} has unsupported persistence ${persistence}`,
        `${path}.persistence`,
      ));
      if (strict && outcome.type === "mutate" && !action.persistence) diagnostics.push(diagnostic(
        "action.persistence.required",
        `Mutation ${action.id} must say whether its result is local, system, or server-backed`,
        `${path}.persistence`,
      ));
      if (strict && execution === "async") {
        const states = action.states || [];
        for (const state of ASYNC_STATES) {
          if (!states.includes(state)) diagnostics.push(diagnostic(
            "action.async-state.required",
            `Async action ${action.id} must define ${state} state`,
            `${path}.states`,
          ));
        }
        if (!action.failure?.message?.trim()) diagnostics.push(diagnostic(
          "action.failure-message.required",
          `Async action ${action.id} must explain failure in user language`,
          `${path}.failure.message`,
        ));
        if (action.failure?.retry !== true) diagnostics.push(diagnostic(
          "action.retry.required",
          `Async action ${action.id} must expose a retry path`,
          `${path}.failure.retry`,
        ));
        if (semanticStrict && (!action.failure?.fallback?.type || !["manual", "settings", "alternate"].includes(action.failure.fallback.type))) diagnostics.push(diagnostic(
          "action.fallback.required",
          `Async action ${action.id} must expose a machine-readable settings, manual, or alternate fallback`,
          `${path}.failure.fallback`,
        ));
      }

      const variant = action.variant;
      const placement = action.placement;
      if (semanticStrict && !ACTION_VARIANTS.has(variant)) diagnostics.push(diagnostic(
        "action.variant.required",
        `Action ${action.id} must use primary, secondary, destructive, quiet, icon, or row`,
        `${path}.variant`,
      ));
      if (semanticStrict && !ACTION_PLACEMENTS.has(placement)) diagnostics.push(diagnostic(
        "action.placement.required",
        `Action ${action.id} must declare body, toolbar, menu, or row placement`,
        `${path}.placement`,
      ));
      if (ACTION_VARIANTS.has(variant) && ACTION_PLACEMENTS.has(placement)
          && !ALLOWED_PLACEMENTS.get(variant).has(placement)) diagnostics.push(diagnostic(
        "action.placement.incompatible",
        `${variant} action ${action.id} cannot be placed in ${placement}`,
        `${path}.placement`,
      ));
      if (action.successOutcome) {
        if (execution !== "async") diagnostics.push(diagnostic(
          "action.success-outcome.async-only",
          `Action ${action.id} may define successOutcome only for async execution`,
          `${path}.successOutcome`,
        ));
        if (action.successOutcome.type !== "mutate" || !action.successOutcome.state?.trim()) diagnostics.push(diagnostic(
          "action.success-outcome.invalid",
          `Action ${action.id} successOutcome must name the product state mutated after adapter success`,
          `${path}.successOutcome`,
        ));
        if (!action.successOutcome.persistence || !PERSISTENCE_TYPES.has(action.successOutcome.persistence)) diagnostics.push(diagnostic(
          "action.success-outcome.persistence-required",
          `Action ${action.id} successOutcome must declare persistence`,
          `${path}.successOutcome.persistence`,
        ));
      }

      actions.push({
        surface: surface.id,
        id: action.id,
        label: action.label,
        outcome,
        execution,
        persistence,
        states: action.states || (execution === "sync" ? ["idle", "success"] : []),
        failure: action.failure || null,
        variant,
        placement,
        enabledWhen: action.enabledWhen || "always",
        successOutcome: action.successOutcome || null,
      });
    }

    if (semanticStrict && rows.filter(action => action.variant === "primary").length > 1) diagnostics.push(diagnostic(
      "surface.primary-action.multiple",
      `Surface ${surface.id} declares more than one primary action`,
      `screens.${surface.id}.ui.actions`,
    ));

    if (strict && interactive && ui?.primaryAction && !rows.some(action => action.label === ui.primaryAction)) {
      diagnostics.push(diagnostic(
        "surface.primary-action.unbound",
        `Primary action “${ui.primaryAction}” on ${surface.id} has no matching action contract`,
        `screens.${surface.id}.ui.primaryAction`,
      ));
    }
  }

  return { diagnostics, actions };
}
