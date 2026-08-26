import SwiftUI
import UIKit

private struct CirclesStateGate<Content: View>: View {
    let state: String?
    @ViewBuilder var content: Content

    var body: some View {
        switch state {
        case "loading": NativeStatePanel(kind: .loading, title: "Загружаем", detail: "Сохраняем структуру экрана.", placement: .page)
        case "empty": NativeStatePanel(kind: .empty, title: "Здесь пока пусто", detail: "Выберите круг или создайте первую публикацию.", placement: .page)
        case "error": NativeStatePanel(kind: .error, title: "Не удалось обновить", detail: "Черновики и локальные данные сохранены.", actionTitle: "Повторить", action: {}, placement: .page)
        case "offline": NativeStatePanel(kind: .warning, title: "Без сети", detail: "Показываем последний сохранённый снимок. Новые действия не пропадут.", placement: .page)
        default: content
        }
    }
}

struct CirclesFeedScreen: View {
    var captureState: String?
    @Environment(CirclesStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var theme
    @State private var lastRefresh: Date? = {
        guard let value = UserDefaults.standard.object(forKey: "native.lastBackgroundRefresh") as? Double else { return nil }
        return Date(timeIntervalSince1970: value)
    }()

    var body: some View {
        VKRootSurface {
            VKTabHeader(title: "Лента") {
                Button { nav.present(sheet: CirclesRoute.create) } label: {
                    Image(systemName: "plus").font(.system(size: 21, weight: .semibold))
                }
                .accessibilityLabel("Новая публикация")
            }
        } content: {
            CirclesStateGate(state: captureState) {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        if let lastRefresh {
                            Text("Обновлено в \(lastRefresh.formatted(date: .omitted, time: .shortened))")
                                .font(.vkMeta).foregroundStyle(theme.palette.textSecondary)
                                .frame(maxWidth: .infinity).padding(.vertical, 7)
                        }
                        ForEach(store.posts) { post in
                            CirclePostCard(post: post)
                            GroupGap()
                        }
                        Color.clear.frame(height: 84)
                    }
                }
                .refreshable {
                    let now = Date()
                    UserDefaults.standard.set(now.timeIntervalSince1970, forKey: "native.lastBackgroundRefresh")
                    lastRefresh = now
                }
            }
        }
    }
}

private struct CirclePostCard: View {
    let post: CirclePost
    @Environment(CirclesStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var theme

    var current: CirclePost { store.posts.first(where: { $0.id == post.id }) ?? post }

    var body: some View {
        VKAuthoredPost {
            HStack(spacing: 10) {
                Avatar(name: current.author, size: 40)
                Button { nav.push(CirclesRoute.post(current)) } label: {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(current.author).font(.vkName).foregroundStyle(theme.palette.textPrimary)
                        Text(current.meta).font(.vkMeta).foregroundStyle(theme.palette.textSecondary)
                    }
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Открыть публикацию, \(current.author)")
                Spacer(minLength: 8)
                Menu {
                    Button("Скопировать ссылку") { Task { await sharePost() } }
                    Button("Скрыть публикацию", role: .destructive) { store.hide(current) }
                } label: {
                    Image(systemName: "ellipsis").font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(theme.palette.textSecondary)
                }
                .accessibilityLabel("Действия с публикацией")
            }
        } content: {
            Button { nav.push(CirclesRoute.post(current)) } label: {
                VStack(alignment: .leading, spacing: 8) {
                    Text(current.title).font(.role(.cardTitle))
                        .foregroundStyle(theme.palette.textPrimary)
                    Text(current.text).font(.role(.body)).foregroundStyle(theme.palette.textPrimary)
                        .lineSpacing(2).lineLimit(4)
                    if let data = current.mediaData, let image = UIImage(data: data) {
                        Image(uiImage: image)
                            .resizable().scaledToFill().frame(maxWidth: .infinity).frame(height: 214)
                            .clipped().accessibilityLabel("Фото публикации: \(current.title)")
                    } else {
                        RoundedRectangle(cornerRadius: 0)
                            .fill(Color(hex: "E5E7EB"))
                            .frame(height: 214)
                            .accessibilityLabel("Медиа публикации: \(current.title)")
                    }
                    if let place = current.place {
                        Label(place, systemImage: "location.fill")
                            .font(.vkMeta).foregroundStyle(theme.palette.textSecondary)
                    }
                    if current.voiceURL != nil {
                        Label("Голосовое · \(Int(current.voiceDuration.rounded())) сек", systemImage: "waveform")
                            .font(.vkMeta).foregroundStyle(theme.palette.textSecondary)
                    }
                }
                .padding(.horizontal, theme.spacing.contentInset)
            }
            .buttonStyle(.plain)
        } actions: {
            VKPostActions(
                likes: current.likes, liked: current.liked, comments: current.comments,
                shares: current.shares, saved: current.saved, trailing: "\(120 + current.likes)",
                onLike: { store.toggleLike(current) },
                onComment: { nav.push(CirclesRoute.comments(current)) },
                onShare: { Task { await sharePost() } },
                onSave: { store.toggleSave(current) }
            )
        }
    }

    @Environment(Permissions.self) private var permissions
    private func request(_ key: PermissionKey, success: String) async {
        nav.toast(await permissions.request(key) ? success : "Можно продолжить без этого доступа")
    }

    private func sharePost() async {
        let shared = await permissions.request(.appgroups)
        let result = CirclesSharePayloadWriter.share(current, storeInAppGroup: shared)
        nav.toast(result.appGroupStored ? "Ссылка готова для меню «Поделиться»" : "Ссылка скопирована")
    }
}

struct CirclesPostScreen: View {
    let post: CirclePost
    let focusComments: Bool
    var captureState: String?
    @Environment(CirclesStore.self) private var store
    @Environment(Permissions.self) private var permissions
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var theme
    @State private var response = ""
    @State private var following = false
    @State private var playback = CirclesAudioPlayback()
    @FocusState private var responseFocused: Bool

    private var current: CirclePost { store.posts.first(where: { $0.id == post.id }) ?? post }

    var body: some View {
        CirclesStateGate(state: captureState) {
            ScrollViewReader { proxy in
                ScrollView {
                    CirclePostCard(post: current)
                        .id("post")
                    VKGroup {
                        VKSectionHeader(title: "Комментарии", count: "\(current.comments)")
                            .id("comments")
                    ForEach(store.comments[current.id, default: []]) { comment in
                        HStack(alignment: .top, spacing: 10) {
                            Avatar(name: comment.author, size: 36)
                            VStack(alignment: .leading, spacing: 3) {
                                HStack {
                                    Text(comment.author).font(.vkName)
                                    Spacer()
                                    Text(comment.time).font(.vkMeta).foregroundStyle(theme.palette.textSecondary)
                                }
                                Text(comment.text).font(.role(.body)).foregroundStyle(theme.palette.textPrimary)
                            }
                        }
                        .padding(.horizontal, theme.spacing.contentInset).padding(.bottom, 12)
                    }
                    HStack(spacing: 10) {
                        TextField("Написать комментарий", text: $response)
                            .textFieldStyle(.plain).padding(.horizontal, 14).frame(height: 42)
                            .background(theme.palette.fill, in: Capsule())
                            .focused($responseFocused)
                        Button {
                            guard !response.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                            store.addComment(response, to: current)
                            response = ""
                        } label: {
                            Image(systemName: "arrow.up.circle.fill").font(.system(size: 30, weight: .semibold))
                        }
                        .accessibilityLabel("Отправить ответ")
                    }
                    .padding(.horizontal, theme.spacing.contentInset).padding(.bottom, 14)
                }
                    VKGroup {
                        VKRow(title: "Создать совместный план", subtitle: "Превратить ответ в конкретные дату и место", icon: "calendar.badge.plus")
                            .onTapGesture { store.createPlan(from: current) }
                    if let voiceURL = current.voiceURL {
                        RowSeparator()
                        VKRow(
                            title: playback.isPlaying ? "Остановить голосовое" : "Прослушать голосовое",
                            subtitle: "\(Int(current.voiceDuration.rounded())) сек",
                            icon: playback.isPlaying ? "pause.circle" : "play.circle",
                            chevron: false
                        )
                        .onTapGesture {
                            Task {
                                guard await CirclesCapabilityFlow.audio(using: permissions) else {
                                    nav.toast("Не удалось включить воспроизведение")
                                    return
                                }
                                _ = playback.toggle(url: voiceURL, title: current.title)
                            }
                        }
                    }
                    RowSeparator()
                    VKRow(title: following ? "Вы следите за изменениями" : "Следить за изменениями", icon: "bell", chevron: false)
                        .onTapGesture {
                            Task {
                                following = await CirclesCapabilityFlow.notifications(using: permissions)
                            }
                        }
                    }
                }
                .task {
                    try? await Task.sleep(for: .milliseconds(120))
                    proxy.scrollTo(focusComments ? "comments" : "post", anchor: .top)
                    if focusComments { responseFocused = true }
                }
            }
        }
        .vkNavigation("Публикация")
    }
}

struct CirclesDiscoveryScreen: View {
    var captureState: String?
    @Environment(CirclesStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var permissions
    @Environment(\.visualLanguage) private var theme
    @State private var query = ""
    @State private var recommendationReason: String?

    var body: some View {
        VKRootSurface {
            VStack(spacing: 0) {
                VKTabHeader(title: "Круги") { EmptyView() }
                VKSearchField(placeholder: "Найти круг", text: $query)
                    .padding(.horizontal, theme.spacing.contentInset).padding(.bottom, 10)
            }
        } content: {
            CirclesStateGate(state: captureState) {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        VKSectionHeader(title: "Ваши круги")
                        ForEach(filtered.filter(\.joined)) { circle in row(circle) }
                        GroupGap()
                        VKSectionHeader(title: "Попробуйте")
                        ForEach(filtered.filter { !$0.joined }) { circle in row(circle) }
                        Button {
                            Task {
                                let personalized = await CirclesCapabilityFlow.personalization(using: permissions)
                                recommendationReason = personalized
                                    ? "Учитываем ваши круги «Кино на 16 мм» и «Беговая среда»."
                                    : "Показываем популярные круги без персонального отслеживания."
                            }
                        } label: {
                            Text("Почему эти рекомендации")
                                .font(.role(.pill)).foregroundStyle(theme.palette.accent).frame(minHeight: 44)
                        }
                        if let recommendationReason {
                            VKInlineNotice(title: "Почему это показано", detail: recommendationReason)
                        }
                    }
                }
            }
        }
    }

    private var filtered: [InterestCircle] {
        query.isEmpty ? store.circles : store.circles.filter { $0.title.localizedCaseInsensitiveContains(query) }
    }

    private func row(_ circle: InterestCircle) -> some View {
        Button { nav.push(CirclesRoute.circle(circle)) } label: {
            VKPersonRow(name: circle.title, subtitle: "\(circle.subtitle) · \(circle.members) участников", avatarSize: 52) {
                Image(systemName: "chevron.right").font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(theme.palette.textSecondary)
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Открыть круг \(circle.title)")
    }
}

struct CircleDetailScreen: View {
    let circle: InterestCircle
    var captureState: String?
    @Environment(Permissions.self) private var permissions
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var theme
    @State private var joined: Bool
    @State private var invitedContacts: [String] = []
    @State private var showContactPicker = false
    @State private var localSessionReady = false
    @State private var privateUnlocked = false

    init(circle: InterestCircle, captureState: String?) {
        self.circle = circle; self.captureState = captureState; _joined = State(initialValue: circle.joined)
    }

    var body: some View {
        CirclesStateGate(state: captureState) {
            ScrollView {
                VStack(spacing: 0) {
                    VStack(spacing: 10) {
                        Avatar(name: circle.title, size: 76)
                        Text(circle.title).font(.role(.section))
                        Text("\(circle.members) участников · \(circle.subtitle)")
                            .font(.vkMeta).foregroundStyle(theme.palette.textSecondary).multilineTextAlignment(.center)
                    }
                    .padding(.horizontal, 24).padding(.vertical, 18)
                    VKPrimaryActionArea {
                        VKButton(title: joined ? "Вы в круге" : "Вступить") { joined = true }
                    }
                    GroupGap()
                    VKGroup {
                        VKRow(title: "Пригласить знакомых", subtitle: invitedContacts.isEmpty ? "Из контактов или по ссылке" : invitedContacts.joined(separator: ", "), icon: "person.badge.plus")
                            .onTapGesture {
                                Task {
                                    if await permissions.request(.contacts) { showContactPicker = true }
                                    else {
                                        UIPasteboard.general.string = "https://circles.local/circle/\(circle.id)"
                                        nav.toast("Ссылка на круг скопирована")
                                    }
                                }
                            }
                        RowSeparator()
                        VKRow(title: "Сессия рядом", subtitle: localSessionReady ? "Готова для участников рядом" : "Обмен материалами на встрече круга", icon: "wifi")
                            .onTapGesture {
                                Task {
                                    let wifi = await permissions.request(.wifiinfo)
                                    let hotspot = await permissions.request(.hotspot, value: "Circles-Local")
                                    localSessionReady = wifi || hotspot
                                    if !localSessionReady { nav.toast("Можно войти по коду") }
                                }
                            }
                        RowSeparator()
                        VKRow(title: "Приватные материалы", subtitle: "Доступ только участникам", icon: "lock")
                            .onTapGesture {
                                Task {
                                    privateUnlocked = await CirclesCapabilityFlow.biometric(using: permissions)
                                    nav.toast(privateUnlocked ? "Материалы открыты" : "Доступен код устройства")
                                }
                            }
                        if privateUnlocked {
                            RowSeparator()
                            VKRow(title: "Черновики участников", subtitle: "3 защищённых материала открыто", icon: "doc.text", chevron: false)
                        }
                    }
                }
            }
        }
        .vkNavigation("Круг")
        .sheet(isPresented: $showContactPicker) { CirclesContactPicker(selectedNames: $invitedContacts) }
    }

    private func run(_ key: PermissionKey, success: String) async {
        nav.toast(await permissions.request(key) ? success : "Доступен ручной вариант")
    }
}

struct CirclesPlansScreen: View {
    var captureState: String?
    @Environment(CirclesStore.self) private var store
    @Environment(Permissions.self) private var permissions
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var theme

    var body: some View {
        VKRootSurface { VKTabHeader(title: "Планы") { EmptyView() } } content: {
            CirclesStateGate(state: captureState) {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(store.plans) { plan in
                            VKGroup {
                                VStack(alignment: .leading, spacing: 7) {
                                    Text(plan.circle).font(.vkMeta).foregroundStyle(theme.palette.accent)
                                    Text(plan.title).font(.role(.cardTitle))
                                    Label(plan.when, systemImage: "calendar").font(.role(.pill)).foregroundStyle(theme.palette.textSecondary)
                                    Label(plan.place, systemImage: "mappin").font(.role(.pill)).foregroundStyle(theme.palette.textSecondary)
                                    HStack(spacing: 10) {
                                        VKPill(title: plan.joined ? "Вы идёте" : "Присоединиться") { store.togglePlan(plan) }
                                        Button(store.calendarEventIDs[plan.id] == nil ? "В календарь" : "Добавлено") {
                                            Task {
                                                if let identifier = await CirclesCalendarWriter.add(plan, using: permissions) {
                                                    store.calendarEventIDs[plan.id] = identifier
                                                    nav.toast("Событие сохранено в календаре")
                                                } else {
                                                    nav.toast("План остаётся доступен в приложении")
                                                }
                                            }
                                        }.font(.system(size: 14, weight: .semibold))
                                            .disabled(store.calendarEventIDs[plan.id] != nil)
                                    }
                                    if plan.joined {
                                        Button(store.publishedOutcomePlanIDs.contains(plan.id) ? "Итог опубликован" : "Опубликовать итог") {
                                            store.publishOutcome(for: plan)
                                        }
                                        .font(.role(.action))
                                        .disabled(store.publishedOutcomePlanIDs.contains(plan.id))
                                    }
                                }
                                .padding(.horizontal, theme.spacing.contentInset).padding(.vertical, 14)
                            }
                        }
                    }
                }
            }
        }
    }
}

struct CirclesMessagesScreen: View {
    var captureState: String?
    @Environment(CirclesStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var theme

    var body: some View {
        VKRootSurface { VKTabHeader(title: "Сообщения") { EmptyView() } } content: {
            CirclesStateGate(state: captureState) {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(store.dialogs) { dialog in
                            Button { nav.push(CirclesRoute.conversation(dialog)) } label: {
                                HStack(spacing: 12) {
                                    Avatar(name: dialog.title, size: 52)
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(dialog.title).font(.vkName).foregroundStyle(theme.palette.textPrimary)
                                        Text(dialog.last).font(.role(.body)).foregroundStyle(theme.palette.textSecondary).lineLimit(1)
                                    }
                                    Spacer(minLength: 8)
                                    VStack(alignment: .trailing, spacing: 6) {
                                        Text(dialog.time).font(.vkMeta).foregroundStyle(theme.palette.textSecondary)
                                        if dialog.unread > 0 {
                                            Text("\(dialog.unread)").font(.role(.badge)).foregroundStyle(.white)
                                                .frame(minWidth: 22, minHeight: 22).background(theme.palette.accent, in: Circle())
                                        }
                                    }
                                }
                                .padding(.horizontal, theme.spacing.contentInset).padding(.vertical, 10)
                            }
                            .buttonStyle(.plain)
                            RowSeparator(leading: 80)
                        }
                    }
                }
            }
        }
    }
}

struct CircleConversationScreen: View {
    let dialog: CircleDialog
    var captureState: String?
    @Environment(Permissions.self) private var permissions
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var theme
    @State private var draft = ""
    @State private var call = CirclesCallCoordinator()

    private var conversation: [CircleMessage] {
        let saved = store.messages[dialog.id, default: []]
        return saved.isEmpty ? [
            CircleMessage(id: UUID(), text: dialog.last, mine: false)
        ] : saved
    }

    @Environment(CirclesStore.self) private var store

    var body: some View {
        VStack(spacing: 0) {
            VKChatHeader(title: dialog.title, subtitle: "\(dialog.unread > 0 ? "\(dialog.unread) новых" : "в сети")", onBack: { nav.pop() }) {
                Task {
                    if call.state == .active {
                        await call.end()
                        nav.toast("Звонок завершён")
                        return
                    }
                    let voip = await permissions.request(.voip)
                    _ = await permissions.request(.commnotif)
                    _ = await CirclesCapabilityFlow.audio(using: permissions)
                    let started = voip ? await call.start(name: dialog.title) : false
                    nav.toast(started ? "Звонок начат" : "Можно отправить голосовое сообщение")
                }
            }
            CirclesStateGate(state: captureState) {
                if call.state == .active {
                    VKInlineNotice(title: "Идёт звонок", detail: "Повторно нажмите трубку, чтобы завершить разговор")
                }
                ScrollView {
                    VStack(spacing: 8) {
                        Text("Сегодня").font(.vkMeta).foregroundStyle(theme.palette.textSecondary).padding(.vertical, 10)
                        ForEach(conversation) { item in message(item.text, mine: item.mine) }
                    }
                    .padding(.horizontal, 12)
                }
            }
            HStack(spacing: 10) {
                TextField("Сообщение", text: $draft)
                    .textFieldStyle(.plain).padding(.horizontal, 14).frame(height: 42)
                    .background(theme.palette.fill, in: Capsule())
                Button {
                    store.sendMessage(draft, to: dialog)
                    draft = ""
                } label: {
                    Image(systemName: "arrow.up.circle.fill").font(.system(size: 30, weight: .semibold))
                }.accessibilityLabel("Отправить")
            }
            .padding(.horizontal, 12).padding(.vertical, 9)
            .background(theme.palette.background)
            .overlay(alignment: .top) { theme.palette.separator.frame(height: 0.5) }
        }
        .toolbar(.hidden, for: .navigationBar)
    }

    private func message(_ text: String, mine: Bool) -> some View {
        HStack { if mine { Spacer(minLength: 54) }; Text(text).font(.role(.body)).padding(.horizontal, 13).padding(.vertical, 9).background(mine ? theme.palette.accent.opacity(0.13) : theme.palette.fill, in: RoundedRectangle(cornerRadius: 16)); if !mine { Spacer(minLength: 54) } }
    }
}

struct CirclesMenuScreen: View {
    var captureState: String?
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var permissions

    var body: some View {
        VKRootSurface { VKTabHeader(title: "Меню") { EmptyView() } } content: {
            CirclesStateGate(state: captureState) {
                ScrollView {
                    VKGroup {
                        Button { nav.push(CirclesRoute.profile) } label: {
                            VKPersonRow(name: "Влад Шукуров", subtitle: "4 круга · 12 публикаций", avatarSize: 56) {
                                Image(systemName: "chevron.right").font(.system(size: 15, weight: .semibold))
                            }
                        }.buttonStyle(.plain)
                    }
                    VKGroup {
                        Button { nav.push(CirclesRoute.saved) } label: {
                            VKRow(title: "Сохранённое", subtitle: "Публикации и планы", icon: "bookmark")
                        }.buttonStyle(HighlightStyle())
                        RowSeparator()
                        Button { nav.push(CirclesRoute.settings) } label: {
                            VKRow(title: "Настройки", subtitle: "Уведомления, фон и приватность", icon: "gearshape")
                        }.buttonStyle(HighlightStyle())
                    }
                }
            }
        }
    }
}

struct CirclesSavedScreen: View {
    var captureState: String?
    @Environment(CirclesStore.self) private var store
    @Environment(\.visualLanguage) private var theme

    private var savedPosts: [CirclePost] { store.posts.filter(\.saved) }
    private var joinedPlans: [CirclePlan] { store.plans.filter(\.joined) }

    var body: some View {
        CirclesStateGate(state: captureState) {
            ScrollView {
                if savedPosts.isEmpty && joinedPlans.isEmpty {
                    NativeStatePanel(
                        kind: .empty,
                        title: "Ничего не сохранено",
                        detail: "Закладка под публикацией сохранит её сюда. Планы, к которым вы присоединились, появятся автоматически.",
                        placement: .page
                    )
                } else {
                    if !savedPosts.isEmpty {
                        VKSectionHeader(title: "Публикации", count: "\(savedPosts.count)")
                        ForEach(savedPosts) { post in CirclePostCard(post: post); GroupGap() }
                    }
                    if !joinedPlans.isEmpty {
                        VKSectionHeader(title: "Планы", count: "\(joinedPlans.count)")
                        VKGroup {
                            ForEach(Array(joinedPlans.enumerated()), id: \.element.id) { index, plan in
                                VKRow(title: plan.title, subtitle: "\(plan.when) · \(plan.place)", icon: "calendar", chevron: false)
                                if index < joinedPlans.count - 1 { RowSeparator() }
                            }
                        }
                    }
                }
                Color.clear.frame(height: 24)
            }
            .background(theme.palette.groupedBackground)
        }
        .vkNavigation("Сохранённое")
    }
}

struct CirclesSettingsScreen: View {
    var captureState: String?
    @Environment(Permissions.self) private var permissions
    @Environment(Nav.self) private var nav
    @Environment(Session.self) private var session
    @Environment(\.visualLanguage) private var theme
    @AppStorage("circles.push") private var pushEnabled = false
    @AppStorage("circles.background") private var backgroundEnabled = false
    @AppStorage("circles.lock") private var lockEnabled = false
    @AppStorage("circles.personalization") private var personalizationEnabled = false
    @State private var hydrated = false
    @State private var confirmLogout = false

    var body: some View {
        CirclesStateGate(state: captureState) {
            ScrollView {
                VStack(spacing: 0) {
                    VKSectionHeader(title: "Уведомления")
                    VKGroup {
                        VKRow(title: "Ответы и сообщения", subtitle: "Только для ваших кругов", icon: "bell", chevron: false, toggle: $pushEnabled)
                        RowSeparator()
                        VKRow(title: "Обновлять в фоне", subtitle: "Свежие ответы после открытия", icon: "arrow.clockwise", chevron: false, toggle: $backgroundEnabled)
                    }
                    GroupGap()
                    VKSectionHeader(title: "Приватность")
                    VKGroup {
                        VKRow(title: "Закрывать приложение", subtitle: "Код устройства или Face ID", icon: "lock", chevron: false, toggle: $lockEnabled)
                        RowSeparator()
                        VKRow(title: "Учитывать интересы", subtitle: "Для рекомендаций кругов", icon: "hand.raised", chevron: false, toggle: $personalizationEnabled)
                    }
                    GroupGap()
                    VKGroup {
                        Button { nav.push(CirclesRoute.accesses) } label: {
                            VKRow(title: "Доступы и интеграции", subtitle: "Что и когда используется", icon: "lock.shield")
                        }.buttonStyle(HighlightStyle())
                        RowSeparator()
                        Button {
                            Task {
                                let keychain = await permissions.request(.keychain)
                                let autofill = await permissions.request(.autofill)
                                nav.toast(keychain || autofill ? "Пароли готовы к подстановке" : "Автозаполнение можно включить в настройках iPhone")
                            }
                        } label: {
                            VKRow(title: "Пароли и вход", subtitle: "Безопасная подстановка", icon: "key", chevron: false)
                        }.buttonStyle(HighlightStyle())
                        RowSeparator()
                        VKRow(title: "Версия", icon: "info.circle", value: "1.0", chevron: false)
                    }
                    GroupGap()
                    VKGroup {
                        Button { confirmLogout = true } label: {
                            Text("Выйти").font(.vkRow).foregroundStyle(Color.red)
                                .frame(maxWidth: .infinity).frame(height: 48)
                        }.buttonStyle(HighlightStyle())
                    }
                    Color.clear.frame(height: 24)
                }
            }
            .background(theme.palette.groupedBackground)
        }
        .vkNavigation("Настройки")
        .task { hydrated = true }
        .onChange(of: pushEnabled) { _, enabled in
            guard hydrated, enabled else { return }
            Task {
                let granted = await CirclesCapabilityFlow.notifications(using: permissions)
                if !granted { pushEnabled = false }
            }
        }
        .onChange(of: backgroundEnabled) { _, enabled in
            guard hydrated, enabled else { return }
            Task {
                let granted = await CirclesCapabilityFlow.background(using: permissions)
                if !granted { backgroundEnabled = false }
            }
        }
        .onChange(of: lockEnabled) { _, enabled in
            guard hydrated, enabled else { return }
            Task {
                let granted = await CirclesCapabilityFlow.biometric(using: permissions)
                if !granted { lockEnabled = false }
            }
        }
        .onChange(of: personalizationEnabled) { _, enabled in
            guard hydrated, enabled else { return }
            Task {
                let granted = await CirclesCapabilityFlow.personalization(using: permissions)
                if !granted { personalizationEnabled = false }
            }
        }
        .confirmationDialog("Выйти из аккаунта?", isPresented: $confirmLogout) {
            Button("Выйти", role: .destructive) { session.signOut() }
            Button("Отмена", role: .cancel) {}
        }
    }
}

struct CirclesAccessesScreen: View {
    var captureState: String?
    @Environment(Permissions.self) private var permissions
    @Environment(\.visualLanguage) private var theme

    private let personal: [(PermissionKey, String, String, String)] = [
        (.camera, "Камера", "Снять кадр для публикации", "camera"),
        (.photos, "Медиатека", "Выбрать материал для поста", "photo"),
        (.mic, "Микрофон", "Записать голосовое дополнение", "mic"),
        (.speech, "Распознавание речи", "Превратить голос в текст", "waveform"),
        (.location, "Геопозиция", "Прикрепить место к посту", "location"),
        (.contacts, "Контакты", "Пригласить знакомых в круг", "person.2"),
        (.calendar, "Календарь", "Добавить подтверждённый план", "calendar"),
        (.push, "Уведомления", "Ответы, планы и сообщения", "bell"),
        (.tracking, "Персонализация", "Учитывать интересы в рекомендациях", "hand.raised"),
        (.faceid, "Face ID", "Защитить приватные материалы", "faceid")
    ]

    private let integrations = [
        "Фоновое обновление", "Звонки и аудио", "Universal Links", "App Groups",
        "Keychain и AutoFill", "Wi‑Fi и локальные сессии"
    ]

    var body: some View {
        CirclesStateGate(state: captureState) {
            ScrollView {
                VStack(spacing: 0) {
                    VKInlineNotice(title: "Доступы запрашиваются по делу", detail: "Например, камера — только после нажатия «Снять фото». Без доступа остаётся ручной путь.")
                    VKSectionHeader(title: "Данные iPhone")
                    VKGroup {
                        ForEach(Array(personal.enumerated()), id: \.offset) { index, item in
                            VKRow(title: item.1, subtitle: item.2, icon: item.3, value: status(item.0), chevron: false)
                            if index < personal.count - 1 { RowSeparator() }
                        }
                    }
                    GroupGap()
                    VKSectionHeader(title: "Системные интеграции")
                    VKGroup {
                        ForEach(Array(integrations.enumerated()), id: \.offset) { index, title in
                            VKRow(title: title, value: "В сборке", chevron: false)
                            if index < integrations.count - 1 { RowSeparator() }
                        }
                    }
                    Button("Открыть настройки iPhone") { openSystemSettings() }
                        .font(.system(size: 15, weight: .semibold)).frame(minHeight: 52)
                    Color.clear.frame(height: 20)
                }
            }
            .background(theme.palette.groupedBackground)
        }
        .vkNavigation("Доступы")
        .task {
            for item in personal { await permissions.refreshStatus(item.0) }
        }
    }

    private func status(_ key: PermissionKey) -> String {
        switch permissions.status(key) {
        case .unknown: "Не запрашивался"
        case .granted: "Разрешено"
        case .denied: "Выключено"
        }
    }

    private func openSystemSettings() {
        guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
        UIApplication.shared.open(url)
    }
}

struct CirclesProfileScreen: View {
    var captureState: String?
    @Environment(\.visualLanguage) private var theme

    var body: some View {
        CirclesStateGate(state: captureState) {
            ScrollView {
                VStack(spacing: 10) {
                    Avatar(name: "Влад Шукуров", size: 84)
                    Text("Влад Шукуров").font(.role(.tabTitle))
                    Text("Снимаю короткое кино и бегаю без рекордов")
                        .font(.role(.body)).foregroundStyle(theme.palette.textSecondary)
                }
                .padding(.horizontal, 24).padding(.vertical, 20)
                VKGroup {
                    VKSectionHeader(title: "Круги", count: "4")
                    VKRow(title: "Кино на 16 мм", subtitle: "8 публикаций", chevron: false)
                    RowSeparator()
                    VKRow(title: "Беговая среда", subtitle: "4 публикации", chevron: false)
                }
            }
        }
        .vkNavigation("Профиль")
    }
}

struct CirclesCreatePostScreen: View {
    var captureState: String?
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var permissions
    @Environment(CirclesStore.self) private var store
    @Environment(\.visualLanguage) private var theme
    @State private var text = ""
    @State private var circle = "Кино на 16 мм"
    @State private var draft = CirclesPostDraftCapabilities()
    @State private var pickerData: Data?
    @State private var showCamera = false
    @State private var showLibrary = false

    var body: some View {
        VStack(spacing: 0) {
            VKModalChrome(title: "Новая публикация", onCancel: { nav.dismiss() }, doneTitle: "Опубликовать", doneDisabled: text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty) {
                store.publish(
                    text: text,
                    circle: circle,
                    mediaData: draft.mediaData,
                    voiceURL: draft.voiceURL,
                    voiceDuration: draft.voiceDuration,
                    place: draft.place
                )
                nav.dismiss()
            }
            CirclesStateGate(state: captureState) {
                ScrollView {
                    VStack(spacing: 0) {
                        VKGroup {
                            Picker("Круг", selection: $circle) {
                                Text("Кино на 16 мм").tag("Кино на 16 мм")
                                Text("Беговая среда").tag("Беговая среда")
                            }
                            .padding(.horizontal, theme.spacing.contentInset).frame(minHeight: 48)
                            TextEditor(text: $text)
                                .font(.role(.rowTitle)).frame(minHeight: 150, maxHeight: 220).padding(.horizontal, 12)
                                .overlay(alignment: .topLeading) {
                                    if text.isEmpty { Text("Покажите шаг, задайте вопрос или пригласите к делу").foregroundStyle(theme.palette.textSecondary).padding(.horizontal, 17).padding(.top, 8).allowsHitTesting(false) }
                                }
                        }
                        VKGroup {
                            Button {
                                Task {
                                    guard await permissions.request(.camera) else {
                                        draft.message = "Камера выключена. Выберите снимок или опубликуйте текст."
                                        return
                                    }
                                    guard UIImagePickerController.isSourceTypeAvailable(.camera) else {
                                        draft.message = "На этом устройстве нет камеры. Выберите снимок из медиатеки."
                                        return
                                    }
                                    showCamera = true
                                }
                            } label: { VKRow(title: "Снять фото", icon: "camera", chevron: false) }
                                .buttonStyle(.plain)
                            RowSeparator()
                            Button {
                                Task {
                                    guard await permissions.request(.photos) else {
                                        draft.message = "Медиатека выключена. Можно снять фото или оставить текст."
                                        return
                                    }
                                    showLibrary = true
                                }
                            } label: { VKRow(title: "Выбрать из медиатеки", icon: "photo", chevron: false) }
                                .buttonStyle(.plain)
                            RowSeparator()
                            Button { Task { await draft.toggleVoice(using: permissions) } } label: {
                                VKRow(
                                    title: draft.isRecording ? "Закончить запись" : "Записать голосовое",
                                    subtitle: draft.voiceURL == nil ? nil : "Прикреплено · \(Int(draft.voiceDuration.rounded())) сек",
                                    icon: draft.isRecording ? "stop.circle.fill" : "mic",
                                    chevron: false
                                )
                            }.buttonStyle(.plain)
                            RowSeparator()
                            Button {
                                Task {
                                    if let transcript = await draft.toggleDictation(using: permissions) {
                                        text += text.isEmpty ? transcript : " \(transcript)"
                                    }
                                }
                            } label: {
                                VKRow(title: draft.isDictating ? "Закончить диктовку" : "Надиктовать текст", icon: "waveform", chevron: false)
                            }.buttonStyle(.plain)
                            RowSeparator()
                            Button { Task { await draft.resolvePlace(using: permissions) } } label: {
                                VKRow(title: "Определить место", subtitle: draft.place.nilIfEmpty, icon: "mappin", chevron: false)
                            }.buttonStyle(.plain)
                        }
                        VKGroup {
                            TextField("Место или адрес вручную", text: $draft.place)
                                .font(.role(.body)).padding(.horizontal, theme.spacing.contentInset).frame(minHeight: 48)
                        }
                        if let data = draft.mediaData, let image = UIImage(data: data) {
                            VKGroup {
                                ZStack(alignment: .topTrailing) {
                                    Image(uiImage: image).resizable().scaledToFill().frame(maxWidth: .infinity).frame(height: 180).clipped()
                                    Button { draft.clearMedia() } label: {
                                        Image(systemName: "xmark.circle.fill").font(.system(size: 25, weight: .semibold))
                                            .symbolRenderingMode(.palette).foregroundStyle(.white, .black.opacity(0.55)).frame(width: 44, height: 44)
                                    }.accessibilityLabel("Убрать фотографию")
                                }
                            }
                        }
                        if let message = draft.message {
                            VKInlineNotice(title: "Черновик обновлён", detail: message)
                        }
                    }
                }
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .sheet(isPresented: $showCamera) { CirclesCameraPicker(imageData: $pickerData).ignoresSafeArea() }
        .sheet(isPresented: $showLibrary) { CirclesPhotoLibraryPicker(imageData: $pickerData).ignoresSafeArea() }
        .onChange(of: pickerData) { _, value in draft.attachMedia(value) }
    }
}

private extension String {
    var nilIfEmpty: String? { isEmpty ? nil : self }
}
