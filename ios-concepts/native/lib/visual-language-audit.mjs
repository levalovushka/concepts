import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const LEGACY_HEX_BUDGET = Object.freeze({ looks: 0, dvor: 0 });

export function auditVisualLanguage(appRoot, slug) {
  const diagnostics = [];
  if (!existsSync(appRoot)) return [`нет native/apps/${slug}`];
  const files = readdirSync(appRoot).filter(file => file.endsWith(".swift"));
  const sources = files.map(file => ({ file, source: readFileSync(join(appRoot, file), "utf8") }));
  const all = sources.map(item => item.source).join("\n");
  const app = sources.find(item => item.file === "App.swift")?.source || "";

  if (!/NativeVisualLanguage\.resolve\(NativeConceptSpec\.design\)/.test(app)) {
    diagnostics.push("App.swift не разрешает NativeVisualLanguage из compiled concept");
  }
  if (!/\.environment\(\\\.visualLanguage, visualLanguage\)/.test(app)) {
    diagnostics.push("App.swift не внедряет единый visualLanguage");
  }
  if (/\.environment\(\\\.theme/.test(app)) {
    diagnostics.push("Theme не может быть отдельным environment seam");
  }
  if (/\bTheme\b|\\\.theme\b/.test(all)) {
    diagnostics.push("compatibility Theme запрещён: source читает visualLanguage напрямую");
  }
  if (/EnvironmentKey/.test(all)) {
    diagnostics.push("приложение не может объявлять локальный visual EnvironmentKey");
  }

  for (const { file, source } of sources) {
    for (const match of source.matchAll(/enum\s+([A-Za-z0-9_]*Style)\s*\{/g)) {
      if (match[1] !== "DvorStyle") diagnostics.push(`${file}: локальный token enum ${match[1]} запрещён`);
    }
  }

  const hexCount = (all.match(/Color\(hex:/g) || []).length;
  const budget = LEGACY_HEX_BUDGET[slug] ?? 0;
  if (hexCount > budget) {
    diagnostics.push(`app-local Color(hex:) ${hexCount}, допустимый миграционный бюджет ${budget}`);
  }
  if (slug === "dvor" && /\bDvorStyle\b/.test(all)) {
    diagnostics.push("DvorStyle запрещён: Dvor читает семантические foundations из visualLanguage");
  }
  if (["looks", "dvor"].includes(slug)) {
    if (!/\.nativeSurface\(/.test(all)) {
      diagnostics.push(`${slug} не связывает SwiftUI surface с canonical UX component roles`);
    }
    if (!/requiredTabIconAsset\(role:\s*tab\.role,\s*selected:\s*nav\.tab\s*==\s*tab\.id\)/.test(app)) {
      diagnostics.push(`${slug} tab bar не получает selected/unselected product-chrome asset через visualLanguage`);
    }
    const tabLabel = app.slice(app.indexOf("private func tabLabel"), app.indexOf("private func tabContent"));
    if (/systemImage:/.test(tabLabel) || /Tab\([^\n]*systemImage:\s*tab\.systemImage/.test(app)) {
      diagnostics.push(`${slug} VK mimicry tab bar не может напрямую использовать SF Symbols`);
    }
    if (!/Tab\(value:\s*tab\.id\)/.test(app) || /struct\s+\w*TabBar/.test(all)) {
      diagnostics.push(`${slug} должен сохранять системный Tab API для Liquid Glass`);
    }
  }
  const repeatedSemanticLiterals = [...all.matchAll(/Image\(systemName:\s*"(chevron\.left|chevron\.right|ellipsis|magnifyingglass|bell)"/g)];
  if (repeatedSemanticLiterals.length) {
    diagnostics.push(`direct SF Symbols для повторяющихся semantic roles: ${repeatedSemanticLiterals.length}`);
  }
  return diagnostics;
}
