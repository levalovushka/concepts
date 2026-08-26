import SwiftUI
import UIKit

@main
struct TodayApp: App {
    @UIApplicationDelegateAdaptor(NativeAppDelegate.self) private var appDelegate
    var body: some Scene { WindowGroup { TodayRoot() } }
}

enum TodayCapture {
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

struct TodayRoot: View {
    @State private var authenticated = TodayCapture.demo || (TodayCapture.surface.map { !["phone", "code", "codefail"].contains($0) } ?? false)
    @State private var tab = NativeConceptSpec.initialTab
    @State private var permissions = Permissions()
    private let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)

    var body: some View {
        Group {
            if authenticated { TodayShell(tab: $tab) }
            else {
                NativeEmailAuth(productName: "Сегодня", persistencePromise: "ваш круг друзей и незавершённые планы",
                                initialSurface: TodayCapture.surface,
                                captureState: TodayCapture.productState(for: TodayCapture.surface ?? "phone"),
                                emailActionID: "phone.open-code", codeActionID: "code.open-codefail") {
                    withAnimation { authenticated = true }
                }
            }
        }
        .environment(permissions)
        .environment(\.visualLanguage, visualLanguage)
        .tint(visualLanguage.palette.accent)
        .preferredColorScheme(.light)
    }
}

struct TodayShell: View {
    @Binding var tab: String
    var body: some View {
        TabView(selection: $tab) {
            ForEach(NativeConceptSpec.tabs) { item in
                NavigationStack {
                    TodayRootSurface(surfaceID: item.screen)
                        .navigationDestination(for: String.self) { TodayDestination(surfaceID: $0) }
                }
                .tabItem { Image(systemName: item.systemImage).accessibilityLabel(item.label).accessibilityIdentifier(item.label) }
                .tag(item.id)
            }
        }
        .task {
            if let screen = TodayCapture.surface,
               let item = NativeConceptSpec.tabs.first(where: { $0.screen == screen }) { tab = item.id }
        }
    }
}

struct TodayRootSurface: View {
    let surfaceID: String
    var body: some View {
        switch surfaceID {
        case "home": TodayHome()
        case "nearby": TodayNearby()
        case "chats": TodayPlans()
        case "profile": TodayProfile()
        default: TodayCreate()
        }
    }
}

struct TodayDestination: View {
    let surfaceID: String
    var body: some View {
        switch surfaceID {
        case "match": TodayMatch()
        case "plan": TodayPlan()
        case "chats": TodayPlans()
        default: NativeSecondarySurface(surfaceID: surfaceID)
        }
    }
}

private struct TodayStatePanel: View {
    let state: String?
    var body: some View {
        if let state, state != "default" {
            switch state {
            case "loading": NativeStatePanel(kind: .loading, title: "Смотрим совпадения", detail: "Намерение пока остаётся только у вас.")
            case "empty": NativeStatePanel(kind: .empty, title: "Сегодня никто не отметился", detail: "Покажите своё намерение выбранным друзьям.")
            case "offline": NativeStatePanel(kind: .warning, title: "Нет сети", detail: "Черновик плана сохранён и отправится позже.")
            default: NativeStatePanel(kind: .error, title: "Не получилось обновить", detail: "Ваш круг и выбранное время сохранены.")
            }
        }
    }
}

struct TodayHome: View {
    @Environment(\.visualLanguage) private var t
    @State private var mood = 0
    private let state = TodayCapture.productState(for: "home")

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                TodayStatePanel(state: state)
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Сегодня").textStyle(.largeTitle)
                        Text("вечер свободен · Москва").textStyle(.meta)
                    }
                    Spacer()
                    ZStack {
                        Circle().fill(t.palette.accent.opacity(0.12)).frame(width: 46, height: 46)
                        Text("Н").textStyle(.cardTitle).foregroundStyle(t.palette.accent)
                    }
                }

                VStack(alignment: .leading, spacing: 16) {
                    Text("Чего хочется сегодня?").textStyle(.section)
                    HStack(spacing: 10) {
                        moodButton("Пройтись", "figure.walk", 0)
                        moodButton("Поесть", "fork.knife", 1)
                        moodButton("Кино", "film", 2)
                    }
                    Text("Намерение увидят только выбранные взаимные друзья и только до конца дня.")
                        .textStyle(.meta).foregroundStyle(t.palette.textSecondary)
                }
                .padding(18)
                .background(
                    LinearGradient(colors: [t.palette.accent.opacity(0.14), t.palette.surface],
                                   startPoint: .topLeading, endPoint: .bottomTrailing),
                    in: RoundedRectangle(cornerRadius: 24, style: .continuous)
                )

                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Уже свободны").textStyle(.section)
                        Spacer(); Text("3 друга").textStyle(.action)
                    }
                    HStack(spacing: -8) {
                        ForEach(["Аня", "Кирилл", "Даша"], id: \.self) { name in
                            TodayInitial(name: name, size: 48)
                        }
                        Spacer()
                        Text("после 19:00").textStyle(.meta)
                    }
                    Text("Ваши окна пересекаются на 2 часа 20 минут").textStyle(.body)
                }
                .padding(18).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 20))

                NativeContractActionControl(surfaceID: "home", title: "Показать совпадения")
                Image("TodayPhoto1").resizable().scaledToFill().frame(height: 220)
                    .clipShape(RoundedRectangle(cornerRadius: 22)).clipped()
                    .overlay(alignment: .bottomLeading) {
                        Text("4 места между вами · до 25 минут каждому")
                            .textStyle(.name).foregroundStyle(.white).padding(16)
                    }
            }.padding(16).padding(.bottom, 90)
        }
        .background(t.palette.groupedBackground)
        .nativeSurface("home")
    }

    private func moodButton(_ title: String, _ icon: String, _ index: Int) -> some View {
        Button { mood = index } label: {
            VStack(spacing: 9) {
                Image(systemName: icon).font(.title2)
                Text(title).font(.role(.meta))
            }
            .foregroundStyle(mood == index ? .white : t.palette.textPrimary)
            .frame(maxWidth: .infinity, minHeight: 82)
            .background(mood == index ? t.palette.accent : t.palette.surface,
                        in: RoundedRectangle(cornerRadius: 16))
        }.buttonStyle(PressableStyle())
    }
}

private struct TodayInitial: View {
    let name: String
    var size: CGFloat = 44
    @Environment(\.visualLanguage) private var t
    var body: some View {
        Circle().fill(t.palette.accent.opacity(0.18)).frame(width: size, height: size)
            .overlay(Text(String(name.prefix(1))).textStyle(.cardTitle).foregroundStyle(t.palette.accent))
            .overlay(Circle().stroke(t.palette.surface, lineWidth: 3))
            .accessibilityLabel(name)
    }
}

struct TodayMatch: View {
    @Environment(\.visualLanguage) private var t
    private let state = TodayCapture.productState(for: "match")
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                TodayStatePanel(state: state)
                Text("Совпало").textStyle(.largeTitle)
                Text("Вы трое хотите выбраться сегодня после 19:00").textStyle(.body).foregroundStyle(t.palette.textSecondary)
                HStack(spacing: 14) {
                    ForEach(["Вы", "Аня", "Кирилл"], id: \.self) { name in
                        VStack(spacing: 7) { TodayInitial(name: name, size: 62); Text(name).textStyle(.meta) }
                    }
                }
                VStack(alignment: .leading, spacing: 12) {
                    Label("Кино", systemImage: "film.fill").textStyle(.cardTitle)
                    Text("Совпало у всех · окно 19:30–22:00").textStyle(.body)
                    Text("Подойдут 4 кинотеатра между вами").textStyle(.action)
                }.padding(18).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 20))
                NativeContractActionControl(surfaceID: "match", title: "Собрать общий план")
                NativeCapabilityControls(surfaceID: "match")
            }.padding(16)
        }.background(t.palette.groupedBackground).navigationTitle("Совпадение").navigationBarTitleDisplayMode(.inline).nativeSurface("match")
    }
}

struct TodayNearby: View {
    @Environment(\.visualLanguage) private var t
    private let state = TodayCapture.productState(for: "nearby")
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                TodayStatePanel(state: state)
                Text("Вместе").textStyle(.largeTitle)
                Text("Места, до которых всем удобно добраться").textStyle(.body).foregroundStyle(t.palette.textSecondary)
                ForEach([(2, "Пионер", "кино · 18 минут"), (1, "Дом культур", "ужин · 22 минуты"), (3, "Парк Горького", "прогулка · 25 минут")], id: \.1) { place in
                    HStack(spacing: 14) {
                        Text("\(place.0)").textStyle(.cardTitle).foregroundStyle(t.palette.accent)
                            .frame(width: 42, height: 42).background(t.palette.accent.opacity(0.12), in: Circle())
                        VStack(alignment: .leading, spacing: 3) { Text(place.1).textStyle(.cardTitle); Text(place.2).textStyle(.meta) }
                        Spacer(); Image(systemName: "arrow.up.right")
                    }.padding(16).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 18))
                }
                NativeContractActionControl(surfaceID: "nearby", title: "Открыть план")
                NativeCapabilityControls(surfaceID: "nearby")
            }.padding(16)
        }.background(t.palette.groupedBackground).nativeSurface("nearby")
    }
}

struct TodayPlan: View {
    @Environment(\.visualLanguage) private var t
    private let state = TodayCapture.productState(for: "plan")
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                TodayStatePanel(state: state)
                Text("Кино сегодня").textStyle(.largeTitle)
                Text("20:10 · Пионер · вы, Аня и Кирилл").textStyle(.body).foregroundStyle(t.palette.textSecondary)
                Image("TodayPhoto2").resizable().scaledToFill().frame(height: 230).clipShape(RoundedRectangle(cornerRadius: 22)).clipped()
                VStack(alignment: .leading, spacing: 13) {
                    planRow("19:35", "Аня выходит из дома", true)
                    planRow("19:50", "Встречаемся у входа", false)
                    planRow("20:10", "Начало сеанса", false)
                }.padding(18).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 20))
                NativeContractActionControl(surfaceID: "plan", title: "Подтвердить план")
                NativeCapabilityControls(surfaceID: "plan")
            }.padding(16)
        }.background(t.palette.groupedBackground).navigationTitle("План сегодня").navigationBarTitleDisplayMode(.inline).nativeSurface("plan")
    }
    private func planRow(_ time: String, _ text: String, _ ready: Bool) -> some View {
        HStack(spacing: 12) {
            Text(time).textStyle(.timer).frame(width: 46, alignment: .leading)
            Circle().fill(ready ? t.palette.positive : t.palette.separator).frame(width: 9, height: 9)
            Text(text).textStyle(.body)
        }
    }
}

struct TodayCreate: View {
    @Environment(\.visualLanguage) private var t
    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Создать").textStyle(.largeTitle)
            Text("Предложите конкретный план или просто обозначьте настроение").textStyle(.body).foregroundStyle(t.palette.textSecondary)
            NativeContractActionControl(surfaceID: "create", title: "Отправить приглашение")
            NativeCapabilityControls(surfaceID: "create")
            Spacer()
        }.padding(16).background(t.palette.groupedBackground).nativeSurface("create")
    }
}

struct TodayPlans: View {
    @Environment(\.visualLanguage) private var t
    private let state = TodayCapture.productState(for: "chats")
    var body: some View {
        List {
            TodayStatePanel(state: state).listRowInsets(EdgeInsets()).listRowSeparator(.hidden)
            Section("Сегодня") {
                NavigationLink(value: "chat") {
                    Label("Кино · 20:10 · подтверждено 3 из 3", systemImage: "ticket.fill")
                }
                .nativeAction("open-chat")
                NavigationLink(value: "chat") {
                    Label("Прогулка · 21:30 · ждём Дашу", systemImage: "figure.walk")
                }
            }
            Section("Недавно") {
                NavigationLink(value: "chat") {
                    Label("Ужин в субботу · завершён", systemImage: "checkmark.circle")
                }
            }
        }.listStyle(.insetGrouped).navigationTitle("Планы").nativeSurface("chats")
    }
}

struct TodayProfile: View {
    @Environment(\.visualLanguage) private var t
    var body: some View {
        VStack(spacing: 18) {
            TodayInitial(name: "Ника", size: 88)
            Text("Ника").textStyle(.largeTitle)
            Text("8 близких друзей · намерения видны только взаимно").textStyle(.meta).multilineTextAlignment(.center)
            NativeContractActionControl(surfaceID: "profile", title: "Настроить свой круг")
            NativeCapabilityControls(surfaceID: "profile")
            Spacer()
        }.padding(20).background(t.palette.groupedBackground).nativeSurface("profile")
    }
}
