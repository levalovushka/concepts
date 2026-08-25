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
    static var demo: Bool { ProcessInfo.processInfo.arguments.contains("-ui-demo") }
}

struct TailsRoot: View {
    @State private var authenticated = TailsCapture.demo || (TailsCapture.surface.map { !["phone", "code", "codefail"].contains($0) } ?? false)
    @State private var selectedTab = NativeConceptSpec.initialTab
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
                    tailsRootSurface(tab.screen)
                        .navigationDestination(for: String.self) { TailsDestination(surfaceID: $0) }
                }
                .tabItem {
                    Image(t.requiredTabIconAsset(role: tab.role, selected: selectedTab == tab.id))
                        .renderingMode(.template)
                }
                .tag(tab.id)
                .accessibilityLabel(tab.label)
            }
        }
        .task {
            if let surface = TailsCapture.surface,
               let tab = NativeConceptSpec.tabs.first(where: { $0.screen == surface }) { selectedTab = tab.id }
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
    @State private var showCreate = false
    @State private var showNotifications = false
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
            VKTabHeader(title: "Главная", avatar: "Бруно") {
                Button { showCreate = true } label: { Image(systemName: "plus.circle") }.accessibilityLabel("Создать")
                Button { showNotifications = true } label: { Image(systemName: t.icon(.notifications)) }.accessibilityLabel("Уведомления")
            }
            .overlay(alignment: .bottom) { t.palette.separator.frame(height: 0.5) }
        }
        .sheet(isPresented: $showCreate) { NavigationStack { NativeSecondarySurface(surfaceID: "create") } }
        .sheet(isPresented: $showNotifications) { NavigationStack { NativeSecondarySurface(surfaceID: "settings") } }
        .nativeSurface("home")
    }

    private var moments: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 15) {
                ForEach(["Бруно", "Марта", "Ричи", "Лея", "Барни"], id: \.self) { name in
                    VStack(spacing: 7) {
                        Avatar(name: name, size: 58, ring: name != "Барни", online: name == "Марта")
                        Text(name).textStyle(.meta)
                    }
                }
            }.padding(.horizontal, 16).padding(.vertical, 14)
        }
    }

    private var walkStrip: some View {
        VStack(alignment: .leading, spacing: 12) {
            VKSectionHeader(title: "Прогулки рядом", action: "Все") {}
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    TailsWalkChip(title: "Сокольники", time: "сегодня 19:00", detail: "спокойный темп · 1,2 км")
                    TailsWalkChip(title: "У пруда", time: "через 35 минут", detail: "маленькие собаки · 800 м")
                }.padding(.horizontal, 16).padding(.bottom, 14)
            }
            NativeContractActionControl(surfaceID: "home", title: "Открыть профиль Бруно", compact: true)
                .padding(.horizontal, 16).padding(.bottom, 14)
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
            VKPostActions(likes: liked ? 129 : 128, liked: liked, comments: 24, shares: 6, trailing: "3,4K",
                          onLike: { liked.toggle() }, onComment: {}, onShare: {}, onSave: {})
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
                        Spacer(); VKPill(title: "Друг") {}
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
    var body: some View {
        List {
            TailsCapturePanel(state: state).listRowInsets(EdgeInsets()).listRowSeparator(.hidden)
            ForEach([("Марта и Лена", "Встретимся у входа в 18:55", "2"), ("Площадка Сокольники", "Кто будет после дождя?", ""), ("Волонтёры района", "Бигль найден, хозяин едет", "5")], id: \.0) { row in
                HStack(spacing: 12) {
                    Avatar(name: row.0, size: 48, online: !row.2.isEmpty)
                    VStack(alignment: .leading, spacing: 3) { Text(row.0).textStyle(.name); Text(row.1).textStyle(.body).foregroundStyle(t.palette.textSecondary).lineLimit(1) }
                    Spacer(); if !row.2.isEmpty { Text(row.2).textStyle(.badge).padding(6).background(t.palette.accent, in: Circle()) }
                }.frame(minHeight: 58)
            }
            NativeContractActionControl(surfaceID: "chats", title: "Открыть разговор", compact: true).listRowInsets(EdgeInsets())
            NativeCapabilityControls(surfaceID: "chats").listRowInsets(EdgeInsets())
        }.listStyle(.plain).navigationTitle("Сообщения").nativeSurface("chats")
    }
}

struct TailsProfile: View {
    @Environment(\.visualLanguage) private var t
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                Avatar(name: "Бруно", size: 92, online: true)
                Text("Бруно").textStyle(.largeTitle); Text("корги · 4 года · 126 друзей").textStyle(.meta)
                NativeContractActionControl(surfaceID: "profile", title: "Настройки профиля")
                NativeCapabilityControls(surfaceID: "profile")
                VStack(spacing: 0) { VKRow(title: "Сохранённые прогулки", icon: "bookmark"); RowSeparator(); VKRow(title: "Здоровье и напоминания", icon: "cross.case"); RowSeparator(); VKRow(title: "Безопасность", icon: "lock") }
                    .background(t.palette.surface, in: RoundedRectangle(cornerRadius: 14))
            }.padding(16)
        }.background(t.palette.groupedBackground).nativeSurface("profile")
    }
}
