import assert from "node:assert/strict";
import test from "node:test";
import { compileLeanNativeShell } from "../lib/lean-native-shell-compiler.mjs";

test("native shell compiler owns auth, theme, capture and VK tab chrome", () => {
  const blueprint = {
    name: "Свои",
    navigation: { screens: [
      { id: "login", actionIds: ["request_email_code", "verify_email_code"] },
      { id: "feed", actionIds: ["open_post"] },
    ] },
  };
  const bundle = {
    appFiles: [{
      path: "App.swift",
      contents: `import SwiftUI
@main struct SvoiApp: App { @State private var store = SvoiStore(); var body: some Scene { WindowGroup { RootView().environment(store) } } }
enum RootTab { case feed }
struct RootView: View { @Environment(SvoiStore.self) var store; var body: some View { Button("Post") {}.accessibilityIdentifier("open_post").tag(RootTab.feed).tabItem { Label("Лента", systemImage: "house") } } }
struct LoginView: View { var body: some View { Text("Wrong auth") } }`,
    }], uiTestFiles: [], smokeTestNames: [],
  };
  const compiled = compileLeanNativeShell({ blueprint, bundle });
  const source = compiled.appFiles.map(file => file.contents).join("\n");
  assert.match(source, /NativeEmailAuth/);
  assert.match(source, /NativeVisualLanguage\.resolve/);
  assert.match(source, /CaptureIdentity\.reportLayout/);
  assert.match(source, /lucide\.tab\.house\.selected/);
  assert.match(source, /struct ProductRootView/);
  assert.match(source, /nativeAction\("feed\.open_post"\)/);
  assert.doesNotMatch(source, /struct LoginView/);
  assert.equal((source.match(/@main/g) || []).length, 1);
});
