import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const nativeRoot = join(import.meta.dirname, "..");

test("VK push surfaces own their navigation chrome instead of inheriting glass toolbars", () => {
  const components = readFileSync(join(nativeRoot, "ReferenceProfiles/vk-ios/Components.swift"), "utf8");
  const screens = readFileSync(join(nativeRoot, "apps/looks/Screens.swift"), "utf8");
  const features = readFileSync(join(nativeRoot, "apps/looks/Features.swift"), "utf8");
  const settings = readFileSync(join(nativeRoot, "apps/looks/Settings.swift"), "utf8");
  const notifications = readFileSync(join(nativeRoot, "apps/looks/Notifications.swift"), "utf8");
  const app = readFileSync(join(nativeRoot, "apps/looks/App.swift"), "utf8");

  assert.match(components, /struct VKNavigationChrome</,
    "the VK profile must own reusable push-screen navigation chrome");
  assert.match(screens, /\.vkNavigation\("\u0421\u0432\u043e\u043f\u044b \u0440\u044f\u0434\u043e\u043c"\)/,
    "nearby must use profile navigation");
  assert.match(screens, /\.vkNavigation\("\u0413\u0430\u0440\u0434\u0435\u0440\u043e\u0431"/,
    "wardrobe must use profile navigation");
  assert.doesNotMatch(screens, /navigationTitle\("\u0421\u0432\u043e\u043f\u044b \u0440\u044f\u0434\u043e\u043c"\)/,
    "native glass navigation must not leak onto nearby");
  assert.match(components, /VKNavigationChrome[\s\S]*?\.buttonStyle\(\.plain\)/,
    "VK chrome back controls must opt out of automatic iOS glass button styling");
  for (const [name, source] of [["Screens", screens], ["Features", features], ["Settings", settings], ["Notifications", notifications]]) {
    assert.doesNotMatch(source, /navigationTitle\("(?:\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438|\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f|\u0420\u0430\u0437\u0431\u043e\u0440 \u0433\u043e\u043b\u043e\u0441\u043e\u043c|\u041e\u0431\u0440\u0430\u0437|\u0417\u043d\u0430\u043a\u043e\u043c\u044b\u0435|\u0421\u0432\u043e\u043f)"\)/,
      `${name} must not mix system glass push chrome with the VK profile`);
  }
  assert.match(app, /destination\(_ route:[\s\S]*?\.toolbar\(\.hidden, for: \.tabBar\)/,
    "pushed product screens must not keep the root Liquid Glass tab bar");
});

test("settings account header keeps optical space before the next section", () => {
  const settings = readFileSync(join(nativeRoot, "apps/looks/Settings.swift"), "utf8");
  assert.match(settings, /header\s*\n\s*GroupGap\(height: 12\)/,
    "the account control must not touch the following section boundary");
  assert.match(settings, /private var header:[\s\S]*?frame\(minHeight: 76\)/,
    "the compact account row must own a stable touch and breathing area");
  assert.doesNotMatch(settings, /private var header:[\s\S]*?VKOutlineButton/,
    "settings must not reintroduce a floating outlined profile button without section insets");
});

test("capture state controls cannot use a universal fake-success fallback", () => {
  const states = readFileSync(join(nativeRoot, "apps/looks/CaptureStates.swift"), "utf8");
  assert.doesNotMatch(states, /default:\s*success\s*=\s*true/,
    "every state CTA needs a route, mutation, permission request, retry or system destination");
});

test("VK functional icons use a deliberate medium-or-heavier weight", () => {
  const components = readFileSync(join(nativeRoot, "ReferenceProfiles/vk-ios/Components.swift"), "utf8");
  assert.doesNotMatch(components, /struct VK(?:Row|RowAction|ServiceTile)[\s\S]*?weight: \.light/,
    "list, service and action icons must not look optically weaker than product typography");
  assert.match(components, /struct VKRow:[\s\S]*?weight: \.semibold/);
  assert.match(components, /struct VKServiceTile:[\s\S]*?weight: \.semibold/);
});

test("all native tab bars are icon-only while retaining accessible names", () => {
  for (const appName of ["looks", "dvor", "tails", "today", "nakat", "peresmenka"]) {
    const source = readFileSync(join(nativeRoot, `apps/${appName}/App.swift`), "utf8");
    assert.doesNotMatch(source, /Text\(tab\.label\)/,
      `${appName} must not render the semantic tab label as visible text`);
    assert.doesNotMatch(source, /Label\(item\.label,\s*systemImage:/,
      `${appName} must use an icon-only system tab item`);
    assert.match(source, /accessibilityLabel\((?:tab|item)\.label\)/,
      `${appName} icon-only tabs must keep their accessible names`);
  }
});
