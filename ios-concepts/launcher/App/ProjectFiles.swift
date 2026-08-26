import SwiftUI

struct ProjectFile: Identifiable, Hashable {
    let url: URL
    let relativePath: String
    var id: String { url.path }
    var name: String { url.lastPathComponent }
}

enum ProjectFileIndex {
    static func files(for concept: Concept, root: String) -> [ProjectFile] {
        let rootURL = URL(fileURLWithPath: root, isDirectory: true)
        let currentLocations = [
            rootURL.appendingPathComponent("native/specs/\(concept.slug).json"),
            rootURL.appendingPathComponent("native/ProductBlueprints/\(concept.slug)-vk.json"),
            rootURL.appendingPathComponent("native/ProductUIContracts/\(concept.slug).json"),
            rootURL.appendingPathComponent("native/Documentation/\(concept.slug)"),
            rootURL.appendingPathComponent("native/apps/\(concept.slug)"),
            rootURL.appendingPathComponent("native/build/\(concept.slug)"),
        ]
        let legacyLocations = [
            rootURL.appendingPathComponent("native/Legacy/concepts/\(concept.slug)"),
            rootURL.appendingPathComponent("native/Legacy/blueprints/\(concept.slug)-vk.json"),
            rootURL.appendingPathComponent("native/Legacy/apps/\(concept.slug)"),
            rootURL.appendingPathComponent("native/build/\(concept.slug)"),
        ]
        let locations = concept.isLegacy ? legacyLocations : currentLocations
        let ignored = ["build/Debug-", "DerivedData", "SmokeDerivedData", ".xcresult", ".DS_Store"]
        var result: [ProjectFile] = []
        for location in locations where FileManager.default.fileExists(atPath: location.path) {
            var isDirectory: ObjCBool = false
            FileManager.default.fileExists(atPath: location.path, isDirectory: &isDirectory)
            if !isDirectory.boolValue {
                let relative = location.path.replacingOccurrences(of: rootURL.path + "/", with: "")
                result.append(ProjectFile(url: location, relativePath: relative))
                continue
            }
            guard let enumerator = FileManager.default.enumerator(
                at: location,
                includingPropertiesForKeys: [.isRegularFileKey],
                options: [.skipsHiddenFiles]
            ) else { continue }
            for case let url as URL in enumerator {
                let values = try? url.resourceValues(forKeys: [.isRegularFileKey])
                guard values?.isRegularFile == true else { continue }
                let relative = url.path.replacingOccurrences(of: rootURL.path + "/", with: "")
                guard !ignored.contains(where: relative.contains) else { continue }
                result.append(ProjectFile(url: url, relativePath: relative))
            }
        }
        return result.sorted { $0.relativePath.localizedStandardCompare($1.relativePath) == .orderedAscending }
    }

    static func text(for file: ProjectFile) -> String? {
        let readable = ["swift", "mjs", "js", "json", "md", "plist", "pbxproj", "strings", "entitlements", "yml", "yaml", "txt"]
        guard readable.contains(file.url.pathExtension.lowercased()),
              let values = try? file.url.resourceValues(forKeys: [.fileSizeKey]),
              (values.fileSize ?? 0) < 2_000_000
        else { return nil }
        return try? String(contentsOf: file.url, encoding: .utf8)
    }
}

struct ProjectFilesTab: View {
    let concept: Concept
    let root: String
    @State private var files: [ProjectFile] = []
    @State private var selectedID: ProjectFile.ID?
    @State private var query = ""

    private var filtered: [ProjectFile] {
        query.isEmpty ? files : files.filter { $0.relativePath.localizedCaseInsensitiveContains(query) }
    }
    private var selected: ProjectFile? { files.first { $0.id == selectedID } }

    var body: some View {
        HSplitView {
            VStack(spacing: 0) {
                HStack(spacing: 6) {
                    Image(systemName: "magnifyingglass").foregroundStyle(.tertiary)
                    TextField("Имя или путь", text: $query).textFieldStyle(.plain)
                }
                .font(.system(size: 12))
                .padding(8)
                Divider()
                List(filtered, selection: $selectedID) { file in
                    VStack(alignment: .leading, spacing: 2) {
                        Text(file.name).font(.system(size: 12, weight: .medium)).lineLimit(1)
                        Text(file.relativePath).font(.system(size: 10, design: .monospaced))
                            .foregroundStyle(.tertiary).lineLimit(1).truncationMode(.middle)
                    }
                    .tag(file.id)
                }
                .listStyle(.sidebar)
            }
            .frame(minWidth: 290, idealWidth: 340, maxWidth: 430)

            if let file = selected {
                VStack(spacing: 0) {
                    HStack {
                        Text(file.relativePath).font(.system(size: 11, design: .monospaced))
                            .foregroundStyle(.secondary).lineLimit(1).truncationMode(.middle)
                        Spacer()
                        Button("Показать в Finder") {
                            NSWorkspace.shared.activateFileViewerSelecting([file.url])
                        }
                    }
                    .padding(10)
                    Divider()
                    if let source = ProjectFileIndex.text(for: file) {
                        ScrollView([.horizontal, .vertical]) {
                            Text(source)
                                .font(.system(size: 11, design: .monospaced))
                                .textSelection(.enabled)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(14)
                        }
                    } else {
                        Placeholder(icon: "doc", title: file.name,
                                    note: "Бинарный или слишком большой файл — откройте его в Finder")
                    }
                }
            } else {
                Placeholder(icon: "folder", title: "Выберите файл", note: "В индексе \(files.count) файлов")
            }
        }
        .task(id: concept.id) {
            let concept = concept
            let root = root
            files = await Task.detached(priority: .userInitiated) {
                ProjectFileIndex.files(for: concept, root: root)
            }.value
            selectedID = files.first?.id
        }
    }
}
