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
                .frame(minWidth: 1040, minHeight: 680)
        }
        .windowStyle(.hiddenTitleBar)
        .commands {
            CommandGroup(after: .appInfo) {
                Button("Проверить обновления…") { Updater.shared.checkForUpdates() }
            }
            CommandGroup(replacing: .newItem) {}
        }
        Settings { SettingsView().environment(library).environment(runner) }
    }
}

struct RootView: View {
    @Environment(Library.self) private var library
    @Environment(Runner.self) private var runner
    @State private var selection: Concept.ID?

    var body: some View {
        @Bindable var library = library
        NavigationSplitView {
            Sidebar(selection: $selection)
                .navigationSplitViewColumnWidth(min: 268, ideal: 288, max: 340)
        } detail: {
            if let id = selection, let c = library.concepts.first(where: { $0.id == id }) {
                ConceptDetail(concept: c).id(c.id)
            } else {
                EmptyDetail()
            }
        }
        .onAppear { if selection == nil { selection = library.concepts.first?.id } }
    }
}

// MARK: - Сайдбар

private struct Sidebar: View {
    @Binding var selection: Concept.ID?
    @Environment(Library.self) private var library

    var body: some View {
        @Bindable var library = library
        VStack(spacing: 0) {
            // шапка библиотеки
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 9) {
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .fill(LinearGradient(colors: [.blue, .purple],
                                             startPoint: .topLeading, endPoint: .bottomTrailing))
                        .frame(width: 26, height: 26)
                        .overlay(Image(systemName: "square.stack.3d.up.fill")
                            .font(.system(size: 12, weight: .semibold)).foregroundStyle(.white))
                    Text("Библиотека").font(.system(size: 15, weight: .semibold))
                    Spacer()
                    Button { library.reload() } label: {
                        Image(systemName: "arrow.clockwise").font(.system(size: 12, weight: .medium))
                    }
                    .buttonStyle(.plain).foregroundStyle(.secondary)
                    .help("Перечитать библиотеку")
                }
                HStack(spacing: 6) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 12)).foregroundStyle(.tertiary)
                    TextField("Концепт или набор", text: $library.query)
                        .textFieldStyle(.plain).font(.system(size: 13))
                }
                .padding(.horizontal, 8).padding(.vertical, 6)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 7))
            }
            .padding(.horizontal, 14)
            .padding(.top, 34)
            .padding(.bottom, 10)

            List(selection: $selection) {
                ForEach(library.groups, id: \.0) { group in
                    Section {
                        ForEach(group.1) { c in
                            ConceptRow(concept: c).tag(c.id)
                        }
                    } header: {
                        Text(group.0).font(.system(size: 11, weight: .medium))
                            .foregroundStyle(.tertiary).textCase(nil)
                    }
                }
            }
            .listStyle(.sidebar)

            Divider()
            HStack(spacing: 5) {
                Text("\(library.concepts.count) концептов")
                Text("·")
                Text("\(library.totalPermissions) доступов")
            }
            .font(.system(size: 11)).foregroundStyle(.tertiary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 16).padding(.vertical, 8)
        }
    }
}

private struct ConceptRow: View {
    let concept: Concept
    @Environment(Runner.self) private var runner

    var body: some View {
        HStack(spacing: 10) {
            ConceptBadge(concept: concept, size: 30, radius: 8)
            VStack(alignment: .leading, spacing: 1) {
                Text(concept.name).font(.system(size: 13, weight: .medium)).lineLimit(1)
                Text("\(concept.permissions.count) доступов · \(concept.screens) экранов")
                    .font(.system(size: 11)).foregroundStyle(.secondary).lineLimit(1)
            }
            Spacer(minLength: 4)
            if runner.busySlug == concept.slug {
                ProgressView().controlSize(.small).scaleEffect(0.7)
            } else if concept.isMimicry {
                Image(systemName: "square.on.square.dashed")
                    .font(.system(size: 11)).foregroundStyle(.tertiary)
                    .help("Мимикрия")
            }
        }
        .padding(.vertical, 3)
        .opacity(concept.hasNative ? 1 : 0.55)
    }
}

struct ConceptBadge: View {
    let concept: Concept
    var size: CGFloat = 30
    var radius: CGFloat = 8
    var body: some View {
        RoundedRectangle(cornerRadius: radius, style: .continuous)
            .fill(LinearGradient(colors: [concept.accent, concept.accent.opacity(0.72)],
                                 startPoint: .topLeading, endPoint: .bottomTrailing))
            .frame(width: size, height: size)
            .overlay(
                Text(String(concept.name.prefix(1)).uppercased())
                    .font(.system(size: size * 0.44, weight: .bold))
                    .foregroundStyle(.white)
            )
    }
}

private struct EmptyDetail: View {
    @Environment(Library.self) private var library
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "square.grid.2x2")
                .font(.system(size: 44, weight: .thin)).foregroundStyle(.tertiary)
            Text("Выберите концепт").font(.system(size: 17, weight: .medium))
            Text("\(library.concepts.count) концептов · \(library.totalPermissions) доступов")
                .font(.system(size: 12)).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(.background)
    }
}
