import SwiftUI

// Компоненты-сигнатуры. Экраны компонуются из них свободно — это не набор
// готовых экранов, а строительный материал.

// MARK: - Карточка на сером фоне (главный ритм ВК)

struct Card<Content: View>: View {
    var padding: CGFloat? = nil
    @ViewBuilder var content: Content
    @Environment(\.theme) private var t
    var body: some View {
        VStack(alignment: .leading, spacing: 0) { content }
            .padding(padding ?? 0)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(t.card)
            .clipShape(RoundedRectangle(cornerRadius: t.cardRadius, style: .continuous))
    }
}

// MARK: - Аватар: круг с инициалами (фото не используем)

struct Avatar: View {
    let name: String
    var size: CGFloat = 40
    var ring: Bool = false
    @Environment(\.theme) private var t

    private var initials: String {
        let parts = name.split(separator: " ").prefix(2)
        let s = parts.compactMap { $0.first }.map(String.init).joined()
        return s.isEmpty ? "?" : s.uppercased()
    }
    // Сдержанная палитра: аватары различимы, но не превращают экран в радугу.
    private var tint: Color {
        let palette = ["4C7DF0", "5AA9E6", "7C6BE0", "3FA88C", "E0719A", "E08A4B"]
        var h = 5381
        for u in name.unicodeScalars { h = (h &* 33) &+ Int(u.value) }
        return Color(hex: palette[abs(h) % palette.count])
    }

    var body: some View {
        Circle()
            .fill(tint)
            .frame(width: size, height: size)
            .overlay(
                Text(initials)
                    .font(.system(size: size * 0.38, weight: .semibold))
                    .foregroundStyle(.white)
            )
            .overlay {
                if ring {
                    Circle().stroke(t.accent, lineWidth: 2)
                        .padding(-3)
                }
            }
    }
}

// MARK: - Шапка экрана: крупный заголовок + действия справа

struct ScreenHeader<Trailing: View>: View {
    let title: String
    var avatar: String? = nil
    @ViewBuilder var trailing: Trailing
    @Environment(\.theme) private var t

    var body: some View {
        HStack(spacing: 12) {
            if let avatar { Avatar(name: avatar, size: 36) }
            Text(title).font(.dsScreenTitle).foregroundStyle(t.textPrimary)
            Spacer()
            HStack(spacing: 20) { trailing }
                .font(.system(size: 22, weight: .regular))
                .foregroundStyle(t.accent)
        }
        .padding(.horizontal, t.pad)
        .padding(.top, 4)
        .padding(.bottom, 10)
        .background(t.card)   // шапка всегда белая: иначе виден шов с серым фоном ленты
    }
}

// MARK: - Табы с подчёркиванием

struct UnderlineTabs: View {
    let items: [String]
    @Binding var selection: Int
    @Environment(\.theme) private var t
    @Namespace private var ns

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 20) {
                ForEach(items.indices, id: \.self) { i in
                    Button {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.85)) { selection = i }
                    } label: {
                        VStack(spacing: 6) {
                            Text(items[i])
                                .font(.system(size: 17, weight: selection == i ? .semibold : .regular))
                                .foregroundStyle(selection == i ? t.textPrimary : t.textSecondary)
                            ZStack {
                                Capsule().fill(.clear).frame(height: 3)
                                if selection == i {
                                    Capsule().fill(t.accent).frame(height: 3)
                                        .matchedGeometryEffect(id: "tab", in: ns)
                                }
                            }
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, t.pad)
        }
        .background(t.card)
    }
}

// MARK: - Пилюли-фильтры

struct FilterPills: View {
    let items: [(String, String?)]   // (заголовок, sf symbol)
    @Binding var selection: Int
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(items.indices, id: \.self) { i in
                    Button {
                        withAnimation(.easeOut(duration: 0.18)) { selection = i }
                    } label: {
                        HStack(spacing: 6) {
                            if let icon = items[i].1 {
                                Image(systemName: icon).font(.system(size: 14, weight: .medium))
                            }
                            Text(items[i].0).font(.system(size: 15, weight: .medium))
                        }
                        .foregroundStyle(selection == i ? t.accent : t.textPrimary)
                        .padding(.horizontal, 14)
                        .frame(height: 36)
                        .background(selection == i ? t.accentSoft : t.fieldFill, in: Capsule())
                    }
                    .pressable()
                }
            }
            .padding(.horizontal, t.pad)
        }
    }
}

// MARK: - Капсула действия поста (сигнатура ВК)

struct ActionPill: View {
    let icon: String
    let count: String
    var active: Bool = false
    var activeColor: Color? = nil
    let action: () -> Void
    @Environment(\.theme) private var t

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: active ? icon + ".fill" : icon)
                    .font(.system(size: 15, weight: .medium))
                    .symbolEffect(.bounce, value: active)
                Text(count).font(.dsAction)
            }
            .foregroundStyle(active ? (activeColor ?? t.accent) : t.textPrimary)
            .padding(.horizontal, 12)
            .frame(height: 32)
            .background(t.fieldFill, in: Capsule())
        }
        .pressable(scale: 0.94)
    }
}

// MARK: - Поле поиска

struct SearchField: View {
    let placeholder: String
    @Binding var text: String
    @Environment(\.theme) private var t
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass").foregroundStyle(t.textTertiary)
            TextField(placeholder, text: $text)
                .font(.system(size: 16))
                .foregroundStyle(t.textPrimary)
        }
        .padding(.horizontal, 12)
        .frame(height: 40)
        .background(t.fieldFill, in: Capsule())
    }
}

// MARK: - Кнопки

struct PrimaryButton: View {
    let title: String
    var icon: String? = nil
    let action: () -> Void
    @Environment(\.theme) private var t
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if let icon { Image(systemName: icon).font(.system(size: 16, weight: .semibold)) }
                Text(title).font(.system(size: 16, weight: .semibold))
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity).frame(height: 44)
            .background(t.accent, in: RoundedRectangle(cornerRadius: t.controlRadius, style: .continuous))
        }
        .pressable()
    }
}

struct SquareButton: View {
    let icon: String
    let action: () -> Void
    @Environment(\.theme) private var t
    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 18, weight: .medium))
                .foregroundStyle(t.accent)
                .frame(width: 44, height: 44)
                .background(t.fieldFill, in: RoundedRectangle(cornerRadius: t.controlRadius, style: .continuous))
        }
        .pressable()
    }
}

// MARK: - Медиа-блок вместо фото (геометрия ВК сохраняется)

struct MediaBlock: View {
    var glyph: String = "photo"
    var height: CGFloat = 300
    var seed: Int = 0
    @Environment(\.theme) private var t

    private var colors: [Color] {
        let palettes: [[String]] = [
            ["6E8BFF", "9B6EFF"], ["FF7A9C", "FFB36E"], ["4FC3A1", "3EA6FF"],
            ["FFB661", "FF7A5C"], ["8E7BFF", "5AC8FA"], ["5AC8FA", "34C6A2"],
        ]
        return palettes[abs(seed) % palettes.count].map { Color(hex: $0) }
    }

    var body: some View {
        LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
            .frame(height: height)
            .overlay(
                Image(systemName: glyph)
                    .font(.system(size: 44, weight: .light))
                    .foregroundStyle(.white.opacity(0.9))
            )
            .clipped()
    }
}

// MARK: - Разделитель внутри карточки

struct RowDivider: View {
    var leading: CGFloat = 0
    @Environment(\.theme) private var t
    var body: some View {
        Rectangle().fill(t.separator).frame(height: 0.5).padding(.leading, leading)
    }
}

// MARK: - Строка-ссылка «Показать всё ›»

struct ShowAllRow: View {
    let title: String
    let action: () -> Void
    @Environment(\.theme) private var t
    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Text(title).font(.system(size: 15, weight: .medium))
                Image(systemName: "chevron.right").font(.system(size: 12, weight: .semibold))
            }
            .foregroundStyle(t.accent)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 13)
        }
        .buttonStyle(HighlightStyle())
    }
}
