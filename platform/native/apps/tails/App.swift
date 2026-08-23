import SwiftUI

// Оболочка «Хвостов». Вкладки и стартовая вкладка приходят из спеки через
// NativeConceptSpec, маршруты и режим съёмки описаны здесь.

enum TailsRoute: Hashable {
    case pet(Pet)
    case walk(Walk)
    case places
    case walks
    case chat(Dialog)
    case call
    case settings
    case mates
    case ads
    case lock
    case vetnote
    case course
    case vaccine
    case netqr
    case refresh
    case create
}

@main
struct TailsApp: App {
    @UIApplicationDelegateAdaptor(NativeAppDelegate.self) private var appDelegate
    var body: some Scene { WindowGroup { TailsRootView() } }
}

/// Режим съёмки: `-shot <surface> -state <state>`.
enum ShotMode {
    static var screen: String? {
        let a = ProcessInfo.processInfo.arguments
        guard let i = a.firstIndex(of: "-shot"), i + 1 < a.count else { return nil }
        return a[i + 1]
    }
    static var state: String {
        let a = ProcessInfo.processInfo.arguments
        guard let i = a.firstIndex(of: "-state"), i + 1 < a.count else { return "default" }
        return a[i + 1]
    }
    static func isScreen(_ value: String, state expected: String? = nil) -> Bool {
        screen == value && (expected == nil || state == expected)
    }
    static var isAuthScreen: Bool {
        ["phone", "code", "codefail"].contains(screen ?? "")
    }
}

struct TailsRootView: View {
    @State private var store = TailsStore()
    @State private var nav = Nav(initialTab: NativeConceptSpec.initialTab)
    @State private var perms = Permissions()
    @State private var session = Session(authenticated: ShotMode.screen != nil && !ShotMode.isAuthScreen)
    private let theme = Theme.resolve(NativeConceptSpec.design)

    var body: some View {
        Group {
            if session.isAuthenticated {
                TailsShell()
            } else {
                TailsAuthScreen { withAnimation(.easeOut(duration: 0.25)) { session.signIn() } }
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

struct TailsShell: View {
    @Environment(Nav.self) private var nav
    @Environment(TailsStore.self) private var store

    private var unread: Int { store.dialogs.reduce(0) { $0 + $1.unread } }

    var body: some View {
        @Bindable var nav = nav
        TabView(selection: $nav.tab) {
            ForEach(NativeConceptSpec.tabs, id: \.id) { tab in
                Tab("", systemImage: tab.systemImage, value: tab.id) {
                    tabContent(tab.screen)
                }
                .badge(tab.role == "chats" ? unread : 0)
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

    @ViewBuilder private func tabContent(_ screen: String) -> some View {
        NavigationStack(path: nav.path(screen)) {
            Group {
                switch screen {
                case "home": FeedScreen()
                case "nearby": NearbyScreen()
                case "create": CreateScreen()
                case "chats": ChatsScreen()
                default: MenuScreen()
                }
            }
            .navigationDestination(for: TailsRoute.self) { destination($0) }
        }
    }

    @ViewBuilder private func destination(_ route: TailsRoute) -> some View {
        switch route {
        case .pet(let pet): PetScreen(pet: pet)
        case .walk(let walk): WalkScreen(walk: walk)
        case .places: PlacesScreen()
        case .walks: WalksScreen()
        case .chat(let dialog): ChatScreen(dialog: dialog)
        case .call: CallScreen()
        case .settings: SettingsScreen()
        case .mates: MatesScreen()
        case .ads: AdsScreen()
        case .lock: LockScreen()
        case .vetnote: VetNoteScreen()
        case .course: CourseScreen()
        case .vaccine: VaccineScreen()
        case .netqr: NetQRScreen()
        case .refresh: RefreshScreen()
        case .create: CreateScreen()
        }
    }

    @ViewBuilder private func routeView(_ any: AnyRoute) -> some View {
        if let route = any.value(TailsRoute.self) {
            NavigationStack { destination(route) }
        }
    }

    /// Каждая объявленная поверхность открывается съёмкой сама.
    private func applyShotMode() {
        guard let screen = ShotMode.screen else { return }
        // Корневые вкладки открываются переключением, а не push: иначе съёмка
        // состояний вкладки снимает одну и ту же «Главную».
        if let tab = NativeConceptSpec.tabs.first(where: { $0.screen == screen }) {
            nav.tab = tab.id
            return
        }
        switch screen {
        case "pet": nav.tab = "home"; nav.push(TailsRoute.pet(store.moments[0].pet))
        case "walk": nav.tab = "nearby"; nav.push(TailsRoute.walk(store.walks[0]))
        case "places": nav.tab = "nearby"; nav.push(TailsRoute.places)
        case "chat", "voice": nav.tab = "chats"; nav.push(TailsRoute.chat(store.dialogs[0]))
        case "call": nav.tab = "chats"; nav.push(TailsRoute.call)
        case "settings": nav.tab = "profile"; nav.push(TailsRoute.settings)
        case "mates": nav.tab = "profile"; nav.push(TailsRoute.mates)
        case "ads": nav.tab = "profile"; nav.push(TailsRoute.ads)
        case "lock": nav.tab = "profile"; nav.push(TailsRoute.lock)
        case "vetnote": nav.tab = "home"; nav.push(TailsRoute.vetnote)
        case "course": nav.tab = "profile"; nav.push(TailsRoute.course)
        case "vaccine": nav.tab = "profile"; nav.push(TailsRoute.vaccine)
        case "netqr": nav.tab = "nearby"; nav.push(TailsRoute.netqr)
        case "refresh": nav.tab = "profile"; nav.push(TailsRoute.refresh)
        default: break
        }
    }
}
