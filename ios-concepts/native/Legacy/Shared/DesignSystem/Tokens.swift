import SwiftUI

extension View {
    /// Static and accessibility-visible binding between a product action
    /// contract and the control that implements it.
    func nativeAction(_ id: String) -> some View {
        modifier(NativeActionSemanticModifier(id: id))
    }

    /// Binds the current SwiftUI subtree to the canonical UX surface and its
    /// semantic component roles without generating or duplicating view code.
    func nativeSurface(_ id: String) -> some View {
        modifier(NativeSurfaceSemanticModifier(id: id))
    }
}

private struct NativeComponentRolesKey: EnvironmentKey {
    static let defaultValue: [String] = []
}

extension EnvironmentValues {
    var nativeComponentRoles: [String] {
        get { self[NativeComponentRolesKey.self] }
        set { self[NativeComponentRolesKey.self] = newValue }
    }
}

private struct NativeSurfaceSemanticModifier: ViewModifier {
    let id: String

    private var definition: NativeSurfaceDefinition? {
        NativeConceptSpec.surfaces.first { $0.id == id }
    }

    func body(content: Content) -> some View {
        let roles = definition?.componentRoles ?? []
        content
            .environment(\.nativeComponentRoles, roles)
            .background(alignment: .topLeading) {
                NativeSurfaceAccessibilityMarker(id: id, roles: roles)
            }
    }
}

/// Keeps surface identity observable without assigning it to the root view.
/// Assigning both surface and action identifiers to the same optimized SwiftUI
/// node lets the outer modifier overwrite the control's action contract.
private struct NativeSurfaceAccessibilityMarker: View {
    let id: String
    let roles: [String]

    var body: some View {
        Color.clear
            .frame(width: 1, height: 1)
            .accessibilityElement(children: .ignore)
            .accessibilityIdentifier((["surface", id] + roles).joined(separator: "."))
            .accessibilityLabel("Экран \(id)")
            .allowsHitTesting(false)
    }
}

private struct NativeActionSemanticModifier: ViewModifier {
    let id: String

    private var definition: NativeActionDefinition? {
        NativeConceptSpec.actions.first { $0.id == id }
    }

    func body(content: Content) -> some View {
        content
            .accessibilityIdentifier("action.\(id)")
            .accessibilityAddTraits(definition?.variant == "primary" ? .isButton : [])
            .accessibilityHint(definition.map {
                "\($0.outcome) · \($0.variant) · \($0.placement)"
            } ?? "")
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
    @Environment(\.visualLanguage) private var t
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background(configuration.isPressed ? t.palette.fill : .clear)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

extension View {
    func pressable(scale: CGFloat = 0.97) -> some View {
        buttonStyle(PressableStyle(scale: scale))
    }
}
