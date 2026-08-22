import SwiftUI

// Дизайн-система: общая, но гибкая. Концепт задаёт палитру и плотность,
// компоненты не форкаются. Значения выведены из vk-visual-profile.md.

// MARK: - Тема концепта

struct Theme: Sendable {
    var accent: Color
    var accentSoft: Color        // подложка активной пилюли
    var background: Color        // фон экрана под карточками
    var card: Color
    var fieldFill: Color         // поиск, капсулы действий, пилюли
    var textPrimary: Color
    var textSecondary: Color
    var textTertiary: Color
    var separator: Color
    var positive: Color
    var danger: Color
    var cardRadius: CGFloat = 12
    var controlRadius: CGFloat = 10
    var cardGap: CGFloat = 8
    var pad: CGFloat = 16

    /// Профиль ВКонтакте — для концептов-мимикрий.
    static let vk = Theme(
        accent: Color(hex: "0077FF"),
        accentSoft: Color(hex: "E5F0FF"),
        background: Color(hex: "EDEEF0"),
        card: .white,
        fieldFill: Color(hex: "F2F3F5"),
        textPrimary: Color(hex: "000000"),
        textSecondary: Color(hex: "818C99"),
        textTertiary: Color(hex: "99A2AD"),
        separator: Color(hex: "E7E8EC"),
        positive: Color(hex: "4BB34B"),
        danger: Color(hex: "E64646")
    )
}

private struct ThemeKey: EnvironmentKey {
    static let defaultValue = Theme.vk
}
extension EnvironmentValues {
    var theme: Theme {
        get { self[ThemeKey.self] }
        set { self[ThemeKey.self] = newValue }
    }
}

// MARK: - Типографика

// Одна шкала на всё приложение. Разнобой кеглей — первое, что читается как
// «свёрстано на глаз», поэтому промежуточных размеров нет.
extension Font {
    static let dsScreenTitle = Font.system(size: 28, weight: .bold)      // заголовок экрана
    static let dsSectionTitle = Font.system(size: 20, weight: .semibold) // заголовок блока
    static let dsHeadline = Font.system(size: 16, weight: .semibold)     // имя автора, строка-действие
    static let dsBody = Font.system(size: 16)                            // текст поста, строки списков
    static let dsSubhead = Font.system(size: 15)                         // вторичный текст
    static let dsMeta = Font.system(size: 13)                            // время, метаданные
    static let dsCaption = Font.system(size: 12)                         // подписи под иконками
    static let dsAction = Font.system(size: 14, weight: .medium)         // счётчики в капсулах
    static let dsName = Font.system(size: 16, weight: .semibold)         // алиас имени
    static let dsTab = Font.system(size: 10, weight: .medium)
}

extension View {
    /// Интерлиньяж текста поста — 16/22, как в ВК.
    func dsParagraph() -> some View {
        font(.dsBody).lineSpacing(5)
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

// MARK: - Нажатия: без них интерфейс мёртвый

struct PressableStyle: ButtonStyle {
    var scale: CGFloat = 0.97
    var dim: Double = 0.6
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? scale : 1)
            .opacity(configuration.isPressed ? dim : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

/// Подсветка строки списка при нажатии — как в нативных списках.
struct HighlightStyle: ButtonStyle {
    @Environment(\.theme) private var t
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background(configuration.isPressed ? t.fieldFill : .clear)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

extension View {
    func pressable(scale: CGFloat = 0.97) -> some View {
        buttonStyle(PressableStyle(scale: scale))
    }
}
