import SwiftUI

// VK reference-profile adapter. Product screens may compose these components,
// but neutral runtime and product state must never depend on VK-specific data.
// Geometry is defined by ReferenceProfiles/vk-ios/profile.json.

// MARK: - Аватар

struct Avatar: View {
    let name: String
    var size: CGFloat = 40
    var ring: Bool = false          // синяя обводка истории
    var online: Bool = false
    @Environment(\.visualLanguage) private var t

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
                if ring { Circle().stroke(t.palette.accent, lineWidth: 2).padding(-3) }
            }
            .overlay(alignment: .bottomTrailing) {
                if online {
                    Circle().fill(Color(hex: "4BB34B"))
                        .frame(width: max(12, size * 0.17), height: max(12, size * 0.17))
                        .overlay(Circle().stroke(.white, lineWidth: 2))
                }
            }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(name)
            .accessibilityValue(online ? "В сети" : "")
    }
}

// MARK: - Топбар вкладки: аватар · заголовок · действия справа

struct VKTabHeader<Trailing: View>: View {
    let title: String
    var avatar: String? = nil
    /// Мини-аватар слева — вход в профиль (у ВК он единственный).
    var avatarAction: (() -> Void)? = nil
    @ViewBuilder var trailing: Trailing
    @Environment(\.visualLanguage) private var t

    var body: some View {
        HStack(spacing: 10) {
            if let avatar {
                if let avatarAction {
                    Button(action: avatarAction) { Avatar(name: avatar, size: 32) }
                        .buttonStyle(.plain)
                        .accessibilityLabel("Профиль")
                } else {
                    Avatar(name: avatar, size: 32)
                }
            }
            Text(title).font(.vkTabTitle).foregroundStyle(t.palette.textPrimary)
            Spacer()
            HStack(spacing: 18) { trailing }
                .font(.system(size: 22, weight: .regular))
                .foregroundStyle(t.palette.accent)
        }
        .frame(height: 52)
        .padding(.horizontal, t.spacing.contentInset)
        .background(t.palette.background)
    }
}

// MARK: - Компактный хедер чата

/// Профиль ВК использует плоскую навигацию без glass-капсул iOS.
/// ZStack удерживает имя строго по центру независимо от ширины кнопок.
struct VKChatHeader: View {
    let title: String
    let subtitle: String
    let onBack: () -> Void
    var onCall: (() -> Void)? = nil
    @Environment(\.visualLanguage) private var t

    var body: some View {
        ZStack {
            VStack(spacing: 1) {
                Text(title)
                    .font(.vkNavTitle)
                    .foregroundStyle(t.palette.textPrimary)
                    .lineLimit(1)
                Text(subtitle)
                    .font(.vkMeta)
                    .foregroundStyle(t.palette.textSecondary)
                    .lineLimit(1)
            }
            .padding(.horizontal, 64)

            HStack {
                Button(action: onBack) {
                    Image(systemName: t.icon(.back))
                        .font(.system(size: 20, weight: .semibold))
                        .frame(width: 44, height: 44)
                        .contentShape(Rectangle())
                }
                .accessibilityLabel("Назад")

                Spacer()

                if let onCall {
                    Button(action: onCall) {
                        Image(systemName: "phone")
                            .font(.system(size: 20, weight: .regular))
                            .frame(width: 44, height: 44)
                            .contentShape(Rectangle())
                    }
                    .accessibilityLabel("Позвонить")
                } else {
                    Color.clear.frame(width: 44, height: 44)
                }
            }
            .foregroundStyle(t.palette.accent)
        }
        .frame(height: 52)
        .padding(.horizontal, 4)
        .background(t.palette.background)
        .overlay(alignment: .bottom) {
            Rectangle().fill(t.palette.separator).frame(height: 0.5)
        }
    }
}

/// Общая плоская навигация push-экранов профиля ВК.
/// Она не зависит от текущей версии системного toolbar SwiftUI.
struct VKNavigationChrome<Trailing: View>: ViewModifier {
    let title: String
    @ViewBuilder var trailing: Trailing
    @Environment(\.dismiss) private var dismiss
    @Environment(\.visualLanguage) private var t

    func body(content: Content) -> some View {
        VStack(spacing: 0) {
            ZStack {
                Text(title)
                    .font(.vkNavTitle)
                    .foregroundStyle(t.palette.textPrimary)
                    .lineLimit(1)
                    .padding(.horizontal, 72)

                HStack {
                    Button { dismiss() } label: {
                        Image(systemName: t.icon(.back))
                            .font(.system(size: 20, weight: .semibold))
                            .frame(width: 44, height: 44)
                            .contentShape(Rectangle())
                    }
                    .accessibilityLabel("Назад")

                    Spacer()

                    HStack(spacing: 4) { trailing }
                        .frame(minWidth: 44, minHeight: 44, alignment: .trailing)
                }
                .foregroundStyle(t.palette.accent)
                .padding(.horizontal, 4)
                .buttonStyle(.plain)
            }
            .frame(height: 52)
            .background(t.palette.background)
            .background {
                GeometryReader { geometry in
                    Color.clear
                        .onAppear {
                            CaptureIdentity.reportNavigationChrome(
                                minY: geometry.frame(in: .global).minY
                            )
                        }
                        .onChange(of: geometry.frame(in: .global).minY) { _, minY in
                            CaptureIdentity.reportNavigationChrome(minY: minY)
                        }
                }
            }
            .overlay(alignment: .bottom) {
                Rectangle().fill(t.palette.separator).frame(height: 0.5)
            }

            content
        }
        .toolbar(.hidden, for: .navigationBar)
    }
}

extension View {
    func vkNavigation(_ title: String) -> some View {
        modifier(VKNavigationChrome(title: title) { EmptyView() })
    }

    func vkNavigation<Trailing: View>(
        _ title: String,
        @ViewBuilder trailing: () -> Trailing
    ) -> some View {
        modifier(VKNavigationChrome(title: title, trailing: trailing))
    }
}

/// Плоский modal chrome для VK-поверхностей. Liquid Glass остаётся у
/// системного TabView, но не превращает редакторы в набор стеклянных капсул.
struct VKModalChrome: View {
    let title: String
    let onCancel: () -> Void
    var cancelTitle = "Отмена"
    var doneTitle: String? = nil
    var doneDisabled = false
    var onDone: (() -> Void)? = nil
    @Environment(\.visualLanguage) private var theme

    var body: some View {
        ZStack {
            Text(title)
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(theme.palette.textPrimary)
                .lineLimit(1)
                .padding(.horizontal, 124)
            HStack {
                Button(cancelTitle, action: onCancel)
                    .frame(minWidth: 60, minHeight: 44, alignment: .leading)
                Spacer()
                if let doneTitle, let onDone {
                    Button(doneTitle, action: onDone)
                        .fontWeight(.semibold)
                        .frame(minWidth: 96, minHeight: 44, alignment: .trailing)
                        .disabled(doneDisabled)
                }
            }
            .font(.system(size: 15))
            .foregroundStyle(theme.palette.accent)
            .padding(.horizontal, 16)
        }
        .frame(height: 52)
        .background(theme.palette.background)
        .overlay(alignment: .bottom) { theme.palette.separator.frame(height: 0.5) }
    }
}

// MARK: - Серая полоса между группами

struct GroupGap: View {
    var height: CGFloat = 9
    @Environment(\.visualLanguage) private var t
    var body: some View { t.palette.groupedBackground.frame(height: height) }
}

/// Разделитель внутри списка — начинается от текста, не от края.
struct RowSeparator: View {
    var leading: CGFloat = 68
    @Environment(\.visualLanguage) private var t
    var body: some View {
        t.palette.separator.frame(height: 0.5).padding(.leading, leading)
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
    @Environment(\.visualLanguage) private var t

    var body: some View {
        HStack(spacing: 16) {
            if let icon {
                Image(systemName: icon)
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(t.palette.accent)
                    .frame(width: 28, alignment: .center)
            }
            VStack(alignment: .leading, spacing: 1) {
                Text(title).font(.vkRow).foregroundStyle(t.palette.textPrimary)
                if let subtitle {
                    Text(subtitle).font(.vkMeta).foregroundStyle(t.palette.textSecondary)
                }
            }
            Spacer(minLength: 8)
            if let value {
                Text(value).font(.vkRow).foregroundStyle(t.palette.textSecondary)
            }
            if let toggle {
                Toggle(title, isOn: toggle).labelsHidden()
                    .accessibilityLabel(title)
            } else if chevron {
                Image(systemName: t.icon(.disclosure))
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Color(hex: "C4C8CC"))
            }
        }
        .padding(.horizontal, t.spacing.contentInset)
        .frame(minHeight: 48)
        .contentShape(Rectangle())
    }
}

// MARK: - Поле поиска

struct VKSearchField: View {
    let placeholder: String
    @Binding var text: String
    @Environment(\.visualLanguage) private var t
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: t.icon(.search))
                .font(.system(size: 17, weight: .medium)).foregroundStyle(t.palette.textSecondary)
            TextField(placeholder, text: $text)
                .textFieldStyle(.plain)
                .font(.system(size: 17))
                .foregroundStyle(t.palette.textPrimary)
        }
        .padding(.horizontal, 14)
        .frame(height: 44)
        .background(t.palette.fill, in: Capsule())
    }
}

// MARK: - Кнопки

/// Основная синяя.
struct VKButton: View {
    let title: String
    var icon: String? = nil
    let action: () -> Void
    var body: some View {
        NativeActionButton(title: title, icon: icon, action: action)
    }
}

/// Серая капсула: «Подписаться», «Скрыть».
struct VKPill: View {
    let title: String
    let action: () -> Void
    @Environment(\.visualLanguage) private var t
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(t.palette.textPrimary)
                .padding(.horizontal, 14).frame(height: 32)
                .background(t.palette.fill, in: Capsule())
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
    var body: some View {
        NativeActionButton(title: title, icon: icon,
                           variant: .secondary, usesAccent: tinted,
                           action: action)
    }
}

// MARK: - Табы с подчёркиванием

struct VKTabs: View {
    let items: [String]
    @Binding var selection: Int
    @Environment(\.visualLanguage) private var t
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
                            .foregroundStyle(selection == i ? t.palette.textPrimary : t.palette.textSecondary)
                        ZStack {
                            Capsule().fill(.clear).frame(height: 2.5)
                            if selection == i {
                                Capsule().fill(t.palette.accent).frame(height: 2.5)
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
        .background(t.palette.background)
    }
}

// MARK: - Медиа-блок (геометрия ВК, контент продукта)

struct VKMedia: View {
    let assetName: String?
    var height: CGFloat = 300
    var pageBadge: String? = nil
    var accessibilityLabel: String? = nil

    var body: some View {
        Group {
            if let assetName {
                Image(assetName)
                    .resizable()
                    .scaledToFill()
            } else {
                // Нейтральное empty/loading-полотно без выдуманной картинки.
                Color(hex: "EDEEF0")
            }
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
        .modifier(VKOptionalMediaAccessibility(label: accessibilityLabel))
    }
}

private struct VKOptionalMediaAccessibility: ViewModifier {
    let label: String?
    func body(content: Content) -> some View {
        if let label {
            content.accessibilityLabel(label)
        } else {
            content.accessibilityHidden(true)
        }
    }
}

// MARK: - Сетка сервисов: нейтральные плитки, один функциональный акцент

struct VKServiceTile: View {
    let title: String
    let icon: String
    let colors: [String]
    let action: () -> Void
    @Environment(\.visualLanguage) private var t

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 27, weight: .semibold))
                    .foregroundStyle(t.palette.accent)
                    .frame(width: 64, height: 52)
                Text(title).font(.vkCaption).foregroundStyle(t.palette.textPrimary)
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
    /// Число рядом с заголовком — это данные («Мои друзья 93»), а не действие:
    /// оно серое и не кликается, в отличие от ссылки справа.
    var count: String? = nil
    var action: String? = nil
    var onTap: (() -> Void)? = nil
    @Environment(\.visualLanguage) private var t
    var body: some View {
        HStack(spacing: 8) {
            Text(title).font(.vkSection).foregroundStyle(t.palette.textPrimary)
            if let count {
                Text(count).font(.system(size: 17)).foregroundStyle(t.palette.textSecondary)
            }
            Spacer()
            if let action, let onTap {
                Button(action: onTap) {
                    Text(action).font(.system(size: 17)).foregroundStyle(t.palette.accent)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, t.spacing.contentInset)
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
    @Environment(\.visualLanguage) private var t

    var body: some View {
        HStack(spacing: 0) {
            ForEach(items) { item in
                Button {
                    withAnimation(.easeOut(duration: 0.12)) { selection = item.id }
                } label: {
                    ZStack(alignment: .topTrailing) {
                        Image(systemName: selection == item.id ? item.iconActive : item.icon)
                            .font(.system(size: 25, weight: .regular))
                            .foregroundStyle(selection == item.id ? t.palette.accent : Color(hex: "99A2AD"))
                            .frame(maxWidth: .infinity)
                            .frame(height: 34)
                        if item.badge > 0 {
                            Text("\(item.badge)")
                                .font(.system(size: 11, weight: .semibold)).foregroundStyle(.white)
                                .padding(.horizontal, 5).padding(.vertical, 1)
                                .background(t.palette.badge, in: Capsule())
                                .offset(x: -14, y: -2)
                        } else if item.dot {
                            Circle().fill(t.palette.badge).frame(width: 8, height: 8)
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
            t.palette.background.ignoresSafeArea(edges: .bottom)
                .overlay(alignment: .top) { t.palette.separator.frame(height: 0.5) }
        )
    }
}

// MARK: - Строка человека: аватар · имя · подпись · действия справа
//
// В ВК она одна и та же в «Друзьях», «Возможных друзьях» и рекомендациях —
// меняются только кнопки справа и наличие ряда общих друзей под подписью.

struct VKPersonRow<Trailing: View>: View {
    let name: String
    var subtitle: String? = nil
    var mutual: [String] = []
    var mutualText: String? = nil
    var avatarSize: CGFloat = 56
    @ViewBuilder var trailing: Trailing
    @Environment(\.visualLanguage) private var t

    var body: some View {
        HStack(spacing: 12) {
            Avatar(name: name, size: avatarSize)
            VStack(alignment: .leading, spacing: 2) {
                Text(name).font(.vkRow).foregroundStyle(t.palette.textPrimary).lineLimit(1)
                if let subtitle {
                    Text(subtitle).font(.system(size: 14)).foregroundStyle(t.palette.textSecondary)
                        .lineLimit(1)
                }
                if !mutual.isEmpty || mutualText != nil {
                    HStack(spacing: 6) {
                        HStack(spacing: -6) {
                            ForEach(mutual, id: \.self) { m in
                                Avatar(name: m, size: 20)
                                    .overlay(Circle().stroke(.white, lineWidth: 1.5))
                            }
                        }
                        if let mutualText {
                            Text(mutualText).font(.vkMeta).foregroundStyle(t.palette.textSecondary)
                        }
                    }
                    .padding(.top, 2)
                }
            }
            Spacer(minLength: 8)
            HStack(spacing: 18) { trailing }
        }
        .padding(.horizontal, t.spacing.contentInset)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
    }
}

/// Синяя контурная иконка-действие в строке человека (звонок, сообщение, «+»).
struct VKRowAction: View {
    let icon: String
    var label: String
    var tint: Color? = nil
    let action: () -> Void
    @Environment(\.visualLanguage) private var t

    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(tint ?? t.palette.accent)
                .frame(width: 30, height: 44)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(label)
    }
}

// MARK: - Мозаика поиска: завершённые ряды без белых разрывов

struct VKMosaicItem: Identifiable, Hashable {
    let id = UUID()
    let assetName: String
    let height: CGFloat
    let badge: String?
}

struct VKMosaic: View {
    let items: [VKMosaicItem]
    var nativeActionID: String? = nil
    var onTap: (VKMosaicItem) -> Void = { _ in }
    private let columns = 3

    private var rows: [[VKMosaicItem]] {
        stride(from: 0, to: items.count, by: columns).map { start in
            Array(items[start..<min(start + columns, items.count)])
        }
    }

    var body: some View {
        LazyVStack(spacing: 2) {
            ForEach(Array(rows.enumerated()), id: \.offset) { _, row in
                let rowHeight = row.map(\.height).max() ?? 0
                GeometryReader { proxy in
                    let gap: CGFloat = 2
                    let cellWidth = (proxy.size.width - gap * CGFloat(columns - 1)) / CGFloat(columns)
                    HStack(spacing: gap) {
                        ForEach(row) { it in
                            Button { onTap(it) } label: {
                                VKMedia(assetName: it.assetName, height: rowHeight)
                                    .frame(width: cellWidth)
                                    .clipped()
                                    .overlay(alignment: .topTrailing) {
                                        if let badge = it.badge {
                                            Image(systemName: badge)
                                                .font(.system(size: 13, weight: .semibold))
                                                .foregroundStyle(.white)
                                                .shadow(color: .black.opacity(0.35), radius: 3)
                                                .padding(8)
                                        }
                                    }
                            }
                            .frame(width: cellWidth)
                            .buttonStyle(.plain)
                            .modifier(VKOptionalNativeAction(id: nativeActionID))
                        }
                        if row.count < columns {
                            ForEach(0..<(columns - row.count), id: \.self) { _ in
                                Color.clear.frame(width: cellWidth, height: rowHeight)
                            }
                        }
                    }
                }
                .frame(height: rowHeight)
            }
        }
        .clipped()
    }
}

private struct VKOptionalNativeAction: ViewModifier {
    let id: String?
    func body(content: Content) -> some View {
        if let id { content.nativeAction(id) }
        else { content }
    }
}

// MARK: - Верхние табы на тёмном (клипы): «Для вас · Шопсы · Тренды»

struct VKDarkTabs: View {
    let items: [String]
    @Binding var selection: Int

    var body: some View {
        HStack(spacing: 14) {
            ForEach(items.indices, id: \.self) { i in
                Button {
                    withAnimation(.easeOut(duration: 0.18)) { selection = i }
                } label: {
                    Text(items[i])
                        .font(.system(size: 17, weight: selection == i ? .bold : .semibold))
                        .foregroundStyle(.white.opacity(selection == i ? 1 : 0.55))
                }
                .buttonStyle(.plain)
            }
        }
    }
}

/// Капсула «Подписаться» с белой обводкой — вариант для тёмного кадра клипа.
struct VKOutlineCapsule: View {
    let title: String
    var body: some View {
        Text(title)
            .font(.system(size: 13, weight: .semibold)).foregroundStyle(.white)
            .padding(.horizontal, 12).frame(height: 28)
            .overlay(Capsule().stroke(.white.opacity(0.75), lineWidth: 1))
    }
}

/// Капсула «Оригинальный звук» под подписью автора клипа.
struct VKSoundCapsule: View {
    let title: String
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: "speaker.wave.2.fill").font(.system(size: 11))
            Text(title).font(.system(size: 13)).lineLimit(1)
        }
        .foregroundStyle(.white)
        .padding(.horizontal, 10).frame(height: 28)
        .background(.white.opacity(0.18), in: Capsule())
    }
}

/// Действие правого рельса клипа: белая иконка и число под ней.
struct VKClipAction: View {
    let icon: String
    var value: String = ""
    var label: String
    var tint: Color = .white
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon).font(.system(size: 27, weight: .semibold)).foregroundStyle(tint)
                if !value.isEmpty {
                    Text(value).font(.system(size: 12, weight: .medium)).foregroundStyle(.white)
                }
            }
        }
        .pressable(scale: 0.9)
        .accessibilityLabel(label)
    }
}

// MARK: - Действия поста: голые иконки с числами, без капсул
//
// Ряд одинаков в ленте и на экране поста — у ВК он тоже один и тот же.

struct VKPostActions: View {
    let likes: Int
    var liked: Bool = false
    let comments: Int
    let shares: Int
    var saved: Bool = false
    /// Просмотры или время публикации — то, что у ВК стоит справа.
    var trailing: String? = nil
    var nativeActionID: String? = nil
    let onLike: () -> Void
    let onComment: () -> Void
    let onShare: () -> Void
    let onSave: () -> Void
    @Environment(\.visualLanguage) private var t

    var body: some View {
        HStack(spacing: 20) {
            Button(action: onLike) {
                metric(liked ? "heart.fill" : "heart", "\(likes)",
                       tint: liked ? Color(hex: "FF3347") : t.palette.textSecondary)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Нравится")
            Button(action: onComment) {
                metric("bubble.right", "\(comments)", tint: t.palette.textSecondary)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Комментарии")
            Button(action: onShare) {
                metric("arrowshape.turn.up.right", "\(shares)", tint: t.palette.textSecondary)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Поделиться")
            Spacer(minLength: 8)
            Button(action: onSave) {
                Image(systemName: saved ? "bookmark.fill" : "bookmark")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(saved ? t.palette.accent : t.palette.textSecondary)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Сохранить")
            .modifier(VKOptionalNativeAction(id: nativeActionID))
            if let trailing {
                Text(trailing).font(.vkMeta).foregroundStyle(t.palette.textSecondary)
            }
        }
    }

    private func metric(_ icon: String, _ value: String, tint: Color) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon).font(.system(size: 19, weight: .semibold))
            Text(value).font(.system(size: 15))
        }
        .foregroundStyle(tint)
    }
}

// MARK: - Группа ВК: белый блок край-в-край и серая полоса под ним
//
// На белых экранах ВК блоки разделены не рамкой и не тенью, а серой полосой:
// белая карточка на белом фоне не читается вовсе (этот дефект тут уже был).

struct VKGroup<Content: View>: View {
    var gap: CGFloat = 9
    @ViewBuilder var content: Content
    @Environment(\.visualLanguage) private var t

    var body: some View {
        VStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 0) { content }
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(t.palette.surface)
            GroupGap(height: gap)
        }
    }
}


// MARK: - Карточка на сером фоне (профиль, плитки сеток)

struct VKCard<Content: View>: View {
    @ViewBuilder var content: Content
    @Environment(\.visualLanguage) private var t
    var body: some View {
        VStack(alignment: .leading, spacing: 0) { content }
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(t.palette.surface, in: RoundedRectangle(cornerRadius: t.metrics.cardRadius, style: .continuous))
    }
}

// MARK: - Ряд фильтров-капсул

struct VKFilterPills: View {
    let items: [(String, String?)]
    @Binding var selection: Int
    @Environment(\.visualLanguage) private var t
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(items.indices, id: \.self) { i in
                    Button {
                        withAnimation(.easeOut(duration: 0.18)) { selection = i }
                    } label: {
                        HStack(spacing: 6) {
                            if let icon = items[i].1 {
                                Image(systemName: icon).font(.system(size: 14))
                            }
                            Text(items[i].0).font(.system(size: 14, weight: .medium))
                        }
                        .foregroundStyle(selection == i ? .white : t.palette.textPrimary)
                        .padding(.horizontal, 11).frame(minHeight: 44)
                        .background(selection == i ? AnyShapeStyle(t.palette.accent) : AnyShapeStyle(t.palette.fill),
                                    in: Capsule())
                    }
                    .pressable()
                }
            }
            .padding(.horizontal, t.spacing.contentInset)
        }
        .scrollClipDisabled()
    }
}

/// Ячейка сетки контента: та же геометрия кадра, что у ВК в «Фото».
struct VKGridCell: View {
    let assetName: String
    var body: some View {
        VKMedia(assetName: assetName, height: 0)
            .frame(maxWidth: .infinity)
            .aspectRatio(0.82, contentMode: .fit)
    }
}
