import AppKit
import Foundation

enum LauncherDistribution {
    #if CAMO_TESTFLIGHT_CATALOG
    static let isTestFlightCatalog = true
    #else
    static let isTestFlightCatalog = false
    #endif

    static var bundledDeveloperKit: URL? {
        Bundle.main.resourceURL?.appendingPathComponent("DeveloperKit", isDirectory: true)
    }

    static var canRunToolchain: Bool { !isTestFlightCatalog }
}

@MainActor
enum DeveloperKitExporter {
    static func exportDocumentation(for concept: Concept) {
        guard let destination = chooseDirectory(prompt: "Куда сохранить документацию?") else { return }
        let target = uniqueDestination(in: destination, name: "\(concept.slug)-documentation")
        do {
            try FileManager.default.copyItem(
                at: concept.docsDirectory,
                to: target
            )
            NSWorkspace.shared.selectFile(nil, inFileViewerRootedAtPath: target.path)
        } catch {
            present(error: error, title: "Не удалось сохранить документацию")
        }
    }

    static func exportKitAndOpen(concept: Concept, currentRoot: String) async -> String? {
        guard let destination = chooseDirectory(prompt: "Куда сохранить Developer Kit?") else { return nil }
        let source = LauncherDistribution.bundledDeveloperKit
            .flatMap { FileManager.default.fileExists(atPath: $0.path) ? $0 : nil }
            ?? URL(fileURLWithPath: currentRoot, isDirectory: true)
        let target = uniqueDestination(in: destination, name: "CamoDeveloperKit")
        do {
            try await Task.detached(priority: .userInitiated) {
                try FileManager.default.copyItem(at: source, to: target)
            }.value
            let project = xcodeProject(root: target, slug: concept.slug)
            if FileManager.default.fileExists(atPath: project.path) {
                NSWorkspace.shared.open(project)
            } else {
                NSWorkspace.shared.selectFile(nil, inFileViewerRootedAtPath: target.path)
            }
            return target.path
        } catch {
            present(error: error, title: "Не удалось сохранить Developer Kit")
            return nil
        }
    }

    static func xcodeProject(root: URL, slug: String) -> URL {
        let appName = slug.prefix(1).uppercased() + slug.dropFirst()
        return root.appendingPathComponent("native/build/\(slug)/\(appName).xcodeproj")
    }

    private static func chooseDirectory(prompt: String) -> URL? {
        let panel = NSOpenPanel()
        panel.title = prompt
        panel.prompt = "Сохранить"
        panel.canChooseDirectories = true
        panel.canCreateDirectories = true
        panel.canChooseFiles = false
        panel.allowsMultipleSelection = false
        return panel.runModal() == .OK ? panel.url : nil
    }

    private static func uniqueDestination(in directory: URL, name: String) -> URL {
        let fm = FileManager.default
        let base = directory.appendingPathComponent(name, isDirectory: true)
        guard fm.fileExists(atPath: base.path) else { return base }
        for index in 2...999 {
            let candidate = directory.appendingPathComponent("\(name)-\(index)", isDirectory: true)
            if !fm.fileExists(atPath: candidate.path) { return candidate }
        }
        return directory.appendingPathComponent("\(name)-\(UUID().uuidString)", isDirectory: true)
    }

    private static func present(error: Error, title: String) {
        let alert = NSAlert(error: error)
        alert.messageText = title
        alert.runModal()
    }
}
