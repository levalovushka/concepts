import SwiftUI

// Дизайн-токены ядра. Спроектированы под iOS, а не перенесены из CSS.
// Сетка концепта одна: поле 16, значок 44, текст с 72.

enum Grid {
    static let edge: CGFloat = 16
    static let control: CGFloat = 44
    static let text: CGFloat = 72
    static let gap: CGFloat = 12
    static let radius: CGFloat = 14
}

extension Color {
    /// Цвет из HEX вида `#0d8a7a`.
    init(hex: String) {
        let s = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        var v: UInt64 = 0
        Scanner(string: s).scanHexInt64(&v)
        let r, g, b: Double
        if s.count == 6 {
            r = Double((v & 0xFF0000) >> 16) / 255
            g = Double((v & 0x00FF00) >> 8) / 255
            b = Double(v & 0x0000FF) / 255
        } else {
            r = 0; g = 0; b = 0
        }
        self = Color(.sRGB, red: r, green: g, blue: b, opacity: 1)
    }
}

// Акцент концепта прокидывается через окружение, чтобы компоненты ядра
// не знали о конкретном концепте.
private struct AccentKey: EnvironmentKey {
    static let defaultValue = Color.accentColor
}

extension EnvironmentValues {
    var conceptAccent: Color {
        get { self[AccentKey.self] }
        set { self[AccentKey.self] = newValue }
    }
}
