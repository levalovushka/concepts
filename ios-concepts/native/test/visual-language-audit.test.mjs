import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { auditVisualLanguage } from "../lib/visual-language-audit.mjs";

function fixture(source) {
  const root = mkdtempSync(join(tmpdir(), "native-visual-language-"));
  writeFileSync(join(root, "App.swift"), source);
  return root;
}

test("visual audit rejects an app-local style seam", () => {
  const root = fixture(`
    import SwiftUI
    enum GhostStyle { static let accent = Color.red }
    let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)
    let body = EmptyView().environment(\\.visualLanguage, visualLanguage)
  `);
  assert.match(auditVisualLanguage(root, "ghost").join("\n"), /локальный token enum GhostStyle запрещён/);
});

test("visual audit rejects a second Theme environment", () => {
  const root = fixture(`
    import SwiftUI
    let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)
    let body = EmptyView().environment(\\.visualLanguage, visualLanguage).environment(\\.theme, Theme.product)
  `);
  assert.match(auditVisualLanguage(root, "ghost").join("\n"), /Theme не может быть отдельным environment seam/);
});

test("visual audit rejects compatibility readers and DvorStyle", () => {
  const root = fixture(`
    import SwiftUI
    let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)
    let body = EmptyView().environment(\.visualLanguage, visualLanguage)
    let old = DvorStyle.card
  `);
  assert.match(auditVisualLanguage(root, "dvor").join("\n"), /DvorStyle запрещён/);
});

test("visual audit accepts a clean visual-language caller", () => {
  const root = fixture(`
    import SwiftUI
    let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)
    let body = EmptyView().environment(\\.visualLanguage, visualLanguage)
  `);
  assert.deepEqual(auditVisualLanguage(root, "ghost"), []);
});
