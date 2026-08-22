import SwiftUI

// Компоненты ВК. Геометрия — из vk-visual-profile.md, раздел «Компоненты».

// MARK: - Аватар

struct Avatar: View {
    let name: String
    var size: CGFloat = 40
    var ring: Bool = false          // синяя обводка истории
    var online: Bool = false
    @Environment(\.theme) private var t

    private var initials: String {
        let words = name.split(whereSeparator: { !$0.isLetter })
        let s = words.prefix(2).compactMap { $0.first }.map(String.init).joined()
        return s.isEmpty ? "?" : s.uppercased()
    }
    private var tint: Color {
        let palette = ["4C7DF0", "5AA9E6", "7C6BE0", "3FA88C", "E0719A", "E0834B"]
        var h = 5381
        for u in name.unicodeScalars { h = (h &* 33) &+ Int(u.value) }
        return Color(hex: palette[abs(h) % palette.count])
    }

    var body: some View {
        Circle()
            .fill(tint)
            .frame(width: size, height: size)
            .overlay(Text(initials)
                .font(.system(size: size * 0.36, weight: .medium))
                .foregroundStyle(.white))
            .overlay {
                if ring { Circle().stroke(t.accent, lineWidth: 3).padding(-5) }
            }
            .overlay(alignment: .bottomTrailing) {
                if online {
                    Circle().fill(Color(hex: "4BB34B"))
                        .frame(width: max(12, size * 0.17), height: max(12, size * 0.17))
                        .overlay(Circle().stroke(.white, lineWidth: 2))
                }
            }
    }
}

// MARK: - Топбар вкладки: аватар · заголовок · действия справа

struct VKTabHeader<Trailing: View>: View {
    let title: String
    var avatar: String? = nil
    var dropdown: Bool = false
    @ViewBuilder var trailing: Trailing
    @Environment(\.theme) private var t

    var body: some View {
        HStack(spacing: 10) {
            if let avatar { Avatar(name: avatar, size: 32) }
            HStack(spacing: 4) {
                Text(title).font(.vkTabTitle).foregroundStyle(t.textPrimary)
                if dropdown {
                    Image(systemName: "chevron.down")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(t.textPrimary)
                }
            }
            Spacer()
            HStack(spacing: 18) { trailing }
                .font(.system(size: 22, weight: .regular))
                .foregroundStyle(t.accent)
        }
        .frame(height: 52)
        .padding(.horizontal, t.pad)
        .background(t.background)
    }
}

// MARK: - Серая полоса между группами

struct GroupGap: View {
    var height: CGFloat = 9
    @Environment(\.theme) private var t
    var body: some View { t.groupGap.frame(height: height) }
}

/// Разделитель внутри списка — начинается от текста, не от края.
struct RowSeparator: View {
    var leading: CGFloat = 68
    @Environment(\.theme) private var t
    var body: some View {
        t.separator.frame(height: 0.5).padding(.leading, leading)
    }
}

// MARK: - Строка списка: синяя контурная иконка · текст · шеврон

struct VKRow: View {
    let title: String
    var subtitle: String? = nil
    var icon: String? = nil
    var value: String? = nil
    var chevron: Bool = true
    var toggle: Binding<Bool>? = nil
    @Environment(\.theme) private var t

    var body: some View {
        HStack(spacing: 16) {
            if let icon {
                Image(systemName: icon)
                    .font(.system(size: 22, weight: .light))
                    .foregroundStyle(t.accent)
                    .frame(width: 28, alignment: .center)
            }
            VStack(alignment: .leading, spacing: 1) {
                Text(title).font(.vkRow).foregroundStyle(t.textPrimary)
                if let subtitle {
                    Text(subtitle).font(.vkMeta).foregroundStyle(t.textSecondary)
                }
            }
            Spacer(minLength: 8)
            if let value {
                Text(value).font(.vkRow).foregroundStyle(t.textSecondary)
            }
            if let toggle {
                Toggle("", isOn: toggle).labelsHidden()
            } else if chevron {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Color(hex: "C4C8CC"))
            }
        }
        .padding(.horizontal, t.pad)
        .frame(minHeight: 48)
        .contentShape(Rectangle())
    }
}

// MARK: - Поле поиска

struct VKSearchField: View {
    let placeholder: String
    @Binding var text: String
    @Environment(\.theme) private var t
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 17)).foregroundStyle(t.textSecondary)
            TextField(placeholder, text: $text)
                .textFieldStyle(.plain)
                .font(.system(size: 17))
                .foregroundStyle(t.textPrimary)
        }
        .padding(.horizontal, 14)
        .frame(height: 44)
        .background(t.fill, in: Capsule())
    }
}

// MARK: - Кнопки

/// Основная синяя.
struct VKButton: View {
    let title: String
    var icon: String? = nil
    let action: () -> Void
    @Environment(\.theme) private var t
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if let icon { Image(systemName: icon).font(.system(size: 16, weight: .medium)) }
                Text(title).font(.system(size: 17, weight: .medium))
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity).frame(height: 44)
            .background(t.accent, in: RoundedRectangle(cornerRadius: t.controlRadius, style: .continuous))
        }
        .pressable()
    }
}

/// Серая капсула: «Подписаться», «Скрыть».
struct VKPill: View {
    let title: String
    var action: () -> Void = {}
    @Environment(\.theme) private var t
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(t.textPrimary)
                .padding(.horizontal, 14).frame(height: 32)
                .background(t.fill, in: Capsule())
        }
        .pressable(scale: 0.95)
    }
}

/// Обводочная во всю ширину: синяя или нейтральная.
struct VKOutlineButton: View {
    let title: String
    var icon: String? = nil
    var tinted: Bool = true
    let action: () -> Void
    @Environment(\.theme) private var t
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if let icon { Image(systemName: icon).font(.system(size: 16)) }
                Text(title).font(.system(size: 17, weight: .medium))
            }
            .foregroundStyle(tinted ? t.accent : t.textPrimary)
            .frame(maxWidth: .infinity).frame(height: 46)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(tinted ? t.accent.opacity(0.5) : t.separator, lineWidth: 1)
            )
        }
        .pressable()
    }
}

// MARK: - Табы с подчёркиванием

struct VKTabs: View {
    let items: [String]
    @Binding var selection: Int
    @Environment(\.theme) private var t
    @Namespace private var ns

    var body: some View {
        HStack(spacing: 0) {
            ForEach(items.indices, id: \.self) { i in
                Button {
                    withAnimation(.spring(response: 0.28, dampingFraction: 0.85)) { selection = i }
                } label: {
                    VStack(spacing: 7) {
                        Text(items[i])
                            .font(.system(size: 17, weight: selection == i ? .semibold : .regular))
                            .foregroundStyle(selection == i ? t.textPrimary : t.textSecondary)
                        ZStack {
                            Capsule().fill(.clear).frame(height: 2.5)
                            if selection == i {
                                Capsule().fill(t.accent).frame(height: 2.5)
                                    .matchedGeometryEffect(id: "vktab", in: ns)
                            }
                        }
                    }
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.top, 6)
        .background(t.background)
    }
}

// MARK: - Медиа-блок вместо фото (геометрия ВК сохраняется)

struct VKMedia: View {
    var glyph: String = "photo"
    var height: CGFloat = 300
    var seed: Int = 0
    var pageBadge: String? = nil

    private var tint: Color {
        let p = ["5B7CFA", "E0719A", "3FA88C", "E0834B", "8B6EE0", "5AA9E6"]
        return Color(hex: p[abs(seed) % p.count])
    }

    var body: some View {
        ZStack {
            LinearGradient(colors: [tint.opacity(0.20), tint.opacity(0.42)],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
            Image(systemName: glyph)
                .font(.system(size: 54, weight: .ultraLight))
                .foregroundStyle(tint)
        }
        .frame(maxWidth: .infinity)
        .frame(height: height > 0 ? height : nil)
        .clipped()
        .overlay(alignment: .topTrailing) {
            if let pageBadge {
                Text(pageBadge)
                    .font(.system(size: 13, weight: .medium)).foregroundStyle(.white)
                    .padding(.horizontal, 9).padding(.vertical, 4)
                    .background(.black.opacity(0.4), in: Capsule())
                    .padding(12)
            }
        }
    }
}

// MARK: - Сетка сервисов: скруглённые квадраты с ярким градиентом

struct VKServiceTile: View {
    let title: String
    let icon: String
    let colors: [String]
    let action: () -> Void
    @Environment(\.theme) private var t

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(LinearGradient(colors: colors.map { Color(hex: $0) },
                                         startPoint: .topLeading, endPoint: .bottomTrailing))
                    .frame(width: 64, height: 64)
                    .overlay(Image(systemName: icon)
                        .font(.system(size: 27, weight: .medium)).foregroundStyle(.white))
                Text(title).font(.vkCaption).foregroundStyle(t.textPrimary)
                    .lineLimit(1).minimumScaleFactor(0.85)
            }
            .frame(maxWidth: .infinity)
        }
        .pressable(scale: 0.94)
    }
}

// MARK: - Заголовок секции со ссылкой справа

struct VKSectionHeader: View {
    let title: String
    var action: String? = nil
    var onTap: () -> Void = {}
    @Environment(\.theme) private var t
    var body: some View {
        HStack {
            Text(title).font(.vkSection).foregroundStyle(t.textPrimary)
            Spacer()
            if let action {
                Button(action: onTap) {
                    Text(action).font(.system(size: 17)).foregroundStyle(t.accent)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, t.pad)
        .padding(.top, 16).padding(.bottom, 10)
    }
}

// MARK: - Таб-бар ВК: плоский, край в край, пять иконок без подписей

struct VKTabBar: View {
    struct Item: Identifiable {
        let id: Int
        let icon: String
        let iconActive: String
        var badge: Int = 0
        var dot: Bool = false
    }
    let items: [Item]
    @Binding var selection: Int
    @Environment(\.theme) private var t

    var body: some View {
        HStack(spacing: 0) {
            ForEach(items) { item in
                Button {
                    withAnimation(.easeOut(duration: 0.12)) { selection = item.id }
                } label: {
                    ZStack(alignment: .topTrailing) {
                        Image(systemName: selection == item.id ? item.iconActive : item.icon)
                            .font(.system(size: 25, weight: .regular))
                            .foregroundStyle(selection == item.id ? t.accent : Color(hex: "99A2AD"))
                            .frame(maxWidth: .infinity)
                            .frame(height: 34)
                        if item.badge > 0 {
                            Text("\(item.badge)")
                                .font(.system(size: 11, weight: .semibold)).foregroundStyle(.white)
                                .padding(.horizontal, 5).padding(.vertical, 1)
                                .background(t.badge, in: Capsule())
                                .offset(x: -14, y: -2)
                        } else if item.dot {
                            Circle().fill(t.badge).frame(width: 8, height: 8)
                                .offset(x: -18, y: 0)
                        }
                    }
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.top, 8)
        .background(
            t.background.ignoresSafeArea(edges: .bottom)
                .overlay(alignment: .top) { t.separator.frame(height: 0.5) }
        )
    }
}
