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
                Button { nav.push(LooksRoute.search) } label: { Image(systemName: "magnifyingglass") }
            }
            UnderlineTabs(items: ["Подписки", "Для вас", "Свопы"], selection: $tab)
            Rectangle().fill(t.separator).frame(height: 0.5)

            ScrollView {
                LazyVStack(spacing: t.cardGap) {
                    StoriesRow()
                    ForEach(store.outfits) { outfit in
                        OutfitCard(outfit: outfit)
                    }
                    NearbyPromoCard()
                }
                .padding(.vertical, t.cardGap)
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
    @State private var showTags = false

    var body: some View {
        Card {
            // шапка
            HStack(spacing: 10) {
                Avatar(name: outfit.author, size: 40)
                VStack(alignment: .leading, spacing: 1) {
                    Text(outfit.author).font(.dsName).foregroundStyle(t.textPrimary)
                    Text(outfit.meta).font(.dsMeta).foregroundStyle(t.textSecondary)
                }
                Spacer()
                Button {} label: {
                    Image(systemName: "ellipsis").font(.system(size: 17)).foregroundStyle(t.textSecondary)
                        .frame(width: 32, height: 32)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 12)
            .padding(.top, 12)
            .padding(.bottom, 10)

            if !outfit.text.isEmpty {
                Text(outfit.text)
                    .font(.dsBody).foregroundStyle(t.textPrimary)
                    .lineSpacing(4)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, 12)
                    .padding(.bottom, 10)
            }

            // образ: медиа край в край + отметки вещей
            Button { nav.push(LooksRoute.outfit(outfit)) } label: {
                ZStack(alignment: .topTrailing) {
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
                .padding(.horizontal, 12)
            }
            .padding(.vertical, 10)

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

    private var tagStack: some View {
        VStack(alignment: .leading, spacing: 6) {
            ForEach(Array(outfit.items.enumerated()), id: \.element.id) { i, g in
                HStack(spacing: 6) {
                    Text("\(i + 1)")
                        .font(.system(size: 11, weight: .bold)).foregroundStyle(.black)
                        .frame(width: 18, height: 18).background(.white, in: Circle())
                    Text(g.title).font(.system(size: 13, weight: .medium)).foregroundStyle(.white)
                }
                .padding(.horizontal, 8).padding(.vertical, 5)
                .background(.black.opacity(0.55), in: Capsule())
            }
        }
        .padding(12)
        .transition(.opacity.combined(with: .offset(y: 8)))
    }
}

/// Медиа образа: композиция вещей (фото не используем, геометрия ВК сохраняется).
struct OutfitMedia: View {
    let items: [Garment]
    var seed: Int = 0
    var height: CGFloat = 320

    private var colors: [Color] {
        let p: [[String]] = [["7B9BFF", "A98BFF"], ["FF8FA6", "FFB877"], ["5BC6A8", "4DA8FF"]]
        return p[abs(seed / 2) % p.count].map { Color(hex: $0) }
    }

    var body: some View {
        ZStack {
            LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
            HStack(spacing: 14) {
                ForEach(Array(items.prefix(3).enumerated()), id: \.element.id) { i, g in
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .fill(.white.opacity(0.92))
                        .frame(width: i == 0 ? 108 : 88, height: i == 0 ? 132 : 108)
                        .overlay(
                            Image(systemName: g.glyph)
                                .font(.system(size: i == 0 ? 46 : 36, weight: .light))
                                .foregroundStyle(colors[0])
                        )
                        .rotationEffect(.degrees(i == 0 ? -4 : (i == 1 ? 5 : -2)))
                        .offset(y: i == 1 ? -18 : (i == 2 ? 16 : 0))
                }
            }
        }
        .frame(height: height)
        .clipped()
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
                Task {
                    let ok = await perms.request(.location)
                    if ok { nav.tab = 1 }
                    else { nav.toast("Без геопозиции покажем свопы по городу", once: "location") }
                }
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
