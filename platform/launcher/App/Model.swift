import SwiftUI

// Лаунчер держит библиотеку концептов: читает concept.json прямо из репозитория,
// собирает и запускает их в симуляторе, показывает документацию.

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
        didSet { UserDefaults.standard.set(rootPath, forKey: "rootPath"); reload() }
    }

    init() {
        rootPath = UserDefaults.standard.string(forKey: "rootPath")
            ?? FileManager.default.homeDirectoryForCurrentUser
                .appendingPathComponent("333в/repo/platform").path
        reload()
    }

    var conceptsURL: URL { URL(fileURLWithPath: rootPath).appendingPathComponent("concepts") }

    func reload() {
        var found: [Concept] = []
        let fm = FileManager.default
        guard let dirs = try? fm.contentsOfDirectory(at: conceptsURL,
                                                     includingPropertiesForKeys: nil) else {
            concepts = []; return
        }
        for dir in dirs.sorted(by: { $0.lastPathComponent < $1.lastPathComponent }) {
            let specURL = dir.appendingPathComponent("concept.json")
            guard let data = try? Data(contentsOf: specURL),
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
            else { continue }
            found.append(parse(json, dir: dir))
        }
        concepts = found
    }

    private func parse(_ j: [String: Any], dir: URL) -> Concept {
        let perms = (j["permissions"] as? [[String: Any]] ?? []).map {
            PermissionRow(key: $0["key"] as? String ?? "",
                          plist: $0["plist"] as? String ?? "",
                          feature: $0["feature"] as? String ?? "",
                          screen: $0["screen"] as? String ?? "",
                          risk: $0["risk"] as? String ?? "low")
        }
        let docsDir = dir.appendingPathComponent("docs")
        let docs = ((try? FileManager.default.contentsOfDirectory(at: docsDir, includingPropertiesForKeys: nil)) ?? [])
            .filter { $0.pathExtension == "md" }
            .sorted { $0.lastPathComponent < $1.lastPathComponent }
            .map { DocFile(name: $0.deletingPathExtension().lastPathComponent, url: $0) }
        let brand = j["brand"] as? [String: Any]
        let pos = j["positioning"] as? [String: Any]
        return Concept(
            slug: j["slug"] as? String ?? dir.lastPathComponent,
            name: j["name"] as? String ?? dir.lastPathComponent,
            tagline: j["tagline"] as? String ?? j["deck"] as? String ?? "",
            targetSet: j["targetSet"] as? String ?? "",
            mode: pos?["mode"] as? String ?? "differentiation",
            accent: Color(hex: brand?["accent"] as? String ?? "#0077FF"),
            screens: (j["screens"] as? [[String: Any]])?.count ?? 0,
            permissions: perms,
            docs: docs
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
