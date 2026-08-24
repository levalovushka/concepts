import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const nativeRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const profilesRoot = join(nativeRoot, "ReferenceProfiles");
const REQUIRED_SURFACES = Object.freeze({
  "vk-ios": ["home", "search", "clips", "menu", "settings", "friends", "chat", "post"],
  "vk-music-ios": ["home", "search", "library", "album", "artist", "player", "queue", "downloaded", "empty", "offline"],
  "vk-video-ios": ["home", "search", "subscriptions", "video-detail", "player", "comments", "short-video", "empty", "offline"],
  "ok-ios": ["feed", "discovery", "messages", "video", "menu", "profile", "post", "group", "settings", "empty", "offline"],
});

function readProfile(directory) {
  const profilePath = join(profilesRoot, directory, "profile.json");
  const source = JSON.parse(readFileSync(profilePath, "utf8"));
  return Object.freeze({
    ...source,
    status: source.evidenceStatus,
    profilePath,
    swiftSources: source.native?.swiftSources || [],
    tokens: source.native?.tokens || {},
  });
}

export function loadReferenceProfiles() {
  return Object.fromEntries(readdirSync(profilesRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(join(profilesRoot, entry.name, "profile.json")))
    .map(entry => {
      const profile = readProfile(entry.name);
      return [profile.id, profile];
    }));
}

export const REFERENCE_PROFILE_CATALOG = Object.freeze(loadReferenceProfiles());

export function resolveReferenceProfile(id) {
  return REFERENCE_PROFILE_CATALOG[id] || null;
}

export function auditReferenceProfile(profile) {
  const blockers = [];
  if (profile.schemaVersion !== 1) blockers.push("schemaVersion должен быть 1");
  if (!profile.id || !profile.product || profile.platform !== "iOS") blockers.push("неполная идентификация профиля");
  const required = REQUIRED_SURFACES[profile.id] || profile.capturePlan || [];
  const captured = new Set(profile.evidence?.surfaces || []);
  const missingSurfaces = required.filter(surface => !captured.has(surface));
  if (missingSurfaces.length) blockers.push(`нет референсов состояний: ${missingSurfaces.join(", ")}`);
  if (!profile.evidence?.source) blockers.push("не указан источник evidence");
  else if (!existsSync(resolve(dirname(profile.profilePath), profile.evidence.source))) blockers.push(`источник evidence не найден: ${profile.evidence.source}`);
  if (!profile.contract) blockers.push("не извлечён визуальный контракт");
  if (!profile.native?.swiftSources?.length) blockers.push("нет нативных рецептов компонентов");
  if (!Object.keys(profile.native?.tokens || {}).length) blockers.push("нет нативных токенов");
  for (const source of profile.native?.swiftSources || []) {
    if (!existsSync(join(nativeRoot, source))) blockers.push(`Swift-рецепт не найден: ${source}`);
  }
  const iconography = profile.native?.iconography;
  if (iconography?.productChrome === "lucide-assets") {
    if (iconography.platformActions !== "sf-symbols") blockers.push("Lucide profile должен оставить platform actions на SF Symbols");
    let sourceIcons = new Set();
    if (!iconography.version || !iconography.sourceManifest) blockers.push("Lucide profile не закрепляет version/sourceManifest");
    else if (!existsSync(join(nativeRoot, iconography.sourceManifest))) blockers.push(`Lucide source manifest не найден: ${iconography.sourceManifest}`);
    else sourceIcons = new Set(JSON.parse(readFileSync(join(nativeRoot, iconography.sourceManifest), "utf8")).icons || []);
    const roles = Object.keys(iconography.tabRoles || {});
    const expected = ["discovery", "feed", "messaging", "services", "short-video"];
    const missingRoles = expected.filter(role => !roles.includes(role));
    if (missingRoles.length) blockers.push(`Lucide tab roles не покрывают semantic роли VK: ${missingRoles.join(", ")}`);
    const unvendored = [...new Set(Object.values(iconography.tabRoles || {}))].filter(icon => !sourceIcons.has(icon));
    if (unvendored.length) blockers.push(`Lucide tab roles ссылаются на невендоренные glyphs: ${unvendored.join(", ")}`);
  }
  const declaredReady = profile.evidenceStatus === "ready";
  if (declaredReady && blockers.length) blockers.unshift("профиль ошибочно помечен ready");
  return { id: profile.id, product: profile.product, ready: declaredReady && blockers.length === 0, blockers };
}

export function auditReferenceProfiles() {
  return Object.values(REFERENCE_PROFILE_CATALOG).map(auditReferenceProfile);
}
