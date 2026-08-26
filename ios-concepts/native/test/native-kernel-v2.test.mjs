import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { compileNativeKernelV2, compileNativeSliceBlueprintV2 } from "../lib/native-kernel-v2.mjs";
import { compileProductBlueprint } from "../lib/native-blueprint-compiler.mjs";
import { createProductCoreArtifact } from "../lib/product-core-v2.mjs";
import { compileCapabilityPlanV2 } from "../lib/capability-plan-v2.mjs";
import { portfolio, strongCore } from "../fixtures/native-pipeline/strong-product.mjs";

const product = createProductCoreArtifact({ request: { id: "native-kernel-test" }, core: strongCore, portfolio }).artifact;
const capability = compileCapabilityPlanV2({
  productCoreArtifact: product,
  target: { permissions: [{ key: "camera" }] },
  bundleId: "com.camo.ryadom",
  proposal: { policy: "required", bindings: [{
    key: "camera", actionId: "capture_result", strengthensActionId: "complete_promise",
    purpose: "Показать соседям проверяемый итог обещания прямо в карточке завершения",
    requestMoment: "После нажатия «Добавить фото результата» на экране завершения",
    platformEffect: "Открыть системную камеру и сохранить полученный локальный файл",
    fallback: "Оставить текстовый результат и предложить выбрать изображение позже",
    testScenario: "Разрешить камеру и увидеть сохранённую миниатюру после перезапуска",
    outcome: { entityId: "promise", stateField: "resultPhoto", proof: "Карточка завершения показывает сохранённую миниатюру" },
  }], exclusions: [] },
}).plan;
const slice = Object.freeze({
  surfaces: [
    { id: "feed", role: "entry", title: "Рядом", recipe: "authoredFeed", states: ["populated/default", "empty", "offline"], actionIds: ["discover_promise"], content: { author: "Марина Орлова", headline: "Починим лавку до вечера", body: "Сосед показал конкретный результат, для которого нужна помощь." } },
    { id: "offer", role: "action", title: "Предложить помощь", recipe: "contributionEditor", states: ["populated/default", "error"], actionIds: ["offer_help"], content: { headline: "Чем вы поможете", body: "Укажите конкретный вклад, который увидит автор обещания.", details: [{ title: "Вклад", detail: "40 минут", icon: "person" }, { title: "Когда", detail: "Сегодня", icon: "clock" }] } },
    { id: "result", role: "result", title: "Результат", recipe: "completion", states: ["populated/default", "permission-denied"], actionIds: ["complete_promise", "capture_result"], content: { headline: "Лавка снова на месте", body: "Результат, вклад помощников и продолжение видны в одной карточке.", summary: { title: "Результат виден", detail: "Вклад сохранён." } } },
  ],
  transitions: [{ from: "feed", to: "offer", actionId: "discover_promise" }, { from: "offer", to: "result", actionId: "offer_help" }],
  acceptanceJourney: { actionIds: ["discover_promise", "offer_help", "complete_promise"] },
});

test("Native Kernel v2 compiles shell, reducers, permission outcomes and XCUI without model Swift", () => {
  const output = compileNativeKernelV2({ productCoreArtifact: product, capabilityPlan: capability, sliceContract: slice });
  const source = output.files.map(item => item.contents).join("\n");
  const tests = output.uiTestFiles.map(item => item.contents).join("\n");
  assert.equal(output.receipt.modelGeneratedSwift, false);
  assert.deepEqual(output.receipt.compilerOwned, ["app-shell", "authentication", "routes", "reducers", "permission-wiring", "capture", "xcui-skeleton"]);
  for (const seam of ["NativeEmailAuth", "NativeVisualLanguage.resolve", "CaptureIdentity.report", "Permissions()", "permissions.request"]) assert.match(source, new RegExp(seam.replace(/[.()]/g, "\\$&")));
  assert.match(source, /PermissionKey\(rawValue: "camera"\)/);
  assert.match(source, /\.vkNavigation\("Результат"\)/);
  assert.match(source, /case \.completePromise:[\s\S]*values\["status"\] = "completed"/);
  assert.match(source, /outcome\.permission\.camera\.granted/);
  assert.match(tests, /NATIVE_UI_TEST_PERMISSION_CAMERA/);
  assert.match(tests, /capabilityCoverage/);
  assert.match(tests, /outcome\.permission\.camera\.\\\(answer\)/);
  assert.match(tests, /testProductProof/);
  assert.match(source, /\.tabBarMinimizeBehavior\(\.never\)/);
  assert.match(source, /\.toolbar\(\["feed"/);
  assert.match(source, /\.accessibilityLabel\("Рядом"\)/);
  assert.ok(output.captureCatalog.drivers.some(item => item.surface === "result" && item.state === "permission-denied"));
});

test("permission acceptance follows a capability transition while denial stays visibly recoverable", () => {
  const transitioningSlice = {
    ...slice,
    transitions: [...slice.transitions, { from: "result", to: "feed", actionId: "capture_result" }],
  };
  const output = compileNativeKernelV2({ productCoreArtifact: product, capabilityPlan: capability, sliceContract: transitioningSlice });
  const tests = output.uiTestFiles.map(item => item.contents).join("\n");
  assert.match(tests, /if answer == "granted"/);
  assert.match(tests, /identifier BEGINSWITH %@", "surface\.feed"/);
  assert.match(tests, /outcome\.permission\.camera\.denied/);
});

test("every compiler-owned Swift file passes swift-format parsing", () => {
  const output = compileNativeKernelV2({ productCoreArtifact: product, capabilityPlan: capability, sliceContract: slice });
  for (const file of [...output.files, ...output.uiTestFiles]) assert.doesNotThrow(() => execFileSync(
    "xcrun", ["swift-format", "format", "--assume-filename", file.path, "-"],
    { input: file.contents, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
  ), file.path);
});

test("capability dispatch uses runtime keys instead of a brittle Swift static-member list", () => {
  const plan = {
    ...capability,
    bindings: [{ ...capability.bindings[0], key: "associateddomains" }],
  };
  const output = compileNativeKernelV2({ productCoreArtifact: product, capabilityPlan: plan, sliceContract: slice });
  const source = output.files.map(item => item.contents).join("\n");
  assert.match(source, /PermissionKey\(rawValue: "associateddomains"\)/);
  assert.doesNotMatch(source, /permissions\.request\(\.associateddomains\)/);
});

test("vertical slice compiles into the existing deterministic Xcode manifest without the full target capability pool", () => {
  const blueprint = compileNativeSliceBlueprintV2({ productCoreArtifact: product, capabilityPlan: capability, sliceContract: slice });
  const compiled = compileProductBlueprint(blueprint, { bundleId: "com.camo.neighbourpromises" });
  assert.equal(compiled.ok, true, compiled.diagnostics.map(item => `${item.code}: ${item.message}`).join("\n"));
  assert.deepEqual(compiled.manifest.permissions.map(item => item.key), ["camera"]);
  assert.equal(compiled.manifest.surfaces.length, 3);
  assert.deepEqual(compiled.manifest.verification.states.map(item => item.state), slice.surfaces.flatMap(item => item.states));
});
