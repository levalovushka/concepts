import assert from "node:assert/strict";
import test from "node:test";
import { compileCapabilityPlanV2 } from "../lib/capability-plan-v2.mjs";
import { createProductCoreArtifact } from "../lib/product-core-v2.mjs";
import { portfolio, strongCore } from "../fixtures/pipeline-v2/strong-product.mjs";

const artifact = createProductCoreArtifact({ request: { id: "request-1" }, core: strongCore, portfolio }).artifact;
const target = { permissions: [{ key: "camera" }, { key: "push" }] };

test("capabilities are grounded after Product Core through an existing gesture and entity", () => {
  const result = compileCapabilityPlanV2({
    productCoreArtifact: artifact,
    target,
    bundleId: "com.camo.ryadom",
    proposal: {
      policy: "pool",
      bindings: [{
        key: "camera", actionId: "capture_result", strengthensActionId: "complete_promise",
        purpose: "Показать соседям проверяемый итог обещания прямо в карточке завершения",
        requestMoment: "После нажатия «Добавить фото результата» на экране завершения",
        platformEffect: "Открыть системную камеру и сохранить полученный локальный файл",
        fallback: "Оставить текстовый результат и предложить выбрать существующее изображение позже",
        testScenario: "Запустить завершение, разрешить камеру и увидеть сохранённую миниатюру после перезапуска",
        outcome: { entityId: "promise", stateField: "resultPhoto", proof: "Карточка завершения показывает сохранённую миниатюру" },
      }],
      exclusions: [{ key: "push", reason: "Core loop уже возвращает участника через локальную ленту; уведомления не нужны для доказательства первого среза" }],
    },
  });
  assert.equal(result.ok, true);
  assert.equal(result.plan.bindings[0].userConsent, true);
  assert.equal(result.plan.bindings[0].activation, "contextual-gesture");
});

test("a permission cannot invent an entity or float outside the core loop", () => {
  const result = compileCapabilityPlanV2({
    productCoreArtifact: artifact,
    target: { permissions: [{ key: "camera" }] },
    bundleId: "com.camo.ryadom",
    proposal: { policy: "required", bindings: [{
      key: "camera", actionId: "capture_result", strengthensActionId: "missing",
      purpose: "Показать проверяемый итог обещания соседям", requestMoment: "После нажатия на контекстную кнопку результата",
      platformEffect: "Открыть камеру и сохранить файл результата", fallback: "Сохранить текст и продолжить без изображения",
      testScenario: "Отклонить камеру и проверить сохранение текста", outcome: { entityId: "permission_feature", stateField: "image", proof: "Изображение видно в карточке результата" },
    }], exclusions: [] },
  });
  const codes = result.diagnostics.map(item => item.code);
  assert.ok(codes.includes("capability.core-link"));
  assert.ok(codes.includes("capability.outcome.entity"));
});
