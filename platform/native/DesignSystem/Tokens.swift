import SwiftUI

extension View {
    /// Static and accessibility-visible binding between a product action
    /// contract and the control that implements it.
    func nativeAction(_ id: String) -> some View {
        accessibilityIdentifier("action.\(id)")
    }
}

// Semantic design roles shared by product composition and reference adapters.
// Named-product values are selected only through a registered profile.

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

    /// Differentiation starts from semantic product tokens, not the VK reference
    /// profile. The product compiler may override these roles per concept.
    static let product = Theme(
        accent: Color(hex: "5B5BD6"),
        background: Color(hex: "FAFAFC"),
        groupGap: Color(hex: "F0F0F5"),
        fill: Color(hex: "F0F0F5"),
        separator: Color(hex: "E2E2EA"),
        textPrimary: Color(hex: "16161D"),
        textSecondary: Color(hex: "6F6F7C"),
        badge: Color(hex: "E5484D"),
        outgoing: [Color(hex: "5B5BD6"), Color(hex: "7C5CFC")]
    )

    static func resolve(_ design: NativeDesignDefinition) -> Theme {
        var theme = Theme.product
        if let value = design.tokens["accent"] { theme.accent = Color(hex: value) }
        if let value = design.tokens["background"] { theme.background = Color(hex: value) }
        if let value = design.tokens["groupedBackground"] {
            theme.groupGap = Color(hex: value)
            theme.fill = Color(hex: value)
        }
        if let value = design.tokens["fill"] { theme.fill = Color(hex: value) }
        if let value = design.tokens["separator"] { theme.separator = Color(hex: value) }
        if let value = design.tokens["textPrimary"] { theme.textPrimary = Color(hex: value) }
        if let value = design.tokens["textSecondary"] { theme.textSecondary = Color(hex: value) }
        if let value = design.tokens["badge"] { theme.badge = Color(hex: value) }
        let outgoing = ["outgoingStart", "outgoingMiddle", "outgoingEnd"]
            .compactMap { design.tokens[$0] }.map { Color(hex: $0) }
        if outgoing.count >= 2 { theme.outgoing = outgoing }
        return theme
    }
}

private struct ThemeKey: EnvironmentKey { static let defaultValue = Theme.product }
extension EnvironmentValues {
    var theme: Theme {
        get { self[ThemeKey.self] }
        set { self[ThemeKey.self] = newValue }
    }
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
