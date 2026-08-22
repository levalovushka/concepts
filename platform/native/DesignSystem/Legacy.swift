import SwiftUI

// Компоненты, которыми пользуются экраны фич. Стиль — из профиля ВК:
// белая карточка радиус 16 на сером фоне (паттерн экрана профиля).

struct Card<Content: View>: View {
    @ViewBuilder var content: Content
    var body: some View {
        VStack(alignment: .leading, spacing: 0) { content }
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.white, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

/// Шапка корневой вкладки — тот же компонент, что VKTabHeader.
struct ScreenHeader<Trailing: View>: View {
    let title: String
    var avatar: String? = nil
    @ViewBuilder var trailing: Trailing
    var body: some View {
        VKTabHeader(title: title, avatar: avatar) { trailing }
    }
}

struct RowDivider: View {
    var leading: CGFloat = 0
    var body: some View { RowSeparator(leading: leading) }
}

struct PrimaryButton: View {
    let title: String
    var icon: String? = nil
    let action: () -> Void
    var body: some View { VKButton(title: title, icon: icon, action: action) }
}

struct SquareButton: View {
    let icon: String
    let action: () -> Void
    @Environment(\.theme) private var t
    var body: some View {
        Button(action: action) {
            Image(systemName: icon).font(.system(size: 18))
                .foregroundStyle(t.accent)
                .frame(width: 44, height: 44)
                .background(t.fill, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
        }
        .pressable()
    }
}

struct MediaBlock: View {
    var glyph: String = "photo"
    var height: CGFloat = 300
    var seed: Int = 0
    var body: some View { VKMedia(glyph: glyph, height: height, seed: seed) }
}

struct ShowAllRow: View {
    let title: String
    let action: () -> Void
    @Environment(\.theme) private var t
    var body: some View {
        Button(action: action) {
            Text(title).font(.system(size: 17)).foregroundStyle(t.accent)
                .frame(maxWidth: .infinity).padding(.vertical, 14)
        }
        .buttonStyle(HighlightStyle())
    }
}

struct SearchField: View {
    let placeholder: String
    @Binding var text: String
    var body: some View { VKSearchField(placeholder: placeholder, text: $text) }
}

struct UnderlineTabs: View {
    let items: [String]
    @Binding var selection: Int
    var body: some View { VKTabs(items: items, selection: $selection) }
}

/// Ряд фильтров-капсул.
struct FilterPills: View {
    let items: [(String, String?)]
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
                                Image(systemName: icon).font(.system(size: 14))
                            }
                            Text(items[i].0).font(.system(size: 15, weight: .medium))
                        }
                        .foregroundStyle(selection == i ? .white : t.textPrimary)
                        .padding(.horizontal, 14).frame(height: 36)
                        .background(selection == i ? AnyShapeStyle(t.accent) : AnyShapeStyle(t.fill),
                                    in: Capsule())
                    }
                    .pressable()
                }
            }
            .padding(.horizontal, t.pad)
        }
        .scrollClipDisabled()
    }
}

/// Действие поста — голая иконка с числом (капсул у ВК нет).
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
                Image(systemName: active ? icon + ".fill" : icon).font(.system(size: 19))
                Text(count).font(.system(size: 15))
            }
            .foregroundStyle(active ? (activeColor ?? t.accent) : t.textSecondary)
        }
        .buttonStyle(.plain)
    }
}

// Шкала прежних имён шрифтов сведена к шкале ВК.
extension Font {
    static let dsHeadline = Font.vkName
    static let dsBody = Font.vkBody
    static let dsSubhead = Font.system(size: 15)
    static let dsMeta = Font.vkMeta
    static let dsCaption = Font.vkCaption
    static let dsSectionTitle = Font.vkSection
    static let dsName = Font.vkName
    static let dsAction = Font.system(size: 15)
}

extension View {
    func dsParagraph() -> some View { font(.vkBody).lineSpacing(3) }
}

/// Ячейка сетки контента.
struct OutfitGridCell: View {
    let glyph: String
    let seed: Int
    var body: some View {
        VKMedia(glyph: glyph, height: 0, seed: seed)
            .frame(maxWidth: .infinity)
            .aspectRatio(0.82, contentMode: .fit)
    }
}

extension Array {
    subscript(safe i: Int) -> Element? { indices.contains(i) ? self[i] : nil }
}

/// Медиа образа — тот же VKMedia, имя оставлено для экранов концепта.
struct OutfitMedia: View {
    let items: [Garment]
    var seed: Int = 0
    var height: CGFloat = 300
    var body: some View {
        VKMedia(glyph: items.first?.glyph ?? "photo", height: height, seed: seed)
    }
}
