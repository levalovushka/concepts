import SwiftUI
import UIKit

@main
struct PeresmenkaApp: App {
    @UIApplicationDelegateAdaptor(NativeAppDelegate.self) private var appDelegate
    var body: some Scene { WindowGroup { PeresmenkaRoot() } }
}

enum ShiftCapture {
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

struct PeresmenkaRoot: View {
    @State private var authenticated = ShiftCapture.demo || (ShiftCapture.surface.map { !["phone", "code", "codefail"].contains($0) } ?? false)
    @State private var tab = NativeConceptSpec.initialTab
    @State private var permissions = Permissions()
    private let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)

    var body: some View {
        Group {
            if authenticated { PeresmenkaShell(tab: $tab) }
            else {
                NativeEmailAuth(productName: "Пересменка", persistencePromise: "график, подтверждённые часы и договорённости о подменах",
                                initialSurface: ShiftCapture.surface,
                                captureState: ShiftCapture.productState(for: ShiftCapture.surface ?? "phone"),
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

struct PeresmenkaShell: View {
    @Binding var tab: String
    var body: some View {
        TabView(selection: $tab) {
            ForEach(NativeConceptSpec.tabs) { item in
                NavigationStack {
                    PeresmenkaRootSurface(surfaceID: item.screen)
                        .navigationDestination(for: String.self) { PeresmenkaDestination(surfaceID: $0) }
                }
                .tabItem { Image(systemName: item.systemImage).accessibilityLabel(item.label).accessibilityIdentifier(item.label) }
                .tag(item.id)
            }
        }
        .task {
            if let screen = ShiftCapture.surface,
               let item = NativeConceptSpec.tabs.first(where: { $0.screen == screen }) { tab = item.id }
        }
    }
}

struct PeresmenkaRootSurface: View {
    let surfaceID: String
    var body: some View {
        switch surfaceID {
        case "shifts": ShiftList()
        case "swaps": SwapList()
        case "people": ShiftPeople()
        default: ShiftMenu()
        }
    }
}

struct PeresmenkaDestination: View {
    let surfaceID: String
    var body: some View {
        switch surfaceID {
        case "shift": ShiftDetail()
        case "handover": ShiftHandover()
        case "swaps": SwapList()
        case "people": ShiftPeople()
        default: NativeSecondarySurface(surfaceID: surfaceID)
        }
    }
}

private struct ShiftStatePanel: View {
    let state: String?
    var body: some View {
        if let state, state != "default" {
            switch state {
            case "loading": NativeStatePanel(kind: .loading, title: "Сверяем график", detail: "Последняя подтверждённая версия остаётся доступна.")
            case "empty": NativeStatePanel(kind: .empty, title: "Смен пока нет", detail: "Импортируйте график или присоединитесь к точке.")
            case "offline": NativeStatePanel(kind: .warning, title: "Без сети", detail: "Показываем локальный график; отметка синхронизируется позже.")
            default: NativeStatePanel(kind: .error, title: "Не удалось обновить", detail: "Принятые подмены и часы сохранены.")
            }
        }
    }
}

struct ShiftList: View {
    @Environment(\.visualLanguage) private var t
    private let state = ShiftCapture.productState(for: "shifts")
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                ShiftStatePanel(state: state)
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Мои смены").textStyle(.largeTitle)
                        Text("Кофейня на Покровке · август").textStyle(.meta)
                    }
                    Spacer()
                    Text("126 ч").textStyle(.cardTitle).foregroundStyle(t.palette.accent)
                        .padding(.horizontal, 12).frame(height: 36).background(t.palette.accent.opacity(0.12), in: Capsule())
                }

                VStack(alignment: .leading, spacing: 14) {
                    HStack {
                        Text("Завтра").textStyle(.badge).foregroundStyle(.white)
                            .padding(.horizontal, 9).frame(height: 24).background(t.palette.accent, in: Capsule())
                        Spacer(); Text("08:00–16:00").textStyle(.timer)
                    }
                    Text("Бар · Покровка").textStyle(.section)
                    Text("Нужна подмена · осталось 18 часов").textStyle(.body).foregroundStyle(t.palette.danger)
                    HStack {
                        Label("8 часов", systemImage: "clock")
                        Spacer()
                        Label("сеть точки", systemImage: "wifi")
                    }.textStyle(.meta).foregroundStyle(t.palette.textSecondary)
                    NativeContractActionControl(surfaceID: "shifts", title: "Открыть график и импорт")
                }
                .padding(18)
                .background(
                    LinearGradient(colors: [t.palette.accent.opacity(0.16), t.palette.surface], startPoint: .topLeading, endPoint: .bottomTrailing),
                    in: RoundedRectangle(cornerRadius: 20)
                )

                Text("Неделя").textStyle(.section)
                VStack(spacing: 0) {
                    ShiftDay(day: "Пн", date: "24", hours: "08–16", status: "закрыта", active: false)
                    Divider().padding(.leading, 64)
                    ShiftDay(day: "Ср", date: "26", hours: "08–16", status: "нужна подмена", active: true)
                    Divider().padding(.leading, 64)
                    ShiftDay(day: "Пт", date: "28", hours: "16–23", status: "подтверждена", active: false)
                }.background(t.palette.surface, in: RoundedRectangle(cornerRadius: 18))

                HStack(spacing: 12) {
                    metric("3", "смены")
                    metric("1", "подмена")
                    metric("24", "часа")
                }
            }.padding(16).padding(.bottom, 80)
        }.background(t.palette.groupedBackground).nativeSurface("shifts")
    }
    private func metric(_ value: String, _ title: String) -> some View {
        VStack(spacing: 3) { Text(value).textStyle(.section); Text(title).textStyle(.meta) }
            .frame(maxWidth: .infinity, minHeight: 72).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 16))
    }
}

private struct ShiftDay: View {
    let day: String, date: String, hours: String, status: String, active: Bool
    @Environment(\.visualLanguage) private var t
    var body: some View {
        HStack(spacing: 13) {
            VStack(spacing: 1) { Text(day).textStyle(.badge); Text(date).textStyle(.cardTitle) }
                .foregroundStyle(active ? .white : t.palette.textPrimary)
                .frame(width: 46, height: 50).background(active ? t.palette.accent : t.palette.fill, in: RoundedRectangle(cornerRadius: 12))
            VStack(alignment: .leading, spacing: 3) { Text(hours).textStyle(.name); Text(status).textStyle(.meta).foregroundStyle(active ? t.palette.danger : t.palette.textSecondary) }
            Spacer(); Image(systemName: "arrow.right")
        }.padding(12)
    }
}

struct ShiftDetail: View {
    @Environment(\.visualLanguage) private var t
    private let state = ShiftCapture.productState(for: "shift")
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                ShiftStatePanel(state: state)
                Text("Среда, 26 августа").textStyle(.largeTitle)
                Text("08:00–16:00 · бар · Покровка").textStyle(.body).foregroundStyle(t.palette.textSecondary)
                NativeStatePanel(kind: .warning, title: "Смена открыта на подмену", detail: "Два сотрудника подходят по навыкам и успевают к началу.")
                VStack(alignment: .leading, spacing: 14) {
                    ShiftFact(icon: "person.2", title: "Назначена", value: "Ника Орлова")
                    ShiftFact(icon: "arrow.triangle.swap", title: "Подмена", value: "2 отклика")
                    ShiftFact(icon: "wifi", title: "Отметка", value: "по сети точки")
                    ShiftFact(icon: "checklist", title: "Сдача", value: "касса · витрина · холодильник")
                }.padding(18).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 20))
                NativeContractActionControl(surfaceID: "shift", title: "Перейти к отметке")
                NativeCapabilityControls(surfaceID: "shift")
            }.padding(16)
        }.background(t.palette.groupedBackground).navigationTitle("Смена").navigationBarTitleDisplayMode(.inline).nativeSurface("shift")
    }
}

private struct ShiftFact: View {
    let icon: String, title: String, value: String
    @Environment(\.visualLanguage) private var t
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon).foregroundStyle(t.palette.accent).frame(width: 28)
            VStack(alignment: .leading, spacing: 2) { Text(title).textStyle(.meta); Text(value).textStyle(.name) }
            Spacer()
        }
    }
}

struct SwapList: View {
    @Environment(\.visualLanguage) private var t
    private let state = ShiftCapture.productState(for: "swaps")
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                ShiftStatePanel(state: state)
                Text("Подмены").textStyle(.largeTitle)
                Text("Только смены общих точек и подтверждённых коллег").textStyle(.body).foregroundStyle(t.palette.textSecondary)
                swapCard(time: "завтра · 08:00–16:00", place: "Покровка · бар", person: "Ника", eta: "18 мин", urgent: true)
                swapCard(time: "пятница · 16:00–23:00", place: "Чистые пруды · зал", person: "Даша", eta: "26 мин", urgent: false)
                NativeContractActionControl(surfaceID: "swaps", title: "Открыть подходящую подмену")
                NativeCapabilityControls(surfaceID: "swaps")
            }.padding(16)
        }.background(t.palette.groupedBackground).nativeSurface("swaps")
    }
    private func swapCard(time: String, place: String, person: String, eta: String, urgent: Bool) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack { Text(time).textStyle(.name); Spacer(); if urgent { Text("Срочно").textStyle(.badge).foregroundStyle(.white).padding(.horizontal, 8).frame(height: 22).background(t.palette.danger, in: Capsule()) } }
            Text(place).textStyle(.section)
            HStack { Text(person).textStyle(.body); Spacer(); Label(eta, systemImage: "figure.walk").textStyle(.meta) }
            HStack { Label("навыки совпадают", systemImage: "checkmark.seal.fill").foregroundStyle(t.palette.positive); Spacer(); Text("8 часов").textStyle(.meta) }.textStyle(.body)
        }.padding(18).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 18))
    }
}

struct ShiftHandover: View {
    @Environment(\.visualLanguage) private var t
    @State private var checks = [true, true, false]
    private let state = ShiftCapture.productState(for: "handover")
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                ShiftStatePanel(state: state)
                Text("Сдать смену").textStyle(.largeTitle)
                Text("Факты останутся внутри смены и не превратятся в общий рейтинг сотрудника").textStyle(.body).foregroundStyle(t.palette.textSecondary)
                ForEach(checks.indices, id: \.self) { index in
                    Button { checks[index].toggle() } label: {
                        HStack {
                            Image(systemName: checks[index] ? "checkmark.square.fill" : "square").foregroundStyle(checks[index] ? t.palette.positive : t.palette.textSecondary)
                            Text(["Касса сверена", "Витрина передана", "Холодильник пополнен"][index]).textStyle(.body)
                            Spacer()
                        }.padding(16).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 15))
                    }.buttonStyle(.plain)
                }
                NativeContractActionControl(surfaceID: "handover", title: "Добавить фото сдачи")
                NativeCapabilityControls(surfaceID: "handover")
            }.padding(16)
        }.background(t.palette.groupedBackground).navigationTitle("Сдача").navigationBarTitleDisplayMode(.inline).nativeSurface("handover")
    }
}

struct ShiftPeople: View {
    @Environment(\.visualLanguage) private var t
    private let state = ShiftCapture.productState(for: "people")
    var body: some View {
        List {
            ShiftStatePanel(state: state).listRowInsets(EdgeInsets()).listRowSeparator(.hidden)
            Section("Ваша точка") {
                person("Аня Романова", "бар · сегодня 16:00", true)
                person("Кирилл Морозов", "кухня · завтра 08:00", false)
                person("Даша Ли", "зал · общих смен 12", true)
            }
            Section("Недавние подмены") {
                person("Марк Львов", "закрыл подмену 18 августа", false)
            }
            Section {
                NavigationLink(value: "mates") {
                    Label("Знакомые в сети", systemImage: "person.2")
                }
                .nativeAction("open-mates")
            } footer: {
                Text("Контакты используются только после вашего выбора и помогают найти знакомых коллег.")
            }
        }.listStyle(.insetGrouped).navigationTitle("Люди").nativeSurface("people")
    }
    private func person(_ name: String, _ detail: String, _ online: Bool) -> some View {
        HStack(spacing: 12) {
            Circle().fill(t.palette.accent.opacity(0.15)).frame(width: 44, height: 44)
                .overlay(Text(String(name.prefix(1))).textStyle(.cardTitle).foregroundStyle(t.palette.accent))
            VStack(alignment: .leading, spacing: 2) { Text(name).textStyle(.name); Text(detail).textStyle(.meta) }
            Spacer(); if online { Circle().fill(t.palette.positive).frame(width: 9, height: 9) }
        }
    }
}

struct ShiftMenu: View {
    @Environment(\.visualLanguage) private var t
    var body: some View {
        List {
            Section {
                Label("Моя точка", systemImage: "storefront")
                Label("Заработок", systemImage: "banknote")
                Label("Настройки и безопасность", systemImage: "lock")
            }
            NativeContractActionControl(surfaceID: "menu", title: "Открыть безопасность", compact: true)
            NativeCapabilityControls(surfaceID: "menu")
        }.navigationTitle("Меню").nativeSurface("menu")
    }
}
