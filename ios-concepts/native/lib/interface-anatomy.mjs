import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RULES = Object.freeze([
  {
    id: "shared-auth",
    test: source => /struct\s+AuthScreen\s*:/.test(source),
    message: "локальная геометрия входа запрещена: используйте NativeEmailAuth",
  },
  {
    id: "declared-auth-provider",
    test: source => /Продолжить с Google/.test(source),
    message: "нельзя показывать провайдера входа, которого нет в продуктовой модели",
  },
  {
    id: "attached-action",
    test: source => /NativeContractActionControl\([^)]*\)\s*\.listRowInsets\(EdgeInsets\(\)\)/.test(source),
    message: "действие оторвано от строки или карточки: привяжите навигацию к конкретному объекту",
  },
]);

export function auditInterfaceSource(source, file = "App.swift") {
  return RULES.filter(rule => rule.test(source)).map(rule => ({
    rule: rule.id,
    file,
    message: rule.message,
  }));
}

export function auditNativeInterface(appDirectory) {
  const diagnostics = [];
  for (const file of readdirSync(appDirectory).filter(name => name.endsWith(".swift")).sort()) {
    diagnostics.push(...auditInterfaceSource(readFileSync(join(appDirectory, file), "utf8"), file));
  }
  return Object.freeze({ ok: diagnostics.length === 0, diagnostics: Object.freeze(diagnostics) });
}
