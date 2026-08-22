import SwiftUI

// Продуктовые layout'ы. concept.json описывает КОНТЕНТ экрана (данные + тип раскладки),
// генератор строит из него эти вьюхи. Плейсхолдер остаётся только там, где в жизни фото.

// MARK: - Данные (эмитятся генератором из concept.json)

struct MediaItem: Identifiable, Sendable {
    let id = UUID()
    let title: String
    let subtitle: String
    var trailing: String? = nil
    var progress: Double? = nil       // 0…1 — прогресс просмотра
    var download: DownloadRow.State? = nil
    var thumb: Bool = true            // миниатюра-плейсхолдер
    var opens: String? = nil          // id экрана, куда ведёт строка
}

struct CatalogSection: Identifiable, Sendable {
    let id = UUID()
    let title: String
    let items: [MediaItem]
}

struct CatalogData: Sendable {
    var hero: HomeHero? = nil
    let sections: [CatalogSection]
}

// Домашний экран ведёт активной сессией, а не голым списком: продукт — hands-free
// инструмент одного занятия, поэтому первым идёт «продолжить», а каталог — под ним.
struct HomeHero: Sendable {
    let project: String
    let lesson: String
    let lessonMeta: String     // «Урок 4 из 9»
    let currentRow: Int
    let goal: String           // «до убавки — 17 рядов»
    let opens: String          // экран кокпита
}

struct PlayerData: Sendable {
    let title: String
    let author: String
    let timeElapsed: String
    let timeTotal: String
    let progress: Double
    let rowLabel: String       // «Ряд 47»
    let schemaCaption: String  // подпись к схеме под видео
}

struct CounterData: Sendable {
    let current: Int
    let goal: String           // «до убавки — 17 рядов»
    let project: String
    let stats: [Stat]
    struct Stat: Identifiable, Sendable { let id = UUID(); let value: String; let label: String }
}

struct SettingsData: Sendable {
    var headerTitle: String? = nil
    var headerSubtitle: String? = nil
    let groups: [Group]
    struct Group: Identifiable, Sendable {
        let id = UUID(); let header: String; var footer: String? = nil; let rows: [Row]
    }
    struct Row: Identifiable, Sendable {
        let id = UUID()
        let title: String
        var subtitle: String? = nil
        var value: String? = nil
        var icon: String? = nil
        var toggle: Bool = false
        var permission: PermissionKey? = nil  // включение свитча запрашивает доступ
        var opens: String? = nil              // переход на экран по тапу
        var chevron: Bool = false
    }
}

// MARK: - Каталог (список курсов с реальными состояниями)

struct CatalogView: View {
    let data: CatalogData
    @Environment(Router.self) private var router
    @Environment(\.appSpec) private var app
    var body: some View {
        List {
            if let hero = data.hero {
                Section {
                    HeroContinueCard(hero: hero) {
                        if let s = app?.screen(hero.opens) { router.open(s) }
                    }
                    .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
                }
            }
            ForEach(data.sections) { section in
                Section {
                    ForEach(section.items) { item in
                        Button {
                            if let dest = item.opens, let s = app?.screen(dest) { router.open(s) }
                        } label: {
                            MediaRow(item: item)
                        }
                        .buttonStyle(.plain)
                        .disabled(item.opens == nil)
                    }
                } header: {
                    Text(section.title).textCase(nil)
                }
            }
        }
        .listStyle(.insetGrouped)
    }
}

// Большая glanceable-карта продолжения: проект, текущий ряд крупно, один тап — в кокпит.
struct HeroContinueCard: View {
    let hero: HomeHero
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 3) {
                    Text(hero.project).font(.headline).foregroundStyle(.white)
                    Text("\(hero.lessonMeta) · \(hero.lesson)")
                        .font(.subheadline).foregroundStyle(.white.opacity(0.75))
                }
                HStack(alignment: .lastTextBaseline, spacing: 8) {
                    Text("\(hero.currentRow)")
                        .font(.system(size: 68, weight: .bold, design: .rounded)).monospacedDigit()
                        .foregroundStyle(.white)
                    Text(hero.goal)
                        .font(.subheadline).foregroundStyle(.white.opacity(0.85))
                        .padding(.bottom, 8)
                }
                HStack(spacing: 8) {
                    Image(systemName: "play.fill").font(.footnote.weight(.bold))
                    Text("Продолжить урок").font(.subheadline.weight(.semibold))
                }
                .foregroundStyle(Color.accentColor)
                .frame(maxWidth: .infinity).frame(height: 46)
                .background(.white, in: Capsule())
            }
            .padding(18)
            .background(
                LinearGradient(colors: [Color.accentColor, Color.accentColor.opacity(0.82)],
                               startPoint: .topLeading, endPoint: .bottomTrailing),
                in: RoundedRectangle(cornerRadius: 22, style: .continuous)
            )
        }
        .buttonStyle(.plain)
    }
}

struct MediaRow: View {
    let item: MediaItem
    var body: some View {
        HStack(spacing: 12) {
            if item.thumb {
                PatternTile(seed: item.title.unicodeScalars.reduce(0) { $0 &+ Int($1.value) })
                    .frame(width: 76, height: 52)
                    .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
                    .overlay {
                        if item.progress != nil {
                            Image(systemName: "play.fill")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundStyle(.white)
                                .padding(6)
                                .background(.black.opacity(0.35), in: Circle())
                        }
                    }
            }
            VStack(alignment: .leading, spacing: 3) {
                Text(item.title).font(.body).lineLimit(1)
                Text(item.subtitle).font(.footnote).foregroundStyle(.secondary).lineLimit(1)
                if let p = item.progress {
                    ProgressView(value: p).tint(Color.accentColor).scaleEffect(x: 1, y: 0.7).padding(.top, 2)
                }
            }
            Spacer(minLength: 6)
            switch item.download {
            case .ready?: Image(systemName: "checkmark.circle.fill").foregroundStyle(.secondary)
            case .busy(let p)?: CircularProgress(value: p)
            case .none(let size)?: VStack(spacing: 2) {
                Image(systemName: "arrow.down.circle").foregroundStyle(Color.accentColor)
                Text(size).font(.caption2).foregroundStyle(.secondary)
            }
            case nil: Image(systemName: "chevron.right").font(.caption.weight(.semibold)).foregroundStyle(Color(.tertiaryLabel))
            }
        }
        .padding(.vertical, 4)
    }
}

private struct CircularProgress: View {
    let value: Double
    var body: some View {
        ZStack {
            Circle().stroke(Color(.systemGray4), lineWidth: 3)
            Circle().trim(from: 0, to: value).stroke(Color.accentColor, style: .init(lineWidth: 3, lineCap: .round)).rotationEffect(.degrees(-90))
            Image(systemName: "stop.fill").font(.system(size: 8)).foregroundStyle(.secondary)
        }.frame(width: 26, height: 26)
    }
}

// MARK: - Плеер урока (тёмный экран, транспорт, схема под видео)

struct PlayerView: View {
    let screenId: String
    let data: PlayerData
    @Environment(\.appSpec) private var app
    @Environment(Router.self) private var router

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                ZStack {
                    Placeholder(height: 220, onDark: true)
                    Image(systemName: "play.circle.fill")
                        .font(.system(size: 56)).foregroundStyle(.white.opacity(0.9))
                }
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))

                VStack(alignment: .leading, spacing: 4) {
                    Text(data.title).font(.title3.bold()).foregroundStyle(.white)
                    Text(data.author).font(.subheadline).foregroundStyle(.white.opacity(0.6))
                }

                VStack(spacing: 6) {
                    ProgressView(value: data.progress).tint(.white)
                    HStack {
                        Text(data.timeElapsed); Spacer(); Text(data.timeTotal)
                    }.font(.caption).foregroundStyle(.white.opacity(0.6))
                }

                HStack(spacing: 28) {
                    Spacer()
                    Image(systemName: "gobackward.15")
                    Image(systemName: "pause.fill").font(.system(size: 34))
                    Image(systemName: "goforward.15")
                    Spacer()
                }.font(.system(size: 22)).foregroundStyle(.white)

                // Точки запроса доступов урока — как транспортные чипы, а не карточки-списки.
                let gates = app?.permissions(on: screenId) ?? []
                if !gates.isEmpty {
                    HStack(spacing: 10) {
                        ForEach(gates) { g in ChipGate(spec: g) }
                        Spacer()
                    }
                }

                // Схема под видео — второй слой того же экрана.
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text("Схема").font(.headline).foregroundStyle(.white)
                        Spacer()
                        Text(data.rowLabel)
                            .font(.subheadline.monospacedDigit().weight(.semibold))
                            .foregroundStyle(.black)
                            .padding(.horizontal, 12).padding(.vertical, 5)
                            .background(Color.accentColor, in: Capsule())
                    }
                    Text(data.schemaCaption).font(.footnote).foregroundStyle(.white.opacity(0.6))
                    Placeholder(height: 140, onDark: true)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
                .padding(.top, 4)
            }
            .padding(Grid.edge)
        }
        .background(Color.black.ignoresSafeArea())
        .toolbarColorScheme(.dark, for: .navigationBar)
    }
}

private struct ChipGate: View {
    let spec: PermissionSpec
    @Environment(Router.self) private var router
    @Environment(PermissionManager.self) private var perms
    @Environment(\.appSpec) private var app
    var body: some View {
        Button {
            Task {
                let ok = spec.activate ? true : await perms.request(spec.key)
                if !ok { router.toast(spec.snack, id: spec.key.rawValue) }
                if spec.target != spec.screen, let t = app?.screen(spec.target) { router.open(t) }
            }
        } label: {
            HStack(spacing: 6) {
                Image(systemName: icon)
                Text(shortLabel).lineLimit(1)
            }
            .font(.footnote.weight(.medium))
            .foregroundStyle(.white)
            .padding(.horizontal, 12).padding(.vertical, 9)
            .background(.white.opacity(0.14), in: Capsule())
        }
        .buttonStyle(.plain)
    }
    private var shortLabel: String { spec.gesture.replacingOccurrences(of: "«", with: "").replacingOccurrences(of: "»", with: "").components(separatedBy: " / ").first ?? spec.gesture }
    private var icon: String {
        switch spec.key {
        case .speech: return "waveform"; case .localnet: return "tv"; case .audio: return "speaker.wave.2"
        case .mic: return "mic"; case .camera: return "camera"; default: return "ellipsis"
        }
    }
}

// MARK: - Счётчик рядов (крупная цифра, голос, ±)

struct CounterView: View {
    let screenId: String
    let data: CounterData
    @Environment(\.appSpec) private var app
    @Environment(Router.self) private var router
    @Environment(PermissionManager.self) private var perms
    @State private var count: Int

    init(screenId: String, data: CounterData) {
        self.screenId = screenId; self.data = data; _count = State(initialValue: data.current)
    }

    var body: some View {
        VStack(spacing: 24) {
            Text(data.project).font(.footnote.weight(.semibold)).foregroundStyle(.secondary)

            Text("\(count)")
                .font(.system(size: 96, weight: .bold, design: .rounded)).monospacedDigit()
                .contentTransition(.numericText())
            Text(data.goal).font(.subheadline).foregroundStyle(.secondary)

            HStack(spacing: 40) {
                CircleButton(system: "minus") { withAnimation { count = max(0, count - 1) } }
                CircleButton(system: "plus") { withAnimation { count += 1 } }
            }

            if let voice = app?.permissions(on: screenId).first(where: { $0.key == .speech }) {
                Button {
                    Task {
                        let ok = await perms.request(.speech)
                        if !ok { router.toast(voice.snack, id: "speech") }
                    }
                } label: {
                    Label("Считать голосом", systemImage: "waveform")
                        .font(.body.weight(.semibold)).frame(maxWidth: .infinity).padding(.vertical, 6)
                }
                .buttonStyle(.borderedProminent).controlSize(.large)
                Text("Скажите «ряд» — прибавит, «сколько» — назовёт номер вслух. Распознавание идёт на устройстве")
                    .font(.caption).foregroundStyle(.secondary).multilineTextAlignment(.center)
            }

            HStack(spacing: 0) {
                ForEach(data.stats) { s in
                    VStack(spacing: 2) {
                        Text(s.value).font(.headline.monospacedDigit())
                        Text(s.label).font(.caption2).foregroundStyle(.secondary)
                    }.frame(maxWidth: .infinity)
                }
            }
            .padding(.top, 4)
            Spacer()
        }
        .padding(Grid.edge)
        .padding(.top, 12)
    }
}

private struct CircleButton: View {
    let system: String; let action: () -> Void
    var body: some View {
        Button(action: action) {
            Image(systemName: system).font(.system(size: 30, weight: .semibold))
                .frame(width: 76, height: 76)
                .background(Color(.secondarySystemBackground), in: Circle())
        }.buttonStyle(.plain)
    }
}

// MARK: - Настройки (реальная сгруппированная форма с рабочими свитчами)

struct SettingsView: View {
    let data: SettingsData
    @Environment(Router.self) private var router
    @Environment(PermissionManager.self) private var perms
    @Environment(\.appSpec) private var app
    @State private var toggles: [String: Bool] = [:]

    var body: some View {
        List {
            if let title = data.headerTitle {
                Section {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(title).font(.title2.bold())
                        if let s = data.headerSubtitle {
                            Text(s).font(.subheadline).foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 6)
                    .listRowBackground(Color.clear)
                }
            }
            ForEach(data.groups) { group in
                Section {
                    ForEach(group.rows) { row in rowView(row) }
                } header: { Text(group.header).textCase(nil) } footer: { if let f = group.footer { Text(f) } }
            }
        }
        .listStyle(.insetGrouped)
    }

    private func act(_ row: SettingsData.Row) {
        Task {
            if let key = row.permission, let g = app?.permissions.first(where: { $0.key == key }) {
                let ok = g.activate ? true : await perms.request(key)
                if !ok { router.toast(g.snack, id: key.rawValue) }
            }
            if let dest = row.opens, let s = app?.screen(dest) { router.open(s) }
        }
    }

    @ViewBuilder
    private func rowView(_ row: SettingsData.Row) -> some View {
        if row.toggle {
            Toggle(isOn: binding(for: row)) {
                Label { rowText(row) } icon: { icon(row) }
            }
        } else {
            Button { act(row) } label: {
                HStack(spacing: 12) {
                    icon(row)
                    rowText(row)
                    Spacer(minLength: 6)
                    if let v = row.value { Text(v).foregroundStyle(.secondary) }
                    if row.chevron { Image(systemName: "chevron.right").font(.caption.weight(.semibold)).foregroundStyle(Color(.tertiaryLabel)) }
                }
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .disabled(row.permission == nil && row.opens == nil)
        }
    }

    @ViewBuilder private func rowText(_ row: SettingsData.Row) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(row.title)
            if let s = row.subtitle { Text(s).font(.caption).foregroundStyle(.secondary) }
        }
    }

    @ViewBuilder private func icon(_ row: SettingsData.Row) -> some View {
        if let ic = row.icon {
            Image(systemName: ic).font(.system(size: 16, weight: .medium))
                .foregroundStyle(Color.accentColor).frame(width: 28)
        }
    }

    private func binding(for row: SettingsData.Row) -> Binding<Bool> {
        Binding(
            get: { toggles[row.id.uuidString] ?? false },
            set: { newValue in
                toggles[row.id.uuidString] = newValue
                if newValue, let key = row.permission, let g = app?.permissions.first(where: { $0.key == key }) {
                    Task {
                        let ok = g.activate ? true : await perms.request(key)
                        if !ok {
                            toggles[row.id.uuidString] = false
                            router.toast(g.snack, id: key.rawValue)
                        }
                    }
                }
            }
        )
    }
}

// MARK: - Кокпит урока (hands-free: телефон лежит, руки заняты спицами)

struct CockpitData: Sendable {
    let project: String
    let lessonTitle: String
    let lessonMeta: String     // «Урок 4 из 9»
    let current: Int
    let goal: String           // «до убавки — 17 рядов»
    let castTarget: String     // «Телевизор в гостиной»
    let schemaCaption: String
}

struct CockpitView: View {
    let screenId: String
    let data: CockpitData
    @Environment(\.appSpec) private var app
    @Environment(Router.self) private var router
    @Environment(PermissionManager.self) private var perms
    @State private var count: Int
    @State private var listening = false
    @State private var casting = false
    @State private var background = false

    init(screenId: String, data: CockpitData) {
        self.screenId = screenId; self.data = data; _count = State(initialValue: data.current)
    }

    private func gate(_ key: PermissionKey) -> PermissionSpec? {
        app?.permissions.first { $0.key == key }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 18) {
                // Урок: что идёт
                VStack(alignment: .leading, spacing: 3) {
                    Text(data.lessonMeta)
                        .font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                    Text(data.lessonTitle).font(.title2.bold())
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                // Как идёт урок, пока руки заняты: ТВ, фон, перемотка — крупные цели
                VStack(spacing: 14) {
                    HStack(spacing: 34) {
                        Image(systemName: "gobackward.15")
                        Image(systemName: "pause.circle.fill").font(.system(size: 52))
                        Image(systemName: "goforward.15")
                    }
                    .font(.system(size: 26))
                    .foregroundStyle(.primary)

                    HStack(spacing: 10) {
                        BigToggle(title: "На телевизор", systemImage: "tv", on: casting) {
                            Task {
                                if let g = gate(.localnet) {
                                    let ok = await perms.request(.localnet)
                                    if ok, let s = app?.screen(g.target) { casting = true; router.open(s) }
                                    else if !ok { router.toast(g.snack, id: "localnet") }
                                }
                            }
                        }
                        BigToggle(title: "Гасить экран", systemImage: "moon.fill", on: background) {
                            if let g = gate(.audio) { _ = g; background.toggle() }
                        }
                    }
                }
                .padding(16)
                .frame(maxWidth: .infinity)
                .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 18, style: .continuous))

                // Герой: счётчик ряда — крупно и издалека читаемо, голос как главный ввод
                VStack(spacing: 16) {
                    Text("текущий ряд").font(.caption.weight(.semibold)).foregroundStyle(.white.opacity(0.8))
                    Text("\(count)")
                        .font(.system(size: 108, weight: .heavy, design: .rounded)).monospacedDigit()
                        .foregroundStyle(.white).contentTransition(.numericText())
                    Text(data.goal).font(.callout).foregroundStyle(.white.opacity(0.85))

                    Button {
                        Task {
                            if let g = gate(.speech) {
                                let ok = await perms.request(.speech)
                                if ok { withAnimation { listening = true } }
                                else { router.toast(g.snack, id: "speech") }
                            }
                        }
                    } label: {
                        HStack(spacing: 10) {
                            Image(systemName: listening ? "waveform.circle.fill" : "mic.fill")
                            Text(listening ? "Слушаю — скажите «ряд»" : "Считать голосом")
                        }
                        .font(.headline)
                        .foregroundStyle(Color.accentColor)
                        .frame(maxWidth: .infinity).frame(height: 58)
                        .background(.white, in: Capsule())
                    }
                    .buttonStyle(.plain)

                    HStack(spacing: 16) {
                        CockpitStep(system: "minus") { withAnimation { count = max(0, count - 1) } }
                        CockpitStep(system: "plus") { withAnimation { count += 1 } }
                    }
                }
                .padding(22)
                .frame(maxWidth: .infinity)
                .background(
                    LinearGradient(colors: [Color.accentColor, Color.accentColor.opacity(0.85)],
                                   startPoint: .top, endPoint: .bottom),
                    in: RoundedRectangle(cornerRadius: 24, style: .continuous)
                )

                // Схема под видео — текущий ряд подсвечен
                VStack(alignment: .leading, spacing: 8) {
                    Text("Схема").font(.headline)
                    Text(data.schemaCaption).font(.footnote).foregroundStyle(.secondary)
                    ZStack(alignment: .leading) {
                        PatternTile(seed: 3)
                            .frame(height: 120)
                        // подсвеченная полоса текущего ряда
                        HStack {
                            Rectangle().fill(Color.accentColor.opacity(0.18)).frame(height: 26)
                            Text("ряд \(count)")
                                .font(.caption.weight(.semibold)).foregroundStyle(Color.accentColor)
                                .padding(.horizontal, 8).padding(.vertical, 3)
                                .background(.background, in: Capsule())
                                .padding(.trailing, 8)
                        }
                        .frame(height: 26)
                        .offset(y: 8)
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(Grid.edge)
        }
        .background(Color(.systemGroupedBackground))
    }
}

private struct BigToggle: View {
    let title: String; let systemImage: String; let on: Bool; let action: () -> Void
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: systemImage)
                Text(title).lineLimit(1).minimumScaleFactor(0.8)
            }
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(on ? Color.white : Color.primary)
            .frame(maxWidth: .infinity).frame(height: 48)
            .background(on ? AnyShapeStyle(Color.accentColor) : AnyShapeStyle(Color(.tertiarySystemGroupedBackground)),
                        in: Capsule())
        }
        .buttonStyle(.plain)
    }
}

private struct CockpitStep: View {
    let system: String; let action: () -> Void
    var body: some View {
        Button(action: action) {
            Image(systemName: system).font(.system(size: 26, weight: .bold))
                .foregroundStyle(.white)
                .frame(width: 64, height: 56)
                .background(.white.opacity(0.18), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Поиск в окружении (телевизор, магазины) — доступ уже выдан на прошлом шаге

struct FinderData: Sendable {
    let note: String
    let results: [Result]
    let actionLabel: String
    struct Result: Identifiable, Sendable {
        let id = UUID(); let title: String; let subtitle: String; var trailing: String? = nil
    }
}

struct FinderView: View {
    let data: FinderData
    @Environment(Router.self) private var router
    var body: some View {
        List {
            Section {
                ForEach(data.results) { r in
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(r.title)
                            Text(r.subtitle).font(.footnote).foregroundStyle(.secondary)
                        }
                        Spacer(minLength: 8)
                        if let t = r.trailing { Text(t).font(.footnote).foregroundStyle(.secondary) }
                        Text(data.actionLabel)
                            .font(.footnote.weight(.semibold)).foregroundStyle(Color.accentColor)
                    }
                    .padding(.vertical, 4)
                }
            } footer: {
                Text(data.note)
            }
        }
        .listStyle(.insetGrouped)
    }
}

// MARK: - Съёмка (свой ракурс, скан этикетки) — видоискатель и спуск

struct CaptureData: Sendable {
    let hint: String
    let shutter: String
    let scanFrame: Bool           // рамка сканирования вместо круглого спуска
    let permission: PermissionKey
    let manualScreen: String?     // экран ручного ввода при неудаче (для скана)
}

struct CaptureView: View {
    let data: CaptureData
    @Environment(\.appSpec) private var app
    @Environment(Router.self) private var router
    @Environment(PermissionManager.self) private var perms

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            Placeholder(height: 0, onDark: true)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .opacity(0.001)
            if data.scanFrame {
                RoundedRectangle(cornerRadius: 16).stroke(.white.opacity(0.9), lineWidth: 2)
                    .frame(width: 260, height: 150)
            }
            VStack {
                Text(data.hint)
                    .font(.subheadline).foregroundStyle(.white.opacity(0.9))
                    .padding(.horizontal, 20).padding(.vertical, 10)
                    .background(.black.opacity(0.35), in: Capsule())
                    .padding(.top, 12)
                Spacer()
                Button {
                    Task {
                        let ok = await perms.request(data.permission)
                        if !ok {
                            if let g = app?.permissions.first(where: { $0.key == data.permission }) {
                                router.toast(g.snack, id: data.permission.rawValue)
                            }
                        }
                    }
                } label: {
                    if data.scanFrame {
                        Text(data.shutter).font(.headline).foregroundStyle(.black)
                            .frame(maxWidth: .infinity).frame(height: 52)
                            .background(.white, in: Capsule()).padding(.horizontal, 40)
                    } else {
                        Circle().fill(.white).frame(width: 74, height: 74)
                            .overlay(Circle().stroke(.white.opacity(0.5), lineWidth: 4).frame(width: 86, height: 86))
                    }
                }
                .buttonStyle(.plain)
                .padding(.bottom, 40)

                if let manual = data.manualScreen {
                    Button("Ввести вручную") {
                        if let s = app?.screen(manual) { router.open(s) }
                    }
                    .font(.subheadline).foregroundStyle(.white)
                    .padding(.bottom, 24)
                }
            }
        }
    }
}

// MARK: - Экран-объяснение перед системным запросом (реклама/ATT)

struct NoticeData: Sendable {
    let icon: String
    let title: String
    let paragraphs: [String]
    let primary: String
    let primaryPermission: PermissionKey?
    let primaryTarget: String?
    let secondary: String
    let secondaryTarget: String?
}

struct NoticeView: View {
    let data: NoticeData
    @Environment(\.appSpec) private var app
    @Environment(Router.self) private var router
    @Environment(PermissionManager.self) private var perms

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Spacer().frame(height: 8)
            Image(systemName: data.icon)
                .font(.system(size: 40)).foregroundStyle(Color.accentColor)
            Text(data.title).font(.title.bold())
            ForEach(Array(data.paragraphs.enumerated()), id: \.offset) { _, p in
                Text(p).font(.body).foregroundStyle(.secondary)
            }
            Spacer()
            Button {
                Task {
                    if let key = data.primaryPermission { _ = await perms.request(key) }
                    if let t = data.primaryTarget, let s = app?.screen(t) { router.open(s) }
                    else { router.dismissPresented() }
                }
            } label: {
                Text(data.primary).frame(maxWidth: .infinity).padding(.vertical, 6)
            }
            .buttonStyle(.borderedProminent).controlSize(.large)

            Button(data.secondary) {
                if let t = data.secondaryTarget, let s = app?.screen(t) { router.open(s) }
                else { router.dismissPresented() }
            }
            .font(.subheadline).frame(maxWidth: .infinity)
        }
        .padding(Grid.edge)
    }
}
