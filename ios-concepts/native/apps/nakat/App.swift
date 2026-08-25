import SwiftUI
import UIKit

@main
struct NakatApp: App {
    @UIApplicationDelegateAdaptor(NativeAppDelegate.self) private var appDelegate
    var body: some Scene { WindowGroup { NakatRoot() } }
}

enum NakatCapture {
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

struct NakatRoot: View {
    @State private var authenticated = NakatCapture.demo || (NakatCapture.surface.map { !["phone", "code", "codefail"].contains($0) } ?? false)
    @State private var tab = NativeConceptSpec.initialTab
    @State private var permissions = Permissions()
    private let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)

    var body: some View {
        Group {
            if authenticated { NakatShell(tab: $tab) }
            else {
                NativeEmailAuth(productName: "Накат", persistencePromise: "прогресс курса, ошибки и расписание занятий",
                                initialSurface: NakatCapture.surface,
                                captureState: NakatCapture.productState(for: NakatCapture.surface ?? "phone"),
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

struct NakatShell: View {
    @Binding var tab: String
    var body: some View {
        TabView(selection: $tab) {
            ForEach(NativeConceptSpec.tabs) { item in
                NavigationStack {
                    NakatRootSurface(surfaceID: item.screen)
                        .navigationDestination(for: String.self) { NakatDestination(surfaceID: $0) }
                }
                .tabItem { Image(systemName: item.systemImage) }
                .tag(item.id)
                .accessibilityLabel(item.label)
            }
        }
        .task {
            if let screen = NakatCapture.surface,
               let item = NativeConceptSpec.tabs.first(where: { $0.screen == screen }) { tab = item.id }
        }
    }
}

struct NakatRootSurface: View {
    let surfaceID: String
    var body: some View {
        switch surfaceID {
        case "lessons": NakatLessons()
        case "theory": NakatTheory()
        default: NakatMenu()
        }
    }
}

struct NakatDestination: View {
    let surfaceID: String
    var body: some View {
        switch surfaceID {
        case "lesson": NakatLesson()
        case "drive": NakatDrive()
        case "ticket": NakatTicket()
        default: NativeSecondarySurface(surfaceID: surfaceID)
        }
    }
}

private struct NakatStatePanel: View {
    let state: String?
    var body: some View {
        if let state, state != "default" {
            switch state {
            case "loading": NativeStatePanel(kind: .loading, title: "Сверяем курс", detail: "Последний завершённый шаг уже сохранён.")
            case "empty": NativeStatePanel(kind: .empty, title: "Нет следующего шага", detail: "Синхронизируйте расписание автошколы.")
            case "offline": NativeStatePanel(kind: .warning, title: "Без сети", detail: "Билеты и расписание доступны из последней синхронизации.")
            default: NativeStatePanel(kind: .error, title: "Не удалось обновить курс", detail: "Ваш прогресс и заметки не потеряны.")
            }
        }
    }
}

struct NakatLessons: View {
    @Environment(\.visualLanguage) private var t
    private let state = NakatCapture.productState(for: "lessons")
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                NakatStatePanel(state: state)
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Накат").textStyle(.largeTitle)
                        Text("Курс B · личный план до экзамена").textStyle(.meta)
                    }
                    Spacer()
                    Image(systemName: "car.side.fill")
                        .font(.title2)
                        .foregroundStyle(t.palette.accent)
                        .frame(width: 48, height: 48)
                        .background(t.palette.accent.opacity(0.12), in: Circle())
                }
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("До экзамена").textStyle(.meta).foregroundStyle(t.palette.textSecondary)
                        Text("12 дней").textStyle(.largeTitle)
                        Text("готовность 68%").textStyle(.action)
                    }
                    Spacer()
                    ZStack {
                        Circle().stroke(t.palette.fill, lineWidth: 9)
                        Circle().trim(from: 0, to: 0.68).stroke(t.palette.accent, style: StrokeStyle(lineWidth: 9, lineCap: .round)).rotationEffect(.degrees(-90))
                        Text("68").textStyle(.cardTitle)
                    }.frame(width: 86, height: 86)
                }
                .padding(20)
                .background(t.palette.surface, in: RoundedRectangle(cornerRadius: 22))

                Text("Следующий учебный шаг").textStyle(.section)
                VStack(alignment: .leading, spacing: 14) {
                    HStack {
                        Label("Сегодня · 18:30", systemImage: "calendar").textStyle(.name)
                        Spacer(); Text("Практика №14").textStyle(.meta)
                    }
                    Text("Парковка и разворот в ограниченном пространстве").textStyle(.cardTitle)
                    Text("Автодром · инструктор Андрей · машина 714").textStyle(.body).foregroundStyle(t.palette.textSecondary)
                    Divider()
                    HStack {
                        Label("Перед занятием", systemImage: "checklist")
                        Spacer(); Text("2 из 3").textStyle(.action)
                    }.textStyle(.body)
                    NativeContractActionControl(surfaceID: "lessons", title: "Открыть занятие")
                }
                .padding(18)
                .background(
                    LinearGradient(colors: [t.palette.accent.opacity(0.12), t.palette.surface], startPoint: .topLeading, endPoint: .bottomTrailing),
                    in: RoundedRectangle(cornerRadius: 22)
                )

                Text("На этой неделе").textStyle(.section)
                VStack(spacing: 0) {
                    NakatTimelineRow(day: "Пн", title: "Разбор 3 ошибок", detail: "завершено · 24 минуты", done: true)
                    Divider().padding(.leading, 58)
                    NakatTimelineRow(day: "Ср", title: "Практика №14", detail: "сегодня · 18:30", done: false)
                    Divider().padding(.leading, 58)
                    NakatTimelineRow(day: "Сб", title: "Внутренний экзамен", detail: "10:00 · площадка", done: false)
                }.background(t.palette.surface, in: RoundedRectangle(cornerRadius: 18))
            }.padding(16).padding(.bottom, 80)
        }.background(t.palette.groupedBackground).nativeSurface("lessons")
    }
}

private struct NakatTimelineRow: View {
    let day: String, title: String, detail: String, done: Bool
    @Environment(\.visualLanguage) private var t
    var body: some View {
        HStack(spacing: 14) {
            Text(day).textStyle(.badge).foregroundStyle(done ? .white : t.palette.accent)
                .frame(width: 38, height: 38).background(done ? t.palette.positive : t.palette.accent.opacity(0.12), in: Circle())
            VStack(alignment: .leading, spacing: 3) { Text(title).textStyle(.name); Text(detail).textStyle(.meta) }
            Spacer(); Image(systemName: done ? "checkmark.circle.fill" : "circle").foregroundStyle(done ? t.palette.positive : t.palette.separator)
        }.padding(14)
    }
}

struct NakatLesson: View {
    @Environment(\.visualLanguage) private var t
    private let state = NakatCapture.productState(for: "lesson")
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                NakatStatePanel(state: state)
                Text("Практика №14").textStyle(.largeTitle)
                Text("Сегодня · 18:30–20:00 · автодром").textStyle(.body).foregroundStyle(t.palette.textSecondary)
                HStack(spacing: 12) {
                    stat("90 мин", "занятие")
                    stat("3", "манёвра")
                    stat("714", "машина")
                }
                VStack(alignment: .leading, spacing: 13) {
                    Text("План занятия").textStyle(.section)
                    task("Параллельная парковка", true)
                    task("Разворот в три приёма", false)
                    task("Заезд в бокс", false)
                }.padding(18).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 20))
                NativeStatePanel(kind: .warning, title: "Точка посадки изменилась", detail: "Инструктор ждёт у восточных ворот. Маршрут сохранён в карточке занятия.")
                NativeContractActionControl(surfaceID: "lesson", title: "Связаться с инструктором")
                NativeCapabilityControls(surfaceID: "lesson")
            }.padding(16)
        }.background(t.palette.groupedBackground).navigationTitle("Занятие").navigationBarTitleDisplayMode(.inline).nativeSurface("lesson")
    }
    private func stat(_ value: String, _ title: String) -> some View {
        VStack(spacing: 4) { Text(value).textStyle(.cardTitle); Text(title).textStyle(.meta) }
            .frame(maxWidth: .infinity, minHeight: 72).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 16))
    }
    private func task(_ title: String, _ done: Bool) -> some View {
        Label(title, systemImage: done ? "checkmark.circle.fill" : "circle").textStyle(.body).foregroundStyle(done ? t.palette.positive : t.palette.textPrimary)
    }
}

struct NakatTheory: View {
    @Environment(\.visualLanguage) private var t
    private let state = NakatCapture.productState(for: "theory")
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                NakatStatePanel(state: state)
                Text("Теория").textStyle(.largeTitle)
                Text("Не каталог билетов, а ошибки, которые мешают следующему шагу").textStyle(.body).foregroundStyle(t.palette.textSecondary)
                VStack(alignment: .leading, spacing: 14) {
                    HStack {
                        Text("3 ошибки требуют разбора").textStyle(.cardTitle)
                        Spacer(); Text("сегодня").textStyle(.meta)
                    }
                    NakatErrorRow(number: "12", title: "Приоритет на перекрёстке", duration: "4 мин")
                    NakatErrorRow(number: "7", title: "Остановка у перехода", duration: "3 мин")
                    NakatErrorRow(number: "31", title: "Сигналы регулировщика", duration: "6 мин")
                    NativeContractActionControl(surfaceID: "theory", title: "Разобрать первую ошибку")
                }.padding(18).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 20))
                NativeCapabilityControls(surfaceID: "theory")
            }.padding(16)
        }.background(t.palette.groupedBackground).nativeSurface("theory")
    }
}

private struct NakatErrorRow: View {
    let number: String, title: String, duration: String
    @Environment(\.visualLanguage) private var t
    var body: some View {
        HStack(spacing: 12) {
            Text(number).textStyle(.cardTitle).foregroundStyle(t.palette.accent).frame(width: 38, height: 38).background(t.palette.accent.opacity(0.1), in: RoundedRectangle(cornerRadius: 10))
            VStack(alignment: .leading, spacing: 2) { Text(title).textStyle(.name); Text(duration + " · аудио и схема").textStyle(.meta) }
            Spacer(); Image(systemName: "play.circle.fill").foregroundStyle(t.palette.accent)
        }
    }
}

struct NakatTicket: View {
    @Environment(\.visualLanguage) private var t
    @State private var answer: Int?
    private let state = NakatCapture.productState(for: "ticket")
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                NakatStatePanel(state: state)
                HStack { Text("Билет 12").textStyle(.largeTitle); Spacer(); Text("ошибка вчера").textStyle(.meta) }
                ZStack {
                    RoundedRectangle(cornerRadius: 20).fill(t.palette.accent.opacity(0.1)).frame(height: 190)
                    VStack(spacing: 14) {
                        Image(systemName: "arrow.triangle.branch").font(.largeTitle).foregroundStyle(t.palette.accent)
                        Text("Нерегулируемый перекрёсток").textStyle(.cardTitle)
                    }
                }
                Text("Кто должен уступить при одновременном повороте налево?").textStyle(.section)
                ForEach(0..<3) { index in
                    Button { answer = index } label: {
                        HStack {
                            Text(["Синий автомобиль", "Красный автомобиль", "Оба могут ехать"][index]).textStyle(.body)
                            Spacer()
                            Image(systemName: answer == index ? "checkmark.circle.fill" : "circle")
                        }.padding(16).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 15))
                    }.buttonStyle(.plain)
                }
                NativeContractActionControl(surfaceID: "ticket", title: "Слушать разбор")
                NativeCapabilityControls(surfaceID: "ticket")
            }.padding(16)
        }.background(t.palette.groupedBackground).navigationTitle("Ошибка билета").navigationBarTitleDisplayMode(.inline).nativeSurface("ticket")
    }
}

struct NakatDrive: View {
    @Environment(\.visualLanguage) private var t
    private let state = NakatCapture.productState(for: "drive")
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                NakatStatePanel(state: state)
                Text("После занятия").textStyle(.largeTitle)
                Text("Зафиксируйте одну ошибку, пока она не стёрлась из памяти").textStyle(.body).foregroundStyle(t.palette.textSecondary)
                NativeStatePanel(kind: .success, title: "Занятие завершено", detail: "90 минут добавлены в курс. Следующий слот — суббота, 10:00.")
                VStack(alignment: .leading, spacing: 12) {
                    Label("Поздно посмотрел в зеркало перед перестроением", systemImage: "waveform").textStyle(.cardTitle)
                    Text("00:38 · распознано на устройстве").textStyle(.meta)
                }.padding(18).background(t.palette.surface, in: RoundedRectangle(cornerRadius: 20))
                NativeContractActionControl(surfaceID: "drive", title: "Сохранить разбор")
                NativeCapabilityControls(surfaceID: "drive")
            }.padding(16)
        }.background(t.palette.groupedBackground).navigationTitle("Разбор практики").navigationBarTitleDisplayMode(.inline).nativeSurface("drive")
    }
}

struct NakatMenu: View {
    @Environment(\.visualLanguage) private var t
    var body: some View {
        List {
            Section {
                Label("Документы курса", systemImage: "doc.text")
                Label("Связь с автошколой", systemImage: "message")
                Label("Безопасность", systemImage: "lock")
            }
            NativeContractActionControl(surfaceID: "menu", title: "Открыть уведомления", compact: true)
            NativeCapabilityControls(surfaceID: "menu")
        }.navigationTitle("Ещё").nativeSurface("menu")
    }
}
