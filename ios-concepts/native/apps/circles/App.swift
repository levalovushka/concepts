import SwiftUI

enum CirclesRoute: Hashable {
    case post(CirclePost)
    case comments(CirclePost)
    case circle(InterestCircle)
    case conversation(CircleDialog)
    case profile
    case saved
    case settings
    case accesses
    case create
}

enum CirclesShotMode {
    static var screen: String? {
        let arguments = ProcessInfo.processInfo.arguments
        guard let index = arguments.firstIndex(of: "-shot"), index + 1 < arguments.count else { return nil }
        return arguments[index + 1]
    }

    static var state: String? {
        let arguments = ProcessInfo.processInfo.arguments
        guard let index = arguments.firstIndex(of: "-state"), index + 1 < arguments.count else { return nil }
        return arguments[index + 1]
    }
}

@main
struct CirclesApp: App {
    @UIApplicationDelegateAdaptor(NativeAppDelegate.self) private var appDelegate
    var body: some Scene { WindowGroup { CirclesRootView() } }
}

struct CirclesRootView: View {
    @State private var store = CirclesStore()
    @State private var nav = Nav(initialTab: NativeConceptSpec.initialTab)
    @State private var permissions = Permissions(
        expectedWiFiSSID: "Circles-Local",
        biometricReason: "Открыть приватные материалы круга",
        autofillService: "circles.local",
        autofillUsers: [("user@circles.local", "main")]
    )
    @State private var session: Session = {
        if CirclesShotMode.screen != nil { return Session(authenticated: true, storageNamespace: "circles.session") }
        return Session.restored(storageNamespace: "circles.session")
    }()
    private let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)

    var body: some View {
        Group {
            if session.isAuthenticated {
                CirclesShell()
            } else {
                NativeEmailAuth(
                    productName: "Круги",
                    persistencePromise: "ваши круги, публикации и планы",
                    initialSurface: "auth",
                    captureState: CirclesShotMode.state,
                    emailActionID: "restore_session",
                    codeActionID: "restore_session",
                    codeFailureActionID: "restore_session"
                ) { session.signIn() }
            }
        }
        .environment(store)
        .environment(nav)
        .environment(permissions)
        .environment(session)
        .environment(\.visualLanguage, visualLanguage)
        .tint(visualLanguage.palette.accent)
        .preferredColorScheme(.light)
        .background {
            GeometryReader { geometry in
                Color.clear.task {
                    guard let screen = CirclesShotMode.screen else { return }
                    CaptureIdentity.report(surface: screen, state: CirclesShotMode.state ?? "populated/default")
                    CaptureIdentity.reportLayout(
                        viewportWidth: geometry.size.width,
                        contentMinX: geometry.frame(in: .global).minX,
                        contentMaxX: geometry.frame(in: .global).maxX
                    )
                }
            }
        }
        .onOpenURL(perform: openDeepLink)
        .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { activity in
            if let url = activity.webpageURL { openDeepLink(url) }
        }
    }

    private func openDeepLink(_ url: URL) {
        let components = url.pathComponents.filter { $0 != "/" }
        guard components.count >= 2, components[components.count - 2] == "post",
              let post = store.posts.first(where: { $0.id == components.last }) else { return }
        nav.open(CirclesRoute.post(post), on: "feed")
    }
}

struct CirclesShell: View {
    @Environment(Nav.self) private var nav
    @Environment(CirclesStore.self) private var store
    @Environment(\.visualLanguage) private var theme

    var body: some View {
        @Bindable var nav = nav
        TabView(selection: $nav.tab) {
            ForEach(NativeConceptSpec.tabs) { tab in
                Tab(value: tab.id) {
                    NavigationStack(path: nav.path(tab.id)) {
                        tabScreen(tab.screen)
                            .navigationDestination(for: CirclesRoute.self) { destination($0) }
                    }
                } label: {
                    Image(theme.requiredTabIconAsset(role: tab.role, selected: nav.tab == tab.id))
                        .renderingMode(.template)
                        .accessibilityHidden(true)
                }
                .accessibilityLabel(tab.label)
                .badge(tab.role == "messaging" ? store.dialogs.reduce(0) { $0 + $1.unread } : 0)
            }
        }
        .sheet(item: $nav.sheet) { route in
            if let value = route.value(CirclesRoute.self) {
                NavigationStack { destination(value) }
            }
        }
        .overlay(alignment: .bottom) { ToastOverlay(text: nav.toastText).padding(.bottom, 92) }
        .task { applyShotMode() }
    }

    @ViewBuilder private func tabScreen(_ screen: String) -> some View {
        switch screen {
        case "feed": CirclesFeedScreen(captureState: state(for: "feed"))
        case "circles": CirclesDiscoveryScreen(captureState: state(for: "circles"))
        case "plans": CirclesPlansScreen(captureState: state(for: "plans"))
        case "messages": CirclesMessagesScreen(captureState: state(for: "messages"))
        default: CirclesMenuScreen(captureState: state(for: "menu"))
        }
    }

    @ViewBuilder private func destination(_ route: CirclesRoute) -> some View {
        Group {
            switch route {
            case .post(let post): CirclesPostScreen(post: post, focusComments: false, captureState: state(for: "post_detail"))
            case .comments(let post): CirclesPostScreen(post: post, focusComments: true, captureState: state(for: "post_detail"))
            case .circle(let circle): CircleDetailScreen(circle: circle, captureState: state(for: "circle_detail"))
            case .conversation(let dialog): CircleConversationScreen(dialog: dialog, captureState: state(for: "conversation"))
            case .profile: CirclesProfileScreen(captureState: state(for: "profile"))
            case .saved: CirclesSavedScreen(captureState: state(for: "saved"))
            case .settings: CirclesSettingsScreen(captureState: state(for: "settings"))
            case .accesses: CirclesAccessesScreen(captureState: state(for: "accesses"))
            case .create: CirclesCreatePostScreen(captureState: state(for: "create_post"))
            }
        }
        .toolbar(.hidden, for: .tabBar)
    }

    private func state(for screen: String) -> String? {
        CirclesShotMode.screen == screen ? CirclesShotMode.state : nil
    }

    private func applyShotMode() {
        guard let screen = CirclesShotMode.screen else { return }
        if let tab = NativeConceptSpec.tabs.first(where: { $0.screen == screen }) {
            nav.tab = tab.id
            return
        }
        switch screen {
        case "post_detail": nav.tab = "feed"; nav.push(CirclesRoute.post(store.posts[0]))
        case "comments": nav.tab = "feed"; nav.push(CirclesRoute.comments(store.posts[0]))
        case "create_post": nav.tab = "feed"; nav.present(sheet: CirclesRoute.create)
        case "circle_detail": nav.tab = "circles"; nav.push(CirclesRoute.circle(store.circles[0]))
        case "conversation": nav.tab = "messages"; nav.push(CirclesRoute.conversation(store.dialogs[0]))
        case "profile": nav.tab = "menu"; nav.push(CirclesRoute.profile)
        case "saved": nav.tab = "menu"; nav.push(CirclesRoute.saved)
        case "settings": nav.tab = "menu"; nav.push(CirclesRoute.settings)
        case "accesses": nav.tab = "menu"; nav.push(CirclesRoute.accesses)
        default: break
        }
    }
}
