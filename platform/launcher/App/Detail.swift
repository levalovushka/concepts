import SwiftUI

struct ConceptDetail: View {
    let concept: Concept
    @Environment(Library.self) private var library
    @Environment(Runner.self) private var runner
    @State private var tab: Tab = .overview

    enum Tab: String, CaseIterable {
        case overview = "Обзор", permissions = "Доступы", screens = "Экраны"
        case docs = "Документы", log = "Журнал"
        var icon: String {
            switch self {
            case .overview: return "square.text.square"
            case .permissions: return "lock.shield"
            case .screens: return "iphone"
            case .docs: return "doc.text"
            case .log: return "terminal"
            }
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            hero
            SegmentedTabs(selection: $tab, accent: concept.accent)
            Divider()
            content
        }
        .background(.background)
    }

    // MARK: шапка

    private var hero: some View {
        ZStack(alignment: .topLeading) {
            LinearGradient(colors: [concept.accent.opacity(0.22), .clear],
                           startPoint: .topLeading, endPoint: .bottom)
                .frame(height: 150)

            HStack(alignment: .top, spacing: 16) {
                ConceptBadge(concept: concept, size: 60, radius: 15)
                VStack(alignment: .leading, spacing: 6) {
                    Text(concept.name).font(.system(size: 26, weight: .bold))
                    Text(concept.tagline).font(.system(size: 13))
                        .foregroundStyle(.secondary).lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)
                    HStack(spacing: 6) {
                        Tag(text: concept.modeTitle,
                            tint: concept.isMimicry ? .purple : .teal,
                            icon: concept.isMimicry ? "square.on.square.dashed" : "sparkles")
                        Tag(text: concept.targetSet, tint: .secondary, icon: "key")
                        Tag(text: "\(concept.permissions.count) доступов", tint: .secondary, icon: "lock")
                        if concept.hasNative {
                            Tag(text: "нативная сборка", tint: .green, icon: "hammer")
                        }
                    }
                }
                Spacer(minLength: 12)
                runControls
            }
            .padding(.horizontal, 22)
            .padding(.top, 30)
            .padding(.bottom, 16)
        }
        .fixedSize(horizontal: false, vertical: true)
    }

    private var runControls: some View {
        VStack(alignment: .trailing, spacing: 7) {
            if !concept.hasNative {
                // честно: нативных исходников нет, собирать нечего
                VStack(alignment: .trailing, spacing: 4) {
                    Label("Нативной сборки нет", systemImage: "questionmark.folder")
                        .font(.system(size: 12, weight: .medium)).foregroundStyle(.secondary)
                    Text("Спека и документы доступны")
                        .font(.system(size: 11)).foregroundStyle(.tertiary)
                }
                .frame(width: 172, alignment: .trailing)
            } else {
            Button {
                runner.run(concept, root: library.rootPath)
            } label: {
                HStack(spacing: 6) {
                    if runner.busySlug == concept.slug {
                        ProgressView().controlSize(.small).scaleEffect(0.65).frame(width: 14)
                    } else {
                        Image(systemName: "play.fill").font(.system(size: 11))
                    }
                    Text(runner.busySlug == concept.slug ? runner.stageTitle : "Запустить")
                        .font(.system(size: 13, weight: .semibold))
                }
                .frame(width: 172, height: 30)
            }
            .buttonStyle(.borderedProminent)
            .tint(concept.accent)
            .disabled(runner.isBusy)

            Picker("", selection: Binding(get: { runner.device },
                                          set: { runner.setDevice($0) })) {
                ForEach(runner.devices, id: \.self) { Text($0).tag($0) }
            }
            .labelsHidden().frame(width: 172).controlSize(.small)

            if runner.stage == .failed {
                Label("Сборка упала — см. Журнал", systemImage: "exclamationmark.triangle.fill")
                    .font(.system(size: 11)).foregroundStyle(.orange)
            }
            }
        }
    }

    @ViewBuilder private var content: some View {
        switch tab {
        case .overview: OverviewTab(concept: concept)
        case .permissions: PermissionsTab(concept: concept)
        case .screens: ScreensTab(concept: concept, root: library.rootPath)
        case .docs: DocsTab(concept: concept)
        case .log: LogTab()
        }
    }
}

// MARK: - Табы

private struct SegmentedTabs: View {
    @Binding var selection: ConceptDetail.Tab
    let accent: Color
    @Namespace private var ns

    var body: some View {
        HStack(spacing: 2) {
            ForEach(ConceptDetail.Tab.allCases, id: \.self) { t in
                Button {
                    withAnimation(.spring(response: 0.25, dampingFraction: 0.85)) { selection = t }
                } label: {
                    HStack(spacing: 5) {
                        Image(systemName: t.icon).font(.system(size: 11))
                        Text(t.rawValue).font(.system(size: 12, weight: .medium))
                    }
                    .foregroundStyle(selection == t ? AnyShapeStyle(accent) : AnyShapeStyle(.secondary))
                    .padding(.horizontal, 12).padding(.vertical, 6)
                    .background {
                        if selection == t {
                            RoundedRectangle(cornerRadius: 7, style: .continuous)
                                .fill(accent.opacity(0.14))
                                .matchedGeometryEffect(id: "tab", in: ns)
                        }
                    }
                }
                .buttonStyle(.plain)
            }
            Spacer()
        }
        .padding(.horizontal, 18).padding(.vertical, 8)
    }
}

struct Tag: View {
    let text: String
    let tint: Color
    var icon: String? = nil
    var body: some View {
        HStack(spacing: 4) {
            if let icon { Image(systemName: icon).font(.system(size: 9, weight: .medium)) }
            Text(text).font(.system(size: 11, weight: .medium))
        }
        .padding(.horizontal, 8).padding(.vertical, 3)
        .background(tint.opacity(0.14), in: Capsule())
        .foregroundStyle(tint)
        .lineLimit(1)
    }
}

// MARK: - Обзор

private struct OverviewTab: View {
    let concept: Concept
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                HStack(spacing: 10) {
                    Stat(value: "\(concept.screens)", label: "экранов", icon: "iphone", tint: concept.accent)
                    Stat(value: "\(concept.permissions.count)", label: "доступов", icon: "lock.shield", tint: .orange)
                    Stat(value: "\(concept.docs.count)", label: "документов", icon: "doc.text", tint: .blue)
                    Stat(value: highRisk, label: "рискованных", icon: "exclamationmark.triangle",
                         tint: highRisk == "0" ? .green : .red)
                }
                Panel(title: "Что это", icon: "text.alignleft") {
                    Text(concept.tagline).font(.system(size: 13)).lineSpacing(3)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Panel(title: "Режим позиционирования", icon: concept.isMimicry ? "square.on.square.dashed" : "sparkles") {
                    Text(concept.isMimicry
                         ? "Мимикрия. Приложение с первого экрана читается как участник категории продукта-референса ВК: сохраняет знакомые паттерны, но имеет собственные отличия в модели контента."
                         : "Отстройка. Тот же целевой набор доступов, но собственная категорийная и интерфейсная гипотеза — референс не копируется.")
                        .font(.system(size: 13)).lineSpacing(3)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Panel(title: "Целевой набор", icon: "key") {
                    HStack(spacing: 6) {
                        ForEach(concept.permissions.prefix(12)) { p in
                            Text(p.key).font(.system(size: 11, design: .monospaced))
                                .padding(.horizontal, 7).padding(.vertical, 3)
                                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 5))
                        }
                        if concept.permissions.count > 12 {
                            Text("+\(concept.permissions.count - 12)")
                                .font(.system(size: 11)).foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .padding(20)
        }
    }
    private var highRisk: String {
        "\(concept.permissions.filter { $0.risk == "high" || $0.risk == "medium" }.count)"
    }
}

private struct Stat: View {
    let value: String, label: String, icon: String, tint: Color
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Image(systemName: icon).font(.system(size: 13, weight: .medium)).foregroundStyle(tint)
            Text(value).font(.system(size: 22, weight: .semibold))
            Text(label).font(.system(size: 11)).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(.quaternary.opacity(0.35), in: RoundedRectangle(cornerRadius: 10))
    }
}

private struct Panel<C: View>: View {
    let title: String, icon: String
    @ViewBuilder var content: C
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label(title, systemImage: icon)
                .font(.system(size: 11, weight: .medium)).foregroundStyle(.secondary)
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(.quaternary.opacity(0.25), in: RoundedRectangle(cornerRadius: 10))
    }
}

// MARK: - Доступы

private struct PermissionsTab: View {
    let concept: Concept
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                ForEach(Array(concept.permissions.enumerated()), id: \.element.id) { i, p in
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: icon(p.key))
                            .font(.system(size: 14)).foregroundStyle(concept.accent)
                            .frame(width: 30, height: 30)
                            .background(concept.accent.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))
                        VStack(alignment: .leading, spacing: 3) {
                            HStack(spacing: 7) {
                                Text(p.key).font(.system(size: 13, weight: .semibold, design: .monospaced))
                                if p.risk != "low" {
                                    Tag(text: p.risk, tint: p.risk == "high" ? .red : .orange)
                                }
                            }
                            Text(p.feature).font(.system(size: 12)).foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                            Text(p.plist).font(.system(size: 10, design: .monospaced))
                                .foregroundStyle(.tertiary).lineLimit(1)
                        }
                        Spacer(minLength: 8)
                        Text(p.screen).font(.system(size: 11, design: .monospaced))
                            .foregroundStyle(.secondary)
                            .padding(.horizontal, 7).padding(.vertical, 3)
                            .background(.quaternary.opacity(0.45), in: Capsule())
                    }
                    .padding(.horizontal, 20).padding(.vertical, 11)
                    if i < concept.permissions.count - 1 {
                        Divider().padding(.leading, 62)
                    }
                }
            }
            .padding(.vertical, 6)
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
    @State private var zoomed: URL?

    private var shots: [URL] {
        let dir = URL(fileURLWithPath: root)
            .appendingPathComponent("native/build/\(concept.slug)/shots")
        return ((try? FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)) ?? [])
            .filter { $0.pathExtension == "png" }
            .sorted { $0.lastPathComponent < $1.lastPathComponent }
    }

    var body: some View {
        if shots.isEmpty {
            VStack(spacing: 10) {
                Image(systemName: "photo.on.rectangle.angled")
                    .font(.system(size: 38, weight: .thin)).foregroundStyle(.tertiary)
                Text("Кадров ещё нет").font(.system(size: 15, weight: .medium))
                Text("Запустите концепт — снимки появятся после прогона")
                    .font(.system(size: 12)).foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            ScrollView {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 158), spacing: 16)], spacing: 16) {
                    ForEach(shots, id: \.self) { url in
                        Button { zoomed = url } label: {
                            VStack(spacing: 6) {
                                if let img = NSImage(contentsOf: url) {
                                    Image(nsImage: img).resizable().scaledToFit()
                                        .clipShape(RoundedRectangle(cornerRadius: 12))
                                        .overlay(RoundedRectangle(cornerRadius: 12)
                                            .stroke(.quaternary, lineWidth: 1))
                                        .shadow(color: .black.opacity(0.14), radius: 6, y: 3)
                                }
                                Text(url.deletingPathExtension().lastPathComponent)
                                    .font(.system(size: 11)).foregroundStyle(.secondary)
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(20)
            }
            .sheet(item: Binding(get: { zoomed.map { ShotURL(url: $0) } },
                                 set: { zoomed = $0?.url })) { s in
                VStack(spacing: 0) {
                    if let img = NSImage(contentsOf: s.url) {
                        Image(nsImage: img).resizable().scaledToFit().padding(20)
                    }
                    Button("Закрыть") { zoomed = nil }.padding(.bottom, 14)
                }
                .frame(width: 460, height: 900)
            }
        }
    }
}

private struct ShotURL: Identifiable { let url: URL; var id: String { url.path } }

// MARK: - Документы

private struct DocsTab: View {
    let concept: Concept
    @State private var selected: DocFile?

    var body: some View {
        HSplitView {
            List(concept.docs, selection: Binding(
                get: { selected?.id },
                set: { id in selected = concept.docs.first { $0.id == id } })
            ) { d in
                Label(prettyName(d.name), systemImage: "doc.text")
                    .font(.system(size: 12)).tag(d.id)
            }
            .listStyle(.sidebar)
            .frame(minWidth: 196, idealWidth: 210, maxWidth: 260)

            Group {
                if let doc = selected, let text = try? String(contentsOf: doc.url, encoding: .utf8) {
                    ScrollView {
                        MarkdownView(source: text)
                            .textSelection(.enabled)
                            .frame(maxWidth: 760, alignment: .leading)
                            .padding(24)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                } else {
                    VStack(spacing: 8) {
                        Image(systemName: "doc.text").font(.system(size: 34, weight: .thin))
                            .foregroundStyle(.tertiary)
                        Text("Выберите документ").font(.system(size: 13)).foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
        }
        .onAppear { if selected == nil { selected = concept.docs.first } }
    }

    /// «01-product-vision» → «Product vision»
    private func prettyName(_ s: String) -> String {
        let parts = s.split(separator: "-").dropFirst()
        let text = parts.joined(separator: " ")
        return text.isEmpty ? s : text.prefix(1).uppercased() + text.dropFirst()
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
                    .padding(14)
                    .id("end")
            }
            .onChange(of: runner.log.count) { _, _ in proxy.scrollTo("end", anchor: .bottom) }
        }
        .background(.quaternary.opacity(0.18))
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
                    TextField("Путь к platform/", text: Binding(get: { library.rootPath },
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
            }
            Section("Обновления") {
                Button("Проверить обновления…") { Updater.shared.checkForUpdates() }
                Text(Updater.shared.status).font(.system(size: 11)).foregroundStyle(.secondary)
            }
        }
        .formStyle(.grouped)
        .frame(width: 470, height: 330)
    }

    private func pick() {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        if panel.runModal() == .OK, let url = panel.url { library.rootPath = url.path }
    }
}
