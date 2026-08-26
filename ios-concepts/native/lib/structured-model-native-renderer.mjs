import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { assertPathInside, NATIVE_PROJECT_ROOT } from "./project-paths.mjs";
import { compileNativeConcept } from "./compile-concept.mjs";
import { compileFactoryNativeConcept } from "./native-concept-compiler.mjs";
import { VISUAL_CALIBRATION_CATALOG } from "./visual-calibration-catalog.mjs";
import { auditVKGoldenImplementation } from "./vk-golden-implementation.mjs";
import { reviewProductUI } from "./product-ui-critic.mjs";

const devices = Object.freeze([
  Object.freeze({ id: "current", name: "iPhone 17 Pro", class: "current" }),
  Object.freeze({ id: "small", name: "iPhone 16e", class: "small-phone" }),
]);

export const NATIVE_RENDERER_INSTRUCTIONS = Object.freeze([
  "Return a complete native SwiftUI application, never HTML, WebView, pseudo-code, or a screen inventory.",
  "Use mostly native iOS components. For VK mimicry, consume the VK reference components and Lucide tab icons; for differentiation, use SF Symbols and native controls.",
  "Implement every declared action with its contracted outcome, every applicable state, persistent local demo data, authentication restoration, contextual system permission requests, denied fallbacks, and deterministic capture launch arguments.",
  "Do not render decorative or speculative tabs, segmented controls, filters, chevrons, avatars, badges, or buttons. A selector is allowed only when every option owns distinct meaningful content/state and its switch is exercised by an XCUI assertion; otherwise omit it.",
  "Use canonical content records and media ownership verbatim across every screen. When an asset binding resolves to a neutral fallback, render the provided uniform gray media asset with the contracted accessibility description; never create icon placeholders or unrelated coloured media backgrounds.",
  "Implement one XCUI journey test per acceptance journey. Tests must tap the actual controls in order and assert the observable result, not only launch each screen.",
  "For every user-consent permission, implement granted and denied XCUI journeys through the contextual product gesture. Observe the real iOS prompt with addUIInterruptionMonitor; plist keys and a mocked runtime result are not permission UX evidence.",
  "Query semantic state markers with app.descendants(matching: .any)[identifier] rather than assuming SwiftUI exposes a particular XCUI element type. Interactive controls must retain their concrete button or text-field identifiers.",
  "Model tab selection separately from nested navigation routes and modal presentation. A detail route may never become an invalid TabView selection value; cross-tab outcomes must select the destination tab before presenting its route.",
  "XCUI assertions must validate canonical surface identity and visible outcomes, not require a system NavigationBar when the selected reference profile uses VKNavigationChrome or VKTabHeader.",
  "Every capture driver must set requiresLayoutAudit=true and requiresFullLayoutAudit=true; every captured root must report its real viewport and visible primary content region through CaptureIdentity.reportLayout so horizontal or vertical escape fails deterministically.",
  "Every product-surface capture must set requiresTopSafeArea=true and declare expectedTopSurface as light or dark from the selected visual tokens; status-bar surfaces may not be omitted from pixel audit.",
  "Keep status-bar surfaces, safe areas, Liquid Glass tab bar, icon weight, spacing, typography and navigation chrome consistent with the selected visual contract.",
  "Use NativeEmailAuth and NativeOTPField for mandatory email-code authentication, NativeVisualLanguage.resolve(NativeConceptSpec.design) as the only theme seam, Permissions.request for contextual system prompts, and CaptureIdentity for capture reporting. Never reimplement or redeclare pipeline-owned runtime/design-system types.",
  "Do not generate concept.json, capture.json, surface ownership, or asset bindings. The deterministic native compiler owns those contracts; generate only Swift app and executable XCUI journey source.",
]);

function safeArtifactPart(value) {
  return String(value).replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

function deterministicAssetName(mediaId) {
  const words = String(mediaId).split(/[^A-Za-z0-9]+/).filter(Boolean);
  return `Media${words.map(word => word[0].toUpperCase() + word.slice(1)).join("") || "Asset"}`.slice(0, 60);
}

function formatGeneratedSwift(output) {
  const normalized = structuredClone(output);
  const misplacedTests = (normalized.appFiles || []).filter(file =>
    /(?:^|\/)UITests?\//i.test(file.path) || /(?:^|\/)\w*UITests?\.swift$/i.test(file.path) || /import\s+XCTest/.test(file.contents));
  normalized.appFiles = (normalized.appFiles || []).filter(file =>
    file.path?.endsWith(".swift") && !misplacedTests.includes(file));
  const testFiles = [...(normalized.uiTestFiles || []), ...misplacedTests]
    .filter(file => file.path?.endsWith(".swift"));
  normalized.uiTestFiles = [...new Map(testFiles.map(file => [file.path.split("/").at(-1), {
    ...file, path: file.path.split("/").at(-1),
  }])).values()];
  for (const file of [...(normalized.appFiles || []), ...(normalized.uiTestFiles || [])]) {
    try {
      file.contents = String(execFileSync("xcrun", [
        "swift-format", "format", "--assume-filename", file.path,
      ], { input: file.contents, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }));
    } catch (error) {
      const detail = String(error?.stderr || error?.message || error).trim();
      throw new Error(`Swift formatter rejected ${file.path}: ${detail}`);
    }
  }
  return normalized;
}

function compilerOwnedBundle(output, { factoryArtifact, experienceContract, visualDevelopment }) {
  const { concept, compiled } = compileFactoryNativeConcept({ factoryArtifact, experienceContract, visualDevelopment });
  if (!compiled.ok) throw new Error(`Deterministic native concept compilation failed:\n${compiled.diagnostics
    .filter(item => item.severity === "error")
    .map(item => `${item.code} · ${item.path}: ${item.message}`)
    .join("\n")}`);
  const nodeById = new Map(experienceContract.navigation.nodes.map(item => [item.id, item]));
  const product = experienceContract.navigation.nodes
    .filter(item => !["system", "external"].includes(item.presentation) && item.id !== "share-extension")
    .map(item => item.id);
  const drivers = experienceContract.states.flatMap(policy => policy.variants
    .filter(item => item.applicable)
    .map(item => ({
      surface: policy.screenId,
      state: item.id,
      launch: policy.screenId,
      artifact: `${safeArtifactPart(policy.screenId)}-${safeArtifactPart(item.id)}`,
      requiresLayoutAudit: true,
      requiresTopSafeArea: product.includes(policy.screenId),
      expectedTopSurface: "light",
      supplemental: !product.includes(policy.screenId),
    })));
  return {
    ...output,
    slug: concept.slug,
    concept,
    captureDrivers: { schemaVersion: 1, distinctStateGroups: [], drivers },
    surfaceOwnership: {
      schemaVersion: 2,
      product,
      pendingProduct: [],
      system: experienceContract.navigation.nodes.filter(item => ["system", "external"].includes(item.presentation)).map(item => item.id),
      extension: nodeById.has("share-extension") ? ["share-extension"] : [],
    },
    assetBindings: experienceContract.content.media.map(item => ({ mediaId: item.id, assetName: deterministicAssetName(item.id) })),
  };
}

function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function hashTree(path) {
  const hash = createHash("sha256");
  const visit = current => {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const child = join(current, entry.name);
      if (entry.isDirectory()) visit(child);
      else {
        hash.update(relative(path, child));
        hash.update(readFileSync(child));
      }
    }
  };
  visit(path);
  return hash.digest("hex");
}

function collectPassedTestNames(value, output = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectPassedTestNames(item, output);
    return output;
  }
  if (!value || typeof value !== "object") return output;
  if (value.nodeType === "Test Case" && value.result === "Passed" && typeof value.name === "string") {
    output.add(value.name.replace(/\(\)$/, ""));
  }
  for (const item of Object.values(value)) collectPassedTestNames(item, output);
  return output;
}

function safeRelativeFile(root, offset, label) {
  if (typeof offset !== "string" || !offset || offset.includes("..") || offset.startsWith("/") || offset.includes("\\")) {
    throw new Error(`${label} must be a safe project-relative path`);
  }
  return assertPathInside(root, resolve(root, offset), label, { allowRoot: false });
}

function validateBundle(bundle, experienceContract, { compileConcept = true } = {}) {
  if (!bundle || typeof bundle !== "object") throw new Error("Native renderer model returned no source bundle");
  const normalized = structuredClone(bundle);
  if (!normalized.concept && typeof normalized.conceptJson === "string") {
    try { normalized.concept = JSON.parse(normalized.conceptJson); }
    catch { throw new Error("Generated conceptJson is not valid JSON"); }
  }
  delete normalized.conceptJson;
  bundle = normalized;
  if (!/^[a-z][a-z0-9-]{2,30}$/.test(bundle.slug || "")) throw new Error("Generated concept slug must be lowercase kebab-case");
  if (!bundle.concept || bundle.concept.slug !== bundle.slug) throw new Error("Generated concept and source bundle slug differ");
  if (compileConcept) {
    const compiledConcept = compileNativeConcept(bundle.concept);
    if (!compiledConcept.ok) throw new Error(`Generated conceptJson failed native compilation:\n${compiledConcept.diagnostics
      .filter(item => item.severity === "error")
      .map(item => `${item.code} · ${item.path}: ${item.message}`)
      .join("\n")}`);
  }
  if (!Array.isArray(bundle.appFiles) || bundle.appFiles.length < 1) throw new Error("Native source bundle needs at least one Swift app file");
  const paths = new Set();
  for (const file of bundle.appFiles) {
    if (!/^[A-Za-z0-9_/-]+\.swift$/.test(file?.path || "") || file.path.includes("..")) throw new Error(`Unsafe Swift source path ${file?.path}`);
    if (paths.has(file.path)) throw new Error(`Duplicate Swift source path ${file.path}`);
    paths.add(file.path);
    if (typeof file.contents !== "string" || file.contents.length < 80) throw new Error(`Swift source ${file.path} is empty`);
    const oversizedLine = file.contents.split("\n").findIndex(line => line.length > 180);
    if (oversizedLine >= 0) throw new Error(`Swift source ${file.path}:${oversizedLine + 1} exceeds the 180 character readability limit`);
    if (/демонстрацион|демоданн/i.test(file.contents)) {
      throw new Error(`Swift source ${file.path} leaks internal demo-data labels into product copy`);
    }
    for (const reserved of ["CaptureIdentity", "Permissions", "PermissionKey", "NativeVisualLanguage", "NativeConceptSpec"]) {
      if (new RegExp(`(?:enum|struct|class|actor)\\s+${reserved}\\b`).test(file.contents)) {
        throw new Error(`Swift source ${file.path} redeclares pipeline-owned type ${reserved}`);
      }
    }
  }
  const appSource = bundle.appFiles.map(file => file.contents).join("\n");
  const vkDiagnostics = auditVKGoldenImplementation({
    strategy: bundle.concept.native?.design?.strategy,
    referenceProfile: bundle.concept.native?.design?.referenceProfile,
    swiftSource: appSource,
  });
  if (vkDiagnostics.length) throw new Error(vkDiagnostics.map(item => item.message).join("\n"));
  if (bundle.concept.native?.design?.strategy === "mimicry"
      && /\.tabItem\s*\{[\s\S]{0,320}?systemImage\s*:/.test(appSource)) {
    throw new Error("VK mimicry tab bars must use the selected Lucide asset catalog, not SF Symbol Label(systemImage:)");
  }
  if (!Array.isArray(bundle.uiTestFiles) || !bundle.uiTestFiles.length) throw new Error("Native source bundle needs executable UI journey tests");
  const journeyIds = new Set(experienceContract.journeys.map(item => item.id));
  const mappedJourneys = new Set((bundle.journeyTests || []).map(item => item.journeyId));
  for (const journeyId of journeyIds) if (!mappedJourneys.has(journeyId)) throw new Error(`Journey ${journeyId} has no UI test mapping`);
  for (const journeyId of mappedJourneys) if (!journeyIds.has(journeyId)) throw new Error(`UI test mapping references unknown journey ${journeyId}`);
  const userConsentPermissions = new Set([
    "camera", "mic", "speech", "photo", "photos", "photoadd", "location", "locationalways",
    "push", "tracking", "contacts", "calendar", "faceid", "localnet",
  ]);
  const expectedPermissionKeys = new Set((experienceContract.permissionFlows || [])
    .filter(item => userConsentPermissions.has(item.key)).map(item => item.key));
  const permissionTests = new Map((bundle.permissionJourneyTests || []).map(item => [item.permissionKey, item]));
  const uiTestSource = bundle.uiTestFiles.map(file => file.contents).join("\n");
  for (const key of expectedPermissionKeys) {
    const mapping = permissionTests.get(key);
    if (!mapping) throw new Error(`User-consent permission ${key} has no real prompt/fallback UI test mapping`);
    if (mapping.promptMode !== "system-dialog") throw new Error(`Permission ${key} must be verified through the system dialog seam`);
    if (!uiTestSource.includes(mapping.grantedTestName) || !uiTestSource.includes(mapping.deniedTestName)) {
      throw new Error(`Permission ${key} UI test source does not contain both granted and denied journeys`);
    }
  }
  for (const key of permissionTests.keys()) if (!expectedPermissionKeys.has(key)) {
    throw new Error(`Permission UI test mapping references uncontracted permission ${key}`);
  }
  if (expectedPermissionKeys.size && !/addUIInterruptionMonitor\s*\(/.test(uiTestSource)) {
    throw new Error("Permission journeys must observe real iOS authorization dialogs with addUIInterruptionMonitor");
  }
  const expectedStates = new Set(experienceContract.states.flatMap(policy => policy.variants
    .filter(item => item.applicable).map(item => `${policy.screenId}|${item.id}`)));
  const captureStates = new Set((bundle.captureDrivers?.drivers || []).map(item => `${item.surface}|${item.state}`));
  if ((bundle.captureDrivers?.drivers || []).some(item => item.requiresLayoutAudit !== true)) {
    throw new Error("Every factory capture driver must require the runtime horizontal layout audit");
  }
  const productSurfaces = new Set(bundle.surfaceOwnership?.product || []);
  for (const driver of bundle.captureDrivers?.drivers || []) if (productSurfaces.has(driver.surface)
      && (driver.requiresTopSafeArea !== true || !["light", "dark"].includes(driver.expectedTopSurface))) {
    throw new Error(`Product capture ${driver.surface}|${driver.state} must declare its status-bar surface audit`);
  }
  for (const state of expectedStates) if (!captureStates.has(state)) throw new Error(`Capture driver missing for ${state}`);
  for (const state of captureStates) if (!expectedStates.has(state)) throw new Error(`Capture driver references uncontracted state ${state}`);
  const mediaIds = new Set(experienceContract.content.media.map(item => item.id));
  const boundMedia = new Set((bundle.assetBindings || []).map(item => item.mediaId));
  for (const mediaId of mediaIds) if (!boundMedia.has(mediaId)) throw new Error(`Canonical media ${mediaId} has no reviewed asset binding`);
  return bundle;
}

export function nativeRendererModelSchema() {
  const sourceFile = {
    type: "object", additionalProperties: false, required: ["path", "contents"],
    properties: { path: { type: "string", minLength: 7 }, contents: { type: "string", minLength: 80 } },
  };
  return {
    type: "object", additionalProperties: false,
    required: ["appFiles", "uiTestFiles", "journeyTests", "permissionJourneyTests"],
    properties: {
      appFiles: { type: "array", minItems: 1, items: sourceFile },
      uiTestFiles: { type: "array", minItems: 1, items: sourceFile },
      journeyTests: {
        type: "array", minItems: 3,
        items: {
          type: "object", additionalProperties: false, required: ["journeyId", "testName"],
          properties: { journeyId: { type: "string", minLength: 2 }, testName: { type: "string", minLength: 5 } },
        },
      },
      permissionJourneyTests: {
        type: "array",
        items: {
          type: "object", additionalProperties: false,
          required: ["permissionKey", "promptMode", "grantedTestName", "deniedTestName"],
          properties: {
            permissionKey: { type: "string", minLength: 2 },
            promptMode: { const: "system-dialog" },
            grantedTestName: { type: "string", minLength: 5 },
            deniedTestName: { type: "string", minLength: 5 },
          },
        },
      },
    },
  };
}

function defaultExecutor({ root, slug, bundle }) {
  const execute = (executable, args, options = {}) => execFileSync(executable, args, {
    cwd: options.cwd || root,
    env: { ...process.env, ...(options.env || {}) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  execute(process.execPath, [join(root, "native/gen/developer-docs.mjs"), slug, "--write"]);
  execute(process.execPath, [join(root, "native/cli.mjs"), "build", slug]);
  const appName = slug[0].toUpperCase() + slug.slice(1);
  const projectDirectory = join(root, "native/build", slug);
  const journeyEvidenceDirectory = join(root, "native/artifacts", slug, "journeys-current");
  mkdirSync(journeyEvidenceDirectory, { recursive: true });
  const projectPath = join(projectDirectory, `${appName}.xcodeproj`);
  const testEvidence = [];
  for (const device of devices) {
    const resultBundle = join(journeyEvidenceDirectory, `JourneyTests-${device.id}.xcresult`);
    rmSync(resultBundle, { recursive: true, force: true });
    execute("/usr/bin/xcodebuild", [
      "-project", projectPath, "-scheme", `${appName}Smoke`,
      "-destination", `platform=iOS Simulator,name=${device.name}`,
      "-derivedDataPath", join(projectDirectory, `JourneyDerivedData-${device.id}`),
      "-resultBundlePath", resultBundle, "test",
    ], { cwd: projectDirectory });
    const testResult = JSON.parse(String(execute("xcrun", [
      "xcresulttool", "get", "test-results", "tests", "--path", resultBundle,
    ])));
    const passedTests = collectPassedTestNames(testResult);
    for (const journey of bundle.journeyTests) if (!passedTests.has(journey.testName.replace(/\(\)$/, ""))) {
      throw new Error(`Journey ${journey.journeyId} has no passed XCUI test ${journey.testName} on ${device.name}`);
    }
    for (const permission of bundle.permissionJourneyTests || []) {
      for (const testName of [permission.grantedTestName, permission.deniedTestName]) if (!passedTests.has(testName.replace(/\(\)$/, ""))) {
        throw new Error(`Permission ${permission.permissionKey} has no passed XCUI test ${testName} on ${device.name}`);
      }
    }
    testEvidence.push({ deviceId: device.id, path: resultBundle, sha256: hashTree(resultBundle), passedTests: [...passedTests].sort() });
    execute(process.execPath, [join(root, "native/gen/shots.mjs"), slug], {
      env: { DEVICE: device.name, ARTIFACT_VARIANT: device.id },
    });
  }
  return { projectPath, testEvidence };
}

function defaultPreviewExecutor({ root, slug, bundle, experienceContract }) {
  const authEntry = experienceContract.authentication?.entrySurface;
  const priority = { tab: 0, root: 1, push: 2, sheet: 3, cover: 4 };
  const screens = experienceContract.navigation.nodes
    .filter(item => item.id !== authEntry && !["system", "external"].includes(item.presentation))
    .sort((left, right) => (priority[left.presentation] ?? 9) - (priority[right.presentation] ?? 9))
    .slice(0, 5);
  const drivers = screens.map(screen => bundle.captureDrivers.drivers.find(item =>
    item.surface === screen.id && item.state === "populated/default"))
    .filter(Boolean);
  if (drivers.length < Math.min(3, screens.length)) throw new Error("Early visual gate needs populated captures for the core product screens");
  execFileSync(process.execPath, [join(root, "native/gen/shots.mjs"), slug, ...drivers.map(item => `${item.surface}--${item.state}`)], {
    cwd: root,
    env: { ...process.env, DEVICE: devices[0].name, ARTIFACT_VARIANT: "preview-current" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const directory = join(root, "native/artifacts", slug, "shots-preview-current");
  return drivers.map(driver => {
    const path = join(directory, `${driver.artifact}.png`);
    if (!existsSync(path) || statSync(path).size < 1024) throw new Error(`Early visual capture missing: ${path}`);
    return {
      id: `preview--${driver.surface}--${driver.state}`,
      deviceId: "current",
      surface: driver.surface,
      state: driver.state,
      path,
      sha256: sha256File(path),
    };
  });
}

function collectDelivery({ root, bundle, factoryArtifact, experienceContract, visualDevelopment, execution }) {
  const slug = bundle.slug;
  const visual = visualDevelopment.visualDirectionContract;
  const captures = [];
  for (const device of devices) {
    const directory = join(root, "native/artifacts", slug, `shots-${device.id}`);
    for (const driver of bundle.captureDrivers.drivers) {
      const path = join(directory, `${driver.artifact}.png`);
      if (!existsSync(path) || statSync(path).size < 1024) throw new Error(`Fresh capture missing: ${path}`);
      captures.push({
        id: `${device.id}--${driver.surface}--${driver.state}`,
        deviceId: device.id,
        surface: driver.surface,
        state: driver.state,
        path,
        sha256: sha256File(path),
      });
    }
  }
  const currentEvidence = execution.testEvidence.find(item => item.deviceId === "current");
  return {
    productContractId: factoryArtifact.productDevelopment.productContract.contractId,
    experienceContractId: experienceContract.experienceContractId,
    visualDirectionContractId: visual.visualDirectionContractId,
    contentManifest: structuredClone(experienceContract.content),
    consumedBlueprintScreenIds: experienceContract.screenBlueprints.map(item => item.screenId),
    consumedRecipeRoles: visual.direction.componentRecipes.map(item => item.role),
    concept: bundle.concept,
    testMatrix: { devices },
    buildReceipt: {
      passed: true,
      xcodeProjectPath: execution.projectPath,
      sha256: hashTree(join(root, "native/build", slug)),
    },
    interactionReceipts: experienceContract.journeys.map(journey => ({
      journeyId: journey.id,
      actionIds: journey.actionIds,
      passed: true,
      evidencePath: currentEvidence.path,
      sha256: currentEvidence.sha256,
      devices: execution.testEvidence.map(item => ({ deviceId: item.deviceId, passedTestNames: item.passedTests })),
    })),
    permissionReceipts: (bundle.permissionJourneyTests || []).map(permission => ({
      permissionKey: permission.permissionKey,
      promptMode: permission.promptMode,
      grantedTestName: permission.grantedTestName,
      deniedTestName: permission.deniedTestName,
      devices: execution.testEvidence.map(item => ({
        deviceId: item.deviceId,
        grantedPassed: item.passedTests.includes(permission.grantedTestName.replace(/\(\)$/, "")),
        deniedPassed: item.passedTests.includes(permission.deniedTestName.replace(/\(\)$/, "")),
        evidencePath: item.path,
        sha256: item.sha256,
      })),
    })),
    captures,
    developerFiles: {
      xcodeProject: execution.projectPath,
      concept: join(root, "concepts", slug, "concept.json"),
      documentation: readdirSync(join(root, "concepts", slug, "docs")).map(item => join(root, "concepts", slug, "docs", item)),
    },
  };
}

export function createStructuredModelNativeRenderer({
  model,
  assetProvider,
  projectRoot = NATIVE_PROJECT_ROOT,
  executor = defaultExecutor,
  previewExecutor = defaultPreviewExecutor,
  previewReviewer = null,
}) {
  if (!model || typeof model.generateStructured !== "function") throw new TypeError("model.generateStructured is required");
  if (!assetProvider || typeof assetProvider.materialize !== "function") throw new TypeError("assetProvider.materialize is required");
  const ownedSlugs = new Set();
  return Object.freeze({
    async render({ factoryArtifact, experienceContract, visualDevelopment, revision, attempt }) {
      const calibrationId = visualDevelopment.visualDirectionContract?.calibrationId;
      const implementationCalibration = VISUAL_CALIBRATION_CATALOG.find(item => item.id === calibrationId) || null;
      if (!implementationCalibration) throw new Error(`Native renderer cannot resolve visual calibration ${calibrationId || "<missing>"}`);
      const output = await model.generateStructured({
        operation: "camo.native-swiftui-renderer.v1",
        input: {
          productContract: factoryArtifact.productDevelopment.productContract,
          worldModel: factoryArtifact.worldModels.find(item => item.id === factoryArtifact.selectedWorldModelId),
          targetProduct: factoryArtifact.targetProduct,
          experienceContract,
          visualDevelopment,
          implementationCalibration,
          revision,
          attempt,
          instructions: NATIVE_RENDERER_INSTRUCTIONS,
        },
        schema: nativeRendererModelSchema(),
      });
      const formattedOutput = formatGeneratedSwift(output);
      const bundle = validateBundle(compilerOwnedBundle(formattedOutput, { factoryArtifact, experienceContract, visualDevelopment }), experienceContract);
      const conceptDirectory = safeRelativeFile(projectRoot, `concepts/${bundle.slug}`, "concept directory");
      const appDirectory = safeRelativeFile(projectRoot, `native/apps/${bundle.slug}`, "app directory");
      if (attempt === 1 && (existsSync(conceptDirectory) || existsSync(appDirectory))) throw new Error(`Refusing to overwrite existing concept ${bundle.slug}`);
      if (attempt > 1 && (existsSync(conceptDirectory) || existsSync(appDirectory)) && !ownedSlugs.has(bundle.slug)) throw new Error(`Revision cannot overwrite unowned concept ${bundle.slug}`);
      rmSync(conceptDirectory, { recursive: true, force: true });
      rmSync(appDirectory, { recursive: true, force: true });
      mkdirSync(conceptDirectory, { recursive: true });
      mkdirSync(appDirectory, { recursive: true });
      writeFileSync(join(conceptDirectory, "concept.json"), JSON.stringify(bundle.concept, null, 2) + "\n");
      for (const file of bundle.appFiles) {
        const path = safeRelativeFile(appDirectory, file.path, "Swift source");
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, file.contents.endsWith("\n") ? file.contents : `${file.contents}\n`);
      }
      for (const file of bundle.uiTestFiles) {
        const path = safeRelativeFile(appDirectory, `UITests/${file.path}`, "UI test source");
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, file.contents.endsWith("\n") ? file.contents : `${file.contents}\n`);
      }
      writeFileSync(join(appDirectory, "capture.json"), JSON.stringify(bundle.captureDrivers, null, 2) + "\n");
      writeFileSync(join(appDirectory, "product-state-surfaces.json"), JSON.stringify(bundle.surfaceOwnership, null, 2) + "\n");
      await assetProvider.materialize({
        root: projectRoot,
        slug: bundle.slug,
        media: structuredClone(experienceContract.content.media),
        bindings: structuredClone(bundle.assetBindings),
      });
      ownedSlugs.add(bundle.slug);
      if (previewReviewer) {
        const previewCaptures = await previewExecutor({
          root: projectRoot, slug: bundle.slug, bundle, experienceContract,
        });
        const preview = await reviewProductUI({
          concept: bundle.concept,
          captures: previewCaptures,
          integrityContract: experienceContract,
          reviewer: previewReviewer,
        });
        if (!preview.ok) throw new Error(`Early product/UI preview blocked before full matrix:\n${preview.diagnostics
          .map(item => `${item.code}: ${item.message}`).join("\n")}`);
      }
      const execution = await executor({ root: projectRoot, slug: bundle.slug, bundle, devices });
      return collectDelivery({ root: projectRoot, bundle, factoryArtifact, experienceContract, visualDevelopment, execution });
    },
  });
}

export function createNoMediaAssetProvider() {
  return Object.freeze({
    async materialize({ media }) {
      if (media.length) throw new Error("This factory run needs a real semantic media provider; placeholder generation is forbidden");
    },
  });
}

export function createNeutralMediaPlaceholderProvider() {
  return Object.freeze({
    async materialize({ root, slug, media, bindings }) {
      const mediaIds = new Set(media.map(item => item.id));
      const bindingByMedia = new Map(bindings.map(item => [item.mediaId, item]));
      for (const id of mediaIds) if (!bindingByMedia.has(id)) throw new Error(`Neutral media fallback lacks asset binding for ${id}`);
      const assets = assertPathInside(root, resolve(root, "native", "apps", slug, "Assets.xcassets"), "neutral media assets", { allowRoot: false });
      mkdirSync(assets, { recursive: true });
      for (const id of mediaIds) {
        const assetName = bindingByMedia.get(id).assetName;
        if (!/^[A-Za-z][A-Za-z0-9_-]{1,60}$/.test(assetName)) throw new Error(`Unsafe neutral media asset name ${assetName}`);
        const imageset = join(assets, `${assetName}.imageset`);
        mkdirSync(imageset, { recursive: true });
        writeFileSync(join(imageset, "placeholder.svg"), [
          '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">',
          '<rect width="1200" height="800" fill="#E5E7EB"/>',
          '</svg>',
          '',
        ].join("\n"));
        writeFileSync(join(imageset, "Contents.json"), JSON.stringify({
          images: [{ filename: "placeholder.svg", idiom: "universal" }],
          info: { author: "xcode", version: 1 },
          properties: { "preserves-vector-representation": true },
        }, null, 2) + "\n");
      }
    },
  });
}

export {
  collectPassedTestNames,
  devices as NATIVE_FACTORY_TEST_DEVICES,
  validateBundle as validateNativeSourceBundle,
};
