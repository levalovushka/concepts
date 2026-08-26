import SwiftUI

/// Semantic type roles shared by generated native concepts. Screens select a
/// product meaning instead of inventing a point size; the reference adapter
/// remains the single place where the optical scale is defined.
enum TextRole: Sendable {
    case largeTitle
    case tabTitle
    case section
    case navTitle
    case rowTitle
    case rowValue
    case cardTitle
    case button
    case name
    case body
    case action
    case pill
    case groupHeader
    case meta
    case caption
    case badge
    case bubbleTime
    case code
    case timer

    var font: Font {
        switch self {
        case .largeTitle: .system(size: 28, weight: .bold)
        case .tabTitle: .system(size: 24, weight: .bold)
        case .section: .system(size: 22, weight: .bold)
        case .navTitle: .system(size: 17, weight: .semibold)
        case .rowTitle, .rowValue: .system(size: 17)
        case .cardTitle, .button: .system(size: 17, weight: .semibold)
        case .name: .system(size: 15, weight: .semibold)
        case .body: .system(size: 15)
        case .action: .system(size: 15, weight: .medium)
        case .pill: .system(size: 14, weight: .medium)
        case .groupHeader: .system(size: 13, weight: .medium)
        case .meta, .caption: .system(size: 13)
        case .badge: .system(size: 11, weight: .semibold)
        case .bubbleTime: .system(size: 11)
        case .code: .system(size: 24, weight: .semibold, design: .rounded)
        case .timer: .system(size: 15).monospacedDigit()
        }
    }

    func color(_ language: NativeVisualLanguage) -> Color {
        switch self {
        case .largeTitle, .tabTitle, .section, .navTitle, .rowTitle, .cardTitle,
             .name, .body, .pill, .code:
            language.palette.textPrimary
        case .rowValue, .groupHeader, .meta, .caption, .bubbleTime, .timer:
            language.palette.textSecondary
        case .action, .button:
            language.palette.accent
        case .badge:
            .white
        }
    }
}

extension Font {
    static func role(_ role: TextRole) -> Font { role.font }

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

private struct NativeTextStyleModifier: ViewModifier {
    let role: TextRole
    @Environment(\.visualLanguage) private var language

    func body(content: Content) -> some View {
        content.font(role.font).foregroundStyle(role.color(language))
    }
}

extension View {
    func textStyle(_ role: TextRole) -> some View {
        modifier(NativeTextStyleModifier(role: role))
    }
}
