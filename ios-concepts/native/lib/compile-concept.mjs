import { resolveCapability } from "./capability-catalog.mjs";
import { resolveExtension } from "./extension-catalog.mjs";
import { auditReferenceProfile, resolveReferenceProfile } from "./reference-profile-catalog.mjs";
import { compileSurfaceContracts } from "./surface-contract.mjs";
import { compileActionContracts } from "./action-contract.mjs";

const PRESENTATION_ALIASES = new Map([
  ["tab (root)", "tab"],
  ["tab root", "tab"],
  ["tab (root, start)", "tab"],
  ["tab (root, старт)", "tab"],
  ["tab (root, старт после входа)", "tab"],
  ["push", "push"],
  ["push detail", "push"],
  ["push task", "push"],
  ["push из navigation bar", "push"],
  ["push фрагмента", "push"],
  ["settings detail", "push"],
  ["modal", "sheet"],
  ["modal (ошибка)", "sheet"],
  ["modal picker", "sheet"],
  ["modal task", "sheet"],
  ["sheet", "sheet"],
  ["sheet из navigation bar", "sheet"],
  ["bottom sheet", "sheet"],
  ["fullscreen", "cover"],
  ["fullscreen camera", "cover"],
  ["fullscreen (камера)", "cover"],
  ["fullscreen (плеер)", "cover"],
  ["fullscreen audio", "cover"],
  ["полноэкранная камера", "cover"],
  ["system", "system"],
  ["system picker", "system"],
  ["system handoff", "system"],
  ["system Now Playing", "system"],
  ["системная поверхность", "system"],
  ["чужое приложение", "external"],
  ["state", "state"],
  ["состояние записи", "state"],
  ["старт", "root"],
  ["старт, без таб-бара", "root"],
  ["onboarding", "root"],
]);

function diagnostic(code, message, path, severity = "error") {
  return { code, message, path, severity };
}

function unique(items) {
  return [...new Set(items)];
}

function mergeKeyed(items) {
  const result = new Map();
  for (const item of items) {
    const previous = result.get(item.key);
    if (previous && JSON.stringify(previous.value) !== JSON.stringify(item.value)) {
      throw new Error(`conflicting values for ${item.key}`);
    }
    result.set(item.key, item);
  }
  return [...result.values()];
}

export function compileNativeConcept(concept, options = {}) {
  const diagnostics = [];
  const slug = concept?.slug;
  if (!slug) diagnostics.push(diagnostic("concept.slug.required", "Concept slug is required", "slug"));
  if (!concept?.name) diagnostics.push(diagnostic("concept.name.required", "Concept name is required", "name"));

  const bundleId = options.bundleId || `com.camo.${String(slug || "concept").replace(/[-_]/g, "")}`;
  const native = concept?.native || {};
  if (native.schemaVersion !== 1) diagnostics.push(diagnostic(
    "native.schema-version.unsupported",
    "Native schemaVersion must be 1",
    "native.schemaVersion",
  ));
  const strategy = native.design?.strategy || concept?.positioning?.mode;
  if (!["mimicry", "differentiation"].includes(strategy)) {
    diagnostics.push(diagnostic(
      "design.strategy.invalid",
      "Native design strategy must be mimicry or differentiation",
      "native.design.strategy",
    ));
  }
  if (strategy === "mimicry" && !native.design?.referenceProfile) {
    diagnostics.push(diagnostic(
      "design.reference.required",
      "Mimicry requires an evidence-backed reference profile",
      "native.design.referenceProfile",
    ));
  }
  const referenceProfile = native.design?.referenceProfile
    ? resolveReferenceProfile(native.design.referenceProfile)
    : null;
  if (strategy === "mimicry" && native.design?.referenceProfile && !referenceProfile) {
    diagnostics.push(diagnostic(
      "design.reference.unknown",
      `Reference profile ${native.design.referenceProfile} is not registered`,
      "native.design.referenceProfile",
    ));
  }
  const referenceAudit = referenceProfile ? auditReferenceProfile(referenceProfile) : null;
  if (strategy === "mimicry" && referenceProfile && !referenceAudit.ready) {
    diagnostics.push(diagnostic(
      "design.reference.evidence-incomplete",
      `Reference profile ${referenceProfile.id} cannot drive mimicry: ${referenceAudit.blockers.join("; ")}`,
      "native.design.referenceProfile",
    ));
  }

  const sourceScreens = concept?.screens || [];
  const screenIds = new Set();
  const surfaces = sourceScreens.map((screen, index) => {
    const path = `screens[${index}]`;
    if (!screen.id) diagnostics.push(diagnostic("surface.id.required", "Surface id is required", `${path}.id`));
    if (screenIds.has(screen.id)) diagnostics.push(diagnostic("surface.id.duplicate", `Duplicate surface ${screen.id}`, `${path}.id`));
    screenIds.add(screen.id);

    const presentation = screen.native?.presentation || PRESENTATION_ALIASES.get(screen.type);
    if (!presentation) {
      diagnostics.push(diagnostic(
        "surface.presentation.unknown",
        `Surface ${screen.id} has no native presentation for legacy type “${screen.type}”`,
        `${path}.native.presentation`,
      ));
    }

    const states = unique(screen.native?.states || screen.ui?.states || ["default"]);
    if (!states.length) diagnostics.push(diagnostic("surface.states.empty", `Surface ${screen.id} has no states`, `${path}.native.states`));
    const purpose = screen.native?.purpose || screen.ui?.purpose || null;
    if (!purpose) diagnostics.push(diagnostic(
      "surface.purpose.required",
      `Surface ${screen.id} must state the product task it serves`,
      `${path}.ui.purpose`,
    ));
    if (screen.parent && !sourceScreens.some(candidate => candidate.id === screen.parent)) diagnostics.push(diagnostic(
      "surface.parent.missing",
      `Surface ${screen.id} points to missing parent ${screen.parent}`,
      `${path}.parent`,
    ));
    return {
      id: screen.id,
      title: screen.title || screen.id,
      purpose,
      role: screen.native?.role || screen.ui?.pattern || null,
      presentation: presentation || "unknown",
      parent: screen.parent ?? null,
      states,
      distinction: Boolean(screen.native?.distinction),
    };
  });

  const tabs = native.navigation?.tabs || concept?.tabs || [];
  const normalizedTabs = tabs.map((tab, index) => {
    const screen = tab.screen || tab.id;
    if (!screenIds.has(screen)) {
      diagnostics.push(diagnostic(
        "navigation.tab.surface-missing",
        `Tab ${tab.id} points to missing surface ${screen}`,
        `native.navigation.tabs[${index}].screen`,
      ));
    }
    return {
      id: tab.id,
      label: tab.label,
      screen,
      role: tab.role || null,
      systemImage: tab.systemImage || null,
    };
  });
  const tabScreens = new Set(normalizedTabs.map(tab => tab.screen));
  for (const tab of normalizedTabs) {
    const surface = surfaces.find(item => item.id === tab.screen);
    if (surface && surface.presentation !== "tab") diagnostics.push(diagnostic(
      "navigation.tab.presentation-invalid",
      `Tab ${tab.id} points to ${tab.screen}, whose native presentation is ${surface.presentation}`,
      "native.navigation.tabs",
    ));
  }
  for (const surface of surfaces) {
    if (surface.presentation === "tab" && !tabScreens.has(surface.id)) diagnostics.push(diagnostic(
      "navigation.orphan-tab-surface",
      `Surface ${surface.id} is declared as a tab but is absent from native navigation`,
      `screens.${surface.id}.type`,
    ));
  }

  const distinctions = concept?.positioning?.distinctions || [];
  const evidenceScreens = concept?.positioning?.evidenceScreens || [];
  if (!distinctions.length) diagnostics.push(diagnostic(
    "product.distinctions.empty",
    "At least one observable product distinction is required",
    "positioning.distinctions",
  ));
  for (const id of evidenceScreens) {
    if (!screenIds.has(id)) diagnostics.push(diagnostic(
      "product.evidence.surface-missing",
      `Distinction evidence points to missing surface ${id}`,
      "positioning.evidenceScreens",
    ));
  }

  const seenPermissions = new Set();
  const capabilityPlans = [];
  const permissions = (concept?.permissions || []).map((permission, index) => {
    const path = `permissions[${index}]`;
    if (seenPermissions.has(permission.key)) diagnostics.push(diagnostic(
      "permission.key.duplicate",
      `Duplicate permission ${permission.key}`,
      `${path}.key`,
    ));
    seenPermissions.add(permission.key);
    if (!screenIds.has(permission.screen)) diagnostics.push(diagnostic(
      "permission.screen.missing",
      `Permission ${permission.key} starts on missing surface ${permission.screen}`,
      `${path}.screen`,
    ));
    if (permission.target && !screenIds.has(permission.target)) diagnostics.push(diagnostic(
      "permission.target.missing",
      `Permission ${permission.key} points to missing target ${permission.target}`,
      `${path}.target`,
    ));

    const plan = resolveCapability(permission.key, { bundleId });
    if (!plan) diagnostics.push(diagnostic(
      "capability.unsupported",
      `Permission ${permission.key} has no iOS capability plan`,
      `${path}.key`,
    ));
    else capabilityPlans.push(plan);

    return {
      key: permission.key,
      feature: permission.feature,
      gesture: permission.gesture,
      screen: permission.screen,
      target: permission.target,
      fallback: permission.fallback,
      conditional: Boolean(permission.conditional),
      capability: permission.key,
      activation: plan?.activation || "contextual-gesture",
    };
  });

  let info = [];
  let entitlements = [];
  try {
    info = mergeKeyed(capabilityPlans.flatMap(plan => plan.info));
    entitlements = mergeKeyed(capabilityPlans.flatMap(plan => plan.entitlements));
  } catch (error) {
    diagnostics.push(diagnostic("capability.conflict", error.message, "permissions"));
  }

  const usageText = new Map();
  for (const permission of concept?.permissions || []) {
    const plan = capabilityPlans.find(candidate => candidate.permissionKey === permission.key);
    for (const key of plan?.usageKeys || []) {
      const text = permission.alert?.text;
      if (!text) diagnostics.push(diagnostic(
        "capability.usage-text.required",
        `${key} requires user-facing usage text for ${permission.key}`,
        `permissions.${permission.key}.alert.text`,
      ));
      else if (usageText.has(key) && usageText.get(key) !== text) diagnostics.push(diagnostic(
        "capability.usage-text.conflict",
        `${key} resolves to conflicting usage text`,
        `permissions.${permission.key}.alert.text`,
      ));
      else usageText.set(key, text);
    }
  }
  info.push(...[...usageText].map(([key, value]) => ({ key, value })));

  const extensionTargets = unique([
    ...capabilityPlans.flatMap(plan => plan.extensionTargets),
    ...(native.extensions || []),
  ]);
  const extensions = extensionTargets.map((id, index) => {
    const extension = resolveExtension(id, { productName: concept.name, slug });
    if (!extension) diagnostics.push(diagnostic(
      "extension.unsupported",
      `Native extension ${id} has no iOS extension plan`,
      `native.extensions[${index}]`,
    ));
    return extension;
  }).filter(Boolean);

  const verificationStates = surfaces.flatMap(surface => surface.states.map(state => {
    const method = ["system", "external"].includes(surface.presentation)
      ? "contract"
      : "screenshot";
    return {
      id: `${surface.id}--${state}`,
      surface: surface.id,
      state,
      method,
      launch: method === "screenshot" ? { screen: surface.id, state } : null,
    };
  }));

  const surfaceContracts = compileSurfaceContracts(concept, surfaces);
  diagnostics.push(...surfaceContracts.diagnostics);
  const actionContracts = compileActionContracts(concept, surfaces, permissions);
  diagnostics.push(...actionContracts.diagnostics);

  const manifest = {
    schemaVersion: 1,
    qualityContractVersion: concept?.qualityContractVersion || 1,
    actionContractVersion: native.actionContractVersion || 0,
    slug,
    name: concept?.name,
    bundleId,
    platform: {
      os: "iOS",
      minimumVersion: native.platform?.minimumVersion || "26.0",
    },
    product: {
      audience: concept?.product?.audience || null,
      problem: concept?.product?.problem || null,
      promise: concept?.product?.promise || null,
      distinctions,
      evidenceScreens,
      coreLoop: concept?.product?.coreLoop || [],
      nonGoals: concept?.product?.nonGoals || [],
    },
    design: {
      strategy,
      referenceProfile,
      character: native.design?.character || [],
      density: native.design?.density || "balanced",
      colorScheme: native.design?.colorScheme || "light",
      tokens: {
        ...(referenceProfile?.tokens || {}),
        ...(native.design?.tokens || {}),
      },
      qualityFloor: native.design?.qualityFloor || 8,
      surfaceContracts: surfaceContracts.contracts,
    },
    navigation: {
      tabs: normalizedTabs,
      profileEntry: native.navigation?.profileEntry || null,
    },
    surfaces,
    permissions,
    interactions: {
      actions: actionContracts.actions,
    },
    capabilities: {
      plans: capabilityPlans,
      info: mergeKeyed(info),
      entitlements,
      backgroundModes: unique(capabilityPlans.flatMap(plan => plan.backgroundModes)),
      extensionTargets,
      extensions,
      frameworks: unique([
        ...capabilityPlans.flatMap(plan => plan.frameworks),
        ...extensions.flatMap(extension => extension.frameworks),
      ]).sort(),
      runtimeAdapters: unique(capabilityPlans.map(plan => plan.runtimeAdapter).filter(Boolean)).sort(),
    },
    verification: {
      states: verificationStates,
    },
  };

  return {
    ok: diagnostics.every(item => item.severity !== "error"),
    diagnostics,
    manifest,
  };
}
