import SwiftUI

// Сборка и запуск концепта в симуляторе. Приложение не в песочнице App Store —
// иначе вызвать xcrun/simctl было бы нельзя (см. README лаунчера).

@MainActor
@Observable
final class Runner {
    enum Stage: String { case idle, generating, building, installing, running, failed }
    var stage: Stage = .idle
    var log: String = ""
    var device: String = UserDefaults.standard.string(forKey: "device") ?? "iPhone 17 Pro"
    var busySlug: String?

    var isBusy: Bool { stage != .idle && stage != .failed }
    var stageTitle: String {
        switch stage {
        case .idle: return "Готово"
        case .generating: return "Генерируем проект"
        case .building: return "Собираем"
        case .installing: return "Ставим на симулятор"
        case .running: return "Запускаем"
        case .failed: return "Ошибка"
        }
    }

    func run(_ concept: Concept, root: String) {
        guard !isBusy else { return }
        busySlug = concept.slug
        log = ""
        Task.detached { [weak self] in
            await self?.pipeline(concept: concept, root: root)
        }
    }

    private func pipeline(concept: Concept, root: String) async {
        let slug = concept.slug
        let bundleId = "com.camo." + slug.replacingOccurrences(of: "-", with: "")

        await set(.generating)
        guard let node = Self.nodePath else {
            await MainActor.run {
                self.log += "Не найден node. Установите Node.js или укажите путь в настройках.\n"
            }
            return await set(.failed)
        }
        let generator = concept.isLegacy ? "gen-legacy-project.mjs" : "gen-project.mjs"
        guard await sh(node, ["\(root)/native/gen/\(generator)", slug], cwd: root) else {
            return await set(.failed)
        }

        await set(.building)
        let proj = "\(root)/native/build/\(slug)"
        let appName = slug.prefix(1).uppercased() + slug.dropFirst()
        guard await sh("/usr/bin/xcodebuild",
                       ["-project", "\(proj)/\(appName).xcodeproj", "-target", String(appName),
                        "-sdk", "iphonesimulator", "-configuration", "Debug", "build"],
                       cwd: proj) else { return await set(.failed) }

        await set(.installing)
        _ = await sh("/usr/bin/xcrun", ["simctl", "boot", device], cwd: root)
        _ = await sh("/usr/bin/xcrun", ["simctl", "bootstatus", device, "-b"], cwd: root)
        _ = await sh("/usr/bin/xcrun", ["simctl", "terminate", device, bundleId], cwd: root)
        let appPath = "\(proj)/build/Debug-iphonesimulator/\(appName).app"
        guard await sh("/usr/bin/xcrun", ["simctl", "install", device, appPath], cwd: root) else {
            return await set(.failed)
        }

        await set(.running)
        _ = await sh("/usr/bin/open", ["-a", "Simulator"], cwd: root)
        _ = await sh("/usr/bin/xcrun", ["simctl", "launch", device, bundleId], cwd: root)
        await set(.idle)
        await MainActor.run { self.busySlug = nil }
    }

    @discardableResult
    private func sh(_ path: String, _ args: [String], cwd: String) async -> Bool {
        await withCheckedContinuation { cont in
            let p = Process()
            p.executableURL = URL(fileURLWithPath: path)
            p.arguments = args
            p.currentDirectoryURL = URL(fileURLWithPath: cwd)
            let pipe = Pipe()
            p.standardOutput = pipe
            p.standardError = pipe
            pipe.fileHandleForReading.readabilityHandler = { h in
                if let s = String(data: h.availableData, encoding: .utf8), !s.isEmpty {
                    Task { @MainActor in self.append(s) }
                }
            }
            p.terminationHandler = { proc in
                pipe.fileHandleForReading.readabilityHandler = nil
                cont.resume(returning: proc.terminationStatus == 0)
            }
            do { try p.run() } catch { cont.resume(returning: false) }
        }
    }

    @MainActor private func append(_ s: String) {
        log += s
        if log.count > 40_000 { log = String(log.suffix(30_000)) }
    }
    private func set(_ s: Stage) async {
        await MainActor.run { self.stage = s; if s == .failed { self.busySlug = nil } }
    }

    /// GUI-приложение получает урезанный PATH (/usr/bin:/bin), поэтому node ищем сами.
    static let nodePath: String? = {
        let candidates = ["/usr/local/bin/node", "/opt/homebrew/bin/node",
                          "/usr/bin/node", "/run/current-system/sw/bin/node"]
        if let found = candidates.first(where: { FileManager.default.isExecutableFile(atPath: $0) }) {
            return found
        }
        // последняя попытка — спросить у логин-шелла
        let p = Process()
        p.executableURL = URL(fileURLWithPath: "/bin/zsh")
        p.arguments = ["-lc", "command -v node"]
        let pipe = Pipe(); p.standardOutput = pipe
        try? p.run(); p.waitUntilExit()
        let out = String(data: pipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8)?
            .trimmingCharacters(in: .whitespacesAndNewlines)
        return (out?.isEmpty == false) ? out : nil
    }()

    var devices: [String] {
        ["iPhone 17 Pro", "iPhone 17 Pro Max", "iPhone 17", "iPhone 16e"]
    }
    func setDevice(_ d: String) {
        device = d
        UserDefaults.standard.set(d, forKey: "device")
    }
}
