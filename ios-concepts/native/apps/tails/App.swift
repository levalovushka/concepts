import SwiftUI
import UIKit

@main
struct TailsApp: App {
    @UIApplicationDelegateAdaptor(NativeAppDelegate.self) private var appDelegate
    var body: some Scene { WindowGroup { TailsRoot() } }
}

enum TailsCapture {
    static var surface: String? {
        let a = ProcessInfo.processInfo.arguments
        guard let i = a.firstIndex(of: "-shot"), i + 1 < a.count else { return nil }
        return a[i + 1]
    }
    static func productState(for surface: String) -> String? {
        let a = ProcessInfo.processInfo.arguments
        guard self.surface == surface, let i = a.firstIndex(of: "-state"), i + 1 < a.count else { return nil }
        return a[i + 1]
    }
    static var initialTab: String? {
        switch surface {
        case "home", "pet", "walk": "home"
        case "nearby": "nearby"
        case "chats", "chat", "voice": "chats"
        case "profile": "profile"
        case "create": "create"
        default: nil
        }
    }
    static var demo: Bool { ProcessInfo.processInfo.arguments.contains("-ui-demo") }
}

struct TailsRoot: View {
    @State private var authenticated = TailsCapture.demo || (TailsCapture.surface.map { !["phone", "code", "codefail"].contains($0) } ?? false)
    @State private var selectedTab = TailsCapture.initialTab ?? NativeConceptSpec.initialTab
    @State private var permissions = Permissions()
    private let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)

    var body: some View {
        Group {
            if authenticated { TailsShell(selectedTab: $selectedTab) }
            else {
                NativeEmailAuth(productName: "Хвосты", persistencePromise: "профиль питомца и договорённости о прогулках",
                                initialSurface: TailsCapture.surface,
                                captureState: TailsCapture.productState(for: TailsCapture.surface ?? "phone"),
                                emailActionID: "phone.open-code", codeActionID: "code.open-codefail") {
                    withAnimation(.easeOut(duration: 0.2)) { authenticated = true }
                }
            }
        }
        .environment(\.visualLanguage, visualLanguage)
        .environment(permissions)
        .tint(visualLanguage.palette.accent)
        .preferredColorScheme(.light)
    }
}

struct TailsShell: View {
    @Binding var selectedTab: String
    @Environment(\.visualLanguage) private var t

    var body: some View {
        TabView(selection: $selectedTab) {
            ForEach(NativeConceptSpec.tabs) { tab in
                NavigationStack {
                    captureAwareSurface(tab.screen)
                    .navigationDestination(for: String.self) { TailsDestination(surfaceID: $0) }
                }
                .tabItem {
                    Image(t.requiredTabIconAsset(role: tab.role, selected: selectedTab == tab.id))
                        .renderingMode(.template)
                        .accessibilityLabel(tab.label)
                        .accessibilityIdentifier(tab.label)
                }
                .tag(tab.id)
            }
        }
        .task {
            if let surface = TailsCapture.surface,
               let tab = NativeConceptSpec.tabs.first(where: { $0.screen == surface }) { selectedTab = tab.id }
            if let surface = TailsCapture.surface {
                CaptureIdentity.report(
                    surface: surface,
                    state: TailsCapture.productState(for: surface) ?? "default"
                )
            }
        }
    }

    @ViewBuilder private func captureAwareSurface(_ rootSurface: String) -> some View {
        if rootSurface == "home", let surface = TailsCapture.surface, ["pet", "walk"].contains(surface) {
            TailsDestination(surfaceID: surface)
        } else if rootSurface == "chats", let surface = TailsCapture.surface, ["chat", "voice"].contains(surface) {
            TailsDestination(surfaceID: surface == "voice" ? "chat" : surface)
        } else {
            tailsRootSurface(rootSurface)
        }
    }

    @ViewBuilder private func tailsRootSurface(_ surface: String) -> some View {
        switch surface {
        case "home": TailsHome()
        case "nearby": TailsNearby()
        case "chats": TailsChats()
        case "profile": TailsProfile()
        default: TailsCreate()
        }
    }
}

struct TailsDestination: View {
    let surfaceID: String
    var body: some View {
        switch surfaceID {
        case "pet": TailsPet()
        case "walk": TailsWalk()
        case "chats": TailsChats()
        case "chat": TailsConversation()
        default: NativeSecondarySurface(surfaceID: surfaceID)
        }
    }
}

private struct TailsCapturePanel: View {
    let state: String?
    var body: some View {
        if let state, state != "default" {
            switch state {
            case "loading": NativeStatePanel(kind: .loading, title: "Ищем свежие прогулки", detail: "Знакомые питомцы остаются на экране.")
            case "empty": NativeStatePanel(kind: .empty, title: "Рядом пока тихо", detail: "Выберите район или предложите первую прогулку.")
            case "offline": NativeStatePanel(kind: .warning, title: "Нет сети", detail: "Показываем сохранённые профили и последние договорённости.")
            default: NativeStatePanel(kind: .error, title: "Не удалось обновить", detail: "Повторите — выбранный район и фильтры сохранены.")
            }
        }
    }
}

struct TailsHome: View {
    @Environment(\.visualLanguage) private var t
    @State private var liked = false
    @State private var saved = false
    @State private var showCreate = false
    @State private var showComments = false
    @State private var showShare = false
    private let state = TailsCapture.productState(for: "home")

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                TailsCapturePanel(state: state).padding(.horizontal, 16).padding(.vertical, state == nil ? 0 : 10)
                moments
                GroupGap()
                walkStrip
                GroupGap()
                momentCard
                Color.clear.frame(height: 96)
            }
        }
        .background(t.palette.background)
        .safeAreaInset(edge: .top, spacing: 0) {
            VKTabHeader(title: "Главная") {
                Button { showCreate = true } label: { Image(systemName: "plus.circle") }.accessibilityLabel("Создать")
            }
            .overlay(alignment: .bottom) { t.palette.separator.frame(height: 0.5) }
        }
        .sheet(isPresented: $showCreate) { NavigationStack { NativeSecondarySurface(surfaceID: "create") } }
        .sheet(isPresented: $showComments) { NavigationStack { TailsConversation() } }
        .sheet(isPresented: $showShare) { NavigationStack { NativeSecondarySurface(surfaceID: "shareext") } }
        .nativeSurface("home")
    }

    private var moments: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 15) {
                ForEach(["Бруно", "Марта", "Ричи", "Лея", "Барни"], id: \.self) { name in
                    NavigationLink(value: "pet") {
                        VStack(spacing: 7) {
                            Avatar(name: name, size: 58, ring: name != "Барни", online: name == "Марта")
                            Text(name).textStyle(.meta).foregroundStyle(t.palette.textPrimary)
                        }
                    }
                    .buttonStyle(.plain)
                }
            }.padding(.horizontal, 16).padding(.vertical, 14)
        }
    }

    private var walkStrip: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Прогулки рядом").textStyle(.section)
                Spacer()
                NavigationLink("Все", value: "nearby").textStyle(.action)
            }
            .padding(.horizontal, 16).padding(.top, 16)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    TailsWalkChip(title: "Сокольники", time: "сегодня 19:00", detail: "спокойный темп · 1,2 км")
                    TailsWalkChip(title: "У пруда", time: "через 35 минут", detail: "маленькие собаки · 800 м")
                }.padding(.horizontal, 16).padding(.bottom, 14)
            }
        }
    }

    private var momentCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 10) {
                Avatar(name: "Марта", size: 42, online: true)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Марта").textStyle(.name)
                    Text("бигль · Лена · 18 минут назад").textStyle(.meta)
                }
                Spacer(); Image(systemName: t.icon(.more)).foregroundStyle(t.palette.textSecondary)
            }.padding(16)
            VKMedia(assetName: "TailsPhoto1", height: 360, pageBadge: "1/3", accessibilityLabel: "Марта бежит по осеннему парку")
            Text("Ищем спокойную компанию на круг по парку. Марта дружелюбна, но сначала знакомится на поводке.")
                .textStyle(.body).padding(.horizontal, 16).padding(.top, 12)
            VKPostActions(likes: liked ? 129 : 128, liked: liked, comments: 24, shares: 6, saved: saved, trailing: "3,4K",
                          onLike: { liked.toggle() }, onComment: { showComments = true },
                          onShare: { showShare = true }, onSave: { saved.toggle() })
                .padding(16)
        }.background(t.palette.surface)
    }
}

private struct TailsWalkChip: View {
    let title: String, time: String, detail: String
    @Environment(\.visualLanguage) private var t
    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack { Circle().fill(t.palette.positive).frame(width: 7, height: 7); Text(time).textStyle(.meta) }
            Text(title).textStyle(.cardTitle)
            Text(detail).textStyle(.meta).foregroundStyle(t.palette.textSecondary)
            HStack(spacing: -7) { Avatar(name: "Бруно", size: 24); Avatar(name: "Марта", size: 24); Avatar(name: "Лея", size: 24) }
        }
        .padding(13).frame(width: 210, alignment: .leading)
        .background(t.palette.fill, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

struct TailsPet: View {
    @Environment(\.visualLanguage) private var t
    private let state = TailsCapture.productState(for: "pet")
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                TailsCapturePanel(state: state).padding(16)
                VKMedia(assetName: "TailsPhoto2", height: 300, accessibilityLabel: "Бруно на прогулке")
                VStack(alignment: .leading, spacing: 14) {
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 4) { Text("Бруно").textStyle(.largeTitle); Text("корги · 4 года · Сокольники").textStyle(.meta) }
                        Spacer()
                        Text("Друг").textStyle(.pill).foregroundStyle(t.palette.textPrimary)
                            .padding(.horizontal, 14).frame(height: 32).background(t.palette.fill, in: Capsule())
                    }
                    Text("Спокойный, не тянет поводок, любит длинные маршруты. С крупными собаками знакомится постепенно.").textStyle(.body)
                    HStack(spacing: 8) { tag("спокойный"); tag("дети — да"); tag("кошки — нет") }
                    NativeContractActionControl(surfaceID: "pet", title: "Написать владельцу")
                    NativeCapabilityControls(surfaceID: "pet")
                }.padding(16)
            }
        }.background(t.palette.background).navigationTitle("Профиль питомца").navigationBarTitleDisplayMode(.inline).nativeSurface("pet")
    }
    private func tag(_ value: String) -> some View { Text(value).textStyle(.pill).padding(.horizontal, 10).frame(height: 30).background(t.palette.fill, in: Capsule()) }
}

struct TailsNearby: View {
    @Environment(\.visualLanguage) private var t
    @State private var filter = 0
    private let state = TailsCapture.productState(for: "nearby")
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                TailsCapturePanel(state: state)
                Text("Кто гуляет рядом").textStyle(.largeTitle)
                Picker("Фильтр", selection: $filter) { Text("Сейчас").tag(0); Text("Вечером").tag(1); Text("Выходные").tag(2) }.pickerStyle(.segmented)
                Image("TailsPhoto3").resizable().scaledToFill().frame(height: 210).clipShape(RoundedRectangle(cornerRadius: 18)).clipped()
                VStack(alignment: .leading, spacing: 8) {
                    Text("Сокольники · круг у пруда").textStyle(.cardTitle)
                    Text("19:00 · Бруно, Марта и ещё 2 питомца").textStyle(.body)
                    Text("Совместимость с Бруно: высокая").textStyle(.action)
                }.padding(16).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 16))
                NativeContractActionControl(surfaceID: "nearby", title: "Посмотреть прогулку")
                NativeCapabilityControls(surfaceID: "nearby")
            }.padding(16)
        }.background(t.palette.groupedBackground).nativeSurface("nearby")
    }
}

struct TailsWalk: View {
    @Environment(\.visualLanguage) private var t
    private let state = TailsCapture.productState(for: "walk")
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                TailsCapturePanel(state: state)
                Text("Сегодня, 19:00").textStyle(.largeTitle)
                Text("Сокольники · круг у пруда · 45 минут").textStyle(.body).foregroundStyle(t.palette.textSecondary)
                HStack { ForEach(["Бруно", "Марта", "Лея"], id: \.self) { Avatar(name: $0, size: 52, online: true) }; Spacer() }
                NativeStatePanel(kind: .success, title: "Совместимость проверена", detail: "Темп, размер и отношение к детям подходят всем участникам.")
                VStack(alignment: .leading, spacing: 10) {
                    Text("Перед выходом").textStyle(.section)
                    Label("Встречаемся у главного входа", systemImage: "mappin.circle.fill")
                    Label("Сначала знакомим питомцев на поводке", systemImage: "checkmark.circle.fill")
                }.textStyle(.body).padding(16).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 16))
                NativeContractActionControl(surfaceID: "walk", title: "Подтвердить участие")
                NativeCapabilityControls(surfaceID: "walk")
            }.padding(16)
        }.background(t.palette.groupedBackground).navigationTitle("Прогулка").navigationBarTitleDisplayMode(.inline).nativeSurface("walk")
    }
}

struct TailsCreate: View {
    @Environment(\.visualLanguage) private var t
    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Создать").textStyle(.largeTitle)
            Text("Момент питомца, прогулка или карточка о пропаже").textStyle(.body).foregroundStyle(t.palette.textSecondary)
            HStack(spacing: 12) { createTile("Момент", "camera.fill"); createTile("Прогулка", "figure.walk"); createTile("Пропал", "exclamationmark.triangle.fill") }
            NativeContractActionControl(surfaceID: "create", title: "Снять момент")
            NativeCapabilityControls(surfaceID: "create")
            Spacer()
        }.padding(16).background(t.palette.groupedBackground).nativeSurface("create")
    }
    private func createTile(_ title: String, _ icon: String) -> some View {
        VStack(spacing: 10) { Image(systemName: icon).font(.title2); Text(title).textStyle(.meta) }
            .foregroundStyle(t.palette.accent).frame(maxWidth: .infinity, minHeight: 100).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 16))
    }
}

struct TailsChats: View {
    @Environment(\.visualLanguage) private var t
    private let state = TailsCapture.productState(for: "chats")
    @State private var query = ""
    private let dialogs = [
        TailsDialog(name: "Марта и Лена", preview: "Встретимся у входа в 18:55", time: "18:42", unread: 2, online: true),
        TailsDialog(name: "Площадка Сокольники", preview: "Кто будет после дождя?", time: "17:10", unread: 0, online: false),
        TailsDialog(name: "Волонтёры района", preview: "Бигль найден, хозяин едет", time: "16:24", unread: 5, online: true),
    ]
    var body: some View {
        VStack(spacing: 0) {
            VKTabHeader(title: "Сообщения") {
                NavigationLink(value: "mates") {
                    Image(systemName: "square.and.pencil")
                        .font(.system(size: 20, weight: t.icons.weight))
                        .frame(width: t.metrics.hitTarget, height: t.metrics.hitTarget)
                }
                .accessibilityLabel("Новое сообщение")
            }
            VKSearchField(placeholder: "Поиск по сообщениям", text: $query)
                .padding(.horizontal, t.spacing.contentInset)
                .padding(.bottom, 10)
            ScrollView {
                if let state, state != "default" {
                    chatsState(state).padding(.horizontal, t.spacing.contentInset).padding(.top, 24)
                } else {
                    LazyVStack(spacing: 0) {
                        ForEach(filteredDialogs) { dialog in
                            NavigationLink(value: "chat") { TailsDialogRow(dialog: dialog) }
                                .buttonStyle(HighlightStyle())
                                .nativeAction("open-chat")
                            if dialog.id != filteredDialogs.last?.id { RowSeparator(leading: 76) }
                        }
                    }
                }
            }
        }
        .background(t.palette.surface)
        .toolbar(.hidden, for: .navigationBar)
        .nativeSurface("chats")
    }

    private var filteredDialogs: [TailsDialog] {
        query.isEmpty ? dialogs : dialogs.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }

    @ViewBuilder private func chatsState(_ state: String) -> some View {
        switch state {
        case "loading": NativeStatePanel(kind: .loading, title: "Обновляем сообщения", detail: "Последние разговоры остаются доступны.", placement: .page)
        case "empty": NativeStatePanel(kind: .empty, title: "Сообщений пока нет", detail: "Начните разговор из профиля владельца или прогулки.", placement: .page)
        case "offline": NativeStatePanel(kind: .warning, title: "Нет сети", detail: "Показываем сохранённые разговоры; новые сообщения отправятся позже.", placement: .page)
        default: NativeStatePanel(kind: .error, title: "Не удалось обновить сообщения", detail: "Разговоры сохранены. Повторите попытку позже.", placement: .page)
        }
    }
}

private struct TailsDialog: Identifiable {
    let name: String, preview: String, time: String
    let unread: Int
    let online: Bool
    var id: String { name }
}

private struct TailsDialogRow: View {
    let dialog: TailsDialog
    @Environment(\.visualLanguage) private var t
    var body: some View {
        HStack(spacing: 12) {
            Avatar(name: dialog.name, size: 48, online: dialog.online)
            VStack(alignment: .leading, spacing: 3) {
                Text(dialog.name).textStyle(.name).foregroundStyle(t.palette.textPrimary).lineLimit(1)
                Text(dialog.preview).textStyle(.meta).foregroundStyle(t.palette.textSecondary).lineLimit(1)
            }
            Spacer(minLength: 8)
            VStack(alignment: .trailing, spacing: 6) {
                Text(dialog.time).textStyle(.meta).foregroundStyle(t.palette.textSecondary)
                if dialog.unread > 0 {
                    Text("\(dialog.unread)").textStyle(.badge).foregroundStyle(.white)
                        .padding(.horizontal, 7).frame(minHeight: 20)
                        .background(t.palette.accent, in: Capsule())
                }
            }
        }
        .padding(.horizontal, t.spacing.contentInset).padding(.vertical, 10)
        .frame(minHeight: 68).contentShape(Rectangle())
    }
}

private struct TailsConversation: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.visualLanguage) private var t
    @State private var draft = ""
    @State private var messages = [
        ("Лена", "Привет! Марта сегодня готова на спокойный круг после дождя.", false),
        ("Вы", "Отлично. Встретимся у главного входа в 18:55?", true),
        ("Лена", "Да, сначала познакомим их на поводке.", false),
    ]
    var body: some View {
        VStack(spacing: 0) {
            VKChatHeader(title: "Марта и Лена", subtitle: "в сети", onBack: { dismiss() })
            ScrollView {
                LazyVStack(spacing: 7) {
                    Text("Сегодня").textStyle(.meta).foregroundStyle(t.palette.textSecondary).padding(.vertical, 8)
                    ForEach(Array(messages.enumerated()), id: \.offset) { _, item in
                        HStack(alignment: .bottom, spacing: 8) {
                            if item.2 { Spacer(minLength: 52) } else { Avatar(name: item.0, size: 28) }
                            Text(item.1).textStyle(.body).foregroundStyle(item.2 ? .white : t.palette.textPrimary)
                                .padding(.horizontal, 12).padding(.vertical, 9)
                                .background(item.2 ? t.palette.accent : t.palette.fill,
                                            in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                            if !item.2 { Spacer(minLength: 52) }
                        }
                    }
                }.padding(.horizontal, 12).padding(.vertical, 10)
            }
            HStack(spacing: 10) {
                NavigationLink(value: "voice") { Image(systemName: "plus.circle.fill").font(.system(size: 26, weight: t.icons.weight)) }
                    .accessibilityLabel("Добавить вложение")
                TextField("Сообщение", text: $draft).padding(.horizontal, 14).frame(height: 40).background(t.palette.fill, in: Capsule())
                if draft.isEmpty {
                    NavigationLink(value: "voice") {
                        Image(systemName: "mic.fill").font(.system(size: 25, weight: t.icons.weight))
                    }
                    .frame(width: 40, height: 44).accessibilityLabel("Записать сообщение")
                    .nativeAction("open-voice")
                } else {
                    Button {
                        messages.append(("Вы", draft, true))
                        draft = ""
                    } label: {
                        Image(systemName: "arrow.up.circle.fill").font(.system(size: 25, weight: t.icons.weight))
                    }
                    .frame(width: 40, height: 44).accessibilityLabel("Отправить сообщение")
                }
            }
            .foregroundStyle(t.palette.accent).padding(.horizontal, 12).padding(.vertical, 8)
            .overlay(alignment: .top) { t.palette.separator.frame(height: 0.5) }
        }
        .toolbar(.hidden, for: .navigationBar).toolbar(.hidden, for: .tabBar)
        .nativeSurface("chat")
    }
}

struct TailsProfile: View {
    @Environment(\.visualLanguage) private var t
    private let state = TailsCapture.productState(for: "profile")
    var body: some View {
        VStack(spacing: 0) {
            VKTabHeader(title: "Профиль") { EmptyView() }
            ScrollView {
                if let state, state != "default" {
                    profileState(state).padding(.horizontal, t.spacing.contentInset).padding(.top, 24)
                } else {
                    VStack(spacing: 0) {
                        VKMedia(assetName: "TailsPhoto2", height: 230, accessibilityLabel: "Бруно на прогулке")
                        VStack(spacing: 8) {
                            Avatar(name: "Бруно", size: 84, online: true).padding(.top, -42)
                            Text("Бруно").textStyle(.largeTitle)
                            Text("корги · 4 года · Сокольники").textStyle(.meta).foregroundStyle(t.palette.textSecondary)
                            Text("Спокойные прогулки и знакомство на поводке").textStyle(.body).multilineTextAlignment(.center)
                            NavigationLink(value: "settings") {
                                Text("Редактировать профиль").textStyle(.button).foregroundStyle(t.palette.accent)
                                    .frame(maxWidth: .infinity, minHeight: t.metrics.hitTarget)
                                    .overlay(RoundedRectangle(cornerRadius: t.metrics.controlRadius).stroke(t.palette.separator))
                            }
                            .buttonStyle(PressableStyle()).nativeAction("open-settings")
                        }.padding(.horizontal, t.spacing.contentInset).padding(.bottom, 16)
                        GroupGap()
                        VStack(spacing: 0) {
                            NavigationLink(value: "walk") { VKRow(title: "Сохранённые прогулки", subtitle: "12 маршрутов", icon: "bookmark") }
                            RowSeparator()
                            NavigationLink(value: "vaccine") { VKRow(title: "Здоровье и напоминания", subtitle: "прививка через 24 дня", icon: "cross.case") }
                            RowSeparator()
                            NavigationLink(value: "lock") { VKRow(title: "Безопасность", subtitle: "контакты и видимость", icon: "lock") }
                        }.background(t.palette.surface)
                        GroupGap()
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Знакомые владельцы рядом").textStyle(.section)
                            Text("Контакты помогут найти только тех, кто уже пользуется Хвостами. Поиск по кличке останется доступен без разрешения.")
                                .textStyle(.meta).foregroundStyle(t.palette.textSecondary)
                            NativeCapabilityControls(surfaceID: "profile")
                        }.padding(t.spacing.contentInset).background(t.palette.surface)
                    }
                }
            }
        }
        .background(t.palette.groupedBackground).toolbar(.hidden, for: .navigationBar).nativeSurface("profile")
    }

    @ViewBuilder private func profileState(_ state: String) -> some View {
        switch state {
        case "loading": NativeStatePanel(kind: .loading, title: "Обновляем профиль Бруно", detail: "Сохранённые данные остаются на экране.", placement: .page)
        case "offline": NativeStatePanel(kind: .warning, title: "Нет сети", detail: "Профиль и сохранённые прогулки доступны без изменений.", placement: .page)
        default: NativeStatePanel(kind: .error, title: "Не удалось обновить профиль", detail: "Данные Бруно сохранены. Повторите попытку позже.", placement: .page)
        }
    }
}
