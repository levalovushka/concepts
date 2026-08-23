import SwiftUI

// Типографика дизайн-системы. Экран выбирает РОЛЬ текста, а не кегль:
// промежуточные размеры — первый признак сгенерированного макета, и они же
// ломают мимикрию (у референса шкала конечная). Значения шкалы взяты из
// vk-visual-profile.md §6 и ReferenceProfiles/vk-ios/profile.json.

/// Роль текста на экране. Один и тот же кегль в разных ролях жить может,
/// но экран обязан называть роль, чтобы правку шкалы можно было сделать
/// в одном месте.
enum TextRole: Sendable {
    case largeTitle    // 28 bold  — имя в профиле, экран-герой
    case tabTitle      // 24 bold  — заголовок корневой вкладки
    case section       // 22 bold  — заголовок секции контента
    case navTitle      // 17 semibold — заголовок навбара
    case rowTitle      // 17       — строка списка
    case rowValue      // 17       — значение справа в строке
    case cardTitle     // 17 semibold — заголовок карточки, дела, диалога
    case button        // 17 semibold — надпись на основной кнопке
    case name          // 15 semibold — имя автора в посте
    case body          // 15       — текст поста, описание, ответ
    case action        // 15 medium — ссылка-действие, вторичная кнопка
    case pill          // 14 medium — надпись на серой капсуле («Подписаться»)
    case groupHeader   // 13 medium — заголовок группы в настройках
    case meta          // 13       — время, подписи, счётчики
    case caption       // 13       — подпись под иконкой сервиса
    case badge         // 11 semibold — число в красном бейдже
    case bubbleTime    // 11       — время внутри бабла чата
    case code          // 24 semibold rounded — цифра кода подтверждения
    case timer         // 15 моноцифры — таймер звонка, длительность

    var font: Font {
        switch self {
        case .largeTitle: .system(size: 28, weight: .bold)
        case .tabTitle: .system(size: 24, weight: .bold)
        case .section: .system(size: 22, weight: .bold)
        case .navTitle: .system(size: 17, weight: .semibold)
        case .rowTitle: .system(size: 17)
        case .rowValue: .system(size: 17)
        case .cardTitle: .system(size: 17, weight: .semibold)
        case .button: .system(size: 17, weight: .semibold)
        case .name: .system(size: 15, weight: .semibold)
        case .body: .system(size: 15)
        case .action: .system(size: 15, weight: .medium)
        case .pill: .system(size: 14, weight: .medium)
        case .groupHeader: .system(size: 13, weight: .medium)
        case .meta: .system(size: 13)
        case .caption: .system(size: 13)
        case .badge: .system(size: 11, weight: .semibold)
        case .bubbleTime: .system(size: 11)
        case .code: .system(size: 24, weight: .semibold, design: .rounded)
        case .timer: .system(size: 15).monospacedDigit()
        }
    }

    /// Цвет по умолчанию — часть текстового стиля: серое время и чёрный
    /// заголовок не должны каждый раз назначаться руками.
    func color(_ theme: Theme) -> Color {
        switch self {
        case .largeTitle, .tabTitle, .section, .navTitle, .rowTitle, .cardTitle, .name, .body, .pill, .code:
            theme.textPrimary
        case .rowValue, .groupHeader, .meta, .caption, .bubbleTime, .timer:
            theme.textSecondary
        case .action, .button:
            theme.accent
        case .badge:
            .white
        }
    }
}

extension Font {
    /// Только кегль роли: цвет остаётся на вызывающей стороне.
    static func role(_ role: TextRole) -> Font { role.font }
}

private struct TextStyleModifier: ViewModifier {
    let role: TextRole
    @Environment(\.theme) private var theme

    func body(content: Content) -> some View {
        content
            .font(role.font)
            .foregroundStyle(role.color(theme))
    }
}

extension View {
    /// Текстовый стиль: кегль и цвет роли одним вызовом.
    func textStyle(_ role: TextRole) -> some View {
        modifier(TextStyleModifier(role: role))
    }
}

// MARK: - Прежние имена шкалы ВК

// Профиль исторически объявлял шрифты сам; имена оставлены как псевдонимы
// ролей, чтобы компоненты профиля не переписывались целиком.
extension Font {
    static var vkTabTitle: Font { .role(.tabTitle) }
    static var vkNavTitle: Font { .role(.navTitle) }
    static var vkSection: Font { .role(.section) }
    static var vkRow: Font { .role(.rowTitle) }
    static var vkName: Font { .role(.name) }
    static var vkBody: Font { .role(.body) }
    static var vkMeta: Font { .role(.meta) }
    static var vkCaption: Font { .role(.caption) }
    static var vkBubbleTime: Font { .role(.bubbleTime) }
}
