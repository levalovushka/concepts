import SwiftUI

/// Токены «Двора». Значения — из docs/03-design-system.md и styles.css концепта.
/// Один акцент на весь продукт, второго нет.
enum D {
    static let page = Color(hex: 0xECEDF1)
    static let card = Color(hex: 0xFFFFFF)
    static let ink = Color(hex: 0x0B0B0C)
    static let sub = Color(hex: 0x6D7885)
    static let mute = Color(hex: 0x6E7887)
    static let quiet = Color(hex: 0xE8EAF0)
    static let quietIn = Color(hex: 0xEFF1F5)
    static let line = Color(hex: 0xE1E3E6)
    static let red = Color(hex: 0xFF3347)
    static let green = Color(hex: 0x4BB34B)
    static let orange = Color(hex: 0xF8A01C)
    static let orangeInk = Color(hex: 0xA8690A)
    static let accent = Color(hex: 0x0077FF)
    static let dark = Color(hex: 0x0A0A0A)
    static let surf = Color(hex: 0x19191A)

    /// Инсет 12, а не 16–20: плотность важнее воздуха.
    static let inset: CGFloat = 12
    static let radius: CGFloat = 14
    static let rowMin: CGFloat = 44
}

extension Color {
    init(hex: UInt32) {
        self.init(.sRGB,
                  red: Double((hex >> 16) & 0xff) / 255,
                  green: Double((hex >> 8) & 0xff) / 255,
                  blue: Double(hex & 0xff) / 255)
    }
}

extension Font {
    /// Всё, что читается как данные — показания, идентификаторы, номера — идёт моно.
    static func data(_ size: CGFloat, _ weight: Font.Weight = .medium) -> Font {
        .system(size: size, weight: weight, design: .monospaced)
    }
}
