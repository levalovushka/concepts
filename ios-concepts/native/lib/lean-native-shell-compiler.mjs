function removeSwiftDeclaration(source, pattern, label) {
  const match = pattern.exec(source);
  if (!match) return { source, removed: null };
  const opening = source.indexOf("{", match.index);
  if (opening < 0) throw new Error(`${label} has no body`);
  let depth = 0;
  let string = false;
  let escaping = false;
  for (let index = opening; index < source.length; index += 1) {
    const character = source[index];
    if (string) {
      if (escaping) escaping = false;
      else if (character === "\\") escaping = true;
      else if (character === '"') string = false;
      continue;
    }
    if (character === '"') { string = true; continue; }
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth === 0) return {
      source: `${source.slice(0, match.index)}${source.slice(index + 1)}`.replace(/\n{3,}/g, "\n\n"),
      removed: source.slice(match.index, index + 1),
    };
  }
  throw new Error(`${label} has an unterminated body`);
}

function names(appSource) {
  const appName = appSource.match(/@main\s+(?:\n\s*)?struct\s+(\w+)\s*:\s*App\b/)?.[1];
  const storeName = appSource.match(/@State(?:Object)?(?:\s+private)?\s+var\s+store\s*=\s*(\w+)\s*\(/)?.[1]
    || appSource.match(/@StateObject(?:\s+private)?\s+var\s+store\s*=\s*(\w+)\s*\(/)?.[1];
  if (!appName || !storeName) throw new Error("Renderer source must expose one app name and one product store");
  return { appName, storeName };
}

const tabAssets = Object.freeze({
  feed: "house", search: "search", create: "layout-grid", messages: "message-circle", profile: "menu",
});

function compileTabItems(source) {
  return source.replace(
    /\.tabItem\s*\{\s*Label\("([^"]+)",\s*systemImage:\s*"[^"]+"\)\s*\}/g,
    (match, label, offset) => {
      const before = source.slice(Math.max(0, offset - 180), offset);
      const role = Object.keys(tabAssets).find(candidate => new RegExp(`\\.tag\\(RootTab\\.${candidate}\\)`).test(before));
      if (!role) return match;
      const asset = tabAssets[role];
      return `.tabItem {\n                    Image(store.tab == .${role} ? "lucide.tab.${asset}.selected" : "lucide.tab.${asset}.regular")\n                        .accessibilityLabel("${label}")\n                }`;
    },
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compileActionBindings(source, blueprint) {
  let compiled = source.replace(/\s*\.nativeAction\("[^"]+"\)/g, "");
  for (const screen of blueprint.navigation.screens) {
    if (screen.id === "login") continue;
    for (const actionId of screen.actionIds) {
      const identifier = new RegExp(`\\.accessibilityIdentifier\\("${escapeRegExp(actionId)}"\\)`);
      if (!identifier.test(compiled)) continue;
      compiled = compiled.replace(identifier, `.nativeAction("${screen.id}.${actionId}")\n            .accessibilityIdentifier("${actionId}")`);
    }
  }
  return compiled;
}

function shellSource({ blueprint, appName, storeName, usesObservableEnvironment }) {
  const login = blueprint.navigation.screens.find(screen => screen.id === "login");
  const emailAction = login?.actionIds?.[0] || "request_email_code";
  const codeAction = login?.actionIds?.[1] || "verify_email_code";
  const environment = usesObservableEnvironment ? ".environment(store)" : ".environmentObject(store)";
  const storeOwnership = usesObservableEnvironment
    ? `@State private var store = ${storeName}()`
    : `@StateObject private var store = ${storeName}()`;
  return `import SwiftUI

@main
struct ${appName}: App {
    ${storeOwnership}
    @State private var permissions = Permissions()
    @State private var session = LeanNativeSessionState()
    private let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)

    var body: some Scene {
        WindowGroup {
            Group {
                if session.isAuthenticated {
                    ProductRootView()
                        .onAppear { store.authenticated = true }
                } else {
                    NativeEmailAuth(
                        productName: ${JSON.stringify(blueprint.name)},
                        persistencePromise: "профиль и ваши действия",
                        initialSurface: LeanNativeCapture.surface,
                        captureState: LeanNativeCapture.state,
                        emailActionID: ${JSON.stringify(`login.${emailAction}`)},
                        codeActionID: ${JSON.stringify(`login.${codeAction}`)}
                    ) { session.signIn(); store.authenticated = true }
                }
            }
            ${environment}
            .environment(permissions)
            .environment(\.${"visualLanguage"}, visualLanguage)
            .tint(visualLanguage.palette.accent)
            .preferredColorScheme(.light)
            .background(LeanNativeCaptureProbe())
        }
    }
}

@MainActor @Observable
private final class LeanNativeSessionState {
    var isAuthenticated = LeanNativeCapture.skipsAuthentication
    func signIn() { isAuthenticated = true }
}

private enum LeanNativeCapture {
    static let surface: String? = argument(after: "-shot")
    static let state: String? = argument(after: "-state")
    static let skipsAuthentication = surface.map { $0 != "login" } ?? false
    private static func argument(after key: String) -> String? {
        let values = ProcessInfo.processInfo.arguments
        guard let index = values.firstIndex(of: key), values.indices.contains(index + 1) else { return nil }
        return values[index + 1]
    }
}

private struct LeanNativeCaptureProbe: View {
    var body: some View {
        GeometryReader { proxy in
            Color.clear.task {
                let frame = proxy.frame(in: .global)
                CaptureIdentity.report(surface: LeanNativeCapture.surface ?? "feed", state: LeanNativeCapture.state ?? "populated/default")
                CaptureIdentity.reportLayout(
                    viewportWidth: proxy.size.width, viewportHeight: proxy.size.height,
                    contentMinX: frame.minX, contentMaxX: frame.maxX,
                    contentMinY: frame.minY, contentMaxY: frame.maxY
                )
            }
        }
        .allowsHitTesting(false)
    }
}
`;
}

export function compileLeanNativeShell({ blueprint, bundle }) {
  const normalized = structuredClone(bundle);
  const appIndex = normalized.appFiles.findIndex(file => /@main\s+[\s\S]{0,40}?struct\s+\w+\s*:\s*App\b/.test(file.contents));
  if (appIndex < 0) throw new Error("Renderer source has no @main application declaration");
  const appFile = normalized.appFiles[appIndex];
  const identity = names(appFile.contents);
  let productApp = removeSwiftDeclaration(
    appFile.contents, /@main\s+(?:\n\s*)?struct\s+\w+\s*:\s*App\b/, "renderer app",
  ).source;
  productApp = compileTabItems(productApp.replace(/\bRootView\b/g, "ProductRootView"));
  appFile.contents = productApp;

  for (const file of normalized.appFiles) {
    const localAuth = removeSwiftDeclaration(file.contents, /struct\s+LoginView\s*:\s*View\b/, "local login");
    file.contents = compileActionBindings(localAuth.source, blueprint);
  }
  normalized.appFiles.unshift({
    path: "NativeShell.swift",
    contents: shellSource({
      blueprint, ...identity,
      usesObservableEnvironment: normalized.appFiles.some(file => /@Environment\(\w+\.self\)/.test(file.contents)),
    }),
  });
  return normalized;
}
