#!/usr/bin/env node
// Генератор Xcode-проекта лаунчера (macOS). Без песочницы — иначе simctl не вызвать.

import { writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const LAUNCHER = join(__dir, "..");
const OUT = join(LAUNCHER, "build");
const APP = join(OUT, "App");
const NAME = "Camo";
const bundleId = "app.camo.launcher";

const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>LSMinimumSystemVersion</key>
	<string>14.0</string>
	<key>NSHumanReadableCopyright</key>
	<string>Camo — тренажёр концептов</string>
</dict>
</plist>
`;

// Developer ID распространение: песочницы нет, но hardened runtime нужен для нотаризации.
const entitlements = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.security.app-sandbox</key>
	<false/>
	<key>com.apple.security.cs.allow-jit</key>
	<true/>
	<key>com.apple.security.cs.disable-library-validation</key>
	<true/>
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
};

const settings = `				CODE_SIGN_ENTITLEMENTS = Camo.entitlements;
				CODE_SIGN_STYLE = Automatic;
				CODE_SIGNING_ALLOWED = NO;
				COMBINE_HIDPI_IMAGES = YES;
				CURRENT_PROJECT_VERSION = 1;
				ENABLE_HARDENED_RUNTIME = YES;
				GENERATE_INFOPLIST_FILE = YES;
				INFOPLIST_FILE = Info.plist;
				INFOPLIST_KEY_CFBundleDisplayName = "${NAME}";
				INFOPLIST_KEY_NSHumanReadableCopyright = "";
				MACOSX_DEPLOYMENT_TARGET = 14.0;
				MARKETING_VERSION = 1.0;
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

/* Begin PBXFileSystemSynchronizedRootGroup section */
		${P.sync} /* App */ = {isa = PBXFileSystemSynchronizedRootGroup; path = App; sourceTree = "<group>"; };
/* End PBXFileSystemSynchronizedRootGroup section */

/* Begin PBXFileReference section */
		${P.app} /* ${NAME}.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = "${NAME}.app"; sourceTree = BUILT_PRODUCTS_DIR; };
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
		${P.rsc} = {isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };
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

console.log(`✓ ${NAME}.app → ${OUT}`);
console.log(`  собрать: cd "${OUT}" && xcodebuild -project ${NAME}.xcodeproj -target ${NAME} -configuration Debug build`);
