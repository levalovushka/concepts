import SwiftUI

@main
struct LauncherApp: App {
    @State private var library = Library()
    @State private var runner = Runner()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(library)
                .environment(runner)
                .frame(minWidth: 980, minHeight: 640)
        }
        .windowToolbarStyle(.unified)
        .commands {
            CommandGroup(after: .appInfo) {
                Button("Проверить обновления…") { Updater.shared.checkForUpdates() }
            }
        }
        Settings { SettingsView().environment(library).environment(runner) }
    }
}

struct RootView: View {
    @Environment(Library.self) private var library
    @State private var selection: Concept.ID?

    var body: some View {
        NavigationSplitView {
            List(library.concepts, selection: $selection) { c in
                ConceptRow(concept: c).tag(c.id)
            }
            .navigationSplitViewColumnWidth(min: 240, ideal: 270)
            .toolbar {
                ToolbarItem {
                    Button { library.reload() } label: { Image(systemName: "arrow.clockwise") }
                        .help("Перечитать библиотеку")
                }
            }
        } detail: {
            if let id = selection, let c = library.concepts.first(where: { $0.id == id }) {
                ConceptDetail(concept: c)
            } else {
                ContentUnavailableView("Выберите концепт",
                                       systemImage: "square.grid.2x2",
                                       description: Text("\(library.concepts.count) концептов в библиотеке"))
            }
        }
        .onAppear { if selection == nil { selection = library.concepts.first?.id } }
    }
}

private struct ConceptRow: View {
    let concept: Concept
    var body: some View {
        HStack(spacing: 10) {
            RoundedRectangle(cornerRadius: 7, style: .continuous)
                .fill(concept.accent)
                .frame(width: 26, height: 26)
                .overlay(Text(String(concept.name.prefix(1)))
                    .font(.system(size: 13, weight: .bold)).foregroundStyle(.white))
            VStack(alignment: .leading, spacing: 1) {
                Text(concept.name).font(.system(size: 13, weight: .medium))
                Text("\(concept.permissions.count) доступов · \(concept.screens) экранов")
                    .font(.system(size: 11)).foregroundStyle(.secondary)
            }
            Spacer()
            if concept.isMimicry {
                Image(systemName: "doc.on.doc").font(.system(size: 10))
                    .foregroundStyle(.secondary).help("Мимикрия")
            }
        }
        .padding(.vertical, 2)
    }
}
