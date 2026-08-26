import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const nativeRoot = join(import.meta.dirname, "..");
const language = readFileSync(join(nativeRoot, "DesignSystem/NativeVisualLanguage.swift"), "utf8");
const tokens = readFileSync(join(nativeRoot, "DesignSystem/Tokens.swift"), "utf8");
const app = readFileSync(join(nativeRoot, "apps/estafeta/NativeV2App.swift"), "utf8");
const screens = readFileSync(join(nativeRoot, "apps/estafeta/NativeV2ProductScreens.swift"), "utf8");
const primitives = readFileSync(join(nativeRoot, "DesignSystem/NativePrimitives.swift"), "utf8");
const vkComponents = readFileSync(join(nativeRoot, "ReferenceProfiles/vk-ios/Components.swift"), "utf8");

test("visual language is the single environment seam", () => {
  assert.match(language, /struct NativeVisualLanguage: Sendable/);
  assert.match(language, /static let vkReference/);
  assert.match(language, /static let product/);
  assert.match(language, /static func resolve\(_ design: NativeDesignDefinition\)/);
  assert.doesNotMatch(tokens, /ThemeKey/);
  assert.doesNotMatch(tokens, /\bTheme\b|\\\.theme\b/);
  assert.match(app, /NativeVisualLanguage\.resolve\(NativeConceptSpec\.design\)/);
  assert.match(app, /\.environment\(\\\.visualLanguage, visualLanguage\)/);
  assert.doesNotMatch(app, /\.environment\(\\\.theme/);
});

test("shared action and state anatomy sits behind the visual seam", () => {
  assert.match(primitives, /struct NativeActionButton: View/);
  assert.match(primitives, /struct NativeStatePanel: View/);
  assert.match(primitives, /@Environment\(\\\.visualLanguage\)/);
  assert.match(vkComponents, /struct VKButton:[\s\S]*?NativeActionButton\(title: title/);
  assert.match(vkComponents, /struct VKOutlineButton:[\s\S]*?NativeActionButton\(title: title/);
});

test("visual adapters own complete semantic foundations", () => {
  for (const family of ["Palette", "Spacing", "Metrics", "TypeScale", "Icons"]) {
    assert.match(language, new RegExp(`struct ${family}: Sendable`));
  }
  assert.match(language, /enum Chrome: String, Sendable/);
  assert.match(language, /case referenceFlat/);
  assert.match(language, /case system/);
  assert.match(language, /weight: \.semibold/);
});

test("SwiftUI consumes canonical UX surfaces and semantic component roles", () => {
  assert.match(tokens, /NativeConceptSpec\.surfaces\.first \{ \$0\.id == id \}/);
  assert.match(tokens, /definition\?\.componentRoles \?\? \[\]/);
  assert.match(tokens, /\.environment\(\\\.nativeComponentRoles, roles\)/);
  assert.match(tokens, /NativeSurfaceAccessibilityMarker\(id: id, roles: roles\)/);
  assert.match(tokens, /\.accessibilityIdentifier\(\(\["surface", id\] \+ roles\)/);
  assert.doesNotMatch(tokens, /content\s*\.environment\(\\\.nativeComponentRoles, roles\)\s*\.accessibilityIdentifier/);
  assert.match(screens, /\.nativeSurface\("relay_feed"\)/);
  assert.match(screens, /\.nativeSurface\("profile"\)/);
});
