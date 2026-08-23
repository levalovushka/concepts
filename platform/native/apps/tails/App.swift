import SwiftUI

// Каркас собран gen/scaffold-app.mjs из concept.json: вкладки, маршруты
// и режим съёмки выводятся из манифеста. Содержимое экранов пишется руками.

enum TailsRoute: Hashable {
    case code
    case codefail
    case pet
    case walk
    case camera
    case places
    case chat
    case voice
    case settings
    case widget
    case fill
    case refresh
    case mates
    case ads
    case lock
    case vetnote
    case course
    case background
    case call
    case vaccine
    case netqr
    case shareext
}

@main
struct TailsApp: App {
    @UIApplicationDelegateAdaptor(NativeAppDelegate.self) private var appDelegate
    var body: some Scene { WindowGroup { TailsRootView() } }
}

/// Режим съёмки: приложение запускается сразу на нужной поверхности
/// и в нужном состоянии — `-shot <surface> -state <state>`.
enum TailsShotMode {
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

struct TailsRootView: View {
    @State private var nav = Nav(initialTab: TailsShotMode.initialTab)
    @State private var permissions = Permissions()
    private let theme = Theme.resolve(NativeConceptSpec.design)

    var body: some View {
        @Bindable var nav = nav
        TabView(selection: $nav.tab) {
            Tab("", systemImage: "house", value: "home") {
                NavigationStack(path: nav.path("home")) {
                    TailsSurface_home()
                        .navigationDestination(for: TailsRoute.self) { destination($0) }
                }
            }
            .accessibilityLabel("Главная")
            Tab("", systemImage: "magnifyingglass", value: "nearby") {
                NavigationStack(path: nav.path("nearby")) {
                    TailsSurface_nearby()
                        .navigationDestination(for: TailsRoute.self) { destination($0) }
                }
            }
            .accessibilityLabel("Рядом")
            Tab("", systemImage: "play.rectangle", value: "create") {
                NavigationStack(path: nav.path("create")) {
                    TailsSurface_create()
                        .navigationDestination(for: TailsRoute.self) { destination($0) }
                }
            }
            .accessibilityLabel("Клипы")
            Tab("", systemImage: "bubble.left", value: "chats") {
                NavigationStack(path: nav.path("chats")) {
                    TailsSurface_chats()
                        .navigationDestination(for: TailsRoute.self) { destination($0) }
                }
            }
            .accessibilityLabel("Сообщения")
            Tab("", systemImage: "line.3.horizontal", value: "profile") {
                NavigationStack(path: nav.path("profile")) {
                    TailsSurface_profile()
                        .navigationDestination(for: TailsRoute.self) { destination($0) }
                }
            }
            .accessibilityLabel("Меню")
        }
        .environment(nav)
        .environment(permissions)
        .environment(\.theme, theme)
        .tint(theme.accent)
        .task { applyShotMode() }
    }

    @ViewBuilder private func destination(_ route: TailsRoute) -> some View {
        switch route {
        case .code: TailsSurface_code()
        case .codefail: TailsSurface_codefail()
        case .pet: TailsSurface_pet()
        case .walk: TailsSurface_walk()
        case .camera: TailsSurface_camera()
        case .places: TailsSurface_places()
        case .chat: TailsSurface_chat()
        case .voice: TailsSurface_voice()
        case .settings: TailsSurface_settings()
        case .widget: TailsSurface_widget()
        case .fill: TailsSurface_fill()
        case .refresh: TailsSurface_refresh()
        case .mates: TailsSurface_mates()
        case .ads: TailsSurface_ads()
        case .lock: TailsSurface_lock()
        case .vetnote: TailsSurface_vetnote()
        case .course: TailsSurface_course()
        case .background: TailsSurface_background()
        case .call: TailsSurface_call()
        case .vaccine: TailsSurface_vaccine()
        case .netqr: TailsSurface_netqr()
        case .shareext: TailsSurface_shareext()
        }
    }

    /// Съёмка объявленных состояний: каждая поверхность открывается сама.
    private func applyShotMode() {
        guard let screen = TailsShotMode.screen else { return }
        switch screen {
        case "code": nav.push(TailsRoute.code)
        case "codefail": nav.push(TailsRoute.codefail)
        case "pet": nav.push(TailsRoute.pet)
        case "walk": nav.push(TailsRoute.walk)
        case "camera": nav.push(TailsRoute.camera)
        case "places": nav.push(TailsRoute.places)
        case "chat": nav.push(TailsRoute.chat)
        case "voice": nav.push(TailsRoute.voice)
        case "settings": nav.push(TailsRoute.settings)
        case "widget": nav.push(TailsRoute.widget)
        case "fill": nav.push(TailsRoute.fill)
        case "refresh": nav.push(TailsRoute.refresh)
        case "mates": nav.push(TailsRoute.mates)
        case "ads": nav.push(TailsRoute.ads)
        case "lock": nav.push(TailsRoute.lock)
        case "vetnote": nav.push(TailsRoute.vetnote)
        case "course": nav.push(TailsRoute.course)
        case "background": nav.push(TailsRoute.background)
        case "call": nav.push(TailsRoute.call)
        case "vaccine": nav.push(TailsRoute.vaccine)
        case "netqr": nav.push(TailsRoute.netqr)
        case "shareext": nav.push(TailsRoute.shareext)
        default: break
        }
    }
}
