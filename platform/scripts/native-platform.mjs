#!/usr/bin/env node
/**
 * Платформенный слой: то, что выводится из concept.json без потери смысла.
 *
 * Info.plist, entitlements, фоновые режимы и Xcode-проект — прямое следствие
 * набора доступов. Продуктового кода отсюда не приходит: композицию экранов
 * вывести нельзя, её принимают решением (см. native-apps/README.md).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { ROOT } from './lib.mjs';

const CAPABILITIES = JSON.parse(
  readFileSync(join(ROOT, 'native', 'capability-map.json'), 'utf8')
).capabilities;

export { CAPABILITIES };

const uid = () => randomUUID().replace(/-/g, '').slice(0, 24).toUpperCase();

/** Info.plist и entitlements выводятся из набора доступов, а не пишутся руками. */
export function platformFiles(compiled) {
  const usage = {};
  const entitlements = {};
  const backgroundModes = new Set();
  const bonjour = new Set();
  const taskIds = new Set();
  const bundle = `app.camo.${compiled.slug}`;

  for (const permission of compiled.permissions) {
    const cap = CAPABILITIES[permission.key];
    for (const key of cap.usageKeys || []) usage[key] = permission.alertText;
    for (const mode of cap.backgroundModes || []) backgroundModes.add(mode);
    for (const service of cap.bonjourServices || []) bonjour.add(service);
    for (const id of cap.taskIdentifiers || []) taskIds.add(`${bundle}.${id}`);
    for (const [key, value] of Object.entries(cap.entitlements || {})) {
      const resolve = (v) => (typeof v === 'string' ? v.replace('__BUNDLE__', bundle).replace('__DOMAIN__', compiled.slug + '.app') : v);
      entitlements[key] = Array.isArray(value) ? value.map(resolve) : resolve(value);
    }
  }
  return { usage, entitlements, backgroundModes: [...backgroundModes], bonjour: [...bonjour], taskIds: [...taskIds], bundle };
}

const plistValue = (value, indent = '\t') => {
  if (Array.isArray(value)) return `<array>\n${value.map((v) => `${indent}\t${plistValue(v, indent + '\t')}`).join('\n')}\n${indent}</array>`;
  if (typeof value === 'boolean') return value ? '<true/>' : '<false/>';
  return `<string>${String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</string>`;
};

const plistDict = (pairs) => Object.entries(pairs)
  .map(([k, v]) => `\t<key>${k}</key>\n\t${plistValue(v)}`).join('\n');

export function writeInfoPlist(dir, compiled, platform) {
  const dict = {
    CFBundleDevelopmentRegion: 'ru',
    CFBundleExecutable: '$(EXECUTABLE_NAME)',
    CFBundleIdentifier: '$(PRODUCT_BUNDLE_IDENTIFIER)',
    CFBundleInfoDictionaryVersion: '6.0',
    CFBundleName: '$(PRODUCT_NAME)',
    CFBundlePackageType: '$(PRODUCT_BUNDLE_PACKAGE_TYPE)',
    CFBundleDisplayName: compiled.name,
    CFBundleShortVersionString: '1.0',
    CFBundleVersion: '1',
    UILaunchScreen: {},
    UISupportedInterfaceOrientations: ['UIInterfaceOrientationPortrait'],
    ...platform.usage,
  };
  if (platform.backgroundModes.length) dict.UIBackgroundModes = platform.backgroundModes;
  if (platform.bonjour.length) dict.NSBonjourServices = platform.bonjour;
  if (platform.taskIds.length) dict.BGTaskSchedulerPermittedIdentifiers = platform.taskIds;

  const body = Object.entries(dict).map(([k, v]) => {
    if (k === 'UILaunchScreen') return `\t<key>${k}</key>\n\t<dict/>`;
    return `\t<key>${k}</key>\n\t${plistValue(v)}`;
  }).join('\n');

  writeFileSync(join(dir, 'Info.plist'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n${body}\n</dict>\n</plist>\n`);
}

export function writeEntitlements(dir, platform) {
  if (!Object.keys(platform.entitlements).length) return false;
  writeFileSync(join(dir, 'Concept.entitlements'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n${plistDict(platform.entitlements)}\n</dict>\n</plist>\n`);
  return true;
}

/** Данные концепта попадают в приложение как JSON — генерируемый Swift не содержит логики. */
function writeConceptData(dir, compiled) {
  const json = JSON.stringify(compiled, null, 1);
  writeFileSync(join(dir, 'ConceptData.swift'),
    `// Сгенерировано scripts/build-native.mjs из concepts/${compiled.slug}/concept.json. Не править руками.\nimport Foundation\n\nenum ConceptData {\n    static let spec: ConceptSpec = {\n        let data = Data(raw.utf8)\n        // Спека валидируется на сборке; падение здесь означает рассинхрон генератора и ядра.\n        return try! JSONDecoder().decode(ConceptSpec.self, from: data)\n    }()\n\n    static let raw = #"""\n${json}\n"""#\n}\n`);

  const adapters = Object.entries(CAPABILITIES).map(([key, cap]) => `        "${key}": "${cap.adapter}",`).join('\n');
  writeFileSync(join(dir, 'CapabilityAdapters.swift'),
    `// Сгенерировано из native/capability-map.json. Не править руками.\nimport Foundation\n\nenum CapabilityAdapters {\n    static let map: [String: String] = [\n${adapters}\n    ]\n}\n`);
}


/** Минимальный pbxproj с одним таргетом приложения. */
export function writeProject(outDir, compiled, platform, hasEntitlements, sources) {
  const projDir = join(outDir, `${compiled.slug}.xcodeproj`);
  mkdirSync(projDir, { recursive: true });

  const ids = {};
  const need = ['project', 'target', 'productRef', 'mainGroup', 'sourcesGroup', 'productsGroup',
    'buildConfigList', 'projectConfigList', 'debug', 'release', 'targetDebug', 'targetRelease',
    'sourcesPhase', 'resourcesPhase', 'frameworksPhase'];
  for (const k of need) ids[k] = uid();
  const fileRefs = sources.map((name) => ({ name, ref: uid(), build: uid() }));

  const settings = (config) => `\t\t\t\tASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES;
\t\t\t\tCODE_SIGN_STYLE = Automatic;
\t\t\t\tCURRENT_PROJECT_VERSION = 1;
\t\t\t\tENABLE_PREVIEWS = YES;
\t\t\t\tGENERATE_INFOPLIST_FILE = NO;
\t\t\t\tINFOPLIST_FILE = Sources/Info.plist;
\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = 26.0;
\t\t\t\tMARKETING_VERSION = 1.0;
\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = ${platform.bundle};
\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";
\t\t\t\tSWIFT_EMIT_LOC_STRINGS = YES;
\t\t\t\tSWIFT_VERSION = 6.0;
\t\t\t\tTARGETED_DEVICE_FAMILY = 1;${hasEntitlements ? '\n\t\t\t\tCODE_SIGN_ENTITLEMENTS = Sources/Concept.entitlements;' : ''}
\t\t\t\tSWIFT_ACTIVE_COMPILATION_CONDITIONS = "${config === 'Debug' ? 'DEBUG' : ''}";`;

  const pbx = `// !$*UTF8*$!
{
\tarchiveVersion = 1;
\tclasses = {
\t};
\tobjectVersion = 56;
\tobjects = {

/* Begin PBXBuildFile section */
${fileRefs.map((f) => `\t\t${f.build} /* ${f.name} */ = {isa = PBXBuildFile; fileRef = ${f.ref} /* ${f.name} */; };`).join('\n')}
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
${fileRefs.map((f) => `\t\t${f.ref} /* ${f.name} */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = ${f.name}; sourceTree = "<group>"; };`).join('\n')}
\t\t${ids.productRef} /* ${compiled.slug}.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = "${compiled.slug}.app"; sourceTree = BUILT_PRODUCTS_DIR; };
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
\t\t${ids.frameworksPhase} = {isa = PBXFrameworksBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
\t\t${ids.mainGroup} = {
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
\t\t\t\t${ids.sourcesGroup} /* Sources */,
\t\t\t\t${ids.productsGroup} /* Products */,
\t\t\t);
\t\t\tsourceTree = "<group>";
\t\t};
\t\t${ids.sourcesGroup} /* Sources */ = {
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
${fileRefs.map((f) => `\t\t\t\t${f.ref} /* ${f.name} */,`).join('\n')}
\t\t\t);
\t\t\tpath = Sources;
\t\t\tsourceTree = "<group>";
\t\t};
\t\t${ids.productsGroup} /* Products */ = {
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
\t\t\t\t${ids.productRef} /* ${compiled.slug}.app */,
\t\t\t);
\t\t\tname = Products;
\t\t\tsourceTree = "<group>";
\t\t};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
\t\t${ids.target} /* ${compiled.slug} */ = {
\t\t\tisa = PBXNativeTarget;
\t\t\tbuildConfigurationList = ${ids.buildConfigList};
\t\t\tbuildPhases = (
\t\t\t\t${ids.sourcesPhase},
\t\t\t\t${ids.frameworksPhase},
\t\t\t\t${ids.resourcesPhase},
\t\t\t);
\t\t\tbuildRules = ();
\t\t\tdependencies = ();
\t\t\tname = "${compiled.name}";
\t\t\tproductName = "${compiled.name}";
\t\t\tproductReference = ${ids.productRef};
\t\t\tproductType = "com.apple.product-type.application";
\t\t};
/* End PBXNativeTarget section */

/* Begin PBXProject section */
\t\t${ids.project} = {
\t\t\tisa = PBXProject;
\t\t\tattributes = {
\t\t\t\tBuildIndependentTargetsInParallel = 1;
\t\t\t\tLastSwiftUpdateCheck = 2600;
\t\t\t\tLastUpgradeCheck = 2600;
\t\t\t};
\t\t\tbuildConfigurationList = ${ids.projectConfigList};
\t\t\tdevelopmentRegion = ru;
\t\t\thasScannedForEncodings = 0;
\t\t\tknownRegions = (ru, Base);
\t\t\tmainGroup = ${ids.mainGroup};
\t\t\tproductRefGroup = ${ids.productsGroup};
\t\t\tprojectDirPath = "";
\t\t\tprojectRoot = "";
\t\t\ttargets = (
\t\t\t\t${ids.target} /* ${compiled.slug} */,
\t\t\t);
\t\t};
/* End PBXProject section */

/* Begin PBXResourcesBuildPhase section */
\t\t${ids.resourcesPhase} = {isa = PBXResourcesBuildPhase; buildActionMask = 2147483647; files = (); runOnlyForDeploymentPostprocessing = 0; };
/* End PBXResourcesBuildPhase section */

/* Begin PBXSourcesBuildPhase section */
\t\t${ids.sourcesPhase} = {
\t\t\tisa = PBXSourcesBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
${fileRefs.map((f) => `\t\t\t\t${f.build} /* ${f.name} */,`).join('\n')}
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t};
/* End PBXSourcesBuildPhase section */

/* Begin XCBuildConfiguration section */
\t\t${ids.debug} /* Debug */ = {
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {
\t\t\t\tALWAYS_SEARCH_USER_PATHS = NO;
\t\t\t\tCLANG_ENABLE_OBJC_ARC = YES;
\t\t\t\tCOPY_PHASE_STRIP = NO;
\t\t\t\tDEBUG_INFORMATION_FORMAT = dwarf;
\t\t\t\tENABLE_STRICT_OBJC_MSGSEND = YES;
\t\t\t\tGCC_OPTIMIZATION_LEVEL = 0;
\t\t\t\tONLY_ACTIVE_ARCH = YES;
\t\t\t\tSDKROOT = iphoneos;
\t\t\t\tSWIFT_OPTIMIZATION_LEVEL = "-Onone";
\t\t\t};
\t\t\tname = Debug;
\t\t};
\t\t${ids.release} /* Release */ = {
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {
\t\t\t\tALWAYS_SEARCH_USER_PATHS = NO;
\t\t\t\tCLANG_ENABLE_OBJC_ARC = YES;
\t\t\t\tDEBUG_INFORMATION_FORMAT = "dwarf-with-dsym";
\t\t\t\tENABLE_STRICT_OBJC_MSGSEND = YES;
\t\t\t\tSDKROOT = iphoneos;
\t\t\t\tSWIFT_COMPILATION_MODE = wholemodule;
\t\t\t\tVALIDATE_PRODUCT = YES;
\t\t\t};
\t\t\tname = Release;
\t\t};
\t\t${ids.targetDebug} /* Debug */ = {
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {
${settings('Debug')}
\t\t\t};
\t\t\tname = Debug;
\t\t};
\t\t${ids.targetRelease} /* Release */ = {
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {
${settings('Release')}
\t\t\t};
\t\t\tname = Release;
\t\t};
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
\t\t${ids.projectConfigList} = {
\t\t\tisa = XCConfigurationList;
\t\t\tbuildConfigurations = (
\t\t\t\t${ids.debug} /* Debug */,
\t\t\t\t${ids.release} /* Release */,
\t\t\t);
\t\t\tdefaultConfigurationIsVisible = 0;
\t\t\tdefaultConfigurationName = Release;
\t\t};
\t\t${ids.buildConfigList} = {
\t\t\tisa = XCConfigurationList;
\t\t\tbuildConfigurations = (
\t\t\t\t${ids.targetDebug} /* Debug */,
\t\t\t\t${ids.targetRelease} /* Release */,
\t\t\t);
\t\t\tdefaultConfigurationIsVisible = 0;
\t\t\tdefaultConfigurationName = Release;
\t\t};
/* End XCConfigurationList section */
\t};
\trootObject = ${ids.project};
}
`;
  writeFileSync(join(projDir, 'project.pbxproj'), pbx);

  mkdirSync(join(projDir, 'xcshareddata', 'xcschemes'), { recursive: true });
  writeFileSync(join(projDir, 'xcshareddata', 'xcschemes', `${compiled.slug}.xcscheme`),
    `<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion = "2600" version = "1.7">
   <BuildAction parallelizeBuildables = "YES" buildImplicitDependencies = "YES">
      <BuildActionEntries>
         <BuildActionEntry buildForTesting = "YES" buildForRunning = "YES" buildForProfiling = "YES" buildForArchiving = "YES" buildForAnalyzing = "YES">
            <BuildableReference BuildableIdentifier = "primary" BlueprintIdentifier = "${ids.target}" BuildableName = "${compiled.slug}.app" BlueprintName = "${compiled.slug}" ReferencedContainer = "container:${compiled.slug}.xcodeproj"/>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <TestAction buildConfiguration = "Debug" selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv = "YES"/>
   <LaunchAction buildConfiguration = "Debug" selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB" launchStyle = "0" useCustomWorkingDirectory = "NO" ignoresPersistentStateOnLaunch = "NO" debugDocumentVersioning = "YES" debugServiceExtension = "internal" allowLocationSimulation = "YES">
      <BuildableProductRunnable runnableDebuggingMode = "0">
         <BuildableReference BuildableIdentifier = "primary" BlueprintIdentifier = "${ids.target}" BuildableName = "${compiled.slug}.app" BlueprintName = "${compiled.slug}" ReferencedContainer = "container:${compiled.slug}.xcodeproj"/>
      </BuildableProductRunnable>
   </LaunchAction>
   <ProfileAction buildConfiguration = "Release" shouldUseLaunchSchemeArgsEnv = "YES" savedToolIdentifier = "" useCustomWorkingDirectory = "NO" debugDocumentVersioning = "YES"/>
   <AnalyzeAction buildConfiguration = "Debug"/>
   <ArchiveAction buildConfiguration = "Release" revealArchiveInOrganizer = "YES"/>
</Scheme>
`);
  return projDir;
}
