import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { compileProductBlueprint } from "./lean-native-factory.mjs";
import { createLeanDeliveryProof } from "./lean-delivery-proof.mjs";
import { writeLeanDeveloperDocumentation } from "./lean-developer-documentation.mjs";
import { compileLeanNativeShell } from "./lean-native-shell-compiler.mjs";
import { auditActionBindings } from "./action-binding-audit.mjs";
import { auditLeanProduct } from "./lean-product-audit.mjs";
import { compileLeanProductUIContract, verifyLeanProductUIContract } from "./lean-product-ui-contract.mjs";
import { shotArtifactDirectory } from "./shot-artifacts.mjs";
import { NATIVE_RENDERER_INSTRUCTIONS } from "./structured-model-native-renderer.mjs";

function sourceFileSchema() {
  return {
    type: "object", additionalProperties: false, required: ["path", "contents"],
    properties: { path: { type: "string", minLength: 7 }, contents: { type: "string", minLength: 100 } },
  };
}

export function leanNativeSourceSchema() {
  return {
    type: "object", additionalProperties: false,
    required: ["appFiles", "uiTestFiles", "smokeTestNames", "screenImplementations", "capabilityImplementations"],
    properties: {
      appFiles: { type: "array", minItems: 3, maxItems: 14, items: sourceFileSchema() },
      uiTestFiles: { type: "array", minItems: 1, maxItems: 4, items: sourceFileSchema() },
      smokeTestNames: { type: "array", minItems: 3, maxItems: 6, items: { type: "string", minLength: 8 } },
      screenImplementations: {
        type: "array", minItems: 3, maxItems: 40,
        items: {
          type: "object", additionalProperties: false,
          required: ["screenId", "sourceFile", "actionIds"],
          properties: {
            screenId: { type: "string", minLength: 2 },
            sourceFile: { type: "string", minLength: 7 },
            actionIds: { type: "array", minItems: 0, maxItems: 30, items: { type: "string", minLength: 2 } },
          },
        },
      },
      capabilityImplementations: {
        type: "array", minItems: 1, maxItems: 40,
        items: {
          type: "object", additionalProperties: false,
          required: ["key", "screenId", "actionId", "sourceFile", "grantedOutcomeIdentifier", "deniedOutcomeIdentifier", "testName"],
          properties: {
            key: { type: "string", minLength: 2 }, screenId: { type: "string", minLength: 2 },
            actionId: { type: "string", minLength: 2 }, sourceFile: { type: "string", minLength: 7 },
            grantedOutcomeIdentifier: { type: "string", minLength: 4 },
            deniedOutcomeIdentifier: { type: "string", minLength: 4 },
            testName: { type: "string", minLength: 8 },
          },
        },
      },
    },
  };
}

function safeFile(root, relative, label) {
  if (typeof relative !== "string" || !/^[A-Za-z0-9_/-]+\.swift$/.test(relative) || relative.includes("..")) {
    throw new Error(`${label} has unsafe path ${relative}`);
  }
  const path = resolve(root, relative);
  if (!path.startsWith(`${resolve(root)}/`)) throw new Error(`${label} escapes its product directory`);
  return path;
}

export function repairSwiftBuilderBoundaries(source) {
  // Structured output occasionally preserves spaces while losing the newline
  // between adjacent SwiftUI result-builder expressions. `} } Section {` is
  // invalid Swift, while the same expressions separated by a newline are
  // valid and have an unambiguous meaning. Keep this repair deliberately
  // limited to known SwiftUI expression starters; syntax errors outside this
  // boundary remain fail-closed in swift-format.
  return source.replace(
    /}\s+(?=(?:Section|ForEach|Button|NavigationLink|Text|VStack|HStack|ZStack|Spacer|Divider|Group|ScrollView|List|LazyVStack|LazyHStack|ContentUnavailableView)\b)/g,
    "}\n",
  );
}

function formatSourceBundle(bundle) {
  const formatted = structuredClone(bundle);
  for (const file of [...(formatted.appFiles || []), ...(formatted.uiTestFiles || [])]) {
    try {
      file.contents = execFileSync("xcrun", ["swift-format", "format", "--assume-filename", file.path], {
        input: repairSwiftBuilderBoundaries(file.contents), encoding: "utf8", stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (error) {
      throw new Error(`swift-format rejected ${file.path}: ${String(error?.stderr || error?.message || error).trim()}`);
    }
  }
  return formatted;
}

function validateSourceBundle(bundle, blueprint) {
  if (!bundle?.appFiles?.length || !bundle?.uiTestFiles?.length || (bundle.smokeTestNames || []).length < 3) {
    throw new Error("Lean native source needs app files, executable UI smoke tests and at least three test names");
  }
  const paths = new Set();
  for (const file of [...bundle.appFiles, ...bundle.uiTestFiles]) {
    if (paths.has(file.path)) throw new Error(`Duplicate generated source path ${file.path}`);
    paths.add(file.path);
    if (typeof file.contents !== "string" || file.contents.length < 100) throw new Error(`Generated source ${file.path} is empty`);
    if (file.contents.split("\n").some(line => line.length > 180)) throw new Error(`Generated source ${file.path} contains a line longer than 180 characters`);
  }
  const appSource = bundle.appFiles.map(file => file.contents).join("\n");
  const uiTestSource = bundle.uiTestFiles.map(file => file.contents).join("\n");
  for (const reserved of ["CaptureIdentity", "Permissions", "PermissionKey", "NativeVisualLanguage", "NativeConceptSpec", "NativeEmailAuth", "NativeOTPField"]) {
    if (new RegExp(`(?:enum|struct|class|actor)\\s+${reserved}\\b`).test(appSource)) throw new Error(`Generated source redeclares pipeline-owned type ${reserved}`);
  }
  for (const token of ["NativeEmailAuth", "NativeVisualLanguage.resolve", "CaptureIdentity.report", "CaptureIdentity.reportLayout"]) {
    if (!appSource.includes(token)) throw new Error(`Generated source does not consume required shared seam ${token}`);
  }
  if (blueprint.strategy === "mimicry" && /\.tabItem\s*\{[\s\S]{0,240}?systemImage\s*:/.test(appSource)) {
    throw new Error("VK mimicry must use compiled Lucide tab assets, not SF Symbols in the tab bar");
  }
  if (blueprint.strategy === "mimicry" && !/\bTabView\s*\(/.test(appSource) && !/\bTabView\s*\{/.test(appSource)) {
    throw new Error("VK mimicry must keep the native TabView shell so iOS owns Liquid Glass tab-bar behavior");
  }
  if (blueprint.selectionReceipt) {
    const fileByPath = new Map(bundle.appFiles.map(file => [file.path, file.contents]));
    const implementationByScreen = new Map((bundle.screenImplementations || []).map(item => [item.screenId, item]));
    for (const screen of blueprint.navigation.screens) {
      if (screen.id === "login") continue;
      const implementation = implementationByScreen.get(screen.id);
      if (!implementation) throw new Error(`Generated source has no implementation map for screen ${screen.id}`);
      const expected = [...screen.actionIds].sort();
      const actual = [...new Set(implementation.actionIds)].sort();
      if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(
        `Screen ${screen.id} action implementation drift: expected ${expected.join(", ")}; got ${actual.join(", ")}`,
      );
      const source = fileByPath.get(implementation.sourceFile);
      if (!source) throw new Error(`Screen ${screen.id} points to missing source ${implementation.sourceFile}`);
      for (const actionId of expected) {
        const marker = `${screen.id}.${actionId}`;
        if (!source.includes(`.nativeAction("${marker}")`)) throw new Error(`${marker} is not bound in ${implementation.sourceFile}`);
      }
    }
    const capabilityMap = new Map((bundle.capabilityImplementations || []).map(item => [item.key, item]));
    for (const capability of blueprint.capabilities) {
      const implementation = capabilityMap.get(capability.key);
      if (!implementation || implementation.actionId !== capability.actionId) throw new Error(
        `Capability ${capability.key} has no implementation receipt for ${capability.actionId}`,
      );
      const source = fileByPath.get(implementation.sourceFile) || "";
      for (const marker of [implementation.grantedOutcomeIdentifier, implementation.deniedOutcomeIdentifier]) {
        if (!source.includes(marker) || !uiTestSource.includes(marker)) throw new Error(
          `Capability ${capability.key} outcome ${marker} is not present in source and XCUI`,
        );
      }
      if (!uiTestSource.includes(implementation.testName)) throw new Error(
        `Capability ${capability.key} test ${implementation.testName} is missing`,
      );
    }
    for (const item of blueprint.localization || []) if (!(item.screenIds || []).every(screen => screen === "login")
        && !appSource.includes(item.key) && !appSource.includes(item.source)) {
      throw new Error(`Generated source does not consume localization ${item.key}`);
    }
    for (const fixture of blueprint.fixtures || []) if (!appSource.includes(fixture.id)) {
      throw new Error(`Generated source does not consume deterministic fixture ${fixture.id}`);
    }
    for (const scenario of blueprint.acceptanceScenarios || []) if (!uiTestSource.includes(scenario.id)
        && !scenario.actionIds.every(actionId => uiTestSource.includes(actionId))) {
      throw new Error(`Generated XCUI does not cover acceptance scenario ${scenario.id}`);
    }
  }
  return Object.freeze({
    appFiles: bundle.appFiles.map(Object.freeze), uiTestFiles: bundle.uiTestFiles.map(Object.freeze),
    smokeTestNames: Object.freeze([...new Set(bundle.smokeTestNames)]),
    screenImplementations: Object.freeze((bundle.screenImplementations || []).map(Object.freeze)),
    capabilityImplementations: Object.freeze((bundle.capabilityImplementations || []).map(Object.freeze)),
  });
}

function auditGeneratedImplementation({ bundle, blueprint, manifest, projectRoot }) {
  const swiftSource = bundle.appFiles.map(file => file.contents).join("\n");
  const uiTestSource = bundle.uiTestFiles.map(file => file.contents).join("\n");
  const runtimeSource = ["Permissions.swift", "AppLifecycle.swift"]
    .map(file => readFileSync(join(projectRoot, "native", "Runtime", file), "utf8")).join("\n");
  const problems = [
    ...auditActionBindings(manifest, swiftSource),
    ...auditLeanProduct({ blueprint, manifest, swiftSource, runtimeSource, uiTestSource }),
  ];
  if (problems.length) throw new Error(`Generated implementation violates ${problems.length} executable contracts:\n${problems.join("\n")}`);
}

export function implementationBlueprint(blueprint) {
  // Receipts and delivery prose are handoff evidence, not renderer input. They
  // used to account for roughly a third of the prompt and repeatedly displaced
  // executable requirements from the model's attention. Documentation still
  // receives the complete blueprint; Swift generation receives only the facts
  // it must implement.
  return Object.freeze({
    schemaVersion: blueprint.schemaVersion,
    id: blueprint.id,
    name: blueprint.name,
    thesis: blueprint.thesis,
    audience: blueprint.audience,
    targetProduct: blueprint.targetProduct,
    strategy: blueprint.strategy,
    world: blueprint.world,
    coreLoop: blueprint.coreLoop,
    socialGrammar: blueprint.socialGrammar,
    navigation: blueprint.navigation,
    capabilities: blueprint.capabilities,
    localization: blueprint.localization,
    fixtures: blueprint.fixtures,
    acceptanceScenarios: blueprint.acceptanceScenarios,
    states: blueprint.states,
  });
}

function captureCatalog(blueprint) {
  return Object.freeze({
    schemaVersion: 1,
    distinctStateGroups: [],
    drivers: blueprint.navigation.screens.map(screen => Object.freeze({
      surface: screen.id,
      state: "populated/default",
      launch: screen.id,
      artifact: `${screen.id.replace(/_/g, "-")}-default`,
      requiresLayoutAudit: true,
      requiresFullLayoutAudit: true,
      requiresTopSafeArea: true,
      expectedTopSurface: "light",
    })),
  });
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function defaultExecutor({ projectRoot, slug, manifest, catalog, smokeTestNames }) {
  const nativeRoot = join(projectRoot, "native");
  const run = (command, args, options = {}) => execFileSync(command, args, {
    cwd: options.cwd || projectRoot,
    env: { ...process.env, ...(options.env || {}) },
    encoding: "utf8",
    stdio: options.stdio || ["ignore", "pipe", "pipe"],
  });
  run(process.execPath, [join(nativeRoot, "gen", "gen-project.mjs"), slug]);
  for (const gate of ["audit-actions.mjs", "audit-nav.mjs", "audit-ui.mjs", "audit-permissions.mjs", "audit-interface-anatomy.mjs", "audit-lean-product.mjs"]) {
    run(process.execPath, [join(nativeRoot, "gen", gate), slug]);
  }
  const appName = slug[0].toUpperCase() + slug.slice(1);
  const buildRoot = join(nativeRoot, "build", slug);
  const derivedData = join(nativeRoot, "artifacts", slug, "LeanDerivedData");
  run("/usr/bin/xcodebuild", [
    "-quiet", "-project", join(buildRoot, `${appName}.xcodeproj`), "-scheme", appName,
    "-sdk", "iphonesimulator", "-destination", "platform=iOS Simulator,name=iPhone 17 Pro",
    "-derivedDataPath", derivedData, "CODE_SIGNING_ALLOWED=NO", "build",
  ]);
  run("/usr/bin/xcodebuild", [
    "-quiet", "-project", join(buildRoot, `${appName}.xcodeproj`), "-scheme", `${appName}Smoke`,
    "-destination", "platform=iOS Simulator,name=iPhone 17 Pro", "-derivedDataPath", derivedData, "test",
  ]);
  const reviewSurfaces = manifest.surfaces.map(surface => surface.id);
  run(process.execPath, [join(nativeRoot, "gen", "shots.mjs"), slug, ...reviewSurfaces, "--reuse-build"], {
    env: {
      DEVICE: "iPhone 17 Pro",
      APP_PATH: join(derivedData, "Build", "Products", "Debug-iphonesimulator", `${appName}.app`),
    },
  });
  const driverBySurface = new Map(catalog.drivers.map(item => [item.surface, item]));
  const directory = shotArtifactDirectory(nativeRoot, slug);
  const captures = reviewSurfaces.map(surface => {
    const driver = driverBySurface.get(surface);
    const path = join(directory, `${driver.artifact}.png`);
    if (!existsSync(path) || statSync(path).size < 10_000) throw new Error(`Core capture missing for ${surface}`);
    return { id: `${surface}--populated/default`, surface, state: "populated/default", path, sha256: sha256(path) };
  });
  return Object.freeze({
    buildReceipt: Object.freeze({ passed: true, projectPath: join(buildRoot, `${appName}.xcodeproj`), sourceHash: sha256(join(buildRoot, "native-manifest.json")) }),
    interactionReceipt: Object.freeze({ passed: true, testNames: smokeTestNames, simulator: "iPhone 17 Pro" }),
    captures: Object.freeze(captures),
  });
}

export function createStructuredModelLeanBuilder({ model, projectRoot, executor = defaultExecutor }) {
  if (!model?.generateStructured) throw new TypeError("Lean builder needs a structured source model");
  const root = resolve(projectRoot || process.cwd());
  const ownedSlugs = new Set();
  return Object.freeze({
    async build({ blueprint, target, reference, calibration }) {
      const compiled = compileProductBlueprint(blueprint, { bundleId: `com.camo.${blueprint.id.replace(/[-_]/g, "")}` });
      if (!compiled.ok) throw new Error(compiled.diagnostics.map(item => `${item.code}: ${item.message}`).join("\n"));
      const productUIContract = compileLeanProductUIContract(blueprint, compiled.manifest);
      const productUIVerification = verifyLeanProductUIContract(productUIContract, blueprint);
      if (!productUIVerification.passed) throw new Error(productUIVerification.problems.join("\n"));
      const productUIPath = join(root, "native", "ProductUIContracts", `${blueprint.id}.json`);
      mkdirSync(dirname(productUIPath), { recursive: true });
      writeFileSync(productUIPath, `${JSON.stringify(productUIContract, null, 2)}\n`);
      const documentationReceipt = writeLeanDeveloperDocumentation({
        projectRoot: root, blueprint, manifest: compiled.manifest,
      });
      const output = await model.generateStructured({
        operation: "camo.lean-native-swiftui-builder.v1",
        input: {
          blueprint: implementationBlueprint(blueprint),
          productUIContract,
          nativeManifest: compiled.manifest,
          target: { id: target.id },
          reference,
          calibration,
          instructions: [
            "NON-NEGOTIABLE PRE-FLIGHT: before returning source, verify NativeEmailAuth, NativeVisualLanguage.resolve, CaptureIdentity.report and reportLayout are present; VK TabView uses compiled Lucide image assets; every capability action calls Permissions.request and performs its declared platformEffect; every declared control has its own outcome and XCUI assertion. Missing any item makes the source invalid.",
            "Return screenImplementations as an exhaustive ownership map: one entry per non-login screen, exact actionIds from that screen, and the source file where actual Button/NavigationLink controls bind them. Inventories, comments and unused string constants are forbidden.",
            "Return capabilityImplementations as an exhaustive map. Each entry names real granted and denied accessibility outcome identifiers present both in its product source file and XCUI test, plus the exact test method name.",
            "Implement the exact recipe on every Product UI Contract surface. Recipe ownership, actions, capability gesture, placement and states are compiler-owned and may not be moved or renamed.",
            ...NATIVE_RENDERER_INSTRUCTIONS,
            "Generate only app Swift files and one compact XCUI smoke suite; the compiler owns blueprint, capture.json, Xcode, assets and docs.",
            "Bind every declared action exactly once with .nativeAction(\"surface.action_id\") on the actual control.",
            "App.swift must own one Route enum and one exhaustive destination function so navigation reachability is mechanically auditable even when screen views live in other files.",
            "Call each contextual capability exactly once through permissions.request(.key) from its owning product gesture; use the compiler-provided Runtime implementation and persist the contracted stateField.",
            "Implement the real post-permission platform operation (picker, recording, location result, notification scheduling, deep link, extension or background update). A granted flag, access badge or permissions list is not implementation.",
            "For every capability XCUI must exercise both granted and denied launch environments and assert the contracted product outcome or fallback using stable accessibility identifiers.",
            "Use the Product Blueprint localization catalog and deterministic fixtures verbatim. Do not invent UI copy, product terms, people or records in Swift source.",
            "Cover every acceptance scenario id in the XCUI suite and execute its actionIds in order.",
            "The smoke suite must prove arbitrary four-digit local auth, the four-action core loop, distinct comment intent, settings and contextual capability outcomes.",
            "Every -shot screen must open deterministically and report its exact surface/state plus real root geometry.",
            "Every captured root must report viewport width/height and the visible product region min/max X/Y. The region must stay inside safe viewport bounds and above persistent bottom chrome.",
          ],
        },
        schema: leanNativeSourceSchema(),
      });
      const hasGeneratedApp = output.appFiles?.some(file => /@main\s+[\s\S]{0,40}?struct\s+\w+\s*:\s*App\b/.test(file.contents));
      const shellOwned = hasGeneratedApp
        ? compileLeanNativeShell({ blueprint, bundle: output })
        : output;
      const formattedBundle = formatSourceBundle(shellOwned);
      if (hasGeneratedApp) auditGeneratedImplementation({
        bundle: formattedBundle, blueprint, manifest: compiled.manifest, projectRoot: root,
      });
      const bundle = validateSourceBundle(formattedBundle, blueprint);
      const slug = blueprint.id;
      const blueprintPath = join(root, "native", "ProductBlueprints", `${slug}-vk.json`);
      const appDirectory = join(root, "native", "apps", slug);
      if ((existsSync(blueprintPath) || existsSync(appDirectory)) && !ownedSlugs.has(slug)) throw new Error(`Refusing to overwrite existing native concept ${slug}`);
      rmSync(appDirectory, { recursive: true, force: true });
      mkdirSync(appDirectory, { recursive: true });
      mkdirSync(dirname(blueprintPath), { recursive: true });
      writeFileSync(blueprintPath, `${JSON.stringify(blueprint, null, 2)}\n`);
      for (const file of bundle.appFiles) {
        const path = safeFile(appDirectory, file.path, "App source");
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, file.contents.endsWith("\n") ? file.contents : `${file.contents}\n`);
      }
      for (const file of bundle.uiTestFiles) {
        const path = safeFile(join(appDirectory, "UITests"), file.path.split("/").at(-1), "UI test source");
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, file.contents.endsWith("\n") ? file.contents : `${file.contents}\n`);
      }
      const catalog = captureCatalog(blueprint);
      writeFileSync(join(appDirectory, "capture.json"), `${JSON.stringify(catalog, null, 2)}\n`);
      ownedSlugs.add(slug);
      const execution = await executor({ projectRoot: root, slug, blueprint, manifest: compiled.manifest, catalog, smokeTestNames: bundle.smokeTestNames });
      const proof = createLeanDeliveryProof({
        manifest: compiled.manifest,
        buildReceipt: execution.buildReceipt,
        captures: execution.captures,
      });
      if (!proof.passed || execution.interactionReceipt?.passed !== true) throw new Error(
        `Lean delivery proof failed: ${proof.diagnostics.map(item => item.message).join("; ") || "interaction smoke did not pass"}`,
      );
      return Object.freeze({
        slug, manifest: compiled.manifest, sourceBundle: bundle,
        buildReceipt: execution.buildReceipt, interactionReceipt: execution.interactionReceipt,
        captures: execution.captures, proof, documentationReceipt,
      });
    },
  });
}
