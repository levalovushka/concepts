import SwiftUI
import Observation

/// Экраны «Двора». В рабочем auth-флоу 29 поверхностей: OTP удалён.
enum Route: Hashable {
    // вход
    case join, verify, manual
    // дом
    case post, problem, shoot, chronicle
    // двор
    case guest, scan, meters, background, events
    // меню
    case passwords, fill, neighbors, profile, settings, ads, lock, widget
}

enum AppTab: Hashable { case home, events, yard, menu }

@MainActor
@Observable
final class Nav {
    var signedIn = false
    var authPath: [Route] = []
    var tab: AppTab = .home
    var paths: [AppTab: [Route]] = [.home: [], .events: [], .yard: [], .menu: []]

    var sheet: Route?
    var cover: Route?
    var toast: String?

    /// Дом подтверждён домашней сетью, а не заявкой на модерацию.
    var homeConfirmed = false

    init() {
        guard let raw = ProcessInfo.processInfo.arguments.first(where: { $0.hasPrefix("-screen:") }) else { return }
        let screen = String(raw.dropFirst("-screen:".count))
        signedIn = true
        switch screen {
        case "events": tab = .events
        case "yard": tab = .yard
        case "post": tab = .home; paths[.home] = [.post]
        case "home": tab = .home
        default: tab = .home
        }
    }

    func push(_ route: Route) { paths[tab, default: []].append(route) }
    func pushAuth(_ route: Route) { authPath.append(route) }
    func present(_ route: Route) { sheet = route }
    func cover(_ route: Route) { cover = route }

    func enterApp() {
        sheet = nil
        cover = nil
        signedIn = true
    }

    func show(_ text: String) {
        toast = text
        Task {
            try? await Task.sleep(for: .seconds(2.2))
            if toast == text { toast = nil }
        }
    }
}

@main
struct DvorApp: App {
    @State private var access = AccessStore()
    @State private var nav = Nav()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(access)
                .environment(nav)
                .tint(D.accent)
                .preferredColorScheme(.light)
        }
    }
}

struct RootView: View {
    @Environment(Nav.self) private var nav

    var body: some View {
        @Bindable var nav = nav
        ZStack(alignment: .bottom) {
            if nav.signedIn { AppShell() } else { AuthFlow() }

            if let toast = nav.toast {
                Text(toast)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 11)
                    .background(Color.black.opacity(0.86), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .padding(.horizontal, 20)
                    .padding(.bottom, nav.signedIn ? 96 : 32)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                    .accessibilityIdentifier("toast")
            }
        }
        .animation(.snappy(duration: 0.22), value: nav.toast)
        .sheet(item: Binding(get: { nav.sheet }, set: { nav.sheet = $0 })) { route in
            NavigationStack { Screen(route) }
        }
        .fullScreenCover(item: Binding(get: { nav.cover }, set: { nav.cover = $0 })) { route in
            Screen(route)
        }
    }
}

extension Route: Identifiable { var id: Self { self } }

/// Оболочка приложения. Таб-бар — системный: в iOS 26 он сам приходит на
/// Liquid Glass, с правильными метриками, бейджами и сжатием при прокрутке.
/// Рисовать его руками смысла нет — получается «почти как системный».
struct AppShell: View {
    @Environment(Nav.self) private var nav

    var body: some View {
        @Bindable var nav = nav
        TabView(selection: $nav.tab) {
            Tab("Дом", systemImage: "house", value: AppTab.home) {
                stack(.home) { HomeView() }
            }
            Tab("События", systemImage: "calendar", value: AppTab.events) {
                stack(.events) { EventsHubView() }
            }
            Tab("Двор", systemImage: "mappin.and.ellipse", value: AppTab.yard) {
                stack(.yard) { YardView() }
            }
            Tab("Меню", systemImage: "line.3.horizontal", value: AppTab.menu) {
                stack(.menu) { MenuView() }
            }
        }
        .tabBarMinimizeBehavior(.onScrollDown)
    }

    @ViewBuilder
    private func stack<Content: View>(_ tab: AppTab, @ViewBuilder content: () -> Content) -> some View {
        @Bindable var nav = nav
        NavigationStack(path: Binding(
            get: { nav.paths[tab] ?? [] },
            set: { nav.paths[tab] = $0 }
        )) {
            content()
                .navigationDestination(for: Route.self) { Screen($0) }
        }
    }
}
