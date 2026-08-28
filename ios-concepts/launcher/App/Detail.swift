import SwiftUI

// Один акцент на всё приложение (системный), без градиентов и разноцветного хрома.
// Цвет концепта живёт только точкой-меткой, чтобы список читался, а интерфейс не рябил.

struct ConceptDetail: View {
    let concept: Concept
    @Environment(Library.self) private var library
    @Environment(Runner.self) private var runner
    @State private var tab: Tab = .overview
    @State private var isExportingKit = false

    enum Tab: String, CaseIterable {
        case overview = "Обзор", permissions = "Доступы", screens = "Экраны"
        case docs = "Документы", files = "Файлы", log = "Журнал"
        var icon: String {
            switch self {
            case .overview: return "info.circle"
            case .permissions: return "lock.shield"
            case .screens: return "iphone"
            case .docs: return "doc.text"
            case .files: return "folder"
            case .log: return "terminal"
            }
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider()
            SegmentedTabs(selection: $tab)
            Divider()
            content
        }
        .background(.background)
    }

    // MARK: Шапка

    // Слева текстовая колонка, справа одна строка контролов одной высоты:
    // разной ширины блоки друг под другом давали лесенку у правого края.
    private static let controlHeight: CGFloat = 30
    private static let controlsWidth: CGFloat = 178

    private var header: some View {
        HStack(alignment: .top, spacing: 14) {
            ConceptBadge(concept: concept, size: 44, radius: 10)
                .padding(.top, 1)

            VStack(alignment: .leading, spacing: 6) {
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Text(concept.name).font(.system(size: 21, weight: .semibold))
                    Text(concept.slug).font(.system(size: 12, design: .monospaced))
                        .foregroundStyle(.tertiary)
                }
                Text(concept.tagline).font(.system(size: 12))
                    .foregroundStyle(.secondary).lineLimit(2)
                    .frame(maxWidth: 520, alignment: .leading)
                    .fixedSize(horizontal: false, vertical: true)
                HStack(spacing: 5) {
                    Chip(concept.modeTitle)
                    Chip(concept.targetSet)
                    Chip("\(concept.permissions.count) доступов")
                    if concept.hasNative { Chip("нативная сборка", strong: true) }
                }
                .padding(.top, 3)
            }

            Spacer(minLength: 20)
            runControls
        }
        .padding(.horizontal, 20)
        .padding(.top, 30)
        .padding(.bottom, 16)
    }

    private var runControls: some View {
        VStack(alignment: .leading, spacing: 7) {
            if concept.hasNative {
                Button { primaryAction() } label: {
                    HStack(spacing: 6) {
                        if runner.busySlug == concept.slug || isExportingKit {
                            ProgressView().controlSize(.small).scaleEffect(0.6).frame(width: 12)
                        } else {
                            Image(systemName: LauncherDistribution.canRunToolchain ? "play.fill" : "hammer.fill")
                                .font(.system(size: 10, weight: .bold))
                        }
                        Text(isExportingKit ? "Сохраняем…" : (runner.busySlug == concept.slug ? runner.stageTitle : primaryTitle))
                    }
                }
                .buttonStyle(PrimaryPill(height: Self.controlHeight))
                .disabled(runner.isBusy || isExportingKit)

                if LauncherDistribution.canRunToolchain {
                    Picker("", selection: Binding(get: { runner.device },
                                                  set: { runner.setDevice($0) })) {
                        ForEach(runner.devices, id: \.self) { Text($0).tag($0) }
                    }
                    .labelsHidden().controlSize(.small)
                }

                HStack(spacing: 6) {
                    if LauncherDistribution.isTestFlightCatalog {
                        MiniAction("Скачать kit", "arrow.down.circle", height: 26) { exportKit() }
                    } else {
                        MiniAction("Finder", "folder", height: 26) { reveal(concept.path) }
                        MiniAction("Xcode", "hammer", height: 26) { openXcode() }
                    }
                }
            } else {
                Text("Нативной сборки нет")
                    .font(.system(size: 12)).foregroundStyle(.tertiary)
                    .frame(maxWidth: .infinity, alignment: .trailing)
                MiniAction("Finder", "folder", height: 26) { reveal(concept.path) }
            }

            if runner.stage == .failed && runner.log.contains(concept.slug) {
                Text("Сборка упала — смотрите Журнал")
                    .font(.system(size: 11)).foregroundStyle(.orange)
                    .frame(maxWidth: .infinity, alignment: .trailing)
            }
        }
        .frame(width: Self.controlsWidth)
    }

    private func reveal(_ path: String) {
        NSWorkspace.shared.selectFile(nil, inFileViewerRootedAtPath: path)
    }
    private func openXcode() {
        if LauncherDistribution.isTestFlightCatalog {
            exportKit()
            return
        }
        let p = "\(library.rootPath)/platform/native-dist/\(concept.slug)/\(concept.slug).xcodeproj"
        if FileManager.default.fileExists(atPath: p) {
            NSWorkspace.shared.open(URL(fileURLWithPath: p))
        }
    }
    private var primaryTitle: String {
        LauncherDistribution.canRunToolchain ? "Запустить" : "Открыть в Xcode"
    }
    private func primaryAction() {
        if LauncherDistribution.canRunToolchain { runner.run(concept, root: library.rootPath) }
        else { exportKit() }
    }
    private func exportKit() {
        guard !isExportingKit else { return }
        isExportingKit = true
        Task {
            defer { isExportingKit = false }
            if let root = await DeveloperKitExporter.exportKitAndOpen(
                concept: concept,
                currentRoot: library.rootPath
            ) {
                library.rootPath = root
            }
        }
    }

    @ViewBuilder private var content: some View {
        switch tab {
        case .overview: OverviewTab(concept: concept)
        case .permissions: PermissionsTab(concept: concept)
        case .screens: ScreensTab(concept: concept, root: library.rootPath)
        case .docs: DocsTab(concept: concept)
        case .files: ProjectFilesTab(concept: concept, root: library.rootPath)
        case .log: LogTab()
        }
    }
}

// MARK: - Мелкие элементы

struct Chip: View {
    let text: String
    var strong: Bool = false
    init(_ text: String, strong: Bool = false) { self.text = text; self.strong = strong }
    var body: some View {
        Text(text)
            .font(.system(size: 11, weight: strong ? .medium : .regular))
            .foregroundStyle(strong ? AnyShapeStyle(.tint) : AnyShapeStyle(.secondary))
            .padding(.horizontal, 7).padding(.vertical, 2)
            .background(.quaternary.opacity(0.45), in: RoundedRectangle(cornerRadius: 5))
            .fixedSize()
    }
}

/// Основное действие: белая скруглённая капсула с чёрной надписью.
/// В светлой теме инвертируется — белое на белом не читалось бы.
private struct PrimaryPill: ButtonStyle {
    var height: CGFloat = 30
    @Environment(\.colorScheme) private var scheme
    @Environment(\.isEnabled) private var enabled
    @State private var hover = false

    private var fill: Color { scheme == .dark ? .white : Color(white: 0.11) }
    private var ink: Color { scheme == .dark ? .black : .white }

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 13, weight: .semibold))
            .foregroundStyle(ink)
            .padding(.horizontal, 16)
            .frame(maxWidth: .infinity)
            .frame(height: height)
            .background(
                Capsule().fill(fill.opacity(configuration.isPressed ? 0.78 : (hover ? 1 : 0.93)))
            )
            .opacity(enabled ? 1 : 0.45)
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(.easeOut(duration: 0.13), value: configuration.isPressed)
            .animation(.easeOut(duration: 0.13), value: hover)
            .onHover { hover = $0 }
    }
}

private struct MiniAction: View {
    let title: String, icon: String, height: CGFloat, action: () -> Void
    @State private var hover = false
    init(_ t: String, _ i: String, height: CGFloat = 30, action: @escaping () -> Void) {
        title = t; icon = i; self.height = height; self.action = action
    }
    var body: some View {
        Button(action: action) {
            HStack(spacing: 5) {
                Image(systemName: icon).font(.system(size: 11))
                Text(title).font(.system(size: 12))
            }
            .foregroundStyle(hover ? AnyShapeStyle(.primary) : AnyShapeStyle(.secondary))
            .padding(.horizontal, 11)
            .frame(maxWidth: .infinity)
            .frame(height: height)
            .background(.quaternary.opacity(hover ? 0.55 : 0.35), in: Capsule())
            .contentShape(Capsule())
        }
        .buttonStyle(.plain)
        .animation(.easeOut(duration: 0.12), value: hover)
        .onHover { hover = $0 }
    }
}

private struct SegmentedTabs: View {
    @Binding var selection: ConceptDetail.Tab
    var body: some View {
        HStack(spacing: 1) {
            ForEach(ConceptDetail.Tab.allCases, id: \.self) { t in
                Button { selection = t } label: {
                    HStack(spacing: 5) {
                        Image(systemName: t.icon).font(.system(size: 11))
                        Text(t.rawValue).font(.system(size: 12, weight: .medium))
                    }
                    .foregroundStyle(selection == t ? AnyShapeStyle(.primary) : AnyShapeStyle(.secondary))
                    .padding(.horizontal, 11).padding(.vertical, 5)
                    .background {
                        if selection == t {
                            RoundedRectangle(cornerRadius: 6).fill(.quaternary.opacity(0.7))
                        }
                    }
                }
                .buttonStyle(.plain)
            }
            Spacer()
        }
        .padding(.horizontal, 16).padding(.vertical, 7)
    }
}

// MARK: - Обзор

private struct OverviewTab: View {
    let concept: Concept
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                HStack(spacing: 8) {
                    Stat("\(concept.screens)", "экранов")
                    Stat("\(concept.permissions.count)", "доступов")
                    Stat("\(concept.docs.count)", "документов")
                    Stat(risky, "рискованных", warn: risky != "0")
                }
                Panel("Что это") {
                    Text(concept.tagline).font(.system(size: 13)).lineSpacing(3)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Panel("Режим позиционирования") {
                    Text(concept.isMimicry
                         ? "Мимикрия. С первого экрана читается как участник категории продукта-референса ВК: знакомые паттерны, но собственные отличия в модели контента."
                         : "Отстройка. Тот же целевой набор доступов, но собственная категорийная и интерфейсная гипотеза — референс не копируется.")
                        .font(.system(size: 13)).lineSpacing(3)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Panel("Целевой набор") {
                    FlowRow(spacing: 5) {
                        ForEach(concept.permissions) { p in
                            Text(p.key)
                                .font(.system(size: 11, design: .monospaced))
                                .padding(.horizontal, 6).padding(.vertical, 3)
                                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 5))
                                .fixedSize()
                        }
                    }
                }
                Panel("Где лежит") {
                    Text(concept.path).font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(.secondary).textSelection(.enabled)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(18)
        }
    }
    private var risky: String {
        "\(concept.permissions.filter { $0.risk != "low" }.count)"
    }
}

private struct Stat: View {
    let value: String, label: String
    var warn: Bool = false
    init(_ v: String, _ l: String, warn: Bool = false) { value = v; label = l; self.warn = warn }
    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(value).font(.system(size: 21, weight: .semibold))
                .foregroundStyle(warn ? AnyShapeStyle(.orange) : AnyShapeStyle(.primary))
            Text(label).font(.system(size: 11)).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 12).padding(.vertical, 10)
        .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 8))
    }
}

private struct Panel<C: View>: View {
    let title: String
    @ViewBuilder var content: C
    init(_ title: String, @ViewBuilder content: () -> C) { self.title = title; self.content = content() }
    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            Text(title).font(.system(size: 11, weight: .medium)).foregroundStyle(.secondary)
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(13)
        .background(.quaternary.opacity(0.22), in: RoundedRectangle(cornerRadius: 9))
    }
}

/// Перенос по элементам, а не по буквам внутри слова.
struct FlowRow: Layout {
    var spacing: CGFloat = 6
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxW = proposal.width ?? 400
        var x: CGFloat = 0, y: CGFloat = 0, rowH: CGFloat = 0
        for v in subviews {
            let s = v.sizeThatFits(.unspecified)
            if x + s.width > maxW, x > 0 { x = 0; y += rowH + spacing; rowH = 0 }
            x += s.width + spacing
            rowH = max(rowH, s.height)
        }
        return CGSize(width: maxW, height: y + rowH)
    }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX, y = bounds.minY, rowH: CGFloat = 0
        for v in subviews {
            let s = v.sizeThatFits(.unspecified)
            if x + s.width > bounds.maxX, x > bounds.minX { x = bounds.minX; y += rowH + spacing; rowH = 0 }
            v.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(s))
            x += s.width + spacing
            rowH = max(rowH, s.height)
        }
    }
}

// MARK: - Доступы

private struct PermissionsTab: View {
    let concept: Concept
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                ForEach(Array(concept.permissions.enumerated()), id: \.element.id) { i, p in
                    HStack(alignment: .top, spacing: 11) {
                        Image(systemName: icon(p.key))
                            .font(.system(size: 13)).foregroundStyle(.secondary)
                            .frame(width: 26, height: 26)
                            .background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 6))
                        VStack(alignment: .leading, spacing: 2) {
                            HStack(spacing: 6) {
                                Text(p.key).font(.system(size: 12, weight: .medium, design: .monospaced))
                                if p.risk != "low" {
                                    Text(p.risk).font(.system(size: 10, weight: .medium))
                                        .foregroundStyle(p.risk == "high" ? .red : .orange)
                                }
                            }
                            Text(p.feature).font(.system(size: 12)).foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                            Text(p.plist).font(.system(size: 10, design: .monospaced))
                                .foregroundStyle(.tertiary).lineLimit(1).truncationMode(.middle)
                        }
                        Spacer(minLength: 8)
                        Text(p.screen).font(.system(size: 11, design: .monospaced))
                            .foregroundStyle(.secondary).fixedSize()
                    }
                    .padding(.horizontal, 18).padding(.vertical, 9)
                    if i < concept.permissions.count - 1 { Divider().padding(.leading, 55) }
                }
            }
            .padding(.vertical, 4)
        }
    }
    private func icon(_ key: String) -> String {
        switch key {
        case "camera": return "camera"
        case "mic": return "mic"
        case "speech": return "waveform"
        case "photo", "photos": return "photo"
        case "location": return "location"
        case "push", "commnotif", "remotenotif": return "bell"
        case "tracking": return "hand.raised"
        case "contacts": return "person.2"
        case "calendar": return "calendar"
        case "faceid": return "faceid"
        case "voip": return "phone"
        case "audio": return "speaker.wave.2"
        case "localnet", "wifiinfo", "hotspot": return "wifi"
        case "keychain", "autofill": return "key"
        case "shareext": return "square.and.arrow.up"
        case "appgroups", "fetch": return "arrow.triangle.2.circlepath"
        default: return "lock"
        }
    }
}

// MARK: - Экраны

private struct ScreensTab: View {
    let concept: Concept
    let root: String
    @State private var zoomed: ShotURL?

    private var shots: [URL] {
        let dir = URL(fileURLWithPath: root)
            .appendingPathComponent("platform/native-dist/\(concept.slug)/screens")
        return ((try? FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)) ?? [])
            .filter { $0.pathExtension == "png" }
            .sorted { $0.lastPathComponent < $1.lastPathComponent }
    }

    var body: some View {
        if shots.isEmpty {
            Placeholder(icon: "photo.on.rectangle.angled", title: "Кадров ещё нет",
                        note: "Запустите концепт — снимки появятся после прогона")
        } else {
            ScrollView {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 14)], spacing: 14) {
                    ForEach(shots, id: \.self) { url in
                        Button { zoomed = ShotURL(url: url) } label: {
                            VStack(spacing: 5) {
                                if let img = NSImage(contentsOf: url) {
                                    Image(nsImage: img).resizable().scaledToFit()
                                        .clipShape(RoundedRectangle(cornerRadius: 9))
                                        .overlay(RoundedRectangle(cornerRadius: 9).stroke(.quaternary))
                                }
                                Text(url.deletingPathExtension().lastPathComponent)
                                    .font(.system(size: 11)).foregroundStyle(.secondary)
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(18)
            }
            .sheet(item: $zoomed) { s in
                VStack(spacing: 0) {
                    if let img = NSImage(contentsOf: s.url) {
                        Image(nsImage: img).resizable().scaledToFit().padding(18)
                    }
                    Button("Закрыть") { zoomed = nil }.padding(.bottom, 12)
                }
                .frame(width: 440, height: 880)
            }
        }
    }
}

struct ShotURL: Identifiable { let url: URL; var id: String { url.path } }

// MARK: - Документы

private struct DocsTab: View {
    let concept: Concept
    @State private var selectedID: DocFile.ID?
    @State private var source = ""
    @State private var isLoading = false

    private var selected: DocFile? {
        concept.docs.first { $0.id == selectedID }
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text("Документация для разработки")
                    .font(.system(size: 12, weight: .medium))
                Spacer()
                Button("Сохранить всю документацию") {
                    DeveloperKitExporter.exportDocumentation(for: concept)
                }
                .controlSize(.small)
            }
            .padding(.horizontal, 12).padding(.vertical, 8)
            Divider()
            HSplitView {
                List(concept.docs, selection: $selectedID) { doc in
                    Label(DocumentationIndex.title(for: doc.name), systemImage: "doc.text")
                        .font(.system(size: 12))
                        .tag(doc.id)
                }
                .listStyle(.sidebar)
                .frame(minWidth: 250, idealWidth: 290, maxWidth: 360)

                Group {
                    if isLoading {
                        ProgressView("Открываем документ…").controlSize(.small)
                    } else if selected != nil {
                        ScrollView {
                            MarkdownView(source: source)
                                .frame(maxWidth: 720, alignment: .leading)
                                .padding(22)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                    } else {
                        Placeholder(icon: "doc.text", title: "Выберите документ", note: nil)
                    }
                }
            }
        }
        .task(id: concept.id) {
            selectedID = concept.docs.first?.id
        }
        .task(id: selectedID) {
            guard let selected else { source = ""; return }
            isLoading = true
            source = await Task.detached(priority: .userInitiated) {
                (try? String(contentsOf: selected.url, encoding: .utf8)) ?? ""
            }.value
            isLoading = false
        }
    }
}

// MARK: - Журнал

private struct LogTab: View {
    @Environment(Runner.self) private var runner
    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                Text(runner.log.isEmpty ? "Журнал пуст — запустите концепт" : runner.log)
                    .font(.system(size: 11, design: .monospaced))
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(13).id("end")
            }
            .onChange(of: runner.log.count) { _, _ in proxy.scrollTo("end", anchor: .bottom) }
        }
        .background(.quaternary.opacity(0.15))
    }
}

struct Placeholder: View {
    let icon: String, title: String
    var note: String?
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon).font(.system(size: 32, weight: .thin)).foregroundStyle(.tertiary)
            Text(title).font(.system(size: 14, weight: .medium))
            if let note {
                Text(note).font(.system(size: 12)).foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Настройки

struct SettingsView: View {
    @Environment(Library.self) private var library
    @Environment(Runner.self) private var runner

    var body: some View {
        Form {
            Section("Библиотека") {
                HStack {
                    TextField("Путь к Camo", text: Binding(get: { library.rootPath },
                                                                set: { library.rootPath = $0 }))
                    Button("Выбрать…") { pick() }
                }
                Text("\(library.concepts.count) концептов · \(library.totalPermissions) доступов")
                    .font(.system(size: 11)).foregroundStyle(.secondary)
            }
            Section("Симулятор") {
                Picker("Устройство", selection: Binding(get: { runner.device },
                                                        set: { runner.setDevice($0) })) {
                    ForEach(runner.devices, id: \.self) { Text($0).tag($0) }
                }
                LabeledContent("node", value: Runner.nodePath ?? "не найден")
                    .font(.system(size: 11))
            }
            Section("Обновления") {
                Button("Проверить обновления…") { Updater.shared.checkForUpdates() }
                Text(Updater.shared.status).font(.system(size: 11)).foregroundStyle(.secondary)
            }
        }
        .formStyle(.grouped)
        .frame(width: 470, height: 340)
    }

    private func pick() {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        if panel.runModal() == .OK, let url = panel.url { library.rootPath = url.path }
    }
}
