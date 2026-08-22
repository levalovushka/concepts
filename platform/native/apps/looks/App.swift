import SwiftUI

enum LooksRoute: Hashable {
    case create, search, settings, mates, ads, nearby, wardrobe
    case outfit(Outfit)
    case chat(Dialog)
    case event(NearbyEvent)
}

@main
struct LooksApp: App {
    var body: some Scene {
        WindowGroup { RootView() }
    }
}

struct RootView: View {
    @State private var store = LooksStore()
    @State private var nav = Nav()
    @State private var perms = Permissions()
    @State private var authed = false
    private let theme = Theme.vk

    var body: some View {
        Group {
            if authed {
                MainShell()
            } else {
                AuthScreen { withAnimation(.easeOut(duration: 0.25)) { authed = true } }
            }
        }
        .environment(store)
        .environment(nav)
        .environment(perms)
        .environment(\.theme, theme)
        .tint(theme.accent)
        .preferredColorScheme(.light)
    }
}

struct MainShell: View {
    @Environment(Nav.self) private var nav
    @Environment(LooksStore.self) private var store
    @Environment(\.theme) private var t

    private var unread: Int { store.dialogs.reduce(0) { $0 + $1.unread } }

    var body: some View {
        @Bindable var nav = nav
        // Нативный TabView — на iOS 26 это Liquid Glass таб-бар с системным
        // поведением: сжатие при скролле, размытие, корректные safe-area отступы.
        TabView(selection: $nav.tab) {
            Tab("Главная", systemImage: "square.stack", value: 0) { tabContent(0) }
            Tab("Сервисы", systemImage: "square.grid.2x2", value: 1) { tabContent(1) }
            Tab("Мессенджер", systemImage: "bubble.left", value: 2) { tabContent(2) }
                .badge(unread)
            Tab("Клипы", systemImage: "play.rectangle", value: 3) { tabContent(3) }
            Tab("Профиль", systemImage: "person", value: 4) { tabContent(4) }
        }
        .overlay(alignment: .bottom) {
            ToastOverlay(text: nav.toastText).padding(.bottom, 96)
        }
        .sheet(item: $nav.sheet) { route in routeView(route) }
        .fullScreenCover(item: $nav.cover) { route in routeView(route) }
    }

    @ViewBuilder private func tabContent(_ i: Int) -> some View {
        NavigationStack(path: nav.path(i)) {
            Group {
                switch i {
                case 0: FeedScreen()
                case 1: ServicesScreen()
                case 2: ChatsScreen()
                case 3: ClipsScreen()
                default: ProfileScreen()
                }
            }
            .navigationDestination(for: LooksRoute.self) { destination($0) }
        }
    }

    @ViewBuilder private func destination(_ route: LooksRoute) -> some View {
        switch route {
        case .outfit(let o): OutfitScreen(outfit: o)
        case .chat(let d): ChatScreen(dialog: d)
        case .event(let e): EventScreen(event: e)
        case .settings: SettingsScreen()
        case .search: SearchScreen()
        case .mates: MatesScreen()
        case .ads: AdsScreen()
        case .create: CreateScreen()
        case .nearby: NearbyScreen()
        case .wardrobe: WardrobeScreen()
        }
    }

    @ViewBuilder private func routeView(_ any: AnyRoute) -> some View {
        if let r = any.value(LooksRoute.self) {
            NavigationStack { destination(r) }
        }
    }
}
