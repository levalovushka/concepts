import SwiftUI

// Лента образов. Структура ВК: серый фон, белые карточки, действия в капсулах.
// Продукт «Образы»: медиа — образ, у него есть отметки вещей и разбор на вещи.

struct FeedScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    @State private var tab = 0
    @State private var refreshing = false

    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(title: "Образы", avatar: "Ника Орлова") {
                Button { nav.present(cover: LooksRoute.create) } label: { Image(systemName: "plus") }
            }
            UnderlineTabs(items: ["Подписки", "Для вас", "Свопы"], selection: $tab)

            ScrollView {
                LazyVStack(spacing: t.cardGap) {
                    StoriesRow()
                    ForEach(store.outfits) { outfit in
                        OutfitCard(outfit: outfit)
                    }
                    NearbyPromoCard()
                }
                .padding(.top, t.cardGap)
                .padding(.bottom, 72)
            }
            .refreshable {
                try? await Task.sleep(nanoseconds: 900_000_000)
            }
            .background(t.background)
        }
        .background(t.background)
    }
}

// MARK: - Истории

private struct StoriesRow: View {
    @Environment(LooksStore.self) private var store
    @Environment(\.theme) private var t
    var body: some View {
        Card {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(store.stories) { s in
                        VStack(spacing: 6) {
                            ZStack(alignment: .bottomTrailing) {
                                Avatar(name: s.name, size: 60, ring: !s.seen && !s.isMine)
                                if s.isMine {
                                    Image(systemName: "plus")
                                        .font(.system(size: 11, weight: .bold))
                                        .foregroundStyle(.white)
                                        .frame(width: 20, height: 20)
                                        .background(t.accent, in: Circle())
                                        .overlay(Circle().stroke(t.card, lineWidth: 2))
                                        .offset(x: 2, y: 2)
                                }
                            }
                            Text(s.isMine ? "История" : s.name.split(separator: " ").first.map(String.init) ?? s.name)
                                .font(.system(size: 12))
                                .foregroundStyle(t.textSecondary)
                                .lineLimit(1)
                                .frame(width: 66)
                        }
                    }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 12)
            }
        }
    }
}

// MARK: - Карточка образа

private struct OutfitCard: View {
    let outfit: Outfit
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var showTags = true

    var body: some View {
        Card {
            // шапка
            HStack(spacing: 12) {
                Avatar(name: outfit.author, size: 40)
                VStack(alignment: .leading, spacing: 2) {
                    Text(outfit.author).font(.dsHeadline).foregroundStyle(t.textPrimary)
                    Text(outfit.meta).font(.dsMeta).foregroundStyle(t.textSecondary)
                }
                Spacer(minLength: 8)
                Button {} label: {
                    Image(systemName: "ellipsis").font(.system(size: 18))
                        .foregroundStyle(t.textSecondary)
                        .frame(width: 32, height: 32)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .offset(x: 6)
            }
            .padding(.horizontal, 14)
            .padding(.top, 14)
            .padding(.bottom, 12)

            if !outfit.text.isEmpty {
                Text(outfit.text)
                    .dsParagraph()
                    .foregroundStyle(t.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, 14)
                    .padding(.bottom, 12)
            }

            // образ: медиа край в край + отметки вещей
            Button { nav.push(LooksRoute.outfit(outfit)) } label: {
                ZStack(alignment: .topLeading) {
                    OutfitMedia(items: outfit.items, seed: outfit.seed)
                        .overlay(alignment: .bottomLeading) {
                            if showTags { tagStack }
                        }
                    Button {
                        withAnimation(.spring(response: 0.32, dampingFraction: 0.8)) { showTags.toggle() }
                    } label: {
                        Image(systemName: showTags ? "tag.fill" : "tag")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(width: 32, height: 32)
                            .background(.black.opacity(0.35), in: Circle())
                    }
                    .buttonStyle(.plain)
                    .padding(10)
                }
            }
            .buttonStyle(.plain)

            // разбор на вещи — обещание продукта
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(Array(outfit.items.enumerated()), id: \.element.id) { i, g in
                        GarmentChip(index: i + 1, garment: g)
                    }
                }
                .padding(.horizontal, 14)
            }
            .scrollClipDisabled()
            .padding(.vertical, 12)

            // действия в капсулах — сигнатура ВК
            HStack(spacing: 8) {
                ActionPill(icon: "heart", count: "\(outfit.likes)",
                           active: outfit.liked, activeColor: t.danger) {
                    store.toggleLike(outfit.id)
                }
                ActionPill(icon: "bubble.right", count: "\(outfit.comments)") {
                    nav.push(LooksRoute.outfit(outfit))
                }
                ActionPill(icon: "arrowshape.turn.up.right", count: "\(outfit.shares)") {}
                Spacer()
                HStack(spacing: 5) {
                    Image(systemName: "eye").font(.system(size: 14))
                    Text(outfit.views).font(.dsAction)
                }
                .foregroundStyle(t.textSecondary)
                Button { store.toggleSave(outfit.id) } label: {
                    Image(systemName: outfit.saved ? "bookmark.fill" : "bookmark")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(outfit.saved ? t.accent : t.textSecondary)
                        .frame(width: 32, height: 32)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 12)
            .padding(.bottom, 12)
        }
    }

    /// Пины вещей на кадре — привязаны к углам, поэтому не вылезают за края.
    private var tagStack: some View {
        ZStack {
            if outfit.items.indices.contains(0) {
                pin(0).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
            }
            if outfit.items.indices.contains(1) {
                pin(1).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
            }
            if outfit.items.indices.contains(2) {
                pin(2).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
            }
        }
        .padding(12)
        .transition(.opacity)
    }

    private func pin(_ i: Int) -> some View {
        ItemPin(index: i + 1, title: outfit.items[i].title, trailing: i != 0)
    }
}

/// Медиа образа — лукбук-коллаж: главная вещь крупно, остальные стопкой справа.
/// Спокойная композиция вместо декоративных наклеек; фото не используем.
struct OutfitMedia: View {
    let items: [Garment]
    var seed: Int = 0
    var height: CGFloat = 264

    private var tint: Color {
        let palette = ["5B7CFA", "E0719A", "3FA88C", "E08A4B", "8B6EE0"]
        return Color(hex: palette[abs(seed) % palette.count])
    }

    var body: some View {
        HStack(spacing: 2) {
            cell(items.first, big: true)
            if items.count > 1 {
                VStack(spacing: 2) {
                    cell(items.dropFirst().first, big: false)
                    if items.count > 2 { cell(items.dropFirst(2).first, big: false) }
                }
                .frame(width: height * 0.42)
            }
        }
        .frame(height: height)
        .clipped()
    }

    @ViewBuilder
    private func cell(_ g: Garment?, big: Bool) -> some View {
        ZStack {
            LinearGradient(colors: [tint.opacity(big ? 0.26 : 0.18), tint.opacity(big ? 0.46 : 0.34)],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
            if let g {
                Image(systemName: g.glyph)
                    .font(.system(size: big ? 62 : 34, weight: .ultraLight))
                    .foregroundStyle(tint)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

private struct GarmentChip: View {
    let index: Int
    let garment: Garment
    @Environment(\.theme) private var t
    var body: some View {
        Button {} label: {
            HStack(spacing: 9) {
                Image(systemName: garment.glyph)
                    .font(.system(size: 17))
                    .foregroundStyle(t.accent)
                    .frame(width: 38, height: 38)
                    .background(t.accentSoft, in: RoundedRectangle(cornerRadius: 9, style: .continuous))
                VStack(alignment: .leading, spacing: 1) {
                    Text(garment.title).font(.system(size: 14, weight: .medium))
                        .foregroundStyle(t.textPrimary).lineLimit(1)
                    Text(garment.brand).font(.system(size: 12))
                        .foregroundStyle(t.textSecondary).lineLimit(1)
                }
                .padding(.trailing, 6)
            }
            .padding(6)
            .background(t.fieldFill, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        }
        .pressable(scale: 0.96)
    }
}

// MARK: - Промо «рядом» — точка запроса гео

private struct NearbyPromoCard: View {
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t

    var body: some View {
        Card {
            HStack(spacing: 12) {
                Image(systemName: "location.fill")
                    .font(.system(size: 18))
                    .foregroundStyle(.white)
                    .frame(width: 40, height: 40)
                    .background(t.accent, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
                VStack(alignment: .leading, spacing: 2) {
                    Text("Свопы рядом с вами").font(.dsName).foregroundStyle(t.textPrimary)
                    Text("Обмен вещами и встречи стиля поблизости")
                        .font(.dsMeta).foregroundStyle(t.textSecondary)
                }
                Spacer(minLength: 8)
            }
            .padding(12)
            RowDivider(leading: 12)
            Button {
                nav.tab = 1
                nav.push(LooksRoute.nearby)
            } label: {
                Text("Показать поблизости")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(t.accent)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 13)
            }
            .buttonStyle(HighlightStyle())
        }
    }
}


/// Пин вещи на кадре образа: точка привязки + подпись.
private struct ItemPin: View {
    let index: Int
    let title: String
    var trailing: Bool = false
    @State private var shown = false

    var body: some View {
        HStack(spacing: 6) {
            if trailing, shown { label }
            Text("\(index)")
                .font(.system(size: 10, weight: .bold)).foregroundStyle(.black)
                .frame(width: 18, height: 18)
                .background(.white, in: Circle())
                .shadow(color: .black.opacity(0.3), radius: 3, y: 1)
            if !trailing, shown { label }
        }
        .padding(.horizontal, 4).padding(.vertical, 4)
        .background(.black.opacity(shown ? 0.55 : 0), in: Capsule())
        .fixedSize()
        .onAppear {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8).delay(Double(index) * 0.08)) {
                shown = true
            }
        }
    }
    private var label: some View {
        Text(title).font(.system(size: 12, weight: .medium))
            .foregroundStyle(.white).lineLimit(1)
            .padding(.horizontal, 3)
    }
}
