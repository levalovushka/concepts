#!/usr/bin/env node
// Генератор Xcode-проекта. Детерминированная часть пайплайна:
// Info.plist из concept.json дословно + сборка из DesignSystem + Runtime + apps/<slug>.

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileNativeConcept } from "../lib/compile-concept.mjs";
import { materializeLucideTabAssets } from "../lib/lucide-asset-catalog.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const NATIVE = join(__dir, "..");
const ROOT = join(NATIVE, "..");

const slug = process.argv[2];
if (!slug) { console.error("usage: gen-project.mjs <slug>"); process.exit(1); }

const spec = JSON.parse(readFileSync(join(ROOT, "concepts", slug, "concept.json"), "utf8"));
const AppName = slug[0].toUpperCase() + slug.slice(1);
const bundleId = `com.camo.${slug.replace(/[-_]/g, "")}`;
const compiled = compileNativeConcept(spec, { bundleId });
if (!compiled.ok) {
  for (const item of compiled.diagnostics) {
    console.error(`✗ ${item.code} · ${item.path}\n  ${item.message}`);
  }
  process.exit(1);
}
const manifest = compiled.manifest;
const OUT = join(NATIVE, "build", slug);
const APP = join(OUT, "App");

const xml = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function plistValue(value, indent = "\t") {
  if (typeof value === "boolean") return value ? "<true/>" : "<false/>";
  if (typeof value === "number") return `<integer>${value}</integer>`;
  if (Array.isArray(value)) {
    if (!value.length) return "<array/>";
    return `<array>\n${value.map(item => `${indent}\t${plistValue(item, indent + "\t")}`).join("\n")}\n${indent}</array>`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (!entries.length) return "<dict/>";
    return `<dict>\n${entries.map(([key, item]) => `${indent}\t<key>${xml(key)}</key>\n${indent}\t${plistValue(item, indent + "\t")}`).join("\n")}\n${indent}</dict>`;
  }
  return `<string>${xml(value)}</string>`;
}

function plistDocument(entries) {
  const body = entries.map(item => `\t<key>${xml(item.key)}</key>\n\t${plistValue(item.value)}`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
${body}
</dict>
</plist>
`;
}

const swift = value => String(value ?? "")
  .replaceAll("\\", "\\\\")
  .replaceAll('"', '\\"')
  .replaceAll("\n", "\\n");

function generatedDesignBrief() {
  const rows = manifest.design.surfaceContracts.map(contract => {
    const actions = manifest.interactions.actions.filter(action => action.surface === contract.surface)
      .map(action => `${action.label} → ${action.outcome.type}${action.outcome.target ? `:${action.outcome.target}` : ""}`)
      .join("; ") || "нет объявленных действий";
    return `## ${contract.surface}\n\n` +
    `- Задача: ${contract.job}\n` +
    `- Главное действие: ${contract.primaryAction || "системное или отсутствует"}\n` +
    `- Композиция: ${contract.composition.join(" → ")}\n` +
    `- Полезный контент в первом экране: ${contract.aboveFold.mustExpose}\n` +
    `- Максимум слоёв до него: ${contract.aboveFold.maxPreludeLayers}\n` +
    `- Разрешённые семейства: ${contract.allowedFamilies.join(", ") || "нет"}\n` +
    `- Запрещённые семейства: ${contract.forbiddenFamilies.join(", ") || "нет"}\n` +
    `- Действия: ${actions}\n` +
    `- Источник: ${contract.source}\n`;
  }).join("\n");
  return `# Блокирующий дизайн-контракт: ${manifest.name}\n\n` +
    `Минимальный порог качества: ${manifest.design.qualityFloor}/10. ` +
    `Референс задаёт визуальную грамматику, но не имеет права добавлять продуктово незаслуженные элементы.\n\n${rows}`;
}

function generatedNativeSpec() {
  const uxScreens = new Map(manifest.uxSpecification.screens.map(screen => [screen.id, screen]));
  const tabs = manifest.navigation.tabs.map(tab =>
    `        NativeTabDefinition(id: "${swift(tab.id)}", label: "${swift(tab.label)}", screen: "${swift(tab.screen)}", role: "${swift(tab.role)}", systemImage: "${swift(tab.systemImage)}")`,
  ).join(",\n");
  const surfaces = manifest.surfaces.map(surface => {
    const states = surface.states.map(state => `"${swift(state)}"`).join(", ");
    const ux = uxScreens.get(surface.id);
    const roles = (ux?.componentRoles || []).map(role => `"${swift(role)}"`).join(", ");
    return `        NativeSurfaceDefinition(id: "${swift(surface.id)}", titleKey: "${swift(ux?.titleKey)}", purposeKey: "${swift(ux?.purposeKey)}", presentation: "${swift(surface.presentation)}", states: [${states}], componentRoles: [${roles}])`;
  }).join(",\n");
  const tokens = Object.entries(manifest.uxSpecification.design.tokens)
    .map(([key, value]) => `"${swift(key)}": "${swift(value)}"`)
    .join(", ");
  const surfaceContracts = manifest.design.surfaceContracts.map(contract => {
    const composition = contract.composition.map(item => `"${swift(item)}"`).join(", ");
    const allowed = contract.allowedFamilies.map(item => `"${swift(item)}"`).join(", ");
    const forbidden = contract.forbiddenFamilies.map(item => `"${swift(item)}"`).join(", ");
    return `        NativeSurfaceContractDefinition(surface: "${swift(contract.surface)}", job: "${swift(contract.job)}", primaryAction: ${contract.primaryAction ? `"${swift(contract.primaryAction)}"` : "nil"}, pattern: "${swift(contract.pattern)}", composition: [${composition}], primaryRegion: "${swift(contract.primaryRegion)}", maxPreludeLayers: ${contract.aboveFold.maxPreludeLayers}, allowedFamilies: [${allowed}], forbiddenFamilies: [${forbidden}], source: "${swift(contract.source)}")`;
  }).join(",\n");
  const actions = manifest.interactions.actions.map(action =>
    `        NativeActionDefinition(surface: "${swift(action.surface)}", id: "${swift(action.id)}", label: "${swift(action.label)}", outcome: "${swift(action.outcome.type)}", target: ${action.outcome.target ? `"${swift(action.outcome.target)}"` : "nil"}, variant: "${swift(action.variant)}", placement: "${swift(action.placement)}", enabledWhen: "${swift(action.enabledWhen)}")`,
  ).join(",\n");
  const localizedStrings = manifest.uxSpecification.localization.catalog
    .map(item => `        "${swift(item.key)}": "${swift(item.source)}"`)
    .join(",\n");
  const fixtureRows = new Map();
  for (const fixture of manifest.uxSpecification.fixtures) {
    if (fixtureRows.has(fixture.surface)) continue;
    const values = [fixture.data?.headline, fixture.data?.status, fixture.data?.metadata]
      .filter(value => typeof value === "string" && value.trim()).slice(0, 3);
    fixtureRows.set(fixture.surface, values);
  }
  const fixtureText = [...fixtureRows.entries()].map(([surface, values]) =>
    `        "${swift(surface)}": [${values.map(value => `"${swift(value)}"`).join(", ")}]`,
  ).join(",\n");
  const permissions = manifest.permissions.map(permission =>
    `        NativePermissionDefinition(key: "${swift(permission.key)}", screen: "${swift(permission.screen)}", feature: "${swift(permission.feature)}", gesture: "${swift(permission.gesture)}", fallback: "${swift(permission.fallback)}")`,
  ).join(",\n");
  return `// Generated from concept.json. Do not edit.
import Foundation

struct NativeTabDefinition: Identifiable, Hashable {
    let id: String
    let label: String
    let screen: String
    let role: String
    let systemImage: String
}

struct NativeSurfaceDefinition: Identifiable, Hashable {
    let id: String
    let titleKey: String
    let purposeKey: String
    let presentation: String
    let states: [String]
    let componentRoles: [String]
}

struct NativeDesignDefinition: Hashable {
    let strategy: String
    let referenceProfile: String?
    let character: [String]
    let density: String
    let colorScheme: String
    let tokens: [String: String]
}

struct NativeSurfaceContractDefinition: Identifiable, Hashable {
    var id: String { surface }
    let surface: String
    let job: String
    let primaryAction: String?
    let pattern: String
    let composition: [String]
    let primaryRegion: String
    let maxPreludeLayers: Int
    let allowedFamilies: [String]
    let forbiddenFamilies: [String]
    let source: String
}

struct NativeActionDefinition: Identifiable, Hashable {
    var id: String { "\(surface).\(self.actionID)" }
    let surface: String
    private let actionID: String
    let label: String
    let outcome: String
    let target: String?
    let variant: String
    let placement: String
    let enabledWhen: String

    init(surface: String, id: String, label: String, outcome: String, target: String?, variant: String, placement: String, enabledWhen: String) {
        self.surface = surface
        self.actionID = id
        self.label = label
        self.outcome = outcome
        self.target = target
        self.variant = variant
        self.placement = placement
        self.enabledWhen = enabledWhen
    }
}

struct NativePermissionDefinition: Identifiable, Hashable {
    var id: String { key }
    let key: String
    let screen: String
    let feature: String
    let gesture: String
    let fallback: String
}

enum NativeConceptSpec {
    static let initialTab = "${swift(manifest.navigation.tabs[0]?.id)}"
    static let design = NativeDesignDefinition(
        strategy: "${swift(manifest.design.strategy)}",
        referenceProfile: ${manifest.design.referenceProfile ? `"${swift(manifest.design.referenceProfile.id)}"` : "nil"},
        character: [${manifest.design.character.map(item => `"${swift(item)}"`).join(", ")}],
        density: "${swift(manifest.design.density)}",
        colorScheme: "${swift(manifest.design.colorScheme)}",
        tokens: [${tokens}]
    )
    static let tabs: [NativeTabDefinition] = [
${tabs}
    ]
    static let surfaces: [NativeSurfaceDefinition] = [
${surfaces}
    ]
    static let surfaceContracts: [NativeSurfaceContractDefinition] = [
${surfaceContracts}
    ]
    static let actions: [NativeActionDefinition] = [
${actions}
    ]
    static let permissions: [NativePermissionDefinition] = [
${permissions}
    ]
    static let localizedStrings: [String: String] = [
${localizedStrings}
    ]
    static let fixtureText: [String: [String]] = [
${fixtureText}
    ]
}
`;
}

function generatedCaptureSurfaceOwnership() {
  const sourcePath = join(NATIVE, "apps", slug, "product-state-surfaces.json");
  const source = existsSync(sourcePath)
    ? JSON.parse(readFileSync(sourcePath, "utf8"))
    : { product: [] };
  const swiftSet = owner => (source[owner] || []).map(item => `"${swift(item)}"`).join(", ");
  return `// Generated from product-state-surfaces.json. Do not edit.
import Foundation

enum NativeCaptureSurfaceOwnership {
    enum Owner: String { case product, pendingProduct, system, extensionSurface }

    static let product: Set<String> = [${swiftSet("product")}]
    static let pendingProduct: Set<String> = [${swiftSet("pendingProduct")}]
    static let system: Set<String> = [${swiftSet("system")}]
    static let extensionSurface: Set<String> = [${swiftSet("extension")}]

    static func owner(of surface: String) -> Owner? {
        if product.contains(surface) { return .product }
        if pendingProduct.contains(surface) { return .pendingProduct }
        if system.contains(surface) { return .system }
        if extensionSurface.contains(surface) { return .extensionSurface }
        return nil
    }

    static func allowsSyntheticPresentation(for surface: String) -> Bool {
        owner(of: surface) != .product
    }
}
`;
}

const infoEntries = [...manifest.capabilities.info];
if (manifest.capabilities.backgroundModes.length) {
  infoEntries.push({ key: "UIBackgroundModes", value: manifest.capabilities.backgroundModes });
}
const infoPlist = plistDocument(infoEntries);
const entitlementsPlist = plistDocument(manifest.capabilities.entitlements);

const P = {
  proj: "CA0000000000000000000001", main: "CA0000000000000000000002", prod: "CA0000000000000000000003",
  target: "CA0000000000000000000004", app: "CA0000000000000000000005", sync: "CA0000000000000000000006",
  pcl: "CA0000000000000000000007", tcl: "CA0000000000000000000008",
  pd: "CA0000000000000000000009", pr: "CA000000000000000000000A",
  td: "CA000000000000000000000B", tr: "CA000000000000000000000C",
  src: "CA000000000000000000000D", frm: "CA000000000000000000000E", rsc: "CA000000000000000000000F",
  uiSync: "CA0000000000000000000020", uiProduct: "CA0000000000000000000021",
  uiTarget: "CA0000000000000000000022", uiConfigs: "CA0000000000000000000023",
  uiDebug: "CA0000000000000000000024", uiRelease: "CA0000000000000000000025",
  uiSrc: "CA0000000000000000000026", uiFrm: "CA0000000000000000000027",
  uiRsc: "CA0000000000000000000028", uiProxy: "CA0000000000000000000029",
  uiDependency: "CA000000000000000000002A",
};
const hasSmokeTests = ["looks", "dvor"].includes(slug);
const smokeTarget = `${AppName}SmokeTests`;
const smokeScheme = `${AppName}Smoke`;

const extensionPlans = manifest.capabilities.extensions.map((extension, index) => {
  const prefix = `CE${String(index + 1).padStart(2, "0")}`;
  const id = suffix => `${prefix}${suffix}`.padEnd(24, "0").slice(0, 24);
  const productName = `${AppName}${extension.productSuffix}`;
  return {
    ...extension,
    productName,
    bundleId: `${bundleId}.${extension.bundleSuffix}`,
    sync: id("01"), product: id("02"), target: id("03"), configs: id("04"),
    debug: id("05"), release: id("06"), sources: id("07"), frameworksPhase: id("08"),
    resources: id("09"), buildFile: id("0A"), proxy: id("0B"), dependency: id("0C"),
    exceptions: id("0D"),
  };
});
const embedPhase = "CA0000000000000000000010";

const extensionSyncGroups = extensionPlans.map(extension =>
  `\t\t${extension.sync} /* ${extension.id} */ = {isa = PBXFileSystemSynchronizedRootGroup; path = "Extensions/${extension.id}"; sourceTree = "<group>"; };`,
).join("\n");
const extensionProductRefs = extensionPlans.map(extension =>
  `\t\t${extension.product} /* ${extension.productName}.appex */ = {isa = PBXFileReference; explicitFileType = "wrapper.app-extension"; includeInIndex = 0; path = "${extension.productName}.appex"; sourceTree = BUILT_PRODUCTS_DIR; };`,
).join("\n");
const extensionBuildFiles = extensionPlans.map(extension =>
  `\t\t${extension.buildFile} /* ${extension.productName}.appex in Embed Foundation Extensions */ = {isa = PBXBuildFile; fileRef = ${extension.product} /* ${extension.productName}.appex */; settings = {ATTRIBUTES = (RemoveHeadersOnCopy, ); }; };`,
).join("\n");
const extensionProxies = extensionPlans.map(extension =>
  `\t\t${extension.proxy} = {isa = PBXContainerItemProxy; containerPortal = ${P.proj} /* Project object */; proxyType = 1; remoteGlobalIDString = ${extension.target}; remoteInfo = ${extension.productName}; };`,
).join("\n");
const extensionDependencies = extensionPlans.map(extension =>
  `\t\t${extension.dependency} = {isa = PBXTargetDependency; target = ${extension.target} /* ${extension.productName} */; targetProxy = ${extension.proxy}; };`,
).join("\n");
const extensionTargets = extensionPlans.map(extension =>
  `\t\t${extension.target} /* ${extension.productName} */ = {isa = PBXNativeTarget; buildConfigurationList = ${extension.configs}; buildPhases = (\n\t\t\t\t${extension.sources},\n\t\t\t\t${extension.frameworksPhase},\n\t\t\t\t${extension.resources},\n\t\t\t); buildRules = (); dependencies = (); fileSystemSynchronizedGroups = (\n\t\t\t\t${extension.sync} /* ${extension.id} */,\n\t\t\t); name = ${extension.productName}; productName = ${extension.productName}; productReference = ${extension.product} /* ${extension.productName}.appex */; productType = "com.apple.product-type.app-extension"; };`,
).join("\n");
const extensionConfigs = extensionPlans.flatMap(extension => [
  [extension.debug, "Debug", "-Onone"],
  [extension.release, "Release", "-O"],
].map(([configId, name, optimization]) => `\t\t${configId} /* ${name} */ = {isa = XCBuildConfiguration; buildSettings = {
\t\t\t\tAPPLICATION_EXTENSION_API_ONLY = YES;
\t\t\t\tCODE_SIGN_ENTITLEMENTS = "Extensions/${extension.id}/${extension.productName}.entitlements";
\t\t\t\tCODE_SIGNING_ALLOWED = NO;
\t\t\t\tCURRENT_PROJECT_VERSION = 1;
\t\t\t\tEXTRACT_APP_INTENTS_METADATA = NO;
\t\t\t\tGENERATE_INFOPLIST_FILE = NO;
\t\t\t\tINFOPLIST_FILE = "Extensions/${extension.id}/Info.plist";
\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = ${manifest.platform.minimumVersion};
\t\t\t\tMARKETING_VERSION = 1.0;
\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = ${extension.bundleId};
\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";
\t\t\t\tSDKROOT = iphoneos;
\t\t\t\tSKIP_INSTALL = YES;
\t\t\t\tSWIFT_OPTIMIZATION_LEVEL = "${optimization}";
\t\t\t\tSWIFT_VERSION = 5.0;
\t\t\t\tTARGETED_DEVICE_FAMILY = "1";
\t\t\t}; name = ${name}; };`)).join("\n");
const extensionConfigLists = extensionPlans.map(extension =>
  `\t\t${extension.configs} = {isa = XCConfigurationList; buildConfigurations = (\n\t\t\t\t${extension.debug} /* Debug */,\n\t\t\t\t${extension.release} /* Release */,\n\t\t\t); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };`,
).join("\n");

const buildSettings = `				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
				CODE_SIGN_ENTITLEMENTS = ${AppName}.entitlements;
				CODE_SIGNING_ALLOWED = NO;
				CURRENT_PROJECT_VERSION = 1;
				EXTRACT_APP_INTENTS_METADATA = NO;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_FILE = Info.plist;
				INFOPLIST_KEY_CFBundleDisplayName = "${spec.name}";
				INFOPLIST_KEY_UILaunchScreen_Generation = YES;
				INFOPLIST_KEY_UIApplicationSceneManifest_Generation = YES;
				INFOPLIST_KEY_UISupportedInterfaceOrientations = "UIInterfaceOrientationPortrait";
				IPHONEOS_DEPLOYMENT_TARGET = ${manifest.platform.minimumVersion};
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

/* Begin PBXBuildFile section */
${extensionBuildFiles}
/* End PBXBuildFile section */

/* Begin PBXContainerItemProxy section */
${extensionProxies}
${hasSmokeTests ? `\t\t${P.uiProxy} = {isa = PBXContainerItemProxy; containerPortal = ${P.proj} /* Project object */; proxyType = 1; remoteGlobalIDString = ${P.target}; remoteInfo = ${AppName}; };` : ""}
/* End PBXContainerItemProxy section */

/* Begin PBXCopyFilesBuildPhase section */
		${embedPhase} /* Embed Foundation Extensions */ = {isa = PBXCopyFilesBuildPhase; buildActionMask = 2147483647; dstPath = ""; dstSubfolderSpec = 13; files = (
${extensionPlans.map(extension => `\t\t\t\t${extension.buildFile} /* ${extension.productName}.appex in Embed Foundation Extensions */,`).join("\n")}
			); name = "Embed Foundation Extensions"; runOnlyForDeploymentPostprocessing = 0; };
/* End PBXCopyFilesBuildPhase section */

/* Begin PBXFileSystemSynchronizedBuildFileExceptionSet section */
${extensionPlans.map(extension => `\t\t${extension.exceptions} = {isa = PBXFileSystemSynchronizedBuildFileExceptionSet; membershipExceptions = (Info.plist, ${extension.productName}.entitlements, ); target = ${extension.target} /* ${extension.productName} */; };`).join("\n")}
/* End PBXFileSystemSynchronizedBuildFileExceptionSet section */

/* Begin PBXFileSystemSynchronizedRootGroup section */
		${P.sync} /* App */ = {isa = PBXFileSystemSynchronizedRootGroup; path = App; sourceTree = "<group>"; };
${hasSmokeTests ? `\t\t${P.uiSync} /* ${smokeTarget} */ = {isa = PBXFileSystemSynchronizedRootGroup; path = ${smokeTarget}; sourceTree = "<group>"; };` : ""}
${extensionPlans.map(extension => `\t\t${extension.sync} /* ${extension.id} */ = {isa = PBXFileSystemSynchronizedRootGroup; exceptions = (${extension.exceptions}, ); path = "Extensions/${extension.id}"; sourceTree = "<group>"; };`).join("\n")}
/* End PBXFileSystemSynchronizedRootGroup section */

/* Begin PBXFileReference section */
		${P.app} /* ${AppName}.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = "${AppName}.app"; sourceTree = BUILT_PRODUCTS_DIR; };
${hasSmokeTests ? `\t\t${P.uiProduct} /* ${smokeTarget}.xctest */ = {isa = PBXFileReference; explicitFileType = wrapper.cfbundle; includeInIndex = 0; path = ${smokeTarget}.xctest; sourceTree = BUILT_PRODUCTS_DIR; };` : ""}
${extensionProductRefs}
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
		${P.frm} = {isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };
${hasSmokeTests ? `\t\t${P.uiFrm} = {isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };` : ""}
${extensionPlans.map(extension => `\t\t${extension.frameworksPhase} = {isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };`).join("\n")}
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
		${P.main} = {isa = PBXGroup; children = (
				${P.sync} /* App */,
${hasSmokeTests ? `\t\t\t\t${P.uiSync} /* ${smokeTarget} */,` : ""}
${extensionPlans.map(extension => `\t\t\t\t${extension.sync} /* ${extension.id} */,`).join("\n")}
				${P.prod} /* Products */,
			); sourceTree = "<group>"; };
		${P.prod} /* Products */ = {isa = PBXGroup; children = (
				${P.app} /* ${AppName}.app */,
${hasSmokeTests ? `\t\t\t\t${P.uiProduct} /* ${smokeTarget}.xctest */,` : ""}
${extensionPlans.map(extension => `\t\t\t\t${extension.product} /* ${extension.productName}.appex */,`).join("\n")}
			); name = Products; sourceTree = "<group>"; };
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		${P.target} /* ${AppName} */ = {isa = PBXNativeTarget; buildConfigurationList = ${P.tcl}; buildPhases = (
				${P.src},
				${P.frm},
				${P.rsc},
				${embedPhase} /* Embed Foundation Extensions */,
			); buildRules = (); dependencies = (
${extensionPlans.map(extension => `\t\t\t\t${extension.dependency},`).join("\n")}
			); fileSystemSynchronizedGroups = (
				${P.sync} /* App */,
			); name = ${AppName}; productName = ${AppName}; productReference = ${P.app} /* ${AppName}.app */; productType = "com.apple.product-type.application"; };
${hasSmokeTests ? `\t\t${P.uiTarget} /* ${smokeTarget} */ = {isa = PBXNativeTarget; buildConfigurationList = ${P.uiConfigs}; buildPhases = (
\t\t\t\t${P.uiSrc},
\t\t\t\t${P.uiFrm},
\t\t\t\t${P.uiRsc},
\t\t\t); buildRules = (); dependencies = (${P.uiDependency}, ); fileSystemSynchronizedGroups = (${P.uiSync}, ); name = ${smokeTarget}; productName = ${smokeTarget}; productReference = ${P.uiProduct} /* ${smokeTarget}.xctest */; productType = "com.apple.product-type.bundle.ui-testing"; };` : ""}
${extensionTargets}
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		${P.proj} = {isa = PBXProject; attributes = {
				BuildIndependentTargetsInParallel = 1;
				LastSwiftUpdateCheck = 2620;
				LastUpgradeCheck = 2620;
			}; buildConfigurationList = ${P.pcl}; compatibilityVersion = "Xcode 16.0"; developmentRegion = ru; hasScannedForEncodings = 0; knownRegions = (ru, en, Base); mainGroup = ${P.main}; minimizedProjectReferenceProxies = 1; preferredProjectObjectVersion = 77; productRefGroup = ${P.prod} /* Products */; projectDirPath = ""; projectRoot = ""; targets = (
				${P.target} /* ${AppName} */,
${hasSmokeTests ? `\t\t\t\t${P.uiTarget} /* ${smokeTarget} */,` : ""}
${extensionPlans.map(extension => `\t\t\t\t${extension.target} /* ${extension.productName} */,`).join("\n")}
			); };
/* End PBXProject section */

/* Begin PBXResourcesBuildPhase section */
		${P.rsc} = {isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };
${hasSmokeTests ? `\t\t${P.uiRsc} = {isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };` : ""}
${extensionPlans.map(extension => `\t\t${extension.resources} = {isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };`).join("\n")}
/* End PBXResourcesBuildPhase section */

/* Begin PBXSourcesBuildPhase section */
		${P.src} = {isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };
${hasSmokeTests ? `\t\t${P.uiSrc} = {isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };` : ""}
${extensionPlans.map(extension => `\t\t${extension.sources} = {isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };`).join("\n")}
/* End PBXSourcesBuildPhase section */

/* Begin PBXTargetDependency section */
${extensionDependencies}
${hasSmokeTests ? `\t\t${P.uiDependency} = {isa = PBXTargetDependency; target = ${P.target} /* ${AppName} */; targetProxy = ${P.uiProxy}; };` : ""}
/* End PBXTargetDependency section */

/* Begin XCBuildConfiguration section */
		${P.pd} /* Debug */ = {isa = XCBuildConfiguration; buildSettings = {
				CLANG_ENABLE_MODULES = YES;
				ENABLE_PREVIEWS = YES;
				SDKROOT = iphoneos;
				SWIFT_OPTIMIZATION_LEVEL = "-Onone";
			}; name = Debug; };
		${P.pr} /* Release */ = {isa = XCBuildConfiguration; buildSettings = {
				CLANG_ENABLE_MODULES = YES;
				ENABLE_PREVIEWS = YES;
				SDKROOT = iphoneos;
				SWIFT_OPTIMIZATION_LEVEL = "-O";
			}; name = Release; };
		${P.td} /* Debug */ = {isa = XCBuildConfiguration; buildSettings = {
${buildSettings}
			}; name = Debug; };
		${P.tr} /* Release */ = {isa = XCBuildConfiguration; buildSettings = {
${buildSettings}
			}; name = Release; };
${hasSmokeTests ? `\t\t${P.uiDebug} /* Debug */ = {isa = XCBuildConfiguration; buildSettings = {
\t\t\t\tCODE_SIGNING_ALLOWED = NO;
\t\t\t\tGENERATE_INFOPLIST_FILE = YES;
\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = ${manifest.platform.minimumVersion};
\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = ${bundleId}.smoke;
\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";
\t\t\t\tSWIFT_VERSION = 5.0;
\t\t\t\tTARGETED_DEVICE_FAMILY = "1";
\t\t\t\tTEST_TARGET_NAME = ${AppName};
\t\t\t}; name = Debug; };
\t\t${P.uiRelease} /* Release */ = {isa = XCBuildConfiguration; buildSettings = {
\t\t\t\tCODE_SIGNING_ALLOWED = NO;
\t\t\t\tGENERATE_INFOPLIST_FILE = YES;
\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = ${manifest.platform.minimumVersion};
\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = ${bundleId}.smoke;
\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";
\t\t\t\tSWIFT_VERSION = 5.0;
\t\t\t\tTARGETED_DEVICE_FAMILY = "1";
\t\t\t\tTEST_TARGET_NAME = ${AppName};
\t\t\t}; name = Release; };` : ""}
${extensionConfigs}
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
${hasSmokeTests ? `\t\t${P.uiConfigs} = {isa = XCConfigurationList; buildConfigurations = (
\t\t\t\t${P.uiDebug} /* Debug */,
\t\t\t\t${P.uiRelease} /* Release */,
\t\t\t); defaultConfigurationIsVisible = 0; defaultConfigurationName = Release; };` : ""}
${extensionConfigLists}
/* End XCConfigurationList section */
	};
	rootObject = ${P.proj};
}
`;

// --- запись ---
if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(APP, "Assets.xcassets", "AccentColor.colorset"), { recursive: true });
mkdirSync(join(APP, "Assets.xcassets", "AppIcon.appiconset"), { recursive: true });
mkdirSync(join(OUT, `${AppName}.xcodeproj`), { recursive: true });
if (hasSmokeTests) {
  mkdirSync(join(OUT, smokeTarget), { recursive: true });
  cpSync(join(NATIVE, "UITests", `${AppName}SmokeTests.swift`),
         join(OUT, smokeTarget, `${AppName}SmokeTests.swift`));
}

cpSync(join(NATIVE, "DesignSystem"), join(APP, "DesignSystem"), { recursive: true });
cpSync(join(NATIVE, "Runtime"), join(APP, "Runtime"), { recursive: true });
const productAssets = join(NATIVE, "apps", slug, "Assets.xcassets");
cpSync(join(NATIVE, "apps", slug), join(APP, "Screens"), {
  recursive: true,
  filter: source => source !== productAssets && !source.startsWith(`${productAssets}/`),
});
if (existsSync(productAssets)) {
  for (const item of readdirSync(productAssets)) {
    if (item === "Contents.json") continue;
    cpSync(join(productAssets, item), join(APP, "Assets.xcassets", item), { recursive: true });
  }
}
const generatedLucideAssets = materializeLucideTabAssets(
  join(APP, "Assets.xcassets"),
  manifest.design.strategy === "mimicry"
    ? manifest.design.referenceProfile?.native?.iconography
    : null,
  NATIVE,
);
for (const source of manifest.design.referenceProfile?.swiftSources || []) {
  const destination = join(APP, "ReferenceProfile", source.split("/").at(-1));
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(join(NATIVE, source), destination);
}
mkdirSync(join(APP, "Generated"), { recursive: true });

writeFileSync(join(OUT, "Info.plist"), infoPlist);
writeFileSync(join(OUT, `${AppName}.entitlements`), entitlementsPlist);
writeFileSync(join(OUT, "native-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
writeFileSync(join(OUT, "product-contract.json"), JSON.stringify(manifest.product.contract, null, 2) + "\n");
if (manifest.product.selectionReceipt) writeFileSync(
  join(OUT, "selection-receipt.json"),
  JSON.stringify(manifest.product.selectionReceipt, null, 2) + "\n",
);
writeFileSync(join(OUT, "ux-specification.json"), JSON.stringify(manifest.uxSpecification, null, 2) + "\n");
writeFileSync(join(OUT, "design-contract.json"), JSON.stringify({
  qualityFloor: manifest.design.qualityFloor,
  strategy: manifest.design.strategy,
  referenceProfile: manifest.design.referenceProfile?.id || null,
  surfaces: manifest.design.surfaceContracts,
  actions: manifest.interactions.actions,
}, null, 2) + "\n");
writeFileSync(join(OUT, "DESIGN-BRIEF.md"), generatedDesignBrief());
writeFileSync(join(APP, "Generated", "NativeConceptSpec.swift"), generatedNativeSpec());
writeFileSync(join(APP, "Generated", "NativeCaptureSurfaceOwnership.swift"), generatedCaptureSurfaceOwnership());
writeFileSync(join(OUT, `${AppName}.xcodeproj`, "project.pbxproj"), pbxproj);
if (hasSmokeTests) {
  const schemeDirectory = join(OUT, `${AppName}.xcodeproj`, "xcshareddata", "xcschemes");
  mkdirSync(schemeDirectory, { recursive: true });
  writeFileSync(join(schemeDirectory, `${smokeScheme}.xcscheme`), `<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="2620" version="1.7">
  <BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES">
    <BuildActionEntries>
      <BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES">
        <BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${P.target}" BuildableName="${AppName}.app" BlueprintName="${AppName}" ReferencedContainer="container:${AppName}.xcodeproj"/>
      </BuildActionEntry>
      <BuildActionEntry buildForTesting="YES" buildForRunning="NO" buildForProfiling="NO" buildForArchiving="NO" buildForAnalyzing="NO">
        <BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${P.uiTarget}" BuildableName="${smokeTarget}.xctest" BlueprintName="${smokeTarget}" ReferencedContainer="container:${AppName}.xcodeproj"/>
      </BuildActionEntry>
    </BuildActionEntries>
  </BuildAction>
  <TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.DebuggerFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES">
    <Testables><TestableReference skipped="NO"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${P.uiTarget}" BuildableName="${smokeTarget}.xctest" BlueprintName="${smokeTarget}" ReferencedContainer="container:${AppName}.xcodeproj"/></TestableReference></Testables>
  </TestAction>
  <LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.DebuggerFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" debugServiceExtension="internal" allowLocationSimulation="YES">
    <BuildableProductRunnable runnableDebuggingMode="0"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${P.target}" BuildableName="${AppName}.app" BlueprintName="${AppName}" ReferencedContainer="container:${AppName}.xcodeproj"/></BuildableProductRunnable>
  </LaunchAction>
  <ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES"/>
  <AnalyzeAction buildConfiguration="Debug"/>
  <ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>
`);
}

const sharedExtensionEntitlements = manifest.capabilities.entitlements.filter(item =>
  ["com.apple.security.application-groups", "keychain-access-groups"].includes(item.key),
);
for (const extension of extensionPlans) {
  const targetDir = join(OUT, "Extensions", extension.id);
  mkdirSync(targetDir, { recursive: true });
  const extensionAttributes = extension.activationRule
    ? { NSExtensionActivationRule: extension.activationRule }
    : undefined;
  const extensionDefinition = {
    NSExtensionPointIdentifier: extension.extensionPoint,
    ...(extensionAttributes ? { NSExtensionAttributes: extensionAttributes } : {}),
    ...(extension.id === "widget" ? {} : {
      NSExtensionPrincipalClass: `$(PRODUCT_MODULE_NAME).${extension.sourceFile.replace(".swift", "")}`,
    }),
  };
  writeFileSync(join(targetDir, "Info.plist"), plistDocument([
    { key: "CFBundleDisplayName", value: extension.displayName },
    { key: "CFBundleExecutable", value: "$(EXECUTABLE_NAME)" },
    { key: "CFBundleIdentifier", value: "$(PRODUCT_BUNDLE_IDENTIFIER)" },
    { key: "CFBundleInfoDictionaryVersion", value: "6.0" },
    { key: "CFBundleName", value: "$(PRODUCT_NAME)" },
    { key: "CFBundlePackageType", value: "XPC!" },
    { key: "CFBundleShortVersionString", value: "$(MARKETING_VERSION)" },
    { key: "CFBundleVersion", value: "$(CURRENT_PROJECT_VERSION)" },
    { key: "NSExtension", value: extensionDefinition },
  ]));
  writeFileSync(join(targetDir, extension.sourceFile), extension.source);
  writeFileSync(join(targetDir, `${extension.productName}.entitlements`), plistDocument([
    ...sharedExtensionEntitlements,
    ...(extension.entitlements || []),
  ]));
}

const accent = (spec.brand?.accent || "#0077FF").replace("#", "");
const [r, g, b] = [0, 2, 4].map(i => (parseInt(accent.substr(i, 2), 16) / 255).toFixed(3));
writeFileSync(join(APP, "Assets.xcassets", "Contents.json"),
  JSON.stringify({ info: { author: "xcode", version: 1 } }, null, 2));
writeFileSync(join(APP, "Assets.xcassets", "AccentColor.colorset", "Contents.json"),
  JSON.stringify({ colors: [{ idiom: "universal", color: { "color-space": "srgb", components: { red: `${r}`, green: `${g}`, blue: `${b}`, alpha: "1.000" } } }], info: { author: "xcode", version: 1 } }, null, 2));
writeFileSync(join(APP, "Assets.xcassets", "AppIcon.appiconset", "Contents.json"),
  JSON.stringify({ images: [{ idiom: "universal", platform: "ios", size: "1024x1024" }], info: { author: "xcode", version: 1 } }, null, 2));

console.log(`✓ ${AppName} → ${OUT}`);
console.log(`  Info.plist: ${manifest.capabilities.info.length} ключей + ${manifest.capabilities.backgroundModes.length} фоновых режимов`);
console.log(`  entitlements: ${manifest.capabilities.entitlements.length}`);
if (manifest.capabilities.extensionTargets.length) {
  console.log(`  extension targets: ${manifest.capabilities.extensionTargets.join(", ")}`);
}
if (generatedLucideAssets.length) {
  console.log(`  Lucide product chrome: ${generatedLucideAssets.length} template assets`);
}
