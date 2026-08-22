import SwiftUI

// Компоненты ядра — нативные вьюхи под сетку 16 / 44 / 72.

/// Плейсхолдер медиа: правило «визуал не делаем» в нативном виде.
struct Placeholder: View {
    var height: CGFloat = 172
    var onDark: Bool = false
    var body: some View {
        RoundedRectangle(cornerRadius: Grid.radius, style: .continuous)
            .fill(onDark ? Color.white.opacity(0.08) : Color(.systemGray5))
            .frame(height: height)
            .overlay(
                Image(systemName: "camera")
                    .font(.system(size: 22))
                    .foregroundStyle(onDark ? Color.white.opacity(0.35) : Color(.systemGray))
            )
    }
}

/// Строка списка: значок 44, текст с 72, опциональный шеврон-обещание перехода.
struct Row: View {
    let title: String
    var subtitle: String? = nil
    var systemImage: String? = nil
    var chevron: Bool = false
    var trailing: String? = nil
    var body: some View {
        HStack(spacing: Grid.gap) {
            if let systemImage {
                Image(systemName: systemImage)
                    .font(.system(size: 18, weight: .medium))
                    .frame(width: Grid.control, height: Grid.control)
                    .foregroundStyle(.secondary)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.body)
                if let subtitle {
                    Text(subtitle).font(.footnote).foregroundStyle(.secondary)
                }
            }
            Spacer(minLength: 8)
            if let trailing {
                Text(trailing).font(.footnote).foregroundStyle(.secondary)
            }
            if chevron {
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Color(.tertiaryLabel))
            }
        }
        .padding(.vertical, 10)
        .contentShape(Rectangle())
    }
}

/// Карточка-секция с заголовком.
struct SectionCard<Content: View>: View {
    let title: String?
    @ViewBuilder var content: Content
    init(_ title: String? = nil, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if let title {
                Text(title)
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)
            }
            VStack(alignment: .leading, spacing: 0) { content }
                .padding(.horizontal, Grid.edge)
                .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: Grid.radius, style: .continuous))
        }
    }
}

/// Индикатор состояния загрузки — приложение всегда наполовину в процессе.
struct DownloadRow: View {
    enum State { case ready, busy(Double), none(String) }
    let title: String
    let state: State
    var body: some View {
        HStack(spacing: Grid.gap) {
            VStack(alignment: .leading, spacing: 4) {
                Text(title).font(.body)
                switch state {
                case .ready:
                    Text("Скачано").font(.caption).foregroundStyle(.secondary)
                case .busy(let p):
                    ProgressView(value: p).frame(maxWidth: 160)
                case .none(let size):
                    Text(size).font(.caption).foregroundStyle(.secondary)
                }
            }
            Spacer()
            switch state {
            case .ready: Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
            case .busy: Image(systemName: "stop.circle").foregroundStyle(.secondary)
            case .none: Image(systemName: "arrow.down.circle").foregroundStyle(Color.accentColor)
            }
        }
        .padding(.vertical, 8)
    }
}

struct Divider16: View {
    var body: some View {
        Divider().padding(.leading, Grid.text - Grid.edge)
    }
}
