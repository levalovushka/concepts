import SwiftUI

// Лаунчер читает скомпилированные Product Blueprints, собирает нативные приложения
// и показывает документацию. Старый каталог HTML-концептов ему не нужен.

struct Concept: Identifiable, Hashable {
    let slug: String
    let name: String
    let tagline: String
    let targetSet: String
    let mode: String            // mimicry / differentiation
    let accent: Color
    let screens: Int
    let permissions: [PermissionRow]
    let docs: [DocFile]
    let docsDirectory: URL
    /// Есть ли нативные исходники (native/apps/<slug>).
    let hasNative: Bool
    let path: String
    var id: String { slug }

    var isMimicry: Bool { mode == "mimicry" }
    var modeTitle: String { isMimicry ? "Мимикрия" : "Отстройка" }
}

struct PermissionRow: Identifiable, Hashable {
    let key: String
    let plist: String
    let feature: String
    let screen: String
    let risk: String
    var id: String { key }
}

struct DocFile: Identifiable, Hashable {
    let name: String
    let url: URL
    var id: String { url.path }
}

// MARK: - Чтение библиотеки из репозитория

@MainActor
@Observable
final class Library {
    var concepts: [Concept] = []
    var rootPath: String {
        didSet {
            if !Self.isEphemeralRoot(rootPath) {
                UserDefaults.standard.set(rootPath, forKey: "rootPath")
            }
            reload()
        }
    }

    init() {
        let configured = ProcessInfo.processInfo.environment["IOS_CONCEPTS_ROOT"]
            .flatMap(Self.validProjectRoot)
        let stored = UserDefaults.standard.string(forKey: "rootPath")
            .flatMap { Self.isEphemeralRoot($0) ? nil : Self.validProjectRoot($0) }
        rootPath = configured ?? stored ?? Self.defaultProjectRoot()
        reload()
    }

    private static func isEphemeralRoot(_ path: String) -> Bool {
        let standardized = URL(fileURLWithPath: path).standardizedFileURL.path
        return standardized.hasPrefix("/private/tmp/")
            || standardized.hasPrefix("/tmp/")
            || standardized.contains("/T/camo-native.")
    }

    private static func validProjectRoot(_ path: String) -> String? {
        let root = URL(fileURLWithPath: path, isDirectory: true)
        let fm = FileManager.default
        let required = ["package.json", "native/ProductBlueprints", "native/apps"]
        return required.allSatisfy { fm.fileExists(atPath: root.appendingPathComponent($0).path) }
            ? root.standardizedFileURL.path : nil
    }

    private static func defaultProjectRoot() -> String {
        let fm = FileManager.default
        var seeds = [URL(fileURLWithPath: fm.currentDirectoryPath, isDirectory: true), Bundle.main.bundleURL]
        if LauncherDistribution.isTestFlightCatalog,
           let bundled = LauncherDistribution.bundledDeveloperKit {
            seeds.insert(bundled, at: 0)
        }
        if let configured = ProcessInfo.processInfo.environment["IOS_CONCEPTS_ROOT"] {
            seeds.insert(URL(fileURLWithPath: configured, isDirectory: true), at: 0)
        }
        for seed in seeds {
            var candidate = seed.standardizedFileURL
            while candidate.path != "/" {
                if let root = validProjectRoot(candidate.path) { return root }
                candidate.deleteLastPathComponent()
            }
        }
        return fm.currentDirectoryPath
    }

    var productBlueprintsURL: URL { URL(fileURLWithPath: rootPath).appendingPathComponent("native/ProductBlueprints") }
    var nativeDocumentationURL: URL { URL(fileURLWithPath: rootPath).appendingPathComponent("native/Documentation") }
    var query: String = ""

    var filtered: [Concept] {
        query.isEmpty ? concepts : concepts.filter {
            $0.name.localizedCaseInsensitiveContains(query)
            || $0.targetSet.localizedCaseInsensitiveContains(query)
        }
    }
    /// Сайдбар: сверху собранные приложения, ниже — контракты без реализации.
    var groups: [(String, [Concept])] {
        let ready = filtered.filter(\.hasNative).sorted { $0.name < $1.name }
        let rest = filtered.filter { !$0.hasNative }.sorted { $0.name < $1.name }
        var out: [(String, [Concept])] = []
        if !ready.isEmpty { out.append(("Собираются нативно", ready)) }
        if !rest.isEmpty { out.append(("Только спека и доки", rest)) }
        return out
    }
    var totalPermissions: Int { concepts.reduce(0) { $0 + $1.permissions.count } }

    private var nativeSlugs: Set<String> {
        let appsURL = URL(fileURLWithPath: rootPath).appendingPathComponent("native/apps")
        let dirs = (try? FileManager.default.contentsOfDirectory(at: appsURL,
                                                                 includingPropertiesForKeys: nil)) ?? []
        return Set(dirs.map(\.lastPathComponent))
    }

    func reload() {
        var found: [Concept] = []
        let nativeSlugs = self.nativeSlugs
        let fm = FileManager.default
        let blueprints = (try? fm.contentsOfDirectory(at: productBlueprintsURL, includingPropertiesForKeys: nil)) ?? []
        for url in blueprints.filter({ $0.lastPathComponent.hasSuffix("-vk.json") }).sorted(by: { $0.lastPathComponent < $1.lastPathComponent }) {
            guard let data = try? Data(contentsOf: url),
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let slug = json["id"] as? String
            else { continue }
            found.append(parseBlueprint(json, slug: slug, native: nativeSlugs.contains(slug)))
        }
        concepts = found
    }

    private func parseBlueprint(_ j: [String: Any], slug: String, native: Bool) -> Concept {
        let appDir = URL(fileURLWithPath: rootPath).appendingPathComponent("native/apps/\(slug)")
        let compiledDocs = nativeDocumentationURL.appendingPathComponent(slug)
        let docsDir = compiledDocs
        let docs = ((try? FileManager.default.contentsOfDirectory(at: docsDir, includingPropertiesForKeys: nil)) ?? [])
            .filter { $0.pathExtension == "md" }
            .sorted { $0.lastPathComponent < $1.lastPathComponent }
            .map { DocFile(name: $0.deletingPathExtension().lastPathComponent, url: $0) }
        let navigation = j["navigation"] as? [String: Any]
        let screens = navigation?["screens"] as? [[String: Any]] ?? []
        let actionScreen = screens.flatMap { screen in
            let screenID = screen["id"] as? String ?? ""
            return (screen["actionIds"] as? [String] ?? []).map { ($0, screenID) }
        }.reduce(into: [String: String]()) { result, pair in
            if result[pair.0] == nil { result[pair.0] = pair.1 }
        }
        let permissions = (j["capabilities"] as? [[String: Any]] ?? []).map { capability in
            let key = capability["key"] as? String ?? ""
            let action = capability["actionId"] as? String ?? ""
            return PermissionRow(
                key: key, plist: "compiled from iOS capability catalog",
                feature: capability["purpose"] as? String ?? capability["observableResult"] as? String ?? "",
                screen: actionScreen[action] ?? "", risk: "contextual"
            )
        }
        let audience = j["audience"] as? [String: Any]
        return Concept(
            slug: slug,
            name: j["name"] as? String ?? slug,
            tagline: j["thesis"] as? String ?? audience?["need"] as? String ?? "",
            targetSet: j["targetProduct"] as? String ?? "iOS",
            mode: j["strategy"] as? String ?? "differentiation",
            accent: Color(hex: "#0077FF"),
            screens: screens.count,
            permissions: permissions,
            docs: docs,
            docsDirectory: docsDir,
            hasNative: native,
            path: appDir.path
        )
    }
}

extension Color {
    init(hex: String) {
        let s = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        var v: UInt64 = 0
        Scanner(string: s).scanHexInt64(&v)
        self = Color(.sRGB,
                     red: Double((v & 0xFF0000) >> 16) / 255,
                     green: Double((v & 0x00FF00) >> 8) / 255,
                     blue: Double(v & 0x0000FF) / 255,
                     opacity: 1)
    }
}
