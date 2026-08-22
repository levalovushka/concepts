#!/usr/bin/env node
// Генератор Xcode-проекта. Детерминированная часть пайплайна:
// Info.plist из concept.json дословно + сборка из DesignSystem + Runtime + apps/<slug>.

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const NATIVE = join(__dir, "..");
const ROOT = join(NATIVE, "..");

const slug = process.argv[2];
if (!slug) { console.error("usage: gen-project.mjs <slug>"); process.exit(1); }

const spec = JSON.parse(readFileSync(join(ROOT, "concepts", slug, "concept.json"), "utf8"));
const AppName = slug[0].toUpperCase() + slug.slice(1);
const bundleId = `com.camo.${slug.replace(/[-_]/g, "")}`;
const OUT = join(NATIVE, "build", slug);
const APP = join(OUT, "App");

const xml = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// --- Info.plist: usage-строки дословно + фоновые режимы ---
const usage = [];
const bg = new Set();
for (const p of spec.permissions || []) {
  const pl = p.plist || "";
  const body = p.alert?.text || "";
  if (/UsageDescription/.test(pl)) {
    for (const k of pl.split(" + ").map(s => s.trim()).filter(s => /^NS.*UsageDescription$/.test(s))) {
      if (!usage.some(u => u.key === k)) usage.push({ key: k, body });
    }
  } else if (/^UIBackgroundModes:/.test(pl)) {
    bg.add(pl.split(":")[1].trim());
  }
}

let body = "";
for (const u of usage) body += `\t<key>${u.key}</key>\n\t<string>${xml(u.body)}</string>\n`;
if (bg.size) {
  body += `\t<key>UIBackgroundModes</key>\n\t<array>\n`;
  for (const m of bg) body += `\t\t<string>${xml(m)}</string>\n`;
  body += `\t</array>\n`;
}

const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
${body}</dict>
</plist>
`;

const P = {
  proj: "CA0000000000000000000001", main: "CA0000000000000000000002", prod: "CA0000000000000000000003",
  target: "CA0000000000000000000004", app: "CA0000000000000000000005", sync: "CA0000000000000000000006",
  pcl: "CA0000000000000000000007", tcl: "CA0000000000000000000008",
  pd: "CA0000000000000000000009", pr: "CA000000000000000000000A",
  td: "CA000000000000000000000B", tr: "CA000000000000000000000C",
  src: "CA000000000000000000000D", frm: "CA000000000000000000000E", rsc: "CA000000000000000000000F",
};

const buildSettings = `				ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
				ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;
				CODE_SIGNING_ALLOWED = NO;
				CURRENT_PROJECT_VERSION = 1;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_FILE = Info.plist;
				INFOPLIST_KEY_CFBundleDisplayName = "${spec.name}";
				INFOPLIST_KEY_UILaunchScreen_Generation = YES;
				INFOPLIST_KEY_UIApplicationSceneManifest_Generation = YES;
				INFOPLIST_KEY_UISupportedInterfaceOrientations = "UIInterfaceOrientationPortrait";
				IPHONEOS_DEPLOYMENT_TARGET = 26.0;
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
			}; buildConfigurationList = ${P.pcl}; compatibilityVersion = "Xcode 16.0"; developmentRegion = ru; hasScannedForEncodings = 0; knownRegions = (ru, en, Base); mainGroup = ${P.main}; minimizedProjectReferenceProxies = 1; preferredProjectObjectVersion = 77; productRefGroup = ${P.prod} /* Products */; projectDirPath = ""; projectRoot = ""; targets = (
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
mkdirSync(join(APP, "Assets.xcassets", "AccentColor.colorset"), { recursive: true });
mkdirSync(join(APP, "Assets.xcassets", "AppIcon.appiconset"), { recursive: true });
mkdirSync(join(OUT, `${AppName}.xcodeproj`), { recursive: true });

cpSync(join(NATIVE, "DesignSystem"), join(APP, "DesignSystem"), { recursive: true });
cpSync(join(NATIVE, "Runtime"), join(APP, "Runtime"), { recursive: true });
cpSync(join(NATIVE, "apps", slug), join(APP, "Screens"), { recursive: true });

writeFileSync(join(OUT, "Info.plist"), infoPlist);
writeFileSync(join(OUT, `${AppName}.xcodeproj`, "project.pbxproj"), pbxproj);

const accent = (spec.brand?.accent || "#0077FF").replace("#", "");
const [r, g, b] = [0, 2, 4].map(i => (parseInt(accent.substr(i, 2), 16) / 255).toFixed(3));
writeFileSync(join(APP, "Assets.xcassets", "Contents.json"),
  JSON.stringify({ info: { author: "xcode", version: 1 } }, null, 2));
writeFileSync(join(APP, "Assets.xcassets", "AccentColor.colorset", "Contents.json"),
  JSON.stringify({ colors: [{ idiom: "universal", color: { "color-space": "srgb", components: { red: `${r}`, green: `${g}`, blue: `${b}`, alpha: "1.000" } } }], info: { author: "xcode", version: 1 } }, null, 2));
writeFileSync(join(APP, "Assets.xcassets", "AppIcon.appiconset", "Contents.json"),
  JSON.stringify({ images: [{ idiom: "universal", platform: "ios", size: "1024x1024" }], info: { author: "xcode", version: 1 } }, null, 2));

console.log(`✓ ${AppName} → ${OUT}`);
console.log(`  доступов в Info.plist: ${usage.length} usage + ${bg.size} фоновых режимов`);
