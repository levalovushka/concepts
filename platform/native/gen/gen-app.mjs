#!/usr/bin/env node
// Генератор нативной сборки: concept.json -> Xcode-проект на SwiftUI.
// Детерминированно эмитит Info.plist, слой доступов, навигацию и вход.
// Тела экранов — data-driven каркас (ScreenScaffold); наполнение заменяется агентом позже.

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const NATIVE = join(__dir, "..");
const ROOT = join(NATIVE, "..");            // platform/
const KERNEL = join(NATIVE, "Kernel");

const slug = process.argv[2];
if (!slug) { console.error("usage: gen-app.mjs <slug>"); process.exit(1); }

const spec = JSON.parse(readFileSync(join(ROOT, "concepts", slug, "concept.json"), "utf8"));

// --- имена ---
const AppName = slug.split(/[-_]/).map(s => s[0].toUpperCase() + s.slice(1)).join("");
const bundleId = `com.camo.${slug.replace(/[-_]/g, "")}`;
const OUT = join(NATIVE, "build", slug);
const APPDIR = join(OUT, "App");

// --- утилиты ---
const sw = s => String(s ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
const xml = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// --- разбор экранов ---
const AUTH = new Set(["phone", "code", "codefail"]);
const tabIds = new Set((spec.tabs || []).map(t => t.id));

function kindOf(scr) {
  const t = (scr.type || "").toLowerCase();
  if (tabIds.has(scr.id) || t.includes("tab")) return "root";
  if (t.includes("fullscreen")) return "fullscreen";
  if (t.includes("system")) return "system";
  if (t.includes("sheet")) return "sheet";
  if (t.includes("modal")) return "modal";
  if (t.includes("push")) return "push";
  return "push";
}

const screens = (spec.screens || [])
  .filter(s => !AUTH.has(s.id))
  .map(s => ({
    id: s.id,
    title: s.title || s.id,
    kind: kindOf(s),
    parent: AUTH.has(s.parent) ? null : (s.parent || null),
    tab: (tabIds.has(s.id)) ? s.id : null,
    meta: s.meta || "",
  }));

// --- разбор доступов (все ключи, а не зашитый список — доступы это смысл тренажёра) ---
const permissions = (spec.permissions || [])
  .map(p => ({
    key: p.key,
    plist: p.plist,
    title: p.alert?.title || "",
    body: p.alert?.text || "",
    feature: p.feature || "",
    gesture: p.gesture || "",
    screen: AUTH.has(p.screen) ? "" : (p.screen || ""),
    target: p.target || "",
    fallback: p.fallback || "",
    snack: p.snack || "",
    risk: p.risk || "low",
    anchor: !!p.anchor,
    conditional: !!p.conditional,
    activate: !!p.activate,
  }));

// --- иконки вкладок ---
const TAB_ICON = { lessons:"play.rectangle", projects:"square.stack", settings:"person.crop.circle",
  home:"house", feed:"square.stack", profile:"person.crop.circle", library:"books.vertical",
  search:"magnifyingglass", discover:"safari", tv:"tv" };
function tabIcon(id, label) {
  return TAB_ICON[id] || "circle.fill";
}

// --- Info.plist: usage-строки дословно + фоновые режимы. Entitlement-плисты
//     (aps-environment, com.apple.*, keychain, extension) требуют подписи и
//     живут в .entitlements — в Info.plist их не кладём, но доступ остаётся в AppSpec. ---
const bgModes = new Set();
const usageKeys = []; // {key, body}
for (const p of permissions) {
  const pl = p.plist || "";
  if (/UsageDescription/.test(pl)) {
    // может быть «A + B» (например, два ключа календаря) с одной строкой
    for (const k of pl.split(" + ").map(s => s.trim()).filter(s => /^NS.*UsageDescription$/.test(s))) {
      usageKeys.push({ key: k, body: p.body });
    }
  } else if (/^UIBackgroundModes:/.test(pl)) {
    bgModes.add(pl.split(":")[1].trim());
  }
}
const hasLocalNet = permissions.some(p => p.key === "localnet");

let plistBody = "";
const seen = new Set();
for (const u of usageKeys) {
  if (seen.has(u.key)) continue; seen.add(u.key);
  plistBody += `\t<key>${u.key}</key>\n\t<string>${xml(u.body)}</string>\n`;
}
if (hasLocalNet) plistBody += `\t<key>NSBonjourServices</key>\n\t<array>\n\t\t<string>_googlecast._tcp</string>\n\t</array>\n`;
if (bgModes.size) {
  plistBody += `\t<key>UIBackgroundModes</key>\n\t<array>\n`;
  for (const m of bgModes) plistBody += `\t\t<string>${xml(m)}</string>\n`;
  plistBody += `\t</array>\n`;
}

const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
${plistBody}</dict>
</plist>
`;

// --- AppConfig.swift ---
const mode = (spec.positioning?.mode === "mimicry") ? "mimicry" : "differentiation";
const refArch = mode === "mimicry" ? `"${sw(spec.targetSet)}"` : "nil";
const mailAuth = spec.targetSet === "vkontakte";

const tabsSwift = (spec.tabs || []).map(t =>
  `        TabSpec(id: "${sw(t.id)}", label: "${sw(t.label)}", systemImage: "${tabIcon(t.id, t.label)}"),`
).join("\n");

const screensSwift = screens.map(s =>
  `        ScreenSpec(id: "${sw(s.id)}", title: "${sw(s.title)}", kind: .${s.kind}, ` +
  `parent: ${s.parent ? `"${sw(s.parent)}"` : "nil"}, tab: ${s.tab ? `"${sw(s.tab)}"` : "nil"}, ` +
  `meta: "${sw(s.meta)}"),`
).join("\n");

const permsSwift = permissions.map(p =>
  `        PermissionSpec(key: PermissionKey(rawValue: "${p.key}"), plistKey: "${sw(p.plist)}", title: "${sw(p.title)}", ` +
  `body: "${sw(p.body)}", feature: "${sw(p.feature)}", gesture: "${sw(p.gesture)}", ` +
  `screen: "${sw(p.screen)}", target: "${sw(p.target)}", fallback: "${sw(p.fallback)}", ` +
  `snack: "${sw(p.snack)}", risk: "${sw(p.risk)}", anchor: ${p.anchor}, ` +
  `conditional: ${p.conditional}, activate: ${p.activate}),`
).join("\n");

const appConfig = `import SwiftUI

// СГЕНЕРИРОВАНО из concept.json — не править руками.
enum Generated {
    static let app = AppSpec(
        name: "${sw(spec.name)}",
        mode: .${mode},
        referenceArchetype: ${refArch},
        accent: Color(hex: "${sw(spec.brand?.accent || "#0d8a7a")}"),
        accentDark: Color(hex: "${sw(spec.brand?.accentDark || spec.brand?.accent || "#3dd6c0")}"),
        tabs: [
${tabsSwift}
        ],
        screens: [
${screensSwift}
        ],
        permissions: [
${permsSwift}
        ],
        mailAuth: ${mailAuth}
    )
}
`;

// --- Контент экранов (content.json) -> Generated/Screens.swift ---
let content = {};
const contentPath = join(ROOT, "concepts", slug, "content.json");
if (existsSync(contentPath)) content = JSON.parse(readFileSync(contentPath, "utf8"));

const q = s => `"${sw(s)}"`;
function dl(d) {
  if (!d) return null;
  if (d.state === "ready") return ".ready";
  if (d.state === "busy") return `.busy(${d.p ?? 0})`;
  if (d.state === "none") return `.none(${q(d.size || "")})`;
  return null;
}
function mediaItem(it) {
  const a = [`title: ${q(it.title)}`, `subtitle: ${q(it.subtitle || "")}`];
  if (it.trailing) a.push(`trailing: ${q(it.trailing)}`);
  if (typeof it.progress === "number") a.push(`progress: ${it.progress}`);
  const d = dl(it.download); if (d) a.push(`download: ${d}`);
  if (it.thumb === false) a.push(`thumb: false`);
  if (it.opens) a.push(`opens: ${q(it.opens)}`);
  return `MediaItem(${a.join(", ")})`;
}
function catalog(c) {
  const secs = c.sections.map(s =>
    `                CatalogSection(title: ${q(s.title)}, items: [\n` +
    s.items.map(it => `                    ${mediaItem(it)},`).join("\n") +
    `\n                ])`).join(",\n");
  let hero = "";
  if (c.hero) {
    const h = c.hero;
    hero = `hero: HomeHero(project: ${q(h.project)}, lesson: ${q(h.lesson)}, ` +
      `lessonMeta: ${q(h.lessonMeta)}, currentRow: ${h.currentRow}, goal: ${q(h.goal)}, ` +
      `opens: ${q(h.opens)}), `;
  }
  return `AnyView(CatalogView(data: CatalogData(${hero}sections: [\n${secs}\n            ])))`;
}
function cockpit(id, c) {
  return `AnyView(CockpitView(screenId: ${q(id)}, data: CockpitData(` +
    `project: ${q(c.project)}, lessonTitle: ${q(c.lessonTitle)}, lessonMeta: ${q(c.lessonMeta)}, ` +
    `current: ${c.current}, goal: ${q(c.goal)}, castTarget: ${q(c.castTarget)}, ` +
    `schemaCaption: ${q(c.schemaCaption)})))`;
}
function player(id, c) {
  return `AnyView(PlayerView(screenId: ${q(id)}, data: PlayerData(` +
    `title: ${q(c.title)}, author: ${q(c.author)}, timeElapsed: ${q(c.timeElapsed)}, ` +
    `timeTotal: ${q(c.timeTotal)}, progress: ${c.progress}, rowLabel: ${q(c.rowLabel)}, ` +
    `schemaCaption: ${q(c.schemaCaption)})))`;
}
function counter(id, c) {
  const stats = c.stats.map(s => `CounterData.Stat(value: ${q(s.value)}, label: ${q(s.label)})`).join(", ");
  return `AnyView(CounterView(screenId: ${q(id)}, data: CounterData(` +
    `current: ${c.current}, goal: ${q(c.goal)}, project: ${q(c.project)}, stats: [${stats}])))`;
}
function settings(c) {
  const groups = c.groups.map(g => {
    const rows = g.rows.map(r => {
      const a = [`title: ${q(r.title)}`];
      if (r.subtitle) a.push(`subtitle: ${q(r.subtitle)}`);
      if (r.value) a.push(`value: ${q(r.value)}`);
      if (r.icon) a.push(`icon: ${q(r.icon)}`);
      if (r.toggle) a.push(`toggle: true`);
      if (r.permission) a.push(`permission: PermissionKey(rawValue: "${r.permission}")`);
      if (r.opens) a.push(`opens: ${q(r.opens)}`);
      if (r.chevron) a.push(`chevron: true`);
      return `                    SettingsData.Row(${a.join(", ")})`;
    }).join(",\n");
    const foot = g.footer ? `footer: ${q(g.footer)}, ` : "";
    return `                SettingsData.Group(header: ${q(g.header)}, ${foot}rows: [\n${rows}\n                ])`;
  }).join(",\n");
  const head = [];
  if (c.headerTitle) head.push(`headerTitle: ${q(c.headerTitle)}`);
  if (c.headerSubtitle) head.push(`headerSubtitle: ${q(c.headerSubtitle)}`);
  const headStr = head.length ? head.join(", ") + ", " : "";
  return `AnyView(SettingsView(data: SettingsData(${headStr}groups: [\n${groups}\n            ])))`;
}
function finder(c) {
  const rs = c.results.map(r => {
    const a = [`title: ${q(r.title)}`, `subtitle: ${q(r.subtitle)}`];
    if (r.trailing) a.push(`trailing: ${q(r.trailing)}`);
    return `FinderData.Result(${a.join(", ")})`;
  }).join(",\n                ");
  return `AnyView(FinderView(data: FinderData(note: ${q(c.note)}, results: [\n                ${rs}\n            ], actionLabel: ${q(c.actionLabel)})))`;
}
function capture(c) {
  const manual = c.manualScreen ? `${q(c.manualScreen)}` : "nil";
  return `AnyView(CaptureView(data: CaptureData(hint: ${q(c.hint)}, shutter: ${q(c.shutter)}, ` +
    `scanFrame: ${!!c.scanFrame}, permission: PermissionKey(rawValue: "${c.permission}"), manualScreen: ${manual})))`;
}
function notice(c) {
  const ps = c.paragraphs.map(q).join(", ");
  const perm = c.primaryPermission ? `.${c.primaryPermission}` : "nil";
  const ptar = c.primaryTarget ? q(c.primaryTarget) : "nil";
  const star = c.secondaryTarget ? q(c.secondaryTarget) : "nil";
  return `AnyView(NoticeView(data: NoticeData(icon: ${q(c.icon)}, title: ${q(c.title)}, ` +
    `paragraphs: [${ps}], primary: ${q(c.primary)}, primaryPermission: ${perm}, ` +
    `primaryTarget: ${ptar}, secondary: ${q(c.secondary)}, secondaryTarget: ${star})))`;
}

const cases = Object.entries(content).map(([id, c]) => {
  let body = "nil";
  if (c.layout === "catalog" || c.layout === "home") body = catalog(c);
  else if (c.layout === "cockpit") body = cockpit(id, c);
  else if (c.layout === "player") body = player(id, c);
  else if (c.layout === "counter") body = counter(id, c);
  else if (c.layout === "settings" || c.layout === "detail") body = settings(c);
  else if (c.layout === "finder") body = finder(c);
  else if (c.layout === "capture") body = capture(c);
  else if (c.layout === "notice") body = notice(c);
  else return "";
  return `        case ${q(id)}: return ${body}`;
}).filter(Boolean).join("\n");

const screensFile = `import SwiftUI

// СГЕНЕРИРОВАНО из content.json — не править руками.
enum GeneratedScreens {
    static func view(_ id: String) -> AnyView? {
        switch id {
${cases}
        default: return nil
        }
    }
}
`;

// --- App entry ---
const appEntry = `import SwiftUI

@main
struct ${AppName}App: App {
    var body: some Scene {
        WindowGroup {
            AppShell(app: Generated.app)
        }
    }
}
`;

// --- Assets: AccentColor + AppIcon ---
const accentHex = (spec.brand?.accent || "#0d8a7a").replace("#", "");
const [ar, ag, ab] = [0,2,4].map(i => (parseInt(accentHex.substr(i,2),16)/255).toFixed(3));
const accentColorset = JSON.stringify({
  colors: [{ idiom:"universal", color:{ "color-space":"srgb", components:{ red:`${ar}`, green:`${ag}`, blue:`${ab}`, alpha:"1.000" } } }],
  info: { author:"xcode", version:1 }
}, null, 2);

// --- pbxproj (синхронизированная корневая группа, Xcode 16+) ---
const P = {
  proj:"CA0000000000000000000001", main:"CA0000000000000000000002", prod:"CA0000000000000000000003",
  target:"CA0000000000000000000004", app:"CA0000000000000000000005", sync:"CA0000000000000000000006",
  pcl:"CA0000000000000000000007", tcl:"CA0000000000000000000008",
  pd:"CA0000000000000000000009", pr:"CA000000000000000000000A",
  td:"CA000000000000000000000B", tr:"CA000000000000000000000C",
  src:"CA000000000000000000000D", frm:"CA000000000000000000000E", rsc:"CA000000000000000000000F",
};

const commonBuild = dt => `				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				INFOPLIST_KEY_CFBundleDisplayName = "${spec.name}";
				ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
				CODE_SIGN_STYLE = Automatic;
				CODE_SIGNING_ALLOWED = NO;
				CURRENT_PROJECT_VERSION = 1;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_FILE = Info.plist;
				INFOPLIST_KEY_UILaunchScreen_Generation = YES;
				INFOPLIST_KEY_UIApplicationSceneManifest_Generation = YES;
				INFOPLIST_KEY_UISupportedInterfaceOrientations = "UIInterfaceOrientationPortrait";
				IPHONEOS_DEPLOYMENT_TARGET = 17.0;
				MARKETING_VERSION = 1.0;
				PRODUCT_BUNDLE_IDENTIFIER = ${bundleId};
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_STRICT_CONCURRENCY = minimal;
				SWIFT_VERSION = 5.0;
				TARGETED_DEVICE_FAMILY = "1";`;

const pbxproj = `// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 77;
	objects = {

/* Begin PBXFileSystemSynchronizedRootGroup section */
		${P.sync} /* App */ = {isa = PBXFileSystemSynchronizedRootGroup; path = App; sourceTree = "<group>"; };
/* End PBXFileSystemSynchronizedRootGroup section */

/* Begin PBXFileReference section */
		${P.app} /* ${AppName}.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = "${AppName}.app"; sourceTree = BUILT_PRODUCTS_DIR; };
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
		${P.frm} = {isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
		${P.main} = {isa = PBXGroup; children = (
				${P.sync} /* App */,
				${P.prod} /* Products */,
			); sourceTree = "<group>"; };
		${P.prod} /* Products */ = {isa = PBXGroup; children = (
				${P.app} /* ${AppName}.app */,
			); name = Products; sourceTree = "<group>"; };
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		${P.target} /* ${AppName} */ = {isa = PBXNativeTarget; buildConfigurationList = ${P.tcl}; buildPhases = (
				${P.src},
				${P.frm},
				${P.rsc},
			); buildRules = (); dependencies = (); fileSystemSynchronizedGroups = (
				${P.sync} /* App */,
			); name = ${AppName}; productName = ${AppName}; productReference = ${P.app} /* ${AppName}.app */; productType = "com.apple.product-type.application"; };
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		${P.proj} = {isa = PBXProject; attributes = {
				BuildIndependentTargetsInParallel = 1;
				LastSwiftUpdateCheck = 2620;
				LastUpgradeCheck = 2620;
			}; buildConfigurationList = ${P.pcl}; compatibilityVersion = "Xcode 16.0"; developmentRegion = en; hasScannedForEncodings = 0; knownRegions = (en, Base); mainGroup = ${P.main}; minimizedProjectReferenceProxies = 1; preferredProjectObjectVersion = 77; productRefGroup = ${P.prod} /* Products */; projectDirPath = ""; projectRoot = ""; targets = (
				${P.target} /* ${AppName} */,
			); };
/* End PBXProject section */

/* Begin PBXResourcesBuildPhase section */
		${P.rsc} = {isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };
/* End PBXResourcesBuildPhase section */

/* Begin PBXSourcesBuildPhase section */
		${P.src} = {isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };
/* End PBXSourcesBuildPhase section */

/* Begin XCBuildConfiguration section */
		${P.pd} /* Debug */ = {isa = XCBuildConfiguration; buildSettings = {
				CLANG_ENABLE_MODULES = YES;
				ENABLE_PREVIEWS = YES;
				SDKROOT = iphoneos;
				SWIFT_OPTIMIZATION_LEVEL = "-Onone";
				ONLY_ACTIVE_ARCH = YES;
			}; name = Debug; };
		${P.pr} /* Release */ = {isa = XCBuildConfiguration; buildSettings = {
				CLANG_ENABLE_MODULES = YES;
				ENABLE_PREVIEWS = YES;
				SDKROOT = iphoneos;
				SWIFT_OPTIMIZATION_LEVEL = "-O";
			}; name = Release; };
		${P.td} /* Debug */ = {isa = XCBuildConfiguration; buildSettings = {
${commonBuild("17.0")}
			}; name = Debug; };
		${P.tr} /* Release */ = {isa = XCBuildConfiguration; buildSettings = {
${commonBuild("17.0")}
			}; name = Release; };
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
		${P.pcl} = {isa = XCConfigurationList; buildConfigurations = (
				${P.pd} /* Debug */,
				${P.pr} /* Release */,
			); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };
		${P.tcl} = {isa = XCConfigurationList; buildConfigurations = (
				${P.td} /* Debug */,
				${P.tr} /* Release */,
			); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };
/* End XCConfigurationList section */
	};
	rootObject = ${P.proj};
}
`;

// --- запись ---
if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(APPDIR, "Kernel"), { recursive: true });
mkdirSync(join(APPDIR, "Assets.xcassets", "AccentColor.colorset"), { recursive: true });
mkdirSync(join(APPDIR, "Assets.xcassets", "AppIcon.appiconset"), { recursive: true });
mkdirSync(join(OUT, `${AppName}.xcodeproj`), { recursive: true });

// ядро копируется целиком (детерминированно)
cpSync(KERNEL, join(APPDIR, "Kernel"), { recursive: true });

writeFileSync(join(APPDIR, "AppConfig.swift"), appConfig);
writeFileSync(join(APPDIR, "Screens.swift"), screensFile);
writeFileSync(join(APPDIR, `${AppName}App.swift`), appEntry);
writeFileSync(join(OUT, "Info.plist"), infoPlist);
writeFileSync(join(OUT, `${AppName}.xcodeproj`, "project.pbxproj"), pbxproj);
writeFileSync(join(APPDIR, "Assets.xcassets", "Contents.json"), JSON.stringify({info:{author:"xcode",version:1}}, null, 2));
writeFileSync(join(APPDIR, "Assets.xcassets", "AccentColor.colorset", "Contents.json"), accentColorset);
writeFileSync(join(APPDIR, "Assets.xcassets", "AppIcon.appiconset", "Contents.json"),
  JSON.stringify({ images:[{idiom:"universal",platform:"ios",size:"1024x1024"}], info:{author:"xcode",version:1} }, null, 2));

console.log(`✓ ${AppName} → ${OUT}`);
console.log(`  экранов: ${screens.length}, доступов: ${permissions.length}, режим: ${mode}`);
console.log(`  build: xcodebuild -project "${OUT}/${AppName}.xcodeproj" -scheme ${AppName} -sdk iphonesimulator`);
