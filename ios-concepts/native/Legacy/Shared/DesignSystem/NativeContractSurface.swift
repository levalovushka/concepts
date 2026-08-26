import SwiftUI

enum NativeProductCaptureState {
    static func productState(for surface: String) -> String? {
        let arguments = ProcessInfo.processInfo.arguments
        guard let screen = arguments.firstIndex(of: "-shot"), screen + 1 < arguments.count,
              arguments[screen + 1] == surface,
              let state = arguments.firstIndex(of: "-state"), state + 1 < arguments.count else { return nil }
        return arguments[state + 1]
    }
}

/// Executes one compiled product action without deciding the composition of
/// the owning surface. Core product screens use it inside their own layout;
/// secondary capability screens may use the neutral surface below.
struct NativeContractActionControl: View {
    let surfaceID: String
    var title: String? = nil
    var compact = false
    @Environment(\.visualLanguage) private var t
    @State private var completed = false

    private var action: NativeActionDefinition? {
        NativeConceptSpec.actions.first { $0.surface == surfaceID }
    }

    var body: some View {
        if let action {
            actionControl(action)
        }
    }

    @ViewBuilder private func actionControl(_ action: NativeActionDefinition) -> some View {
        if action.outcome == "navigate", let target = action.target {
            NavigationLink(value: target) { label(action) }
                .buttonStyle(PressableStyle())
                .nativeAction(action.id)
        } else {
            Button { completed = true } label: { label(action) }
                .buttonStyle(PressableStyle())
                .nativeAction(action.id)
        }
    }

    private func label(_ action: NativeActionDefinition) -> some View {
        HStack(spacing: 10) {
            Text(completed ? "Готово" : (title ?? action.label)).font(.role(.button))
            Spacer(minLength: 8)
            Image(systemName: completed ? "checkmark.circle.fill" : "arrow.right")
        }
        .foregroundStyle(.white)
        .padding(.horizontal, 16)
        .frame(maxWidth: .infinity, minHeight: compact ? 44 : 50)
        .background(t.palette.accent, in: RoundedRectangle(cornerRadius: t.metrics.controlRadius, style: .continuous))
    }
}

struct NativeCapabilityControls: View {
    let surfaceID: String
    @Environment(Permissions.self) private var permissions
    @Environment(\.visualLanguage) private var t
    @State private var outcomes: [String: Bool] = [:]

    private var surfacePermissions: [NativePermissionDefinition] {
        NativeConceptSpec.permissions.filter { $0.screen == surfaceID }
    }

    var body: some View {
        ForEach(surfacePermissions) { permission in
            Button {
                Task {
                    outcomes[permission.key] = await permissions.request(PermissionKey(rawValue: permission.key))
                }
            } label: {
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: outcomes[permission.key] == false ? "exclamationmark.shield" : "checkmark.shield")
                    VStack(alignment: .leading, spacing: 3) {
                        Text(permission.gesture).textStyle(.name)
                        Text(outcomes[permission.key] == false ? permission.fallback : permission.feature)
                            .textStyle(.meta).foregroundStyle(t.palette.textSecondary)
                    }
                    Spacer(minLength: 0)
                }
                .foregroundStyle(t.palette.textPrimary)
                .padding(14)
                .frame(maxWidth: .infinity, minHeight: 50, alignment: .leading)
                .background(t.palette.surface, in: RoundedRectangle(cornerRadius: t.metrics.controlRadius))
            }
            .buttonStyle(.plain)
            .accessibilityIdentifier("permission.\(surfaceID).\(permission.key)")
        }
    }
}

/// Neutral realization for non-core capability and recovery surfaces. It is
/// intentionally unavailable as an application root: product identity gates
/// require every core surface to have an owned composition in app sources.
struct NativeSecondarySurface: View {
    let surfaceID: String
    @Environment(\.visualLanguage) private var t

    private var surface: NativeSurfaceDefinition? {
        NativeConceptSpec.surfaces.first { $0.id == surfaceID }
    }
    private var title: String {
        NativeConceptSpec.localizedStrings[surface?.titleKey ?? ""] ?? surfaceID
    }
    private var purpose: String {
        NativeConceptSpec.localizedStrings[surface?.purposeKey ?? ""] ?? "Продолжить задачу"
    }
    private var content: [String] { NativeConceptSpec.fixtureText[surfaceID] ?? [] }
    private var productState: String? { NativeProductCaptureState.productState(for: surfaceID) }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(title).textStyle(.largeTitle)
                    Text(purpose).textStyle(.body).foregroundStyle(t.palette.textSecondary)
                }
                if let productState, productState != "default" {
                    statePanel(productState)
                }
                if let headline = content.first {
                    VStack(alignment: .leading, spacing: 10) {
                        Text(headline).textStyle(.cardTitle)
                        ForEach(Array(content.dropFirst()), id: \.self) { value in
                            Text(value).textStyle(.meta).foregroundStyle(t.palette.textSecondary)
                        }
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(t.palette.surface, in: RoundedRectangle(cornerRadius: t.metrics.cardRadius, style: .continuous))
                }
                NativeContractActionControl(surfaceID: surfaceID)
                NativeCapabilityControls(surfaceID: surfaceID)
            }
            .padding(t.spacing.contentInset)
        }
        .background(t.palette.groupedBackground)
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .nativeSurface(surfaceID)
    }

    @ViewBuilder private func statePanel(_ state: String) -> some View {
        switch state {
        case "loading": NativeStatePanel(kind: .loading, title: "Обновляем данные", detail: "Текущая задача остаётся на экране.")
        case "empty": NativeStatePanel(kind: .empty, title: "Здесь пока пусто", detail: "Начните с основного действия ниже.")
        case "offline": NativeStatePanel(kind: .warning, title: "Нет сети", detail: "Показываем сохранённые данные и отметили их свежесть.")
        case "denied", "restricted", "limited": NativeStatePanel(kind: .warning, title: "Доступ ограничен", detail: "Основная задача доступна через запасной путь.")
        default: NativeStatePanel(kind: .error, title: "Не удалось обновить", detail: "Введённые данные сохранены — повторите действие.")
        }
    }
}
