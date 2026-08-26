import SwiftUI
import UIKit

struct NativeV2ProductRoot: View {
    @Environment(NativeV2ProductStore.self) private var store
    @Environment(\.visualLanguage) private var theme
    @State private var selectedTab = NativeV2Capture.initialTab(["relay_feed", "discover", "create", "messages", "services"])

    var body: some View {
        @Bindable var store = store
        TabView(selection: $selectedTab) {
            NavigationStack {
                NativeV2Surface(route: store.route)
            }
            .tabItem {
                Image(theme.requiredTabIconAsset(role: "feed", selected: selectedTab == "relay_feed"))
                    .renderingMode(.template)
                    .accessibilityLabel("Лента")
            }
            .tag("relay_feed")

            NavigationStack {
                NativeV2Surface(route: store.route)
            }
                .tabItem {
                    Image(theme.requiredTabIconAsset(role: "discovery", selected: selectedTab == "discover"))
                        .renderingMode(.template)
                        .accessibilityLabel("Поиск")
                }
                .tag("discover")

            NavigationStack {
                NativeV2Surface(route: store.route)
            }
                .tabItem {
                    Image(theme.requiredTabIconAsset(role: "short-video", selected: selectedTab == "create"))
                        .renderingMode(.template)
                        .accessibilityLabel("Создать")
                }
                .tag("create")

            NavigationStack {
                NativeV2Surface(route: store.route)
            }
                .tabItem {
                    Image(theme.requiredTabIconAsset(role: "messaging", selected: selectedTab == "messages"))
                        .renderingMode(.template)
                        .accessibilityLabel("Ответы")
                }
                .tag("messages")

            NavigationStack {
                NativeV2Surface(route: store.route)
            }
                .tabItem {
                    Image(theme.requiredTabIconAsset(role: "services", selected: selectedTab == "services"))
                        .renderingMode(.template)
                        .accessibilityLabel("Профиль")
                }
                .tag("services")
        }
        .tabBarMinimizeBehavior(.never)
        .onChange(of: selectedTab) { _, value in
            if let route = ProductRoute(rawValue: value) { store.route = route }
        }

        .sheet(isPresented: Binding(
            get: { store.presentedCapability == "camera" },
            set: { if !$0 { store.cancelPresentedCapability() } }
        )) {
            NativeV2CameraPicker(
                onCapture: { _ in store.completePresentedCapability() },
                onCancel: { store.cancelPresentedCapability() }
            )
            .ignoresSafeArea()
        }
    }
}

private struct NativeV2SlicePlaceholder: View {
    let title: String
    var body: some View {
        VKRootSurface {
            VKTabHeader(title: title) { EmptyView() }
        } content: {
            VKGroup {
                VKInlineNotice(
                    title: "За границей вертикального среза",
                    detail: "Эта вкладка появится только после приёмки основного механизма."
                )
            }
        }
    }
}

private struct NativeV2ServiceState: View {
    let state: String
    let title: String
    @Environment(\.visualLanguage) private var theme

    private var copy: (icon: String, title: String, detail: String) {
        switch state {
        case "loading": return ("arrow.triangle.2.circlepath", "Обновляем", "Сохраняем видимый контекст, пока данные загружаются.")
        case "empty": return ("tray", "Пока пусто", "Первое действие заполнит этот раздел понятным результатом.")
        case "error": return ("exclamationmark.circle", "Не удалось завершить", "Введённые данные сохранены; действие можно безопасно повторить.")
        case "offline": return ("wifi.slash", "Нет сети", "Последний подтверждённый результат доступен до восстановления связи.")
        case "permission-denied": return ("lock.slash", "Доступ не дан", "Основной сценарий остаётся доступен, а системное действие можно повторить позже.")
        case "permission-granted": return ("checkmark.circle", "Доступ выполнен", "Системный результат связан с продуктовой сущностью.")
        default: return ("questionmark.circle", title, "Состояние не описано контрактом.")
        }
    }

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: copy.icon).font(.system(size: 36, weight: .medium)).foregroundStyle(theme.palette.accent)
            Text(copy.title).font(.vkTabTitle)
            Text(copy.detail).font(.vkBody).foregroundStyle(theme.palette.textSecondary).multilineTextAlignment(.center)
            if state == "permission-denied" {
                Button("Открыть настройки") {
                    if let url = URL(string: UIApplication.openSettingsURLString) { UIApplication.shared.open(url) }
                }
                .buttonStyle(.bordered)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(32)
        .background(theme.palette.groupedBackground)
    }
}

private struct NativeV2Surface: View {
    let route: ProductRoute
    @ViewBuilder var body: some View {
        switch route {
        case .relayFeed: RelayFeedSurface()
        case .turn: TurnSurface()
        case .chapterResult: ChapterResultSurface()
        case .discover: DiscoverSurface()
        case .create: CreateSurface()
        case .messages: MessagesSurface()
        case .services: ServicesSurface()
        case .settings: SettingsSurface()
        }
    }
}

private struct RelayFeedSurface: View {
    @Environment(NativeV2ProductStore.self) private var store
    @Environment(Permissions.self) private var permissions
    @Environment(\.visualLanguage) private var theme

    var body: some View {
        VKRootSurface {
            VKTabHeader(title: "Эстафета", avatar: "Аня Коваль") { EmptyView() }
        } content: {
            if NativeV2Capture.state == "populated/default" {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
            VKAuthoredPost {
                HStack(spacing: 10) {
                    Avatar(name: "Аня Коваль", size: 42, online: true)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Аня Коваль").font(.vkName)
                        Text("сегодня").font(.vkMeta)
                    }
                }
            } content: {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Найди во дворе что-то идеально круглое").font(.vkSection)
                    Text("Аня продолжила эстафету Саши и передала следующий ход тебе. В цепочке уже четыре знакомых.").font(.vkBody).fixedSize(horizontal: false, vertical: true)
                }
                .padding(.horizontal, 16)
            } actions: {
                VStack(alignment: .leading, spacing: 12) {
                    VKPostActions(
                        likes: 18, comments: 4, shares: 2, trailing: "1,2K",
                        onLike: { store.flags["feedLiked", default: false].toggle() },
                        onComment: { store.lastOutcome = "Открываем обсуждение" },
                        onShare: { store.lastOutcome = "Обещание готово к отправке" },
                        onSave: { store.flags["feedSaved", default: false].toggle() }
                    )
                    VKButton(title: "Открыть эстафету") { store.perform(.openRelay) }
            .nativeAction("relay_feed.open_relay")
            .accessibilityIdentifier("action.relay_feed.open_relay")
                }
            }
            GroupGap()
            VKGroup {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Цепочка").font(.vkSection)
                    HStack(spacing: 10) {
                        Avatar(name: "Саша", size: 38)
                        Image(systemName: "arrow.right").foregroundStyle(theme.palette.textSecondary)
                        Avatar(name: "Аня Коваль", size: 38, online: true)
                        Image(systemName: "arrow.right").foregroundStyle(theme.palette.textSecondary)
                        Avatar(name: "Ты", size: 38)
                        Spacer()
                        Text("4 главы").font(.vkMeta).foregroundStyle(theme.palette.textSecondary)
                    }
                }
                .padding(16)
            }
        }
                }
                .background(theme.palette.groupedBackground)
            } else {
                NativeV2ServiceState(state: NativeV2Capture.state, title: "Эстафета")
            }
        }
        
        .nativeSurface("relay_feed")
    }
}

private struct TurnSurface: View {
    @Environment(NativeV2ProductStore.self) private var store
    @Environment(Permissions.self) private var permissions
    @Environment(\.visualLanguage) private var theme

    var body: some View {
        VKRootSurface {
            VKModalChrome(title: "Твой ход", onCancel: { store.route = ProductRoute.allCases[0] })
        } content: {
            if NativeV2Capture.state == "populated/default" {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Продолжить сегодня").font(.vkTabTitle)
                    Text("Прими ход, чтобы закрепить его за собой и добавить следующую главу в цепочку друзей.").font(.vkBody).foregroundStyle(theme.palette.textSecondary)
                }
                .padding(16)
            }
            GroupGap()
            VKGroup {
                VStack(spacing: 0) {

                    VKRow(title: "Условие", subtitle: "Найти идеально круглое во дворе", icon: "scope", chevron: false)
                    RowSeparator()

                    VKRow(title: "Передала", subtitle: "Аня Коваль · 12 минут назад", icon: "person.crop.circle", chevron: false)
                    RowSeparator()

                    VKRow(title: "На выполнение", subtitle: "До конца сегодняшнего дня", icon: "clock", chevron: false)
                    
                }
            }
            GroupGap()
            VKPrimaryActionArea { VKButton(title: "Принять ход") { store.perform(.acceptTurn) }
            .nativeAction("turn.accept_turn")
            .accessibilityIdentifier("action.turn.accept_turn") }
            
            
        }
                }
                .background(theme.palette.groupedBackground)
            } else {
                NativeV2ServiceState(state: NativeV2Capture.state, title: "Твой ход")
            }
        }
        
        .nativeSurface("turn")
    }
}

private struct ChapterResultSurface: View {
    @Environment(NativeV2ProductStore.self) private var store
    @Environment(Permissions.self) private var permissions
    @Environment(\.visualLanguage) private var theme

    var body: some View {
        VKRootSurface {
            EmptyView()
        } content: {
            if NativeV2Capture.state == "populated/default" {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Теперь это твоя глава").font(.vkTabTitle)
                    Text("Сними найденный объект — результат появится после главы Ани и сохранит связь со всей цепочкой.").font(.vkBody).foregroundStyle(theme.palette.textSecondary)
                    VKInlineNotice(title: "Продолжение увидят участники", detail: "После съёмки останется выбрать знакомого, которому перейдёт следующий ход.")
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
            }
            GroupGap()
            VKPrimaryActionArea { VKButton(title: "Снять продолжение") { Task { await store.performCapability(.captureChapter, key: "camera", fallback: "Сохранить принятый ход без медиа и вернуться к съёмке позже", permissions: permissions) } }
            .nativeAction("chapter_result.capture_chapter")
            .accessibilityIdentifier("action.chapter_result.capture_chapter") }
            
            if let granted = store.permissionOutcomes["camera"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.camera.granted" : "outcome.permission.camera.denied")
            }
        }
                }
                .background(theme.palette.groupedBackground)
            } else {
                NativeV2ServiceState(state: NativeV2Capture.state, title: "Продолжение")
            }
        }
        
        .vkNavigation("Продолжение")
        .nativeSurface("chapter_result")
    }
}

private struct DiscoverSurface: View {
    @Environment(NativeV2ProductStore.self) private var store
    @Environment(Permissions.self) private var permissions
    @Environment(\.visualLanguage) private var theme

    var body: some View {
        VKRootSurface {
            VKTabHeader(title: "Найти") { EmptyView() }
        } content: {
            if NativeV2Capture.state == "populated/default" {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Эстафеты друзей").font(.vkTabTitle)
                    Text("Продолжения знакомых и короткие цепочки, к которым можно присоединиться сегодня.").font(.vkBody).foregroundStyle(theme.palette.textSecondary)
                }.padding(16)
            }
            GroupGap()
            VKGroup {
                VKRow(title: "Кадр из окна одним цветом", subtitle: "Лена · 6 друзей продолжили", icon: "camera.fill")
                RowSeparator()
                VKRow(title: "Доброе дело за пятнадцать минут", subtitle: "Миша · ход доступен сегодня", icon: "heart.fill")
                RowSeparator()
                VKRow(title: "Необычная вывеска по пути", subtitle: "Оля · рядом с вами", icon: "location.fill")
            }
            GroupGap()
            VKPrimaryActionArea { VKButton(title: "Поддержать продолжение") { store.perform(.supportChapter) }
            .nativeAction("discover.support_chapter")
            .accessibilityIdentifier("action.discover.support_chapter") }
            VKGroup {
                Text("Инструменты поиска").font(.vkSection).padding(.horizontal, 16).padding(.top, 12)
                Button { Task { await store.performCapability(.capabilityLocation, key: "location", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Добавить место", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("discover.capability_location")
            .accessibilityIdentifier("action.discover.capability_location")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityWifiinfo, key: "wifiinfo", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Проверить общую сеть", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("discover.capability_wifiinfo")
            .accessibilityIdentifier("action.discover.capability_wifiinfo")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityTracking, key: "tracking", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Настроить рекомендации", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("discover.capability_tracking")
            .accessibilityIdentifier("action.discover.capability_tracking")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityAssociateddomains, key: "associateddomains", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Открывать ссылки на эстафеты", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("discover.capability_associateddomains")
            .accessibilityIdentifier("action.discover.capability_associateddomains")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityHotspot, key: "hotspot", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Подключиться к встрече", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("discover.capability_hotspot")
            .accessibilityIdentifier("action.discover.capability_hotspot")
            RowSeparator()
            }
            if let granted = store.permissionOutcomes["location"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.location.granted" : "outcome.permission.location.denied")
            }
if let granted = store.permissionOutcomes["wifiinfo"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.wifiinfo.granted" : "outcome.permission.wifiinfo.denied")
            }
if let granted = store.permissionOutcomes["tracking"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.tracking.granted" : "outcome.permission.tracking.denied")
            }
if let granted = store.permissionOutcomes["associateddomains"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.associateddomains.granted" : "outcome.permission.associateddomains.denied")
            }
if let granted = store.permissionOutcomes["hotspot"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.hotspot.granted" : "outcome.permission.hotspot.denied")
            }
        }
                }
                .background(theme.palette.groupedBackground)
            } else {
                NativeV2ServiceState(state: NativeV2Capture.state, title: "Найти")
            }
        }
        
        .nativeSurface("discover")
    }
}

private struct CreateSurface: View {
    @Environment(NativeV2ProductStore.self) private var store
    @Environment(Permissions.self) private var permissions
    @Environment(\.visualLanguage) private var theme

    var body: some View {
        VKRootSurface {
            VKTabHeader(title: "Создать") { EmptyView() }
        } content: {
            if NativeV2Capture.state == "populated/default" {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Новая эстафета").font(.vkTabTitle)
                    Text("Задай одно простое условие, покажи первый пример и передай персональный ход знакомому.").font(.vkBody).foregroundStyle(theme.palette.textSecondary)
                }
                .padding(16)
            }
            GroupGap()
            VKPrimaryActionArea { VKButton(title: "Начать эстафету") { store.perform(.startRelay) }
            .nativeAction("create.start_relay")
            .accessibilityIdentifier("action.create.start_relay") }
            VKGroup { Button { Task { await store.performCapability(.capabilityPhotos, key: "photos", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Выбрать из медиатеки", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("create.capability_photos")
            .accessibilityIdentifier("action.create.capability_photos")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityMic, key: "mic", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Записать голос", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("create.capability_mic")
            .accessibilityIdentifier("action.create.capability_mic")
            RowSeparator()
Button { Task { await store.performCapability(.capabilitySpeech, key: "speech", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Расшифровать голос", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("create.capability_speech")
            .accessibilityIdentifier("action.create.capability_speech")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityAudio, key: "audio", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Слушать продолжения", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("create.capability_audio")
            .accessibilityIdentifier("action.create.capability_audio")
            RowSeparator() }
            if let granted = store.permissionOutcomes["photos"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.photos.granted" : "outcome.permission.photos.denied")
            }
if let granted = store.permissionOutcomes["mic"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.mic.granted" : "outcome.permission.mic.denied")
            }
if let granted = store.permissionOutcomes["speech"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.speech.granted" : "outcome.permission.speech.denied")
            }
if let granted = store.permissionOutcomes["audio"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.audio.granted" : "outcome.permission.audio.denied")
            }
        }
                }
                .background(theme.palette.groupedBackground)
            } else {
                NativeV2ServiceState(state: NativeV2Capture.state, title: "Создать")
            }
        }
        
        .nativeSurface("create")
    }
}

private struct MessagesSurface: View {
    @Environment(NativeV2ProductStore.self) private var store
    @Environment(Permissions.self) private var permissions
    @Environment(\.visualLanguage) private var theme

    var body: some View {
        VKRootSurface {
            VKTabHeader(title: "Ответы") { EmptyView() }
        } content: {
            if NativeV2Capture.state == "populated/default" {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VKRow(title: "Аня Коваль", subtitle: "Приняла ход · 2 минуты назад", icon: "person.crop.circle.fill")
                RowSeparator()
                VKRow(title: "Саша и ещё 3 участника", subtitle: "В цепочке появилась новая глава", icon: "person.2.fill")
                RowSeparator()
                VKRow(title: "Лена Морозова", subtitle: "Ждёт твоего продолжения сегодня", icon: "clock.fill")
            }
            GroupGap()
            VKPrimaryActionArea { VKButton(title: "Передать ход") { store.perform(.passTurn) }
            .nativeAction("messages.pass_turn")
            .accessibilityIdentifier("action.messages.pass_turn") }
            VKGroup {
                Text("Связь с участниками").font(.vkSection).padding(.horizontal, 16).padding(.top, 12)
                Button { Task { await store.performCapability(.capabilityPush, key: "push", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Следить за эстафетой", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("messages.capability_push")
            .accessibilityIdentifier("action.messages.capability_push")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityCommnotif, key: "commnotif", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Включить важные ответы", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("messages.capability_commnotif")
            .accessibilityIdentifier("action.messages.capability_commnotif")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityRemotenotif, key: "remotenotif", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Обновлять цепочки", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("messages.capability_remotenotif")
            .accessibilityIdentifier("action.messages.capability_remotenotif")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityContacts, key: "contacts", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Выбрать знакомого", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("messages.capability_contacts")
            .accessibilityIdentifier("action.messages.capability_contacts")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityVoip, key: "voip", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Позвонить участнику", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("messages.capability_voip")
            .accessibilityIdentifier("action.messages.capability_voip")
            RowSeparator()
            }
            if let granted = store.permissionOutcomes["push"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.push.granted" : "outcome.permission.push.denied")
            }
if let granted = store.permissionOutcomes["commnotif"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.commnotif.granted" : "outcome.permission.commnotif.denied")
            }
if let granted = store.permissionOutcomes["remotenotif"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.remotenotif.granted" : "outcome.permission.remotenotif.denied")
            }
if let granted = store.permissionOutcomes["contacts"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.contacts.granted" : "outcome.permission.contacts.denied")
            }
if let granted = store.permissionOutcomes["voip"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.voip.granted" : "outcome.permission.voip.denied")
            }
        }
                }
                .background(theme.palette.groupedBackground)
            } else {
                NativeV2ServiceState(state: NativeV2Capture.state, title: "Ответы")
            }
        }
        
        .nativeSurface("messages")
    }
}

private struct ServicesSurface: View {
    @Environment(NativeV2ProductStore.self) private var store
    @Environment(Permissions.self) private var permissions
    @Environment(\.visualLanguage) private var theme

    var body: some View {
        VKRootSurface {
            VKTabHeader(title: "Профиль") { EmptyView() }
        } content: {
            if NativeV2Capture.state == "populated/default" {
                ScrollView {
                    VStack(alignment: .leading, spacing: 8) {
            VKGroup {
                VStack(spacing: 12) {
                    Avatar(name: "Ты", size: 86, online: true)
                    Text("Эстафета").font(.vkTabTitle)
                    Text("Продолжения, приватные черновики, расписание и настройки участия собраны в одном месте.").font(.vkBody).foregroundStyle(theme.palette.textSecondary).multilineTextAlignment(.center)
                    HStack(spacing: 0) {
                        VStack { Text("3").font(.vkName); Text("активные").font(.vkMeta) }.frame(maxWidth: .infinity)
                        Divider().frame(height: 34)
                        VStack { Text("12").font(.vkName); Text("главы").font(.vkMeta) }.frame(maxWidth: .infinity)
                        Divider().frame(height: 34)
                        VStack { Text("8").font(.vkName); Text("друзей").font(.vkMeta) }.frame(maxWidth: .infinity)
                    }
                }.padding(16)
            }
            VKGroup { Button { store.perform(.openSettings) } label: {
                VKRow(title: "Настройки приложения", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("services.open_settings")
            .accessibilityIdentifier("action.services.open_settings")
            RowSeparator() }
        }
                }
                .background(theme.palette.groupedBackground)
            } else {
                NativeV2ServiceState(state: NativeV2Capture.state, title: "Профиль")
            }
        }
        
        .nativeSurface("services")
    }
}

private struct SettingsSurface: View {
    @Environment(NativeV2ProductStore.self) private var store
    @Environment(Permissions.self) private var permissions
    @Environment(\.visualLanguage) private var theme

    var body: some View {
        VKRootSurface {
            EmptyView()
        } content: {
            if NativeV2Capture.state == "populated/default" {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Настройки приложения").font(.vkTabTitle)
                    Text("Управление приватностью, уведомлениями и безопасностью без повторного запроса при запуске.").font(.vkBody).foregroundStyle(theme.palette.textSecondary)
                }
                .padding(16)
            }
            
            GroupGap()
            VKGroup { Button { Task { await store.performCapability(.capabilityFetch, key: "fetch", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Освежать ленту", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("settings.capability_fetch")
            .accessibilityIdentifier("action.settings.capability_fetch")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityBgtask, key: "bgtask", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Готовить подборку", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("settings.capability_bgtask")
            .accessibilityIdentifier("action.settings.capability_bgtask")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityAppgroups, key: "appgroups", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Поделиться черновиком", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("settings.capability_appgroups")
            .accessibilityIdentifier("action.settings.capability_appgroups")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityKeychain, key: "keychain", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Сохранить защищённую сессию", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("settings.capability_keychain")
            .accessibilityIdentifier("action.settings.capability_keychain")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityAutofill, key: "autofill", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Добавить быстрый вход", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("settings.capability_autofill")
            .accessibilityIdentifier("action.settings.capability_autofill")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityFaceid, key: "faceid", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Защитить черновики", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("settings.capability_faceid")
            .accessibilityIdentifier("action.settings.capability_faceid")
            RowSeparator()
Button { Task { await store.performCapability(.capabilityCalendar, key: "calendar", fallback: "Сохранить текущий продуктовый контекст и предложить повторить действие позже", permissions: permissions) } } label: {
                VKRow(title: "Запланировать ход", icon: "arrow.right", chevron: false)
            }
            .buttonStyle(.plain)
            .nativeAction("settings.capability_calendar")
            .accessibilityIdentifier("action.settings.capability_calendar")
            RowSeparator() }
            if let granted = store.permissionOutcomes["fetch"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.fetch.granted" : "outcome.permission.fetch.denied")
            }
if let granted = store.permissionOutcomes["bgtask"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.bgtask.granted" : "outcome.permission.bgtask.denied")
            }
if let granted = store.permissionOutcomes["appgroups"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.appgroups.granted" : "outcome.permission.appgroups.denied")
            }
if let granted = store.permissionOutcomes["keychain"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.keychain.granted" : "outcome.permission.keychain.denied")
            }
if let granted = store.permissionOutcomes["autofill"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.autofill.granted" : "outcome.permission.autofill.denied")
            }
if let granted = store.permissionOutcomes["faceid"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.faceid.granted" : "outcome.permission.faceid.denied")
            }
if let granted = store.permissionOutcomes["calendar"] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? "outcome.permission.calendar.granted" : "outcome.permission.calendar.denied")
            }
        }
                }
                .background(theme.palette.groupedBackground)
            } else {
                NativeV2ServiceState(state: NativeV2Capture.state, title: "Настройки")
            }
        }
        
        .vkNavigation("Настройки")
        .nativeSurface("settings")
    }
}


private struct NativeV2CameraPicker: UIViewControllerRepresentable {
    let onCapture: (Data) -> Void
    let onCancel: () -> Void

    func makeCoordinator() -> Coordinator { Coordinator(parent: self) }
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = UIImagePickerController.isSourceTypeAvailable(.camera) ? .camera : .photoLibrary
        picker.delegate = context.coordinator
        return picker
    }
    func updateUIViewController(_ controller: UIImagePickerController, context: Context) {}

    final class Coordinator: NSObject, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
        let parent: NativeV2CameraPicker
        init(parent: NativeV2CameraPicker) { self.parent = parent }
        func imagePickerController(
            _ picker: UIImagePickerController,
            didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]
        ) {
            guard let image = info[.originalImage] as? UIImage, let data = image.jpegData(compressionQuality: 0.82) else {
                parent.onCancel()
                return
            }
            parent.onCapture(data)
        }
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { parent.onCancel() }
    }
}

