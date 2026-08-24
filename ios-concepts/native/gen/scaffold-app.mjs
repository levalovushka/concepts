#!/usr/bin/env node
// Каркас приложения из спеки. Новый концепт больше не начинается с пустого
// файла: навигация, режим съёмки, роли поверхностей и объявленные состояния
// выводятся из манифеста, а агент пишет содержимое экранов.
//
// Так закрывается причина №4 из WHY-REWORK: спека описывает интерфейс, но
// экраны писались рядом с ней, а не из неё.
//
// Файлы не перезаписываются: каркас ставится один раз, дальше он живёт руками.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const NATIVE = join(__dir, "..");

const slug = process.argv[2];
if (!slug) { console.error("usage: scaffold-app.mjs <slug>"); process.exit(1); }

const raw = execFileSync(process.execPath, [join(__dir, "compile-concept.mjs"), slug], {
  encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
});
const manifest = JSON.parse(raw.slice(raw.indexOf("{")));

const Prefix = slug[0].toUpperCase() + slug.slice(1);
const appDir = join(NATIVE, "apps", slug);
mkdirSync(appDir, { recursive: true });

const pushSurfaces = manifest.surfaces.filter(s => ["push", "sheet", "cover"].includes(s.presentation));
const tabs = manifest.navigation.tabs;
const swiftId = id => id.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());

const app = `import SwiftUI

// Каркас собран gen/scaffold-app.mjs из concept.json: вкладки, маршруты
// и режим съёмки выводятся из манифеста. Содержимое экранов пишется руками.

enum ${Prefix}Route: Hashable {
${pushSurfaces.map(s => `    case ${swiftId(s.id)}`).join("\n")}
}

@main
struct ${Prefix}App: App {
    @UIApplicationDelegateAdaptor(NativeAppDelegate.self) private var appDelegate
    var body: some Scene { WindowGroup { ${Prefix}RootView() } }
}

/// Режим съёмки: приложение запускается сразу на нужной поверхности
/// и в нужном состоянии — \`-shot <surface> -state <state>\`.
enum ${Prefix}ShotMode {
    static var screen: String? {
        let arguments = ProcessInfo.processInfo.arguments
        guard let index = arguments.firstIndex(of: "-shot"), index + 1 < arguments.count else { return nil }
        return arguments[index + 1]
    }
    static var state: String {
        let arguments = ProcessInfo.processInfo.arguments
        guard let index = arguments.firstIndex(of: "-state"), index + 1 < arguments.count else { return "default" }
        return arguments[index + 1]
    }
    static func isScreen(_ value: String, state expected: String? = nil) -> Bool {
        screen == value && (expected == nil || state == expected)
    }
    static var initialTab: String { NativeConceptSpec.initialTab }
}

struct ${Prefix}RootView: View {
    @State private var nav = Nav(initialTab: ${Prefix}ShotMode.initialTab)
    @State private var permissions = Permissions()
    private let theme = Theme.resolve(NativeConceptSpec.design)

    var body: some View {
        @Bindable var nav = nav
        TabView(selection: $nav.tab) {
${tabs.map(tab => `            Tab("", systemImage: "${tab.systemImage || "circle"}", value: "${tab.id}") {
                NavigationStack(path: nav.path("${tab.id}")) {
                    ${Prefix}Surface_${swiftId(tab.screen)}()
                        .navigationDestination(for: ${Prefix}Route.self) { destination($0) }
                }
            }
            .accessibilityLabel("${tab.label}")`).join("\n")}
        }
        .environment(nav)
        .environment(permissions)
        .environment(\\.theme, theme)
        .tint(theme.accent)
        .task { applyShotMode() }
    }

    @ViewBuilder private func destination(_ route: ${Prefix}Route) -> some View {
        switch route {
${pushSurfaces.map(s => `        case .${swiftId(s.id)}: ${Prefix}Surface_${swiftId(s.id)}()`).join("\n")}
        }
    }

    /// Съёмка объявленных состояний: каждая поверхность открывается сама.
    private func applyShotMode() {
        guard let screen = ${Prefix}ShotMode.screen else { return }
        switch screen {
${pushSurfaces.map(s => `        case "${s.id}": nav.push(${Prefix}Route.${swiftId(s.id)})`).join("\n")}
        default: break
        }
    }
}
`;

const surfaceViews = manifest.surfaces.map(surface => {
  const contract = manifest.design.surfaceContracts?.find(c => c.surface === surface.id);
  const regions = contract?.composition || ["primary-content"];
  const states = surface.states || ["default"];
  return `
// ${surface.id} — ${surface.purpose || "назначение не объявлено"}
// Композиция рецепта: ${regions.join(" · ")}
// Состояния: ${states.join(", ")}
struct ${Prefix}Surface_${swiftId(surface.id)}: View {
    @Environment(Nav.self) private var nav
    @Environment(\\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
${regions.map(region => `                // TODO region: ${region}`).join("\n")}
                Text("${surface.title || surface.id}").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}`;
}).join("\n");

const screens = `import SwiftUI

// Заготовки поверхностей из манифеста: у каждой объявлены назначение,
// композиция рецепта и состояния. Заполняются руками — каркас только
// задаёт, что на экране обязано быть.
${surfaceViews}
`;

// Драйверы съёмки: по одному на каждое объявленное состояние. Без них
// состояния объявлены, но не сняты — а ворота требуют кадр на каждое.
const capture = {
  schemaVersion: 1,
  distinctStateGroups: manifest.surfaces
    .filter(s => (s.states || []).length > 1)
    .map(s => s.states.map(state => `${s.id}-${state}`)),
  drivers: manifest.verification.states
    .filter(state => state.method === "screenshot")
    .map(state => ({
      surface: state.surface,
      state: state.state,
      launch: state.surface,
      artifact: `${state.surface}-${state.state}`,
    })),
};

const files = [
  ["App.swift", app],
  ["Surfaces.swift", screens],
  ["capture.json", JSON.stringify(capture, null, 2) + "\n"],
];

let written = 0;
for (const [name, content] of files) {
  const path = join(appDir, name);
  if (existsSync(path)) {
    console.log(`  · ${name} уже есть — не трогаю`);
    continue;
  }
  writeFileSync(path, content);
  written += 1;
  console.log(`  ✓ ${name}`);
}

console.log(`\nКаркас «${slug}»: поверхностей ${manifest.surfaces.length}, вкладок ${tabs.length}, файлов создано ${written}.`);
if (written) {
  console.log("Дальше: наполнить поверхности содержимым и прогнать npm run native:pipeline " + slug);
}
