import SwiftUI

/// The single visual seam between a product contract and SwiftUI screens.
/// Screens consume semantic roles; reference profiles and differentiated
/// products provide adapters without leaking named-brand values into callers.
struct NativeVisualLanguage: Sendable {
    enum Strategy: String, Sendable {
        case reference
        case product
    }

    enum Chrome: String, Sendable {
        /// Flat, app-owned navigation bars. The system still owns the root
        /// Liquid Glass tab bar.
        case referenceFlat
        /// Native system navigation for differentiated concepts.
        case system
    }

    enum IconRole: CaseIterable, Hashable, Sendable {
        case back, disclosure, close, more, search, notifications, like, comment, share
        case views, profile, success, warning, error, empty
    }

    enum ProductChromeIconSource: String, Sendable {
        case lucideAssets
        case sfSymbols
    }

    enum TabIconRole: String, CaseIterable, Sendable {
        case feed, houseMatters = "house-matters", discovery, messaging
        case shortVideo = "short-video", infrastructure, services
    }

    struct Palette: Sendable {
        var accent: Color
        var background: Color
        var groupedBackground: Color
        var surface: Color
        var fill: Color
        var separator: Color
        var textPrimary: Color
        var textSecondary: Color
        var textTertiary: Color
        var badge: Color
        var positive: Color
        var warning: Color
        var danger: Color
        var outgoing: [Color]
        /// Neutral dark field for immersive camera/call surfaces.
        var immersiveBackground: [Color]
    }

    struct Spacing: Sendable {
        let x1: CGFloat
        let x2: CGFloat
        let x3: CGFloat
        let x4: CGFloat
        let x6: CGFloat
        let contentInset: CGFloat
        let groupGap: CGFloat
        let sectionGap: CGFloat
    }

    struct Metrics: Sendable {
        let hitTarget: CGFloat
        let controlHeight: CGFloat
        let controlRadius: CGFloat
        let cardRadius: CGFloat
        let navigationHeight: CGFloat
        let hairline: CGFloat
    }

    struct TypeScale: Sendable {
        let rootTitle: CGFloat
        let navigationTitle: CGFloat
        let sectionTitle: CGFloat
        let row: CGFloat
        let body: CGFloat
        let metadata: CGFloat
        let caption: CGFloat
    }

    struct Icons: Sendable {
        let symbols: [IconRole: String]
        let weight: Font.Weight
        let productChromeSource: ProductChromeIconSource
        let tabAssets: [TabIconRole: String]

        func name(_ role: IconRole) -> String {
            symbols[role] ?? "questionmark"
        }

        func tabAsset(role: String, selected: Bool) -> String? {
            guard productChromeSource == .lucideAssets,
                  let semanticRole = TabIconRole(rawValue: role),
                  let base = tabAssets[semanticRole] else { return nil }
            return "lucide.tab.\(base).\(selected ? "selected" : "regular")"
        }
    }

    let id: String
    let strategy: Strategy
    let chrome: Chrome
    var palette: Palette
    let spacing: Spacing
    let metrics: Metrics
    let type: TypeScale
    let icons: Icons

    func icon(_ role: IconRole) -> String { icons.name(role) }

    func tabIconAsset(role: String, selected: Bool) -> String? {
        icons.tabAsset(role: role, selected: selected)
    }

    func requiredTabIconAsset(role: String, selected: Bool) -> String {
        guard let asset = tabIconAsset(role: role, selected: selected) else {
            preconditionFailure("Missing product tab glyph for \(role) in \(id)")
        }
        return asset
    }

    /// Evidence-backed VK iOS adapter. Product screens do not know these
    /// literal values; only the adapter does.
    static let vkReference = NativeVisualLanguage(
        id: "vk-ios",
        strategy: .reference,
        chrome: .referenceFlat,
        palette: Palette(
            accent: Color(hex: "0077FF"),
            background: .white,
            groupedBackground: Color(hex: "F2F3F5"),
            surface: .white,
            fill: Color(hex: "F2F3F5"),
            separator: Color(hex: "E7E8EC"),
            textPrimary: .black,
            textSecondary: Color(hex: "818C99"),
            textTertiary: Color(hex: "C4C8CC"),
            badge: Color(hex: "FF3347"),
            positive: Color(hex: "4BB34B"),
            warning: Color(hex: "A8690A"),
            danger: Color(hex: "E64646"),
            outgoing: [Color(hex: "4B8BF5"), Color(hex: "A44BF5"), Color(hex: "F54BA4")],
            immersiveBackground: [Color(hex: "3A4256"), Color(hex: "15171E")]
        ),
        spacing: Spacing(x1: 4, x2: 8, x3: 12, x4: 16, x6: 24,
                         contentInset: 16, groupGap: 9, sectionGap: 8),
        metrics: Metrics(hitTarget: 44, controlHeight: 44, controlRadius: 10,
                         cardRadius: 16, navigationHeight: 52, hairline: 0.5),
        type: TypeScale(rootTitle: 24, navigationTitle: 17, sectionTitle: 18,
                        row: 17, body: 15, metadata: 13, caption: 12),
        icons: Icons(
            symbols: defaultSymbols,
            weight: .semibold,
            productChromeSource: .lucideAssets,
            tabAssets: [
                .feed: "house", .houseMatters: "house", .discovery: "search",
                .messaging: "message-circle", .shortVideo: "circle-play",
                .infrastructure: "layout-grid", .services: "menu"
            ]
        )
    )

    /// Neutral adapter for deliberate product differentiation.
    static let product = NativeVisualLanguage(
        id: "native-product",
        strategy: .product,
        chrome: .system,
        palette: Palette(
            accent: Color(hex: "5B5BD6"),
            background: Color(hex: "FAFAFC"),
            groupedBackground: Color(hex: "F0F0F5"),
            surface: .white,
            fill: Color(hex: "F0F0F5"),
            separator: Color(hex: "E2E2EA"),
            textPrimary: Color(hex: "16161D"),
            textSecondary: Color(hex: "6F6F7C"),
            textTertiary: Color(hex: "9B9BA7"),
            badge: Color(hex: "E5484D"),
            positive: Color(hex: "30A46C"),
            warning: Color(hex: "AD5700"),
            danger: Color(hex: "E5484D"),
            outgoing: [Color(hex: "5B5BD6"), Color(hex: "7C5CFC")],
            immersiveBackground: [Color(hex: "34343E"), Color(hex: "141419")]
        ),
        spacing: Spacing(x1: 4, x2: 8, x3: 12, x4: 16, x6: 24,
                         contentInset: 16, groupGap: 8, sectionGap: 12),
        metrics: Metrics(hitTarget: 44, controlHeight: 48, controlRadius: 12,
                         cardRadius: 16, navigationHeight: 52, hairline: 0.5),
        type: TypeScale(rootTitle: 28, navigationTitle: 17, sectionTitle: 20,
                        row: 17, body: 16, metadata: 13, caption: 12),
        icons: Icons(symbols: defaultSymbols, weight: .semibold,
                     productChromeSource: .sfSymbols, tabAssets: [:])
    )

    static func resolve(_ design: NativeDesignDefinition) -> NativeVisualLanguage {
        var language = design.strategy == "mimicry" && design.referenceProfile == "vk-ios"
            ? NativeVisualLanguage.vkReference
            : NativeVisualLanguage.product
        language.apply(design.tokens)
        return language
    }

    private mutating func apply(_ tokens: [String: String]) {
        if let value = tokens["accent"] { palette.accent = Color(hex: value) }
        if let value = tokens["background"] { palette.background = Color(hex: value) }
        if let value = tokens["groupedBackground"] { palette.groupedBackground = Color(hex: value) }
        if let value = tokens["surface"] { palette.surface = Color(hex: value) }
        if let value = tokens["fill"] { palette.fill = Color(hex: value) }
        if let value = tokens["separator"] { palette.separator = Color(hex: value) }
        if let value = tokens["textPrimary"] { palette.textPrimary = Color(hex: value) }
        if let value = tokens["textSecondary"] { palette.textSecondary = Color(hex: value) }
        if let value = tokens["badge"] { palette.badge = Color(hex: value) }
        let outgoing = ["outgoingStart", "outgoingMiddle", "outgoingEnd"]
            .compactMap { tokens[$0] }.map { Color(hex: $0) }
        if outgoing.count >= 2 { palette.outgoing = outgoing }
    }

    private static let defaultSymbols: [IconRole: String] = [
        .back: "chevron.left", .disclosure: "chevron.right", .close: "xmark", .more: "ellipsis",
        .search: "magnifyingglass", .notifications: "bell", .like: "heart",
        .comment: "message", .share: "arrowshape.turn.up.right", .views: "eye",
        .profile: "person.crop.circle", .success: "checkmark.circle.fill",
        .warning: "exclamationmark.triangle.fill", .error: "xmark.circle.fill",
        .empty: "tray"
    ]
}

private struct NativeVisualLanguageKey: EnvironmentKey {
    static let defaultValue = NativeVisualLanguage.product
}

extension EnvironmentValues {
    var visualLanguage: NativeVisualLanguage {
        get { self[NativeVisualLanguageKey.self] }
        set { self[NativeVisualLanguageKey.self] = newValue }
    }
}
