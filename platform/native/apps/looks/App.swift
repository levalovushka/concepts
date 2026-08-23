import SwiftUI

enum LooksRoute: Hashable {
    case profile, create, settings, mates, ads, nearby, wardrobe, notifications
    case call, talk, checkin, lock, swap, netqr
    case outfit(Outfit)
    case chat(Dialog)
    case event(NearbyEvent)
}

@main
struct LooksApp: App {
    @UIApplicationDelegateAdaptor(NativeAppDelegate.self) private var appDelegate

    var body: some Scene {
        WindowGroup { RootView() }
    }
}

/// Режим съёмки: приложение запускается сразу на нужном экране.
/// `xcrun simctl launch <dev> <bundle> -shot feed`
enum ShotMode {
    static var screen: String? {
        let a = ProcessInfo.processInfo.arguments
        guard let i = a.firstIndex(of: "-shot"), i + 1 < a.count else { return nil }
        return a[i + 1]
    }
}

struct RootView: View {
    @State private var store = LooksStore()
    @State private var nav = Nav(initialTab: NativeConceptSpec.initialTab)
    @State private var perms = Permissions()
    @State private var session = Session(authenticated: ShotMode.screen != nil && ShotMode.screen != "auth")
    private let theme = Theme.resolve(NativeConceptSpec.design)

    var body: some View {
        Group {
            if session.isAuthenticated {
                MainShell()
            } else {
                AuthScreen { withAnimation(.easeOut(duration: 0.25)) { session.signIn() } }
            }
        }
        .environment(store)
        .environment(nav)
        .environment(perms)
        .environment(session)
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
        // Таб-бар — нативный Liquid Glass iOS 26 (решение заказчика:
        // копировать плоский бар ВК один в один здесь не нужно).
        TabView(selection: $nav.tab) {
            ForEach(NativeConceptSpec.tabs) { tab in
                Tab("", systemImage: tab.systemImage, value: tab.id) { tabContent(tab.id, screen: tab.screen) }
                    .badge(tab.role == "messaging" ? unread : 0)
                    .accessibilityLabel(tab.label)
            }
        }
        .overlay(alignment: .bottom) {
            ToastOverlay(text: nav.toastText).padding(.bottom, 96)
        }
        .sheet(item: $nav.sheet) { route in routeView(route) }
        .fullScreenCover(item: $nav.cover) { route in routeView(route) }
        .task { applyShotMode() }
    }

    /// Разводит режим съёмки по вкладкам и маршрутам.
    private func applyShotMode() {
        guard let s = ShotMode.screen else { return }
        if let tab = NativeConceptSpec.tabs.first(where: { $0.screen == s }) {
            nav.tab = tab.id
            return
        }
        switch s {
        case "profile": selectTab(role: "feed"); nav.push(LooksRoute.profile)
        case "notifications": selectTab(role: "feed"); nav.push(LooksRoute.notifications)
        case "chat": selectTab(role: "messaging"); nav.push(LooksRoute.chat(store.dialogs[0]))
        case "outfit": selectTab(role: "feed"); nav.push(LooksRoute.outfit(store.outfits[0]))
        case "nearby": selectTab(role: "services"); nav.push(LooksRoute.nearby)
        case "wardrobe": selectTab(role: "services"); nav.push(LooksRoute.wardrobe)
        case "mates": selectTab(role: "services"); nav.push(LooksRoute.mates)
        case "settings": selectTab(role: "services"); nav.push(LooksRoute.settings)
        case "event": selectTab(role: "services"); nav.push(LooksRoute.event(store.events[0]))
        case "create": selectTab(role: "feed"); nav.present(cover: LooksRoute.create)
        case "ads": selectTab(role: "services"); nav.push(LooksRoute.ads)
        case "call": selectTab(role: "messaging"); nav.push(LooksRoute.call)
        case "talk": selectTab(role: "services"); nav.push(LooksRoute.talk)
        case "checkin": selectTab(role: "services"); nav.push(LooksRoute.checkin)
        case "lock": selectTab(role: "services"); nav.push(LooksRoute.lock)
        case "swap": selectTab(role: "services"); nav.push(LooksRoute.swap)
        case "netqr": selectTab(role: "services"); nav.push(LooksRoute.netqr)
        default: break
        }
    }

    private func selectTab(role: String) {
        if let tab = NativeConceptSpec.tabs.first(where: { $0.role == role }) { nav.tab = tab.id }
    }

    @ViewBuilder private func tabContent(_ tab: String, screen: String) -> some View {
        NavigationStack(path: nav.path(tab)) {
            Group {
                switch screen {
                case "home": FeedScreen()
                case "search": SearchScreen()
                case "chats": ChatsScreen()
                case "clip": ClipsScreen()
                default: ServicesScreen()
                }
            }
            .navigationDestination(for: LooksRoute.self) { destination($0) }
        }
    }

    @ViewBuilder private func destination(_ route: LooksRoute) -> some View {
        switch route {
        case .profile: ProfileScreen()
        case .outfit(let o): OutfitScreen(outfit: o)
        case .chat(let d): ChatScreen(dialog: d)
        case .event(let e): EventScreen(event: e)
        case .settings: SettingsScreen()
        case .notifications: NotificationsScreen()
        case .mates: MatesScreen()
        case .ads: AdsScreen()
        case .create: CreateScreen()
        case .nearby: NearbyScreen()
        case .wardrobe: WardrobeScreen()
        case .call: CallScreen(peer: store.dialogs[0].name)
        case .talk: TalkScreen()
        case .checkin: CheckinScreen()
        case .lock: LockScreen()
        case .swap: SwapScreen()
        case .netqr: NetQRScreen()
        }
    }

    @ViewBuilder private func routeView(_ any: AnyRoute) -> some View {
        if let r = any.value(LooksRoute.self) {
            NavigationStack { destination(r) }
        }
    }
}
