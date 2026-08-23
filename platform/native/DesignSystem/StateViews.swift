import SwiftUI

// Состояния экрана — часть дизайн-системы, а не концепта: пустой список,
// загрузка, отказ доступа и ошибка выглядят одинаково во всех концептах,
// иначе каждый изобретает свою пустоту.

struct AppStatePanel: View {
    enum Kind {
        case empty, loading, success, warning, error

        var icon: String {
            switch self {
            case .empty: "tray"
            case .loading: "arrow.triangle.2.circlepath"
            case .success: "checkmark.circle.fill"
            case .warning: "exclamationmark.triangle.fill"
            case .error: "xmark.circle.fill"
            }
        }
    }

    let kind: Kind
    let title: String
    let detail: String
    var icon: String? = nil
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil
    @Environment(\.theme) private var t

    private var tint: Color {
        switch kind {
        case .empty, .loading: t.textSecondary
        case .success: t.positive
        case .warning: t.warning
        case .error: t.danger
        }
    }

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Group {
                if kind == .loading {
                    ProgressView().tint(tint)
                } else {
                    Image(systemName: icon ?? kind.icon)
                        .font(.system(size: 18, weight: .semibold))
                }
            }
            .foregroundStyle(tint)
            .frame(width: 24, height: 24)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.role(.name))
                    .foregroundStyle(t.textPrimary)
                Text(detail)
                    .font(.role(.meta))
                    .foregroundStyle(t.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
                if let actionTitle, let action {
                    Button(actionTitle, action: action)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(t.accent)
                        .frame(minHeight: 44)
                }
            }
            Spacer(minLength: 0)
        }
        .padding(12)
        // Semantic colour belongs to the status glyph, not to a decorative card.
        // Keeping the surface neutral makes feedback feel native to the VK shell
        // and prevents a feed of unrelated green, amber and red blocks.
        .background(t.card, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(t.separator, lineWidth: 1)
        }
        .accessibilityElement(children: .combine)
    }
}

// MARK: - Stateful actions

