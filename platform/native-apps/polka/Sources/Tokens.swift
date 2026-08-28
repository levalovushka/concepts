import SwiftUI

/// Визуальный язык «Полки»: знакомый ритм VK, но более тёплые медиа-поверхности.
enum D {
    static let accent = Color(hex: "2688EB")
    static let page = Color(hex: "F2F3F5")
    static let card = Color.white
    static let ink = Color(hex: "19191A")
    static let sub = Color(hex: "6D7885")
    static let mute = Color(hex: "99A2AD")
    static let line = Color(hex: "E1E3E6")
    static let quiet = Color(hex: "EBEDF0")
    static let quietIn = Color(hex: "F2F3F5")
    static let orange = Color(hex: "FFA000")
    static let orangeInk = Color(hex: "A85F00")
    static let green = Color(hex: "4BB34B")
    static let red = Color(hex: "E64646")
    static let inset: CGFloat = 16
    static let radius: CGFloat = 16
    static let rowMin: CGFloat = 56
}

extension Color {
    init(hex: String) {
        let clean = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: clean).scanHexInt64(&value)
        let red = Double((value >> 16) & 0xFF) / 255
        let green = Double((value >> 8) & 0xFF) / 255
        let blue = Double(value & 0xFF) / 255
        self.init(red: red, green: green, blue: blue)
    }
}
