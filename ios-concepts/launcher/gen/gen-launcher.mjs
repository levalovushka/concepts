#!/usr/bin/env node
// Генератор Xcode-проекта лаунчера (macOS). Без песочницы — иначе simctl не вызвать.

import { writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dir = dirname(fileURLToPath(import.meta.url));
const LAUNCHER = join(__dir, "..");
const ROOT = join(LAUNCHER, "..");
const OUT = join(LAUNCHER, "build");
const APP = join(OUT, "App");
const NAME = "Camo";
const distribution = process.env.CAMO_DISTRIBUTION || "local";
const testFlight = distribution === "testflight";
const bundleId = process.env.CAMO_BUNDLE_ID || "app.camo.launcher";
const developmentTeam = process.env.CAMO_DEVELOPMENT_TEAM || "";
const marketingVersion = process.env.CAMO_MARKETING_VERSION || "1.0";
const buildNumber = process.env.CAMO_BUILD_NUMBER || "1";

const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>LSMinimumSystemVersion</key>
	<string>14.0</string>
	<key>NSHumanReadableCopyright</key>
	<string>Camo — тренажёр концептов</string>
	<key>ITSAppUsesNonExemptEncryption</key>
	<false/>
	<key>LSApplicationCategoryType</key>
	<string>public.app-category.developer-tools</string>
</dict>
</plist>
`;

// Developer ID распространение: песочницы нет, но hardened runtime нужен для нотаризации.
const entitlements = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.security.app-sandbox</key>
	<${testFlight ? "true" : "false"}/>
${testFlight ? `	<key>com.apple.security.files.user-selected.read-write</key>
	<true/>
	<key>com.apple.security.network.client</key>
	<true/>` : `	<key>com.apple.security.cs.allow-jit</key>
	<true/>
	<key>com.apple.security.cs.disable-library-validation</key>
	<true/>`}
</dict>
</plist>
`;

const P = {
  proj: "CB0000000000000000000001", main: "CB0000000000000000000002", prod: "CB0000000000000000000003",
  target: "CB0000000000000000000004", app: "CB0000000000000000000005", sync: "CB0000000000000000000006",
  pcl: "CB0000000000000000000007", tcl: "CB0000000000000000000008",
  pd: "CB0000000000000000000009", pr: "CB000000000000000000000A",
  td: "CB000000000000000000000B", tr: "CB000000000000000000000C",
  src: "CB000000000000000000000D", frm: "CB000000000000000000000E", rsc: "CB000000000000000000000F",
  kitRef: "CB0000000000000000000010", kitBuild: "CB0000000000000000000011",
};

const signingSettings = testFlight
  ? `				CODE_SIGN_STYLE = Automatic;
				CODE_SIGNING_ALLOWED = YES;
${developmentTeam ? `				DEVELOPMENT_TEAM = ${developmentTeam};` : ""}
				SWIFT_ACTIVE_COMPILATION_CONDITIONS = "$(inherited) CAMO_TESTFLIGHT_CATALOG";`
  : `				CODE_SIGN_STYLE = Automatic;
				CODE_SIGNING_ALLOWED = NO;`;

const settings = `				CODE_SIGN_ENTITLEMENTS = Camo.entitlements;
${signingSettings}
				COMBINE_HIDPI_IMAGES = YES;
				CURRENT_PROJECT_VERSION = ${buildNumber};
				ENABLE_HARDENED_RUNTIME = YES;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_FILE = Info.plist;
				INFOPLIST_KEY_CFBundleDisplayName = "${NAME}";
				INFOPLIST_KEY_NSHumanReadableCopyright = "";
				MACOSX_DEPLOYMENT_TARGET = 14.0;
				MARKETING_VERSION = ${marketingVersion};
				PRODUCT_BUNDLE_IDENTIFIER = ${bundleId};
				PRODUCT_NAME = "$(TARGET_NAME)";
				SWIFT_STRICT_CONCURRENCY = minimal;
				SWIFT_VERSION = 5.0;`;

const pbxproj = `// !$*UTF8*$!
{
	archiveVersion = 1;
	classes = {
	};
	objectVersion = 77;
	objects = {

${testFlight ? `/* Begin PBXBuildFile section */
		${P.kitBuild} /* DeveloperKit in Resources */ = {isa = PBXBuildFile; fileRef = ${P.kitRef} /* DeveloperKit */; };
/* End PBXBuildFile section */` : ""}

/* Begin PBXFileSystemSynchronizedRootGroup section */
		${P.sync} /* App */ = {isa = PBXFileSystemSynchronizedRootGroup; path = App; sourceTree = "<group>"; };
/* End PBXFileSystemSynchronizedRootGroup section */

/* Begin PBXFileReference section */
		${P.app} /* ${NAME}.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = "${NAME}.app"; sourceTree = BUILT_PRODUCTS_DIR; };
${testFlight ? `		${P.kitRef} /* DeveloperKit */ = {isa = PBXFileReference; lastKnownFileType = folder; path = DeveloperKit; sourceTree = "<group>"; };` : ""}
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
		${P.frm} = {isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
		${P.main} = {isa = PBXGroup; children = (
				${P.sync} /* App */,
${testFlight ? `				${P.kitRef} /* DeveloperKit */,` : ""}
				${P.prod} /* Products */,
			); sourceTree = "<group>"; };
		${P.prod} /* Products */ = {isa = PBXGroup; children = (
				${P.app} /* ${NAME}.app */,
			); name = Products; sourceTree = "<group>"; };
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
		${P.target} /* ${NAME} */ = {isa = PBXNativeTarget; buildConfigurationList = ${P.tcl}; buildPhases = (
				${P.src},
				${P.frm},
				${P.rsc},
			); buildRules = (); dependencies = (); fileSystemSynchronizedGroups = (
				${P.sync} /* App */,
			); name = ${NAME}; productName = ${NAME}; productReference = ${P.app} /* ${NAME}.app */; productType = "com.apple.product-type.application"; };
/* End PBXNativeTarget section */

/* Begin PBXProject section */
		${P.proj} = {isa = PBXProject; attributes = {
				BuildIndependentTargetsInParallel = 1;
				LastSwiftUpdateCheck = 2620;
				LastUpgradeCheck = 2620;
			}; buildConfigurationList = ${P.pcl}; compatibilityVersion = "Xcode 16.0"; developmentRegion = ru; hasScannedForEncodings = 0; knownRegions = (ru, en, Base); mainGroup = ${P.main}; minimizedProjectReferenceProxies = 1; preferredProjectObjectVersion = 77; productRefGroup = ${P.prod} /* Products */; projectDirPath = ""; projectRoot = ""; targets = (
				${P.target} /* ${NAME} */,
			); };
/* End PBXProject section */

/* Begin PBXResourcesBuildPhase section */
		${P.rsc} = {isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = (${testFlight ? `
				${P.kitBuild} /* DeveloperKit in Resources */,` : ""}
			); runOnlyForDeploymentPostprocessing = 0; };
/* End PBXResourcesBuildPhase section */

/* Begin PBXSourcesBuildPhase section */
		${P.src} = {isa = PBXSourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };
/* End PBXSourcesBuildPhase section */

/* Begin XCBuildConfiguration section */
		${P.pd} /* Debug */ = {isa = XCBuildConfiguration; buildSettings = {
				CLANG_ENABLE_MODULES = YES;
				SDKROOT = macosx;
				SWIFT_OPTIMIZATION_LEVEL = "-Onone";
			}; name = Debug; };
		${P.pr} /* Release */ = {isa = XCBuildConfiguration; buildSettings = {
				CLANG_ENABLE_MODULES = YES;
				SDKROOT = macosx;
				SWIFT_OPTIMIZATION_LEVEL = "-O";
			}; name = Release; };
		${P.td} /* Debug */ = {isa = XCBuildConfiguration; buildSettings = {
${settings}
			}; name = Debug; };
		${P.tr} /* Release */ = {isa = XCBuildConfiguration; buildSettings = {
${settings}
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

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(APP, { recursive: true });
mkdirSync(join(OUT, `${NAME}.xcodeproj`), { recursive: true });
cpSync(join(LAUNCHER, "App"), APP, { recursive: true });
writeFileSync(join(OUT, "Info.plist"), infoPlist);
writeFileSync(join(OUT, `${NAME}.entitlements`), entitlements);
writeFileSync(join(OUT, `${NAME}.xcodeproj`, "project.pbxproj"), pbxproj);

const scheme = `<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="2620" version="1.7">
  <BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES">
    <BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${P.target}" BuildableName="${NAME}.app" BlueprintName="${NAME}" ReferencedContainer="container:${NAME}.xcodeproj"/></BuildActionEntry></BuildActionEntries>
  </BuildAction>
  <LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.DebuggerFoundation.Launcher.LLDB"><BuildableProductRunnable runnableDebuggingMode="0"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${P.target}" BuildableName="${NAME}.app" BlueprintName="${NAME}" ReferencedContainer="container:${NAME}.xcodeproj"/></BuildableProductRunnable></LaunchAction>
  <ProfileAction buildConfiguration="Release"><BuildableProductRunnable runnableDebuggingMode="0"><BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${P.target}" BuildableName="${NAME}.app" BlueprintName="${NAME}" ReferencedContainer="container:${NAME}.xcodeproj"/></BuildableProductRunnable></ProfileAction>
  <AnalyzeAction buildConfiguration="Debug"/><ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>`;
const schemeDirectory = join(OUT, `${NAME}.xcodeproj`, "xcshareddata", "xcschemes");
mkdirSync(schemeDirectory, { recursive: true });
writeFileSync(join(schemeDirectory, `${NAME}.xcscheme`), scheme);

if (testFlight) {
  const kit = join(OUT, "DeveloperKit");
  const excluded = ["native/build", "native/artifacts", "launcher/build", "node_modules", ".git"];
  const copy = name => {
    const source = join(ROOT, name);
    if (!existsSync(source)) return;
    cpSync(source, join(kit, name), {
      recursive: true,
      filter: path => !excluded.some(item => relative(ROOT, path).startsWith(item)),
    });
  };
  mkdirSync(kit, { recursive: true });
  for (const name of ["package.json", "README.md", "docs", "permission-sets", "concepts", "native"]) copy(name);
  const slugs = readdirSync(join(kit, "native", "apps"), { withFileTypes: true })
    .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  for (const slug of slugs) execFileSync(process.execPath, [join(kit, "native", "gen", "gen-project.mjs"), slug], {
    cwd: kit, stdio: "ignore",
  });
  writeFileSync(join(kit, "DEVELOPER-KIT.json"), JSON.stringify({ version: marketingVersion, build: buildNumber, concepts: slugs }, null, 2) + "\n");
}

console.log(`✓ ${NAME}.app → ${OUT}`);
console.log(`  режим: ${distribution}`);
console.log(`  собрать: cd "${OUT}" && xcodebuild -project ${NAME}.xcodeproj -scheme ${NAME} -configuration Debug build`);
