import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compileProductBlueprint } from "../lib/native-blueprint-compiler.mjs";
import { auditLeanProduct } from "../lib/lean-product-audit.mjs";

const blueprint = JSON.parse(readFileSync(new URL("../ProductBlueprints/estafeta-vk.json", import.meta.url), "utf8"));
const manifest = compileProductBlueprint(blueprint).manifest;

test("lean product audit rejects permission-only creation controls without real outcomes", () => {
  const bad = `
    func actionRow(_ title: String, key: PermissionKey) {
      Task {
        if await permissions.request(key) { attachments.append(title) }
      }
    }
    actionRow("Снять фото", key: .camera)
    actionRow("Выбрать из медиатеки", key: .photos)
    actionRow("Записать голосом", key: .mic)
    actionRow("Надиктовать текст", key: .speech)
    actionRow("Добавить место", key: .location)
  `;
  const problems = auditLeanProduct({ blueprint, manifest, swiftSource: bad });
  assert.equal(problems.some(item => item.includes("generic capability control")), true);
  assert.equal(problems.some(item => item.includes("real platform effect is missing")), true);
});

test("full capability products cannot hide requests in one accesses screen", () => {
  const capabilityHeavy = structuredClone(blueprint);
  capabilityHeavy.deliveryMode = "full";
  capabilityHeavy.navigation.screens.push({
    id: "accesses", title: "Доступы", presentation: "push",
    actionIds: capabilityHeavy.capabilities.map(item => item.actionId), entityIds: [],
  });
  const problems = auditLeanProduct({ blueprint: capabilityHeavy, manifest, swiftSource: "UIApplication.openSettingsURLString" });
  assert.equal(problems.some(item => item.includes("not an accesses screen")), true);
});
