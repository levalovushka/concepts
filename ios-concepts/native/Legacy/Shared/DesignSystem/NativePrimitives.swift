import SwiftUI

enum NativeFeedbackKind: Equatable, Sendable {
    case empty, loading, success, warning, error
}

enum NativeActionVariant: Sendable {
    case primary
    case secondary
    case destructive
}

enum NativeStatePlacement: Sendable {
    case inline
    case page
}

/// One action primitive owns loading, disabled, optical weight, hit target and
/// press feedback. Product wrappers provide vocabulary, not fresh geometry.
struct NativeActionButton: View {
    let title: String
    var loadingTitle: String? = nil
    var isLoading = false
    var isDisabled = false
    var icon: String? = nil
    var variant: NativeActionVariant = .primary
    var usesAccent = true
    let action: () -> Void

    @Environment(\.visualLanguage) private var language

    var body: some View {
        Button(action: action) {
            HStack(spacing: language.spacing.x2) {
                if isLoading {
                    ProgressView()
                        .tint(foreground)
                        .controlSize(.small)
                } else if let icon {
                    Image(systemName: icon)
                        .font(.system(size: 16, weight: language.icons.weight))
                }
                Text(isLoading ? (loadingTitle ?? title) : title)
                    .font(.system(size: language.type.body, weight: .semibold))
            }
            .foregroundStyle(foreground)
            .frame(maxWidth: .infinity)
            .frame(minHeight: language.metrics.hitTarget)
            .contentShape(Rectangle())
            .background(background)
        }
        .buttonStyle(PressableStyle())
        .disabled(isDisabled || isLoading)
        .accessibilityValue(isLoading ? "Выполняется" : "")
    }

    private var foreground: Color {
        if isDisabled { return language.palette.textSecondary }
        switch variant {
        case .primary, .destructive: return .white
        case .secondary: return usesAccent ? language.palette.accent : language.palette.textPrimary
        }
    }

    @ViewBuilder private var background: some View {
        let shape = RoundedRectangle(cornerRadius: language.metrics.controlRadius, style: .continuous)
        switch variant {
        case .primary:
            shape.fill(isDisabled ? language.palette.fill : language.palette.accent)
        case .secondary:
            shape.stroke(usesAccent ? language.palette.accent.opacity(0.5) : language.palette.separator, lineWidth: 1)
        case .destructive:
            shape.fill(isDisabled ? language.palette.fill : language.palette.danger)
        }
    }
}

/// Shared feedback anatomy. Meaning is carried by copy and a status glyph;
/// the container stays neutral to avoid decorative colored placeholder cards.
struct NativeStatePanel: View {
    let kind: NativeFeedbackKind
    let title: String
    let detail: String
    var icon: String? = nil
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil
    var placement: NativeStatePlacement = .inline

    @Environment(\.visualLanguage) private var language

    var body: some View {
        Group {
            switch placement {
            case .inline: inlineBody
            case .page: pageBody
            }
        }
        .accessibilityElement(children: .combine)
    }

    private var inlineBody: some View {
        HStack(alignment: .top, spacing: language.spacing.x3) {
            statusGlyph(size: 18).frame(width: 24, height: 24)

            VStack(alignment: .leading, spacing: language.spacing.x1) {
                Text(title)
                    .font(.system(size: language.type.body, weight: .semibold))
                    .foregroundStyle(language.palette.textPrimary)
                Text(detail)
                    .font(.system(size: language.type.metadata))
                    .foregroundStyle(language.palette.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
                if let actionTitle, let action {
                    Button(actionTitle, action: action)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(language.palette.accent)
                        .frame(minHeight: language.metrics.hitTarget)
                        .accessibilityLabel(actionTitle)
                }
            }
            Spacer(minLength: 0)
        }
        .padding(language.spacing.x3)
        .background(language.palette.surface,
                    in: RoundedRectangle(cornerRadius: language.metrics.controlRadius, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: language.metrics.controlRadius, style: .continuous)
                .stroke(language.palette.separator, lineWidth: 1)
        }
    }

    private var pageBody: some View {
        VStack(spacing: language.spacing.x2) {
            statusGlyph(size: 28)
                .frame(width: 36, height: 36)
                .padding(.bottom, language.spacing.x1)
            Text(title)
                .font(.system(size: language.type.sectionTitle, weight: .semibold))
                .foregroundStyle(language.palette.textPrimary)
                .multilineTextAlignment(.center)
            Text(detail)
                .font(.system(size: language.type.body))
                .foregroundStyle(language.palette.textSecondary)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
            if let actionTitle, let action {
                Button(actionTitle, action: action)
                    .font(.system(size: language.type.body, weight: .semibold))
                    .foregroundStyle(language.palette.accent)
                    .frame(minHeight: language.metrics.hitTarget)
                    .padding(.top, language.spacing.x1)
                    .accessibilityLabel(actionTitle)
            }
        }
        .frame(maxWidth: .infinity, minHeight: 240)
        .padding(.horizontal, language.spacing.x6)
    }

    @ViewBuilder private func statusGlyph(size: CGFloat) -> some View {
        if kind == .loading {
            ProgressView().tint(tint)
        } else {
            Image(systemName: icon ?? defaultIcon)
                .font(.system(size: size, weight: language.icons.weight))
                .foregroundStyle(tint)
        }
    }

    private var defaultIcon: String {
        switch kind {
        case .empty: language.icon(.empty)
        case .loading: "arrow.triangle.2.circlepath"
        case .success: language.icon(.success)
        case .warning: language.icon(.warning)
        case .error: language.icon(.error)
        }
    }

    private var tint: Color {
        switch kind {
        case .empty, .loading: language.palette.textSecondary
        case .success: language.palette.positive
        case .warning: language.palette.warning
        case .error: language.palette.danger
        }
    }
}
