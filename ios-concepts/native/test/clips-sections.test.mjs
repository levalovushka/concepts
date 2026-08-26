import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(import.meta.dirname, "../apps/looks/Clips.swift"), "utf8");

test("clips do not expose speculative sections that add no product value", () => {
  assert.doesNotMatch(source, /VKDarkTabs|"Примерки"|"Тренды"/);
  assert.match(source, /ForEach\(Array\(store\.outfits\.enumerated\(\)\)/);
});

test("clip creation remains a single readable action without changing global system chrome", () => {
  assert.match(source, /accessibilityLabel\("Снять клип"\)/);
  assert.match(source, /background\(\.black\.opacity\(0\.34\), in: Circle\(\)\)/);
  assert.doesNotMatch(source, /preferredColorScheme\(\.dark\)/,
    "the clip surface must not leak a dark status-bar style into later light tabs");
});

test("Looks UI uses plain product language instead of remix and swap jargon", () => {
  const source = ["App.swift", "Features.swift", "Feed.swift", "Notifications.swift", "Screens.swift", "Services.swift"]
    .map(file => readFileSync(join(import.meta.dirname, "../apps/looks", file), "utf8")).join("\n");
  assert.doesNotMatch(source, /ремикс|своп/iu);
  assert.match(source, /Собрать похожий образ|Обмен вещами/u);
});
