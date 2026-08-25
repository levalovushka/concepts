import Foundation

struct DocumentationPage: Identifiable, Hashable {
    let id: String
    let title: String
    let source: String
    let isOverview: Bool
}

struct DocumentationGroup: Identifiable, Hashable {
    let file: DocFile
    let title: String
    let pages: [DocumentationPage]
    var id: String { file.id }
}

/// Builds a lightweight navigation index over generated Markdown. The source
/// file remains canonical, while the launcher renders only the selected page.
enum DocumentationIndex {
    static func groups(for docs: [DocFile]) -> [DocumentationGroup] {
        docs.compactMap { doc in
            guard let source = try? String(contentsOf: doc.url, encoding: .utf8) else { return nil }
            return DocumentationGroup(
                file: doc,
                title: fileTitle(doc.name),
                pages: pages(source: source, fileID: doc.id)
            )
        }
    }

    static func pages(source: String, fileID: String) -> [DocumentationPage] {
        let lines = source.components(separatedBy: .newlines)
        var pages: [DocumentationPage] = []
        var buffer: [String] = []
        var currentTitle = "Обзор"
        var isOverview = true
        var inCodeFence = false

        func flush() {
            let pageSource = buffer.joined(separator: "\n").trimmingCharacters(in: .whitespacesAndNewlines)
            guard !pageSource.isEmpty else { buffer.removeAll(); return }
            pages.append(DocumentationPage(
                id: "\(fileID)#\(pages.count)",
                title: localizedTitle(currentTitle),
                source: pageSource + "\n",
                isOverview: isOverview
            ))
            buffer.removeAll(keepingCapacity: true)
        }

        for line in lines {
            let trimmed = line.trimmingCharacters(in: .whitespaces)
            if trimmed.hasPrefix("```") {
                inCodeFence.toggle()
                buffer.append(line)
                continue
            }
            if !inCodeFence, trimmed.hasPrefix("## ") {
                flush()
                currentTitle = String(trimmed.dropFirst(3)).trimmingCharacters(in: .whitespaces)
                isOverview = false
            }
            buffer.append(line)
        }
        flush()

        if pages.isEmpty, !source.isEmpty {
            return [DocumentationPage(id: "\(fileID)#0", title: "Документ", source: source, isOverview: true)]
        }
        return pages
    }

    static func fileTitle(_ name: String) -> String {
        if name == "developer-guide" { return "Руководство разработчика" }
        let parts = name.split(separator: "-").drop(while: { $0.allSatisfy(\.isNumber) })
        let value = parts.joined(separator: " ")
        guard let first = value.first else { return name }
        return first.uppercased() + value.dropFirst()
    }

    static func localizedTitle(_ title: String) -> String {
        let titles = [
            "Product vision and scope": "Продукт и границы",
            "Domain glossary": "Термины продукта",
            "Personas and jobs": "Пользователи и задачи",
            "Core loop and critical flows": "Основной цикл и ключевые сценарии",
            "Information architecture and navigation": "Архитектура экранов и навигация",
            "Screen, state, and action matrix": "Экраны, состояния и действия",
            "Canonical UX state handling": "Состояния интерфейса",
            "Design tokens and semantic component roles": "Дизайн-токены и компоненты",
            "Localization string catalog": "Строки локализации",
            "Executable acceptance scenarios": "Сценарии приёмки",
            "Deterministic fixture catalog": "Мок-данные",
            "Permissions, capabilities, and entitlements": "Доступы и возможности iOS",
            "Architecture and module boundaries": "Архитектура приложения",
            "Data, state, persistence, and integrations": "Данные и интеграции",
            "Loading, empty, error, denied, and offline states": "Служебные состояния",
            "Privacy, security, and trust": "Приватность и безопасность",
            "Accessibility and localization": "Доступность и локализация",
            "Analytics event plan and success metrics": "Аналитика и метрики",
            "Testing, evidence, and capture plan": "Тестирование и визуальная проверка",
            "Setup, build, and run": "Сборка и запуск",
            "Generated and owned file map": "Карта файлов",
            "Limitations, risks, and acceptance criteria": "Ограничения и критерии приёмки",
            "App Store notes": "Требования App Store",
        ]
        return titles[title] ?? title
    }
}
