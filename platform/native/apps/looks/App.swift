import SwiftUI

enum LooksRoute: Hashable {
    case create, search, settings, mates, ads
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

    private var tabs: [TabItem] {
        [
            TabItem(id: 0, title: "Лента", icon: "square.stack", iconActive: "square.stack.fill"),
            TabItem(id: 1, title: "Рядом", icon: "location", iconActive: "location.fill"),
            TabItem(id: 2, title: "Гардероб", icon: "hanger", iconActive: "hanger"),
            TabItem(id: 3, title: "Сообщения", icon: "bubble.left", iconActive: "bubble.left.fill",
                    badge: store.dialogs.reduce(0) { $0 + $1.unread }),
            TabItem(id: 4, title: "Профиль", icon: "person", iconActive: "person.fill"),
        ]
    }

    var body: some View {
        @Bindable var nav = nav
        ZStack(alignment: .bottom) {
            VStack(spacing: 0) {
                ZStack {
                    tabContent(0).opacity(nav.tab == 0 ? 1 : 0)
                    tabContent(1).opacity(nav.tab == 1 ? 1 : 0)
                    tabContent(2).opacity(nav.tab == 2 ? 1 : 0)
                    tabContent(3).opacity(nav.tab == 3 ? 1 : 0)
                    tabContent(4).opacity(nav.tab == 4 ? 1 : 0)
                }
                VKTabBar(items: tabs, selection: $nav.tab)
            }
            ToastOverlay(text: nav.toastText).padding(.bottom, 76)
        }
        .ignoresSafeArea(.keyboard, edges: .bottom)
        .sheet(item: $nav.sheet) { route in routeView(route) }
        .fullScreenCover(item: $nav.cover) { route in routeView(route) }
    }

    @ViewBuilder private func tabContent(_ i: Int) -> some View {
        NavigationStack(path: nav.path(i)) {
            Group {
                switch i {
                case 0: FeedScreen()
                case 1: NearbyScreen()
                case 2: WardrobeScreen()
                case 3: ChatsScreen()
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
        }
    }

    @ViewBuilder private func routeView(_ any: AnyRoute) -> some View {
        if let r = any.value(LooksRoute.self) {
            NavigationStack { destination(r) }
        }
    }
}
