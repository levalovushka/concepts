import SwiftUI

// Токены выведены из vk-visual-profile.md (разбор iOS-приложения ВК).
// Главное: фон белый, серый — заливка полей и полос между группами.

struct Theme: Sendable {
    var accent: Color            // #0077FF
    var background: Color        // белый фон экранов
    var groupGap: Color          // серая полоса между группами
    var fill: Color              // заливка полей, капсул, входящих баблов
    var separator: Color         // линия внутри списка
    var textPrimary: Color
    var textSecondary: Color
    var badge: Color             // красный бейдж
    var outgoing: [Color]        // градиент исходящего бабла

    var controlRadius: CGFloat = 10
    var pad: CGFloat = 16
    /// Зазор между карточками на сером фоне профиля.
    var cardGap: CGFloat = 8
    var cardRadius: CGFloat = 16
    /// Прежние имена, сведённые к палитре ВК.
    var card: Color { .white }
    var background2: Color { groupGap }
    var fieldFill: Color { fill }
    var accentSoft: Color { accent.opacity(0.12) }
    var textTertiary: Color { Color(hex: "C4C8CC") }
    var positive: Color { Color(hex: "4BB34B") }
    var danger: Color { badge }

    static let vk = Theme(
        accent: Color(hex: "0077FF"),
        background: .white,
        groupGap: Color(hex: "F2F3F5"),
        fill: Color(hex: "F2F3F5"),
        separator: Color(hex: "E7E8EC"),
        textPrimary: Color(hex: "000000"),
        textSecondary: Color(hex: "818C99"),
        badge: Color(hex: "FF3347"),
        outgoing: [Color(hex: "4B8BF5"), Color(hex: "A44BF5"), Color(hex: "F54BA4")]
    )
}

private struct ThemeKey: EnvironmentKey { static let defaultValue = Theme.vk }
extension EnvironmentValues {
    var theme: Theme {
        get { self[ThemeKey.self] }
        set { self[ThemeKey.self] = newValue }
    }
}

// MARK: - Типографика ВК

extension Font {
    static let vkTabTitle = Font.system(size: 24, weight: .bold)       // заголовок вкладки
    static let vkNavTitle = Font.system(size: 17, weight: .semibold)   // заголовок навбара
    static let vkSection = Font.system(size: 22, weight: .bold)        // заголовок секции
    static let vkRow = Font.system(size: 17)                           // строка списка
    static let vkName = Font.system(size: 15, weight: .semibold)       // имя в посте
    static let vkBody = Font.system(size: 15)                          // текст поста
    static let vkMeta = Font.system(size: 13)                          // время, подписи
    static let vkCaption = Font.system(size: 13)                       // подпись под иконкой
    static let vkBubbleTime = Font.system(size: 11)
}

// MARK: - Цвет из HEX

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

// MARK: - Нажатия

struct PressableStyle: ButtonStyle {
    var scale: CGFloat = 0.97
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? scale : 1)
            .opacity(configuration.isPressed ? 0.65 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

struct HighlightStyle: ButtonStyle {
    @Environment(\.theme) private var t
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background(configuration.isPressed ? t.fill : .clear)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

extension View {
    func pressable(scale: CGFloat = 0.97) -> some View {
        buttonStyle(PressableStyle(scale: scale))
    }
}
