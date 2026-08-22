import SwiftUI

// AppSpec прокидывается через окружение — экраны не держат ссылку на глобал.
private struct AppSpecKey: EnvironmentKey {
    static let defaultValue: AppSpec? = nil
}
extension EnvironmentValues {
    var appSpec: AppSpec? {
        get { self[AppSpecKey.self] }
        set { self[AppSpecKey.self] = newValue }
    }
}

// Кнопка запроса доступа: жест → системный запрос → granted ведёт к фиче,
// denied показывает снек, а fallback лежит на целевом экране.
struct PermissionGate: View {
    let spec: PermissionSpec
    @Environment(Router.self) private var router
    @Environment(PermissionManager.self) private var perms
    @Environment(\.appSpec) private var app

    var body: some View {
        Button {
            Task {
                let granted = spec.activate ? true : await perms.request(spec.key)
                if !granted { router.toast(spec.snack, id: spec.key.rawValue) }
                if spec.target != spec.screen, let target = app?.screen(spec.target) {
                    router.open(target)
                }
            }
        } label: {
            Row(title: spec.gesture,
                subtitle: spec.feature,
                systemImage: icon(for: spec.key),
                chevron: true)
        }
        .buttonStyle(.plain)
    }

    private func icon(for key: PermissionKey) -> String {
        switch key {
        case .camera: return "camera"
        case .mic: return "mic"
        case .speech: return "waveform"
        case .photo: return "photo"
        case .location: return "location"
        case .push: return "bell"
        case .tracking: return "hand.raised"
        case .localnet: return "wifi"
        case .audio: return "speaker.wave.2"
        }
    }
}

// Экран, выведенный из спеки. Наполнение (тела) заменяется агентом позже;
// каркас же — детерминированный: заголовок, точки запроса доступов, переходы к детям, fallback.
struct ScreenScaffold: View {
    let screen: ScreenSpec
    @Environment(\.appSpec) private var app
    @Environment(PermissionManager.self) private var perms

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if !screen.meta.isEmpty {
                    Text(screen.meta)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                if screen.kind == .system {
                    SectionCard("Системная поверхность") {
                        Row(title: screen.title, subtitle: "Экран уровня системы (PiP / Now Playing / системный picker)")
                    }
                } else {
                    Placeholder(height: 172)
                }

                let gates = app?.permissions(on: screen.id) ?? []
                if !gates.isEmpty {
                    SectionCard("Действия") {
                        ForEach(Array(gates.enumerated()), id: \.element.id) { i, g in
                            if i > 0 { Divider16() }
                            PermissionGate(spec: g)
                        }
                    }
                }

                let deniedHere = (app?.permissions ?? []).filter {
                    $0.target == screen.id && perms.status($0.key) == .denied
                }
                if !deniedHere.isEmpty {
                    SectionCard("Без доступа") {
                        ForEach(deniedHere) { g in
                            Row(title: g.fallback, systemImage: "exclamationmark.triangle")
                        }
                    }
                }

                let kids = (app?.children(of: screen.id) ?? []).filter { $0.kind != .system || true }
                if !kids.isEmpty {
                    SectionCard("Дальше") {
                        ForEach(Array(kids.enumerated()), id: \.element.id) { i, k in
                            if i > 0 { Divider16() }
                            NavLink(child: k)
                        }
                    }
                }
            }
            .padding(Grid.edge)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle(screen.title)
        .navigationBarTitleDisplayMode(screen.kind == .root ? .large : .inline)
    }
}

private struct NavLink: View {
    let child: ScreenSpec
    @Environment(Router.self) private var router
    var body: some View {
        Button { router.open(child) } label: {
            Row(title: child.title, subtitle: child.meta.isEmpty ? nil : child.meta, chevron: true)
        }
        .buttonStyle(.plain)
    }
}
