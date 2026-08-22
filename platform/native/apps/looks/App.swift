import SwiftUI

enum LooksRoute: Hashable {
    case create, settings, mates, ads, nearby, wardrobe
    case call, talk, checkin, lock, swap, netqr
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
    @State private var nav = Nav()
    @State private var perms = Permissions()
    @State private var authed = ShotMode.screen != nil && ShotMode.screen != "auth"
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
            // подписей нет — только иконки; имена остаются для VoiceOver
            Tab("", systemImage: "square.stack", value: 0) { tabContent(0) }
                .accessibilityLabel("Главная")
            Tab("", systemImage: "square.grid.2x2", value: 1) { tabContent(1) }
                .accessibilityLabel("Сервисы")
            Tab("", systemImage: "bubble.left", value: 2) { tabContent(2) }
                .badge(unread)
                .accessibilityLabel("Мессенджер")
            Tab("", systemImage: "play.rectangle", value: 3) { tabContent(3) }
                .accessibilityLabel("Клипы")
            Tab("", systemImage: "person", value: 4) { tabContent(4) }
                .accessibilityLabel("Профиль")
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
        switch s {
        case "feed": nav.tab = 0
        case "services": nav.tab = 1
        case "chats": nav.tab = 2
        case "clips": nav.tab = 3
        case "profile": nav.tab = 4
        case "chat": nav.tab = 2; nav.push(LooksRoute.chat(store.dialogs[0]))
        case "outfit": nav.tab = 0; nav.push(LooksRoute.outfit(store.outfits[0]))
        case "nearby": nav.tab = 1; nav.push(LooksRoute.nearby)
        case "wardrobe": nav.tab = 1; nav.push(LooksRoute.wardrobe)
        case "mates": nav.tab = 1; nav.push(LooksRoute.mates)
        case "settings": nav.tab = 4; nav.push(LooksRoute.settings)
        case "event": nav.tab = 1; nav.push(LooksRoute.event(store.events[0]))
        case "create": nav.tab = 0; nav.present(cover: LooksRoute.create)
        case "ads": nav.tab = 4; nav.push(LooksRoute.ads)
        case "call": nav.tab = 2; nav.push(LooksRoute.call)
        case "talk": nav.tab = 1; nav.push(LooksRoute.talk)
        case "checkin": nav.tab = 1; nav.push(LooksRoute.checkin)
        case "lock": nav.tab = 4; nav.push(LooksRoute.lock)
        case "swap": nav.tab = 1; nav.push(LooksRoute.swap)
        case "netqr": nav.tab = 1; nav.push(LooksRoute.netqr)
        default: break
        }
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
