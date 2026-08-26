import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, normalize, resolve, sep } from "node:path";

const roleOrder = ["feed", "discovery", "short-video", "messaging", "services"];
const symbolByRole = {
  feed: "house", discovery: "magnifyingglass", "short-video": "play.rectangle",
  messaging: "message", infrastructure: "square.grid.2x2", services: "line.3.horizontal",
};

function inside(root, relative) {
  const target = resolve(root, relative);
  if (target !== root && !target.startsWith(root + sep)) throw new Error(`legacy path escapes catalog: ${relative}`);
  return target;
}

function normalizedTokens(tokens = {}) {
  return Object.fromEntries(Object.entries(tokens).map(([key, value]) => {
    const hex = String(value).match(/#[0-9a-f]{6}\b/i)?.[0];
    return [key, hex || String(value)];
  }));
}

function conceptTabs(manifest) {
  const tabs = manifest.native?.navigation?.tabs || manifest.tabs || [];
  return tabs.map((tab, index) => {
    const role = tab.role || roleOrder[index] || "services";
    return {
      id: tab.id,
      label: tab.label || tab.title || tab.id,
      screen: tab.screen || tab.id,
      role,
      systemImage: tab.systemImage || symbolByRole[role] || "circle",
    };
  });
}

function blueprintTabs(manifest) {
  return (manifest.navigation?.rootTabs || []).map((tab, index) => {
    const role = roleOrder[index] || "services";
    return {
      id: tab.screenId,
      label: tab.title,
      screen: tab.screenId,
      role,
      systemImage: symbolByRole[role] || "circle",
    };
  });
}

export function loadLegacyCatalog(nativeRoot) {
  const legacyRoot = join(nativeRoot, "Legacy");
  const catalog = JSON.parse(readFileSync(join(legacyRoot, "catalog.json"), "utf8"));
  if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.apps)) throw new Error("unsupported legacy catalog");
  return catalog.apps.map(entry => {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(entry.slug)) throw new Error(`invalid legacy slug: ${entry.slug}`);
    const appPath = inside(legacyRoot, `apps/${entry.slug}`);
    const manifestPath = inside(legacyRoot, entry.manifest);
    if (!existsSync(appPath) || !existsSync(manifestPath)) throw new Error(`incomplete legacy app: ${entry.slug}`);
    const swiftFiles = readdirSync(appPath, { recursive: true }).filter(name => String(name).endsWith(".swift"));
    if (!swiftFiles.length) throw new Error(`legacy app has no Swift sources: ${entry.slug}`);
    return { ...entry, appPath, manifestPath, legacyRoot };
  });
}

export function loadLegacyApp(nativeRoot, slug) {
  const entry = loadLegacyCatalog(nativeRoot).find(item => item.slug === slug);
  if (!entry) throw new Error(`unknown legacy app: ${slug}`);
  const manifest = JSON.parse(readFileSync(entry.manifestPath, "utf8"));
  const isBlueprint = entry.format === "blueprint";
  const screens = isBlueprint ? manifest.navigation?.screens || [] : manifest.screens || [];
  const permissions = isBlueprint ? manifest.capabilities || [] : manifest.permissions || [];
  const design = isBlueprint ? {
    strategy: manifest.strategy || "differentiation",
    referenceProfile: manifest.strategy === "mimicry" ? "vk-ios" : null,
    density: manifest.strategy === "mimicry" ? "reference" : "product",
    colorScheme: "light",
    tokens: {},
  } : manifest.native?.design || {};
  const tabs = isBlueprint ? blueprintTabs(manifest) : conceptTabs(manifest);
  return {
    ...entry,
    manifest,
    name: manifest.name || slug,
    tagline: manifest.tagline || manifest.thesis || manifest.heroDeck || "Архивный нативный концепт",
    targetSet: manifest.targetSet || manifest.targetProduct || "iOS",
    mode: design.strategy || manifest.positioning?.mode || "differentiation",
    screens,
    permissions,
    tabs,
    design: { ...design, tokens: normalizedTokens(design.tokens) },
    initialTab: tabs[0]?.id || screens[0]?.id || "home",
    docsPath: isBlueprint ? entry.legacyRoot : join(entry.legacyRoot, "concepts", slug, "docs"),
    isMimicryReference: entry.referenceRole === "vk-mimicry-golden",
  };
}
