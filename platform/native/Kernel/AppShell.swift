import SwiftUI

private struct Presented: Identifiable { let id: String }

// Каркас приложения: вход → TabView с NavigationStack на вкладку.
// Роли навигации (root / push / sheet / fullscreen / system) — из типов экранов.
struct AppShell: View {
    let app: AppSpec
    @State private var router: Router
    @State private var perms = PermissionManager()
    @State private var authed = false

    init(app: AppSpec) {
        self.app = app
        _router = State(initialValue: Router(startTab: app.tabs.first?.id ?? ""))
    }

    var body: some View {
        Group {
            if authed {
                shell
            } else {
                AuthFlow(appName: app.name,
                         lede: app.mailAuth
                            ? "Пришлём код на почту — чтобы вход и ваши данные остались с вами на новом устройстве"
                            : "Пришлём код в SMS — чтобы вход и ваши данные остались с вами при смене телефона",
                         mailAuth: app.mailAuth) {
                    authed = true
                }
            }
        }
        .tint(app.accent)
        .environment(router)
        .environment(perms)
        .environment(\.appSpec, app)
        .environment(\.conceptAccent, app.accent)
    }

    private var shell: some View {
        ZStack(alignment: .bottom) {
            TabView(selection: Binding(get: { router.selectedTab },
                                       set: { router.selectedTab = $0 })) {
                ForEach(app.tabs) { tab in
                    NavigationStack(path: router.path(for: tab.id)) {
                        rootView(for: tab)
                            .navigationDestination(for: String.self) { id in
                                scaffold(id)
                            }
                    }
                    .tabItem { Label(tab.label, systemImage: tab.systemImage) }
                    .tag(tab.id)
                }
            }

            if let snack = router.snack {
                Text(snack)
                    .font(.footnote)
                    .padding(.horizontal, 14).padding(.vertical, 10)
                    .background(.ultraThinMaterial, in: Capsule())
                    .padding(.bottom, 60)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .animation(.spring(duration: 0.3), value: router.snack)
        .sheet(item: sheetBinding) { p in presentedFlow(p.id) }
        .fullScreenCover(item: coverBinding) { p in presentedFlow(p.id) }
    }

    @ViewBuilder
    private func rootView(for tab: TabSpec) -> some View {
        if let root = app.rootScreen(forTab: tab.id) {
            scaffold(root.id)
        } else {
            Text(tab.label)
        }
    }

    @ViewBuilder
    private func scaffold(_ id: String) -> some View {
        if let custom = GeneratedScreens.view(id) {
            custom.navigationTitle(app.screen(id)?.title ?? "")
                .navigationBarTitleDisplayMode((app.screen(id)?.kind == .root) ? .large : .inline)
        } else if let s = app.screen(id) {
            ScreenScaffold(screen: s)
        } else {
            Text(id)
        }
    }

    @ViewBuilder
    private func presentedFlow(_ id: String) -> some View {
        NavigationStack(path: Binding(get: { router.presentedPath },
                                      set: { router.presentedPath = $0 })) {
            scaffold(id)
                .navigationDestination(for: String.self) { scaffold($0) }
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Готово") { router.dismissPresented() }
                    }
                }
        }
    }

    private var sheetBinding: Binding<Presented?> {
        Binding(get: { router.sheetScreen.map(Presented.init) },
                set: { if $0 == nil { router.dismissPresented() } })
    }
    private var coverBinding: Binding<Presented?> {
        Binding(get: { router.coverScreen.map(Presented.init) },
                set: { if $0 == nil { router.dismissPresented() } })
    }
}
