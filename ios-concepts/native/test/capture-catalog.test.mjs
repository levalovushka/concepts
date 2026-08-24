import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { compileNativeConcept } from "../lib/compile-concept.mjs";
import { compileCaptureCatalog, selectCaptureDrivers } from "../lib/capture-catalog.mjs";
import { compileCaptureSurfaceOwnership } from "../lib/capture-surface-ownership.mjs";

const nativeRoot = join(import.meta.dirname, "..");
const looks = JSON.parse(readFileSync(join(nativeRoot, "../concepts/looks/concept.json"), "utf8"));
const source = JSON.parse(readFileSync(join(nativeRoot, "apps/looks/capture.json"), "utf8"));
const appSource = readFileSync(join(nativeRoot, "apps/looks/App.swift"), "utf8");
const feedSource = readFileSync(join(nativeRoot, "apps/looks/Feed.swift"), "utf8");
const captureSource = readFileSync(join(nativeRoot, "apps/looks/CaptureStates.swift"), "utf8");
const searchSource = readFileSync(join(nativeRoot, "apps/looks/Search.swift"), "utf8");
const chatsSource = readFileSync(join(nativeRoot, "apps/looks/Messaging.swift"), "utf8");
const notificationsSource = readFileSync(join(nativeRoot, "apps/looks/Notifications.swift"), "utf8");
const screensSource = readFileSync(join(nativeRoot, "apps/looks/Screens.swift"), "utf8");
const servicesSource = readFileSync(join(nativeRoot, "apps/looks/Services.swift"), "utf8");
const featuresSource = readFileSync(join(nativeRoot, "apps/looks/Features.swift"), "utf8");
const productStateRegistry = JSON.parse(readFileSync(join(nativeRoot, "apps/looks/product-state-surfaces.json"), "utf8"));

test("capture drivers bind app launch routes to declared product states", () => {
  const manifest = compileNativeConcept(looks).manifest;
  const catalog = compileCaptureCatalog(manifest, source);

  assert.equal(catalog.ok, true);
  assert.equal(selectCaptureDrivers(catalog, ["chat"])[0].id, "chat--default");
  assert.equal(selectCaptureDrivers(catalog, ["wardrobe--populated"])[0].artifact, "wardrobe--populated");
  assert.equal(catalog.missing.length, 0);
});

test("home empty capture injects state into the real feed", () => {
  assert.match(appSource, /FeedScreen\(captureState: productState\(for: "home"\)\)/);
  assert.match(feedSource, /captureState == "empty"/);
  assert.match(feedSource, /VKTabHeader\(title: "Главная"/);
  assert.match(feedSource, /NativeStatePanel\(/);
  assert.doesNotMatch(captureSource, /"home\.empty":/);
});

test("migrated app surfaces keep their own chrome and consume product state", () => {
  assert.deepEqual(productStateRegistry.product, ["home", "search", "chats", "notifications", "wardrobe", "nearby", "services", "create", "mates", "lock", "talk", "netqr", "phone", "code", "codefail", "event", "checkin"]);
  for (const surface of productStateRegistry.product) {
    assert.match(appSource, new RegExp(`productState\\(for: "${surface}"\\)`));
    assert.doesNotMatch(captureSource, new RegExp(`"${surface}\\.[^"]+"\\s*:`));
  }
  assert.match(searchSource, /captureState == "loading"/);
  assert.match(searchSource, /case "query": query = "тренч"/);
  assert.match(chatsSource, /captureState == "empty"/);
  assert.match(notificationsSource, /captureState == "empty"/);
  assert.match(notificationsSource, /captureState != "read"/);
  assert.match(screensSource, /struct WardrobeScreen:[\s\S]*?captureState == "loading"/);
  assert.match(screensSource, /struct NearbyScreen:[\s\S]*?captureState == "empty"/);
  assert.match(screensSource, /struct CreateScreen:[\s\S]*?captureState == "success"/);
  assert.match(servicesSource, /struct ServicesScreen:[\s\S]*?captureState == "loading"/);
  assert.match(screensSource, /struct MatesScreen:[\s\S]*?captureState == "denied"/);
  assert.match(featuresSource, /struct TalkScreen:[\s\S]*?captureState == "loading"/);
  assert.match(featuresSource, /struct LockScreen:[\s\S]*?captureState == "denied"/);
  assert.match(featuresSource, /struct NetQRScreen:[\s\S]*?captureState == "error"/);
  assert.match(chatsSource, /enum AuthFlowState:[\s\S]*?sendingCode[\s\S]*?invalidCode[\s\S]*?retryFailed/);
  assert.match(chatsSource, /UserDefaults\.standard\.set\(mail, forKey: "looks\.auth\.email"\)/);
  assert.match(appSource, /Session\.restored\(storageNamespace: "looks\.session"\)/);
  assert.match(appSource, /if let screen = ShotMode\.screen/);
  assert.match(screensSource, /struct EventScreen:[\s\S]*?captureState == "joined"/);
  assert.match(screensSource, /EKEvent\(eventStore: eventStore\)/);
  assert.match(screensSource, /store\.setGoing\(going, to: event\)/);
  assert.match(featuresSource, /struct CheckinScreen:[\s\S]*?case "denied": \.denied/);
  assert.match(featuresSource, /await LooksPermissionFlow\.requestLocation\(using: perms\)[\s\S]*?await perms\.request\(\.wifiinfo\)/);
  assert.match(featuresSource, /store\.setCheckedIn\(true\)/);
});

test("every multi-state capture surface has exactly one explicit owner", () => {
  const manifest = compileNativeConcept(looks).manifest;
  const catalog = compileCaptureCatalog(manifest, source);
  const ownership = compileCaptureSurfaceOwnership(catalog, productStateRegistry);
  assert.equal(ownership.ok, true, ownership.diagnostics.join("\n"));
  assert.equal(ownership.multiState.length, 22);
  assert.deepEqual(ownership.pendingProduct, []);
  for (const surface of ["phone", "code", "codefail", "event", "checkin"]) {
    assert.equal(ownership.product.includes(surface), true);
    assert.doesNotMatch(captureSource, new RegExp(`"${surface}\\.[^"]+"\\s*:`));
  }
});

test("every captured multi-state surface is automatically checked for identical screenshots", () => {
  const manifest = compileNativeConcept(looks).manifest;
  const catalog = compileCaptureCatalog(manifest, source);
  assert.equal(catalog.distinctGroups.some(group =>
    group.includes("home--default") && group.includes("home--empty")
  ), true);
});
