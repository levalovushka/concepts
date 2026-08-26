import SwiftUI
import UIKit

enum LooksRoute: Hashable {
    case profile, create, settings, mates, ads, nearby, wardrobe, notifications
    case author(String)
    case talk, checkin, lock, swap, netqr
    case call(String)
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

    static var state: String? {
        let arguments = ProcessInfo.processInfo.arguments
        guard let index = arguments.firstIndex(of: "-state"), index + 1 < arguments.count else { return nil }
        return arguments[index + 1]
    }
}

struct RootView: View {
    @State private var store = LooksStore()
    @State private var nav = Nav(initialTab: NativeConceptSpec.initialTab)
    @State private var perms = Permissions(
        biometricReason: "Открыть черновики и сохранённые образы",
        autofillService: "looks.local",
        autofillUsers: [("nika@mail.ru", "account")]
    )
    @State private var session: Session = {
        if let screen = ShotMode.screen {
            return Session(
                authenticated: !["auth", "phone", "code", "codefail"].contains(screen),
                storageNamespace: "looks.session"
            )
        }
        return Session.restored(storageNamespace: "looks.session")
    }()
    private let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)

    var body: some View {
        Group {
            if session.isAuthenticated {
                if let direct = DirectLooksCaptureRoute.resolve(ShotMode.screen) {
                    DirectLooksCaptureHost(route: direct, state: ShotMode.state)
                } else {
                    MainShell()
                }
            } else {
                LooksCaptureSurface(surface: ShotMode.screen ?? "phone", state: ShotMode.state) {
                    NativeEmailAuth(
                        productName: "Образы",
                        persistencePromise: "образы, гардероб и настройки профиля",
                        initialSurface: ShotMode.screen,
                        captureState: authProductState,
                        emailActionID: "phone.continue-email",
                        codeActionID: "code.confirm-code",
                        codeFailureActionID: "codefail.retry-code"
                    ) { withAnimation(.easeOut(duration: 0.25)) { session.signIn() } }
                }
            }
        }
        .environment(store)
        .environment(nav)
        .environment(perms)
        .environment(session)
        .environment(\.visualLanguage, visualLanguage)
        .tint(visualLanguage.palette.accent)
        .preferredColorScheme(.light)
    }

    private var authProductState: String? {
        switch ShotMode.screen {
        case "phone": productState(for: "phone")
        case "code": productState(for: "code")
        case "codefail": productState(for: "codefail")
        default: nil
        }
    }

    private func productState(for surface: String) -> String? {
        ShotMode.screen == surface ? ShotMode.state : nil
    }
}

/// Capture-only host for short pushed surfaces whose safe-area could be lost
/// when a path and tab-bar visibility changed in the same launch transaction.
/// Normal product navigation continues through MainShell unchanged.
private enum DirectLooksCaptureRoute {
    case event, swap

    static func resolve(_ screen: String?) -> Self? {
        switch screen {
        case "event": .event
        case "swap": .swap
        default: nil
        }
    }
}

private struct DirectLooksCaptureHost: View {
    let route: DirectLooksCaptureRoute
    let state: String?
    @Environment(LooksStore.self) private var store
    @State private var captureTopInset: CGFloat = 0

    var body: some View {
        GeometryReader { geometry in
            NavigationStack {
                LooksCaptureSurface(surface: ShotMode.screen, state: state) {
                    switch route {
                    case .event: EventScreen(event: store.events[0], captureState: state)
                    case .swap: SwapScreen()
                    }
                }
            }
            // Capture launches do not have a presenting navigation transaction,
            // so reserve the real device inset explicitly. Product pushes never
            // enter this host and keep their normal NavigationStack geometry.
            .padding(.top, captureTopInset)
            .ignoresSafeArea(edges: .top)
        }
        .task {
            await Task.yield()
            captureTopInset = UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .flatMap(\.windows)
                .first(where: \.isKeyWindow)?.safeAreaInsets.top ?? 0
        }
    }
}

struct MainShell: View {
    @Environment(Nav.self) private var nav
    @Environment(LooksStore.self) private var store
    @Environment(\.visualLanguage) private var t

    private var unread: Int { store.dialogs.reduce(0) { $0 + $1.unread } }

    var body: some View {
        @Bindable var nav = nav
        // TabView owns Liquid Glass; the VK adapter supplies only its
        // template-rendered product-chrome glyphs.
        TabView(selection: $nav.tab) {
            ForEach(NativeConceptSpec.tabs) { tab in
                tabContent(tab.id, screen: tab.screen)
                    .tabItem { tabLabel(tab) }
                    .tag(tab.id)
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

    @ViewBuilder private func tabLabel(_ tab: NativeTabDefinition) -> some View {
        Image(t.requiredTabIconAsset(role: tab.role, selected: nav.tab == tab.id))
            .renderingMode(.template)
            .accessibilityHidden(true)
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
        case "outfit", "post": selectTab(role: "feed"); nav.push(LooksRoute.outfit(store.outfits[0]))
        case "nearby": selectTab(role: "services"); nav.push(LooksRoute.nearby)
        case "wardrobe": selectTab(role: "services"); nav.push(LooksRoute.wardrobe)
        case "mates": selectTab(role: "services"); nav.push(LooksRoute.mates)
        case "settings": selectTab(role: "services"); nav.push(LooksRoute.settings)
        case "event": selectTab(role: "services"); nav.push(LooksRoute.event(store.events[0]))
        case "create": selectTab(role: "feed"); nav.present(cover: LooksRoute.create)
        case "ads": selectTab(role: "services"); nav.push(LooksRoute.ads)
        case "call": selectTab(role: "messaging"); nav.push(LooksRoute.call(store.dialogs[0].name))
        case "talk": selectTab(role: "services"); nav.push(LooksRoute.talk)
        case "checkin": selectTab(role: "services"); nav.push(LooksRoute.checkin)
        case "lock": selectTab(role: "services"); nav.push(LooksRoute.lock)
        case "swap": selectTab(role: "services"); nav.push(LooksRoute.swap)
        case "netqr": selectTab(role: "services"); nav.push(LooksRoute.netqr)
        case "camera", "media", "voice", "widget", "fill", "subtitles", "background", "shareext":
            selectTab(role: "services")
        default: break
        }
    }

    private func selectTab(role: String) {
        if let tab = NativeConceptSpec.tabs.first(where: { $0.role == role }) { nav.tab = tab.id }
    }

    @ViewBuilder private func tabContent(_ tab: String, screen: String) -> some View {
        NavigationStack(path: nav.path(tab)) {
            LooksCaptureSurface(surface: captureSurface(for: screen), state: ShotMode.state) {
                switch screen {
                case "home": FeedScreen(captureState: productState(for: "home"))
                case "search": SearchScreen(captureState: productState(for: "search"))
                case "chats": ChatsScreen(captureState: productState(for: "chats"))
                case "clip": ClipsScreen()
                default: ServicesScreen(captureState: productState(for: "services"))
                }
            }
            .navigationDestination(for: LooksRoute.self) { destination($0) }
        }
    }

    private func captureSurface(for screen: String) -> String {
        let virtualSurfaces = ["camera", "media", "voice", "widget", "fill", "subtitles", "background", "shareext"]
        if screen == "services", let requested = ShotMode.screen, virtualSurfaces.contains(requested) {
            return requested
        }
        return screen
    }

    /// Capture state is injected into the real product screen. The screenshot
    /// harness must drive state, never replace the screen composition.
    private func productState(for surface: String) -> String? {
        guard ShotMode.screen == surface else { return nil }
        return ShotMode.state
    }

    @ViewBuilder private func destination(_ route: LooksRoute) -> some View {
        LooksCaptureSurface(surface: ShotMode.screen ?? semanticSurface(for: route), state: ShotMode.state) {
          switch route {
        case .profile: ProfileScreen()
        case .author(let name): ProfileScreen(name: name, isOwn: false)
        case .outfit(let o): OutfitScreen(outfit: o)
        case .chat(let d): ChatScreen(dialog: d)
        case .event(let e): EventScreen(event: e, captureState: productState(for: "event"))
        case .settings: SettingsScreen()
        case .notifications: NotificationsScreen(captureState: productState(for: "notifications"))
        case .mates: MatesScreen(captureState: productState(for: "mates"))
        case .ads: AdsScreen()
        case .create: CreateScreen(captureState: productState(for: "create"))
        case .nearby: NearbyScreen(captureState: productState(for: "nearby"))
        case .wardrobe: WardrobeScreen(captureState: productState(for: "wardrobe"))
        case .call(let peer): CallScreen(peer: peer)
        case .talk: TalkScreen(captureState: productState(for: "talk"))
        case .checkin: CheckinScreen(captureState: productState(for: "checkin"))
        case .lock: LockScreen(captureState: productState(for: "lock"))
        case .swap: SwapScreen()
        case .netqr: NetQRScreen(captureState: productState(for: "netqr"))
          }
        }
        .toolbar(.hidden, for: .tabBar)
    }

    private func semanticSurface(for route: LooksRoute) -> String {
        switch route {
        case .profile, .author: "profile"
        case .outfit: "post"
        case .chat: "chat"
        case .event: "event"
        case .settings: "settings"
        case .notifications: "notifications"
        case .mates: "mates"
        case .ads: "ads"
        case .create: "create"
        case .nearby: "nearby"
        case .wardrobe: "wardrobe"
        case .call: "call"
        case .talk: "talk"
        case .checkin: "checkin"
        case .lock: "lock"
        case .swap: "swap"
        case .netqr: "netqr"
        }
    }

    @ViewBuilder private func routeView(_ any: AnyRoute) -> some View {
        if let r = any.value(LooksRoute.self) {
            NavigationStack { destination(r) }
        }
    }
}
