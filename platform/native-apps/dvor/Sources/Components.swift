import SwiftUI

/// Компоненты «Двора»: плотный список на серой странице, белая карточка,
/// строка с цветной плашкой-иконкой. Направление — из docs/03-design-system.md.

/// Белая карточка во всю ширину на серой странице.
struct DCard<Content: View>: View {
    var padding: CGFloat = 0
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 0) { content }
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(D.card, in: RoundedRectangle(cornerRadius: D.radius, style: .continuous))
    }
}

/// Заголовок секции над карточкой: капсом, приглушённый.
struct DSectionTitle: View {
    let text: String
    var body: some View {
        Text(text.uppercased())
            .font(.system(size: 12, weight: .semibold))
            .kerning(0.4)
            .foregroundStyle(D.mute)
            .padding(.horizontal, 4)
            .padding(.top, 4)
    }
}

/// Плейсхолдер медиа: в концепте вместо фотографий стоит серое поле с камерой.
struct DPhoto: View {
    var size: CGFloat? = nil
    var height: CGFloat? = nil
    var circle: Bool = false
    var glyph: CGFloat = 16

    var body: some View {
        let shape = RoundedRectangle(cornerRadius: circle ? 999 : 10, style: .continuous)
        shape
            .fill(D.quiet)
            .frame(width: size, height: size ?? height)
            .overlay {
                Image(systemName: "camera")
                    .font(.system(size: glyph))
                    .foregroundStyle(D.mute.opacity(0.55))
            }
            .overlay { shape.strokeBorder(D.line, lineWidth: circle ? 1 : 0) }
    }
}

/// Аватар: круг с камерой. Размеры из концепта — sm 36, md 44, lg 48, xl 72.
struct DAvatar: View {
    var size: CGFloat = 44
    var body: some View { DPhoto(size: size, circle: true, glyph: size * 0.3) }
}

/// Цветная плашка-иконка в начале строки — тинт акцента 10%.
struct DBullet: View {
    let symbol: String
    var tint: Color = D.accent
    var body: some View {
        RoundedRectangle(cornerRadius: 9, style: .continuous)
            .fill(tint.opacity(0.1))
            .frame(width: 34, height: 34)
            .overlay {
                Image(systemName: symbol)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(tint)
            }
    }
}

/// Чип-фильтр. Активный — залитый акцентом, с мягкой тенью.
struct DChip: View {
    let title: String
    var count: Int? = nil
    var active: Bool = false
    var inCard: Bool = false
    var action: () -> Void = {}

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Text(title)
                    .font(.system(size: 14, weight: active ? .semibold : .regular))
                if let count {
                    Text("\(count)")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(active ? D.accent : .white)
                        .padding(.horizontal, 5)
                        .padding(.vertical, 1)
                        .background(active ? Color.white : D.mute, in: Capsule())
                }
            }
            .foregroundStyle(active ? .white : D.ink)
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .background(active ? D.accent : (inCard ? D.quietIn : D.quiet),
                        in: RoundedRectangle(cornerRadius: 10, style: .continuous))
            .shadow(color: active ? D.accent.opacity(0.28) : .clear, radius: 6, y: 2)
        }
        .buttonStyle(.plain)
    }
}

/// Тег под постом: тинт акцента или предупреждение.
struct DTag: View {
    let title: String
    var warn: Bool = false
    var muted: Bool = false

    var body: some View {
        Text(title)
            .font(.system(size: 13))
            .foregroundStyle(warn ? D.orangeInk : (muted ? D.sub : D.accent))
            .padding(.horizontal, 9)
            .padding(.vertical, 4)
            .background(warn ? D.orange.opacity(0.14) : (muted ? D.quiet : D.accent.opacity(0.1)),
                        in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

/// Первичная кнопка. Не капсула — радиус 12, как везде в концепте.
struct DButton: View {
    let title: String
    var quiet: Bool = false
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(quiet ? D.ink : .white)
                .frame(maxWidth: .infinity, minHeight: 48)
                .background(quiet ? D.quiet : D.accent,
                            in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        }
        .buttonStyle(.plain)
    }
}

/// Строка списка внутри белой карточки. Разделителей внутри карточки нет —
/// только хайрлайн между строками, начинающийся после иконки.
struct DRow<Leading: View, Trailing: View>: View {
    let title: String
    var subtitle: String?
    @ViewBuilder var leading: Leading
    @ViewBuilder var trailing: Trailing
    var action: (() -> Void)? = nil

    var body: some View {
        let content = HStack(spacing: 10) {
            leading
            VStack(alignment: .leading, spacing: 1) {
                Text(title)
                    .font(.system(size: 16))
                    .foregroundStyle(D.ink)
                    .multilineTextAlignment(.leading)
                if let subtitle {
                    Text(subtitle)
                        .font(.system(size: 14))
                        .foregroundStyle(D.sub)
                        .multilineTextAlignment(.leading)
                }
            }
            Spacer(minLength: 8)
            trailing
        }
        .padding(.horizontal, D.inset)
        .padding(.vertical, 10)
        .frame(minHeight: D.rowMin)
        .contentShape(.rect)

        if let action {
            Button(action: action) { content }.buttonStyle(.plain)
        } else {
            content
        }
    }
}

extension DRow where Trailing == DChevron {
    init(title: String, subtitle: String? = nil, @ViewBuilder leading: () -> Leading, action: (() -> Void)? = nil) {
        self.init(title: title, subtitle: subtitle, leading: leading, trailing: { DChevron() }, action: action)
    }
}

struct DChevron: View {
    var body: some View {
        Image(systemName: "chevron.right")
            .font(.system(size: 13, weight: .semibold))
            .foregroundStyle(D.mute.opacity(0.7))
    }
}

/// Хайрлайн между строками карточки.
struct DHair: View {
    var inset: CGFloat = D.inset
    var body: some View {
        Rectangle().fill(D.line).frame(height: 0.5).padding(.leading, inset)
    }
}
