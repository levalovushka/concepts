import SwiftUI

// Обновления. Лаунчер НЕ может жить в Mac App Store: песочница MAS запрещает
// запускать xcrun/simctl, а без этого лаунчер бессмысленен. Поэтому распространение —
// Developer ID + нотаризация, а обновления — по своему appcast.
//
// Здесь встроен минимальный клиент: читает appcast.json, сравнивает версии,
// открывает страницу загрузки. Подключение Sparkle — следующий шаг, схема
// та же (Sparkle читает тот же appcast и умеет ставить обновление сам).

@MainActor
@Observable
final class Updater {
    static let shared = Updater()

    /// Куда публикуется манифест версий. Заменить на свой адрес.
    var appcastURL = URL(string: "https://camo.example/appcast.json")!
    var status = "Обновления не проверялись"

    var currentVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }

    struct Appcast: Decodable {
        let version: String
        let notes: String
        let url: String
        let minimumSystemVersion: String?
    }

    func checkForUpdates() {
        status = "Проверяем…"
        Task {
            do {
                let (data, _) = try await URLSession.shared.data(from: appcastURL)
                let cast = try JSONDecoder().decode(Appcast.self, from: data)
                if isNewer(cast.version, than: currentVersion) {
                    status = "Доступна версия \(cast.version)"
                    presentUpdate(cast)
                } else {
                    status = "Установлена последняя версия (\(currentVersion))"
                }
            } catch {
                status = "Не удалось проверить: \(error.localizedDescription)"
            }
        }
    }

    private func isNewer(_ a: String, than b: String) -> Bool {
        a.compare(b, options: .numeric) == .orderedDescending
    }

    private func presentUpdate(_ cast: Appcast) {
        let alert = NSAlert()
        alert.messageText = "Доступна версия \(cast.version)"
        alert.informativeText = cast.notes
        alert.addButton(withTitle: "Скачать")
        alert.addButton(withTitle: "Позже")
        if alert.runModal() == .alertFirstButtonReturn, let url = URL(string: cast.url) {
            NSWorkspace.shared.open(url)
        }
    }
}
