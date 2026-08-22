import SwiftUI

struct ConceptDetail: View {
    let concept: Concept
    @Environment(Library.self) private var library
    @Environment(Runner.self) private var runner
    @State private var tab = 0

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider()
            Picker("", selection: $tab) {
                Text("Обзор").tag(0)
                Text("Доступы").tag(1)
                Text("Экраны").tag(2)
                Text("Документы").tag(3)
                Text("Журнал").tag(4)
            }
            .pickerStyle(.segmented)
            .labelsHidden()
            .padding(12)

            Divider()
            Group {
                switch tab {
                case 0: OverviewTab(concept: concept)
                case 1: PermissionsTab(concept: concept)
                case 2: ScreensTab(concept: concept, root: library.rootPath)
                case 3: DocsTab(concept: concept)
                default: LogTab()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .navigationTitle(concept.name)
    }

    private var header: some View {
        HStack(spacing: 14) {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(concept.accent).frame(width: 52, height: 52)
                .overlay(Text(String(concept.name.prefix(1)))
                    .font(.system(size: 24, weight: .bold)).foregroundStyle(.white))
            VStack(alignment: .leading, spacing: 3) {
                Text(concept.name).font(.system(size: 20, weight: .semibold))
                Text(concept.tagline).font(.system(size: 12))
                    .foregroundStyle(.secondary).lineLimit(2)
                HStack(spacing: 6) {
                    Tag(text: concept.modeTitle, tint: concept.isMimicry ? .purple : .teal)
                    Tag(text: concept.targetSet, tint: .gray)
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 6) {
                Button {
                    runner.run(concept, root: library.rootPath)
                } label: {
                    Label(runner.busySlug == concept.slug ? runner.stageTitle : "Запустить",
                          systemImage: runner.busySlug == concept.slug ? "hourglass" : "play.fill")
                        .frame(width: 168)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .disabled(runner.isBusy)

                Picker("", selection: Binding(get: { runner.device },
                                              set: { runner.setDevice($0) })) {
                    ForEach(runner.devices, id: \.self) { Text($0).tag($0) }
                }
                .labelsHidden().frame(width: 168)
            }
        }
        .padding(16)
    }
}

struct Tag: View {
    let text: String; let tint: Color
    var body: some View {
        Text(text).font(.system(size: 10, weight: .medium))
            .padding(.horizontal, 7).padding(.vertical, 2)
            .background(tint.opacity(0.16), in: Capsule())
            .foregroundStyle(tint)
    }
}

// MARK: - Обзор

private struct OverviewTab: View {
    let concept: Concept
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                StatRow(items: [("Экранов", "\(concept.screens)"),
                                ("Доступов", "\(concept.permissions.count)"),
                                ("Документов", "\(concept.docs.count)"),
                                ("Набор", concept.targetSet)])
                GroupBox("Что это") {
                    Text(concept.tagline).font(.system(size: 13))
                        .frame(maxWidth: .infinity, alignment: .leading).padding(4)
                }
                GroupBox("Режим позиционирования") {
                    Text(concept.isMimicry
                         ? "Мимикрия: приложение с первого экрана читается как участник категории продукта-референса ВК."
                         : "Отстройка: тот же набор доступов, но собственная категорийная и интерфейсная гипотеза.")
                        .font(.system(size: 13))
                        .frame(maxWidth: .infinity, alignment: .leading).padding(4)
                }
            }
            .padding(16)
        }
    }
}

private struct StatRow: View {
    let items: [(String, String)]
    var body: some View {
        HStack(spacing: 10) {
            ForEach(items, id: \.0) { i in
                VStack(spacing: 3) {
                    Text(i.1).font(.system(size: 20, weight: .semibold))
                    Text(i.0).font(.system(size: 11)).foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity).padding(.vertical, 12)
                .background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 10))
            }
        }
    }
}

// MARK: - Доступы

private struct PermissionsTab: View {
    let concept: Concept
    var body: some View {
        Table(concept.permissions) {
            TableColumn("Ключ") { Text($0.key).font(.system(size: 12, weight: .medium)) }.width(110)
            TableColumn("Фича") { Text($0.feature).font(.system(size: 12)) }
            TableColumn("Экран") { Text($0.screen).font(.system(size: 12)).foregroundStyle(.secondary) }.width(110)
            TableColumn("Риск") { p in
                Tag(text: p.risk, tint: p.risk == "high" ? .red : (p.risk == "medium" ? .orange : .green))
            }.width(70)
            TableColumn("Info.plist") { Text($0.plist).font(.system(size: 11)).foregroundStyle(.secondary) }
        }
    }
}

// MARK: - Экраны

private struct ScreensTab: View {
    let concept: Concept
    let root: String
    private var shots: [URL] {
        let dir = URL(fileURLWithPath: root)
            .appendingPathComponent("native/build/\(concept.slug)/shots")
        return ((try? FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)) ?? [])
            .filter { $0.pathExtension == "png" }
            .sorted { $0.lastPathComponent < $1.lastPathComponent }
    }
    var body: some View {
        if shots.isEmpty {
            ContentUnavailableView("Кадров ещё нет", systemImage: "photo.on.rectangle",
                                   description: Text("Запустите концепт — снимки появятся после прогона"))
        } else {
            ScrollView {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 170), spacing: 14)], spacing: 14) {
                    ForEach(shots, id: \.self) { url in
                        VStack(spacing: 5) {
                            if let img = NSImage(contentsOf: url) {
                                Image(nsImage: img).resizable().scaledToFit()
                                    .clipShape(RoundedRectangle(cornerRadius: 10))
                                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(.quaternary))
                            }
                            Text(url.deletingPathExtension().lastPathComponent)
                                .font(.system(size: 11)).foregroundStyle(.secondary)
                        }
                    }
                }
                .padding(16)
            }
        }
    }
}

// MARK: - Документы

private struct DocsTab: View {
    let concept: Concept
    @State private var selected: DocFile?
    var body: some View {
        HSplitView {
            List(concept.docs, selection: Binding(get: { selected?.id },
                                                  set: { id in selected = concept.docs.first { $0.id == id } })) { d in
                Text(d.name).font(.system(size: 12)).tag(d.id)
            }
            .frame(minWidth: 190, maxWidth: 240)

            if let doc = selected, let text = try? String(contentsOf: doc.url, encoding: .utf8) {
                ScrollView {
                    Text(markdown(text))
                        .font(.system(size: 13))
                        .textSelection(.enabled)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(16)
                }
            } else {
                ContentUnavailableView("Выберите документ", systemImage: "doc.text")
            }
        }
        .onAppear { if selected == nil { selected = concept.docs.first } }
    }
    private func markdown(_ s: String) -> AttributedString {
        (try? AttributedString(markdown: s,
            options: .init(interpretedSyntax: .inlineOnlyPreservingWhitespace))) ?? AttributedString(s)
    }
}

// MARK: - Журнал сборки

private struct LogTab: View {
    @Environment(Runner.self) private var runner
    var body: some View {
        ScrollView {
            Text(runner.log.isEmpty ? "Журнал пуст — запустите концепт" : runner.log)
                .font(.system(size: 11, design: .monospaced))
                .textSelection(.enabled)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12)
        }
        .background(.black.opacity(0.03))
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
                Text("\(library.concepts.count) концептов найдено")
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
        .frame(width: 460, height: 320)
    }
    private func pick() {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        if panel.runModal() == .OK, let url = panel.url { library.rootPath = url.path }
    }
}
