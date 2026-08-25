import Foundation

/// The generator owns physical, bounded Markdown files. The launcher indexes
/// filenames only and opens one file on demand.
enum DocumentationIndex {
    private static let titles = [
        "overview": "Обзор",
        "product-vision": "Продукт и границы",
        "domain-glossary": "Термины продукта",
        "personas-and-jobs": "Пользователи и задачи",
        "core-loop-and-flows": "Основной цикл и сценарии",
        "navigation": "Экраны и навигация",
        "screen-state-action-matrix": "Экраны, состояния и действия",
        "state-handling": "Состояния интерфейса",
        "design-system": "Дизайн-система",
        "localization": "Строки локализации",
        "acceptance-scenarios": "Сценарии приёмки",
        "fixtures": "Мок-данные",
        "permissions": "Доступы и возможности iOS",
        "architecture": "Архитектура приложения",
        "data-and-integrations": "Данные и интеграции",
        "service-states": "Служебные состояния",
        "privacy-and-trust": "Приватность и безопасность",
        "accessibility-and-localization": "Доступность и локализация",
        "analytics": "Аналитика и метрики",
        "testing-and-evidence": "Тестирование и визуальная проверка",
        "setup-build-run": "Сборка и запуск",
        "file-map": "Карта файлов",
        "risks-and-acceptance": "Ограничения и критерии приёмки",
        "app-store": "Требования App Store",
    ]

    static func title(for name: String) -> String {
        let withoutOrder = name.replacingOccurrences(
            of: #"^\d{2}-"#, with: "", options: .regularExpression
        )
        let withoutPage = withoutOrder.replacingOccurrences(
            of: #"-\d{2}$"#, with: "", options: .regularExpression
        )
        let base = titles[withoutPage]
            ?? withoutPage.replacingOccurrences(of: "-", with: " ").capitalized
        guard withoutPage != withoutOrder,
              let suffix = withoutOrder.split(separator: "-").last
        else { return base }
        return "\(base) · \(Int(suffix) ?? 1)"
    }
}
