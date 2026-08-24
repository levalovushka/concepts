import SwiftUI
import UIKit

enum DvorRoute: Hashable {
    case profile
    case neighbour(Resident)
    case houseSwitcher
    case notifications
    case createPost
    case matter(HouseMatter)
    case report
    case chronicle
    case chat(HouseConversation)
    case guest
    case meters
    case events
    case passwords
    case neighbours
    case settings
    case ads
}

@main
struct DvorApp: App {
    @UIApplicationDelegateAdaptor(NativeAppDelegate.self) private var appDelegate

    var body: some Scene {
        WindowGroup { DvorRootView() }
    }
}

enum DvorShotMode {
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

    static var initialTab: String {
        switch screen {
        case "chats", "chat", "voice", "pending": "chats"
        case "yard", "guest", "scan", "meters", "events": "yard"
        case "menu", "profile", "passwords", "neighbors", "settings": "menu"
        default: "home"
        }
    }

    static var requiresDirectLaunchTopInset: Bool {
        guard let screen else { return false }
        return ["notifications", "post", "chat", "guest", "meters", "events",
                "passwords", "neighbors", "settings", "chronicle"].contains(screen)
    }
}

enum DvorEntryStage {
    case onboarding
    case join
    case residenceVerification
    case manual
    case main
}

struct DvorRootView: View {
    @Environment(\.scenePhase) private var scenePhase
    @AppStorage("dvor.appLock") private var appLockEnabled = false
    @State private var store = HouseStore()
    @State private var nav = Nav(initialTab: DvorShotMode.initialTab)
    @State private var permissions = Permissions(
        expectedWiFiSSID: HouseStore.expectedResidenceSSID,
        biometricReason: "Открыть защищённые доступы дома",
        autofillService: "dvor.local",
        autofillUsers: [("Квартира 48", "door"), ("Dvor-Guest", "guest")]
    )
    @State private var session: Session
    @State private var isLocked = DvorShotMode.screen == "lockscreen"
    @State private var entryStage: DvorEntryStage
    @State private var captureTopInset: CGFloat = 0
    private let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)

    init() {
        if DvorShotMode.screen != nil {
            _session = State(initialValue: Session(
                authenticated: true,
                residenceStatus: DvorShotMode.screen == "pending" ? .pendingReview : .verified,
                storageNamespace: "dvor.session",
                validatesAppleCredential: true
            ))
            _entryStage = State(initialValue: {
                switch DvorShotMode.screen {
                case "auth", "phone": .onboarding
                case "join": .join
                case "verify": .residenceVerification
                case "manual": .manual
                default: .main
                }
            }())
        } else {
            let restored = Session.restored(storageNamespace: "dvor.session", validatesAppleCredential: true)
            _session = State(initialValue: restored)
            _entryStage = State(initialValue: restored.isAuthenticated
                ? (restored.residenceStatus == .unverified ? .join : .main)
                : .onboarding)
        }
    }

    var body: some View {
        Group {
            switch entryStage {
            case .onboarding:
                ResidenceOnboarding { appleUserIdentifier in
                    session.signIn(appleUserIdentifier: appleUserIdentifier)
                    withAnimation(.easeInOut(duration: 0.25)) { entryStage = .join }
                }
            case .join:
                ResidenceJoinScreen(
                    continueVerification: { withAnimation(.easeInOut(duration: 0.25)) { entryStage = .residenceVerification } },
                    manualFallback: { withAnimation(.easeInOut(duration: 0.25)) { entryStage = .manual } }
                )
            case .residenceVerification:
                ResidenceVerificationScreen(
                    verified: {
                        store.isResidenceVerified = true
                        session.verifyResidence()
                        withAnimation(.easeInOut(duration: 0.25)) { entryStage = .main }
                    },
                    manualFallback: {
                        withAnimation(.easeInOut(duration: 0.25)) { entryStage = .manual }
                    }
                )
            case .manual:
                ManualResidenceScreen {
                    store.isResidenceVerified = false
                    session.submitResidenceForReview()
                    withAnimation(.easeInOut(duration: 0.25)) { entryStage = .main }
                }
            case .main:
                DvorMainShell()
            }
        }
        .nativeSurface(currentSemanticSurface)
        .environment(store)
        .environment(nav)
        .environment(permissions)
        .environment(session)
        .environment(\.visualLanguage, visualLanguage)
        .tint(visualLanguage.palette.accent)
        .preferredColorScheme(.light)
        .padding(.top, DvorShotMode.requiresDirectLaunchTopInset ? captureTopInset : 0)
        .ignoresSafeArea(edges: DvorShotMode.requiresDirectLaunchTopInset ? .top : [])
        .background {
            Color.clear.task {
                if let screen = DvorShotMode.screen {
                    CaptureIdentity.report(surface: screen, state: DvorShotMode.state)
                }
            }
        }
        .overlay {
            if isLocked {
                DvorLockScreen(unlock: unlock)
                    .environment(\.visualLanguage, visualLanguage)
            }
        }
        .task {
            if DvorShotMode.requiresDirectLaunchTopInset {
                await Task.yield()
                captureTopInset = UIApplication.shared.connectedScenes
                    .compactMap { $0 as? UIWindowScene }
                    .flatMap(\.windows)
                    .first(where: \.isKeyWindow)?.safeAreaInsets.top ?? 0
            }
            if DvorShotMode.screen == nil, session.isAuthenticated {
                let valid = await session.validateRestoredCredential()
                if !valid {
                    entryStage = .onboarding
                    store.isResidenceVerified = false
                } else {
                    store.isResidenceVerified = session.residenceStatus == .verified
                }
            }
            guard appLockEnabled, DvorShotMode.screen == nil else { return }
            isLocked = true
            await unlock()
        }
        .onChange(of: scenePhase) { _, phase in
            guard appLockEnabled, DvorShotMode.screen == nil else { return }
            if phase != .active { isLocked = true }
            else if isLocked { Task { await unlock() } }
        }
    }

    private func unlock() async {
        guard appLockEnabled else { isLocked = false; return }
        if await permissions.authenticateDeviceOwner() { isLocked = false }
    }

    private var currentSemanticSurface: String {
        if let screen = DvorShotMode.screen { return screen }
        switch entryStage {
        case .onboarding: return "phone"
        case .join: return "join"
        case .residenceVerification: return "verify"
        case .manual: return "manual"
        case .main: return NativeConceptSpec.tabs.first(where: { $0.id == nav.tab })?.screen ?? "home"
        }
    }
}

private struct DvorLockScreen: View {
    let unlock: () async -> Void
    @Environment(\.visualLanguage) private var theme
    @State private var checking = false

    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            Image(systemName: "lock.shield.fill")
                .font(.system(size: 38, weight: .medium))
                .foregroundStyle(theme.palette.textPrimary)
            VStack(spacing: 6) {
                Text("Двор закрыт").font(.role(.tabTitle))
                Text("Разблокируйте, чтобы увидеть адрес, сообщения и доступы дома.")
                    .font(.role(.body)).foregroundStyle(theme.palette.textSecondary)
                    .multilineTextAlignment(.center)
            }
            DvorPrimaryButton(
                title: "Разблокировать",
                loadingTitle: "Проверяем…",
                isLoading: checking
            ) {
                checking = true
                Task { await unlock(); checking = false }
            }
            .padding(.horizontal, 32)
            Spacer()
        }
        .padding(20)
        .background(theme.palette.background)
        .ignoresSafeArea()
    }
}

struct DvorMainShell: View {
    @Environment(Nav.self) private var nav
    @Environment(HouseStore.self) private var store
    @Environment(Session.self) private var session
    @Environment(\.visualLanguage) private var t

    var body: some View {
        @Bindable var nav = nav
        TabView(selection: $nav.tab) {
            ForEach(NativeConceptSpec.tabs) { tab in
                Tab(value: tab.id) {
                    tabContent(tab.id, screen: tab.screen)
                } label: {
                    tabLabel(tab)
                }
                .badge(tab.role == "messaging" ? store.conversations.reduce(0) { $0 + $1.unread } : 0)
                .accessibilityLabel(tab.label)
            }
        }
        .overlay(alignment: .bottom) { ToastOverlay(text: nav.toastText).padding(.bottom, 94) }
        .sheet(item: $nav.sheet) { route in routeView(route) }
        .task { applyShotMode() }
    }

    @ViewBuilder private func tabLabel(_ tab: NativeTabDefinition) -> some View {
        Label {
            Text(tab.label)
        } icon: {
            Image(t.requiredTabIconAsset(role: tab.role, selected: nav.tab == tab.id))
                .renderingMode(.template)
                .accessibilityHidden(true)
        }
    }

    @ViewBuilder private func tabContent(_ tab: String, screen: String) -> some View {
        NavigationStack(path: nav.path(tab)) {
            Group {
                if screen == "chats" && !session.canWriteToHouse {
                    ResidencePendingGateScreen()
                } else {
                    switch screen {
                    case "home": HouseHomeScreen()
                    case "chats": HouseChatsScreen()
                    case "yard": YardScreen()
                    default: HouseMenuScreen()
                    }
                }
            }
            .safeAreaInset(edge: .top, spacing: 0) {
                if session.residenceStatus == .pendingReview {
                    ResidencePendingBanner()
                }
            }
            .nativeSurface(screen)
            .navigationDestination(for: DvorRoute.self) {
                destination($0).toolbar(.hidden, for: .tabBar)
            }
        }
    }

    @ViewBuilder private func destination(_ route: DvorRoute) -> some View {
        Group {
            if requiresVerifiedResidence(route), !session.canWriteToHouse {
                ResidencePendingGateScreen()
            } else {
                switch route {
                case .profile: DvorProfileScreen()
                case .neighbour(let resident): NeighbourProfileScreen(resident: resident)
                case .houseSwitcher: HouseSwitcherScreen()
                case .notifications: HouseNotificationsScreen()
                case .createPost: CreateHousePostScreen()
                case .matter(let matter): MatterScreen(matterID: matter.id)
                case .report: IncidentReportScreen()
                case .chronicle: ChronicleScreen()
                case .chat(let conversation): HouseChatScreen(conversation: conversation)
                case .guest: GuestAccessScreen()
                case .meters: MeterScreen()
                case .events: EventsScreen()
                case .passwords: HouseAccessScreen()
                case .neighbours: NeighboursScreen()
                case .settings: DvorSettingsScreen()
                case .ads: DvorAdsScreen()
                }
            }
        }
        .nativeSurface(semanticSurface(for: route))
    }

    private func semanticSurface(for route: DvorRoute) -> String {
        switch route {
        case .profile, .neighbour: "profile"
        case .houseSwitcher: "home"
        case .notifications: "notifications"
        case .createPost: "createpost"
        case .matter: "post"
        case .report: "problem"
        case .chronicle: "chronicle"
        case .chat: "chat"
        case .guest: "guest"
        case .meters: "meters"
        case .events: "events"
        case .passwords: "passwords"
        case .neighbours: "neighbors"
        case .settings: "settings"
        case .ads: "ads"
        }
    }

    private func requiresVerifiedResidence(_ route: DvorRoute) -> Bool {
        switch route {
        case .createPost, .report, .chat, .guest, .meters, .passwords, .neighbours, .neighbour, .chronicle:
            true
        default:
            false
        }
    }

    @ViewBuilder private func routeView(_ route: AnyRoute) -> some View {
        if let value = route.value(DvorRoute.self) { NavigationStack { destination(value) } }
    }

    private func applyShotMode() {
        guard let screen = DvorShotMode.screen else { return }
        if DvorShotMode.isScreen("home", state: "empty") { store.matters.removeAll() }
        if DvorShotMode.isScreen("home", state: "liked"), let matter = store.matters.first {
            store.toggleLike(matter)
        }
        if DvorShotMode.isScreen("home", state: "poll-voted"),
           let poll = store.matters.first(where: { $0.kind == .poll }),
           let option = poll.pollOptions.first {
            store.vote(in: poll, option: option)
        }
        if DvorShotMode.isScreen("chats", state: "empty") { store.conversations.removeAll() }
        if DvorShotMode.isScreen("events", state: "empty") { store.events.removeAll() }
        if DvorShotMode.isScreen("post", state: "following"),
           let matter = store.matters.first(where: { $0.kind == .incident }) {
            store.following.insert(matter.id)
        }
        if DvorShotMode.isScreen("post", state: "resolved"),
           let index = store.matters.firstIndex(where: { $0.kind == .incident }) {
            store.matters[index].status = .resolved
        }
        if NativeConceptSpec.tabs.contains(where: { $0.screen == screen }) { return }
        switch screen {
        case "profile":
            nav.tab = "menu"
            nav.push(DvorRoute.neighbour(Resident(name: "Анна Котова", apartment: "кв. 12", role: "Старшая по дому")))
        case "notifications": nav.tab = "home"; nav.push(DvorRoute.notifications)
        case "createpost": nav.tab = "home"; nav.present(sheet: DvorRoute.createPost)
        case "post":
            nav.tab = "home"
            let matter = DvorShotMode.state == "default"
                ? store.matters[0]
                : (store.matters.first(where: { $0.kind == .incident }) ?? store.matters[0])
            nav.push(DvorRoute.matter(matter))
        case "problem": nav.tab = "home"; nav.present(sheet: DvorRoute.report)
        case "chronicle": nav.tab = "home"; nav.push(DvorRoute.chronicle)
        case "chat", "voice": nav.tab = "chats"; nav.push(DvorRoute.chat(store.conversations[0]))
        case "guest", "scan": nav.tab = "yard"; nav.push(DvorRoute.guest)
        case "meters": nav.tab = "yard"; nav.push(DvorRoute.meters)
        case "events": nav.tab = "yard"; nav.push(DvorRoute.events)
        case "passwords": nav.tab = "menu"; nav.push(DvorRoute.passwords)
        case "neighbors": nav.tab = "menu"; nav.push(DvorRoute.neighbours)
        case "settings": nav.tab = "menu"; nav.push(DvorRoute.settings)
        case "ads": nav.tab = "menu"; nav.present(sheet: DvorRoute.ads)
        default: break
        }
    }
}

private struct ResidencePendingGateScreen: View {
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t

    var body: some View {
        VStack(spacing: 0) {
            AppStatePanel(
                kind: .warning,
                title: "Заявка сохранена на iPhone",
                detail: "Пока доступна лента и события дома. Приложение не считает локальную заявку подтверждением квартиры."
            )
            .padding(16)
            DvorCard {
                VStack(spacing: 0) {
                    DvorRow(title: "Адрес", value: "Мясницкая, 24/7", chevron: false)
                    DvorRow(title: "Квартира", value: "48", chevron: false)
                    DvorRow(title: "Доступ", value: "Только чтение", chevron: false)
                }
            }
            .padding(.horizontal, 16)
            Spacer()
        }
        .background(t.palette.groupedBackground)
        .vkNavigation("Заявка на подтверждение")
    }
}

private struct ResidencePendingBanner: View {
    @Environment(\.visualLanguage) private var theme

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "clock.badge.checkmark")
                .foregroundStyle(theme.palette.accent)
                .frame(width: 24, height: 24)
            VStack(alignment: .leading, spacing: 2) {
                Text("Заявка сохранена")
                    .font(.role(.groupHeader))
                Text("Пока можно только читать. Локальная заявка не открывает публикации, чаты и доступы.")
                    .font(.role(.bubbleTime))
                    .foregroundStyle(theme.palette.textSecondary)
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(theme.palette.background)
        .overlay(alignment: .bottom) { theme.palette.separator.frame(height: 0.5) }
    }
}
