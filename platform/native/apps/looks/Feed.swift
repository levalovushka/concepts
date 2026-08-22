import SwiftUI

// Главная — лента ВК: белый фон, посты во всю ширину, между постами серая полоса.
// Действия поста — голые иконки с числами, без капсул (см. профиль, раздел 1).

struct FeedScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        VStack(spacing: 0) {
            VKTabHeader(title: "Главная", avatar: "Ника Орлова", dropdown: true) {
                Button { nav.present(cover: LooksRoute.create) } label: {
                    Image(systemName: "plus.circle")
                }
                Button {} label: {
                    Image(systemName: "bell")
                        .overlay(alignment: .topTrailing) {
                            Text("7").font(.system(size: 11, weight: .semibold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 5).padding(.vertical, 1)
                                .background(t.badge, in: Capsule())
                                .offset(x: 9, y: -6)
                        }
                }
            }

            ScrollView {
                LazyVStack(spacing: 0) {
                    StoriesRow()
                    GroupGap()
                    ForEach(store.outfits) { outfit in
                        PostCard(outfit: outfit)
                        GroupGap()
                    }
                    NearbyRow()
                    Color.clear.frame(height: 80)
                }
            }
            .refreshable { try? await Task.sleep(nanoseconds: 900_000_000) }
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
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(alignment: .top, spacing: 14) {
                ForEach(store.stories) { s in
                    VStack(spacing: 7) {
                        ZStack(alignment: .bottomTrailing) {
                            Avatar(name: s.name, size: 64, ring: !s.seen && !s.isMine)
                            if s.isMine {
                                Image(systemName: "plus")
                                    .font(.system(size: 12, weight: .bold)).foregroundStyle(.white)
                                    .frame(width: 22, height: 22)
                                    .background(t.accent, in: Circle())
                                    .overlay(Circle().stroke(.white, lineWidth: 2.5))
                                    .offset(x: 1, y: 1)
                            }
                        }
                        Text(s.isMine ? "История" : (s.name.split(separator: " ").first.map(String.init) ?? s.name))
                            .font(.vkCaption).foregroundStyle(t.textPrimary)
                            .lineLimit(1).frame(width: 72)
                    }
                }
            }
            .padding(.horizontal, t.pad)
            .padding(.top, 12).padding(.bottom, 14)
        }
    }
}

// MARK: - Пост

private struct PostCard: View {
    let outfit: Outfit
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var showTags = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 10) {
                Avatar(name: outfit.author, size: 40)
                VStack(alignment: .leading, spacing: 1) {
                    HStack(spacing: 4) {
                        Text(outfit.author).font(.vkName).foregroundStyle(t.textPrimary)
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 13)).foregroundStyle(t.accent)
                    }
                    Text(outfit.meta).font(.vkMeta).foregroundStyle(t.textSecondary)
                }
                Spacer(minLength: 8)
                VKPill(title: "Подписаться")
                Button {} label: {
                    Image(systemName: "ellipsis").font(.system(size: 17))
                        .foregroundStyle(t.textSecondary)
                        .frame(width: 24, height: 32).contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, t.pad)
            .padding(.vertical, 10)

            Button { nav.push(LooksRoute.outfit(outfit)) } label: {
                VKMedia(glyph: outfit.items.first?.glyph ?? "photo",
                        height: 340, seed: outfit.seed,
                        pageBadge: outfit.items.count > 1 ? "1/\(outfit.items.count)" : nil)
                    .overlay(alignment: .bottomLeading) { if showTags { tagStack } }
                    .overlay(alignment: .topLeading) {
                        if !outfit.items.isEmpty {
                            Button {
                                withAnimation(.easeOut(duration: 0.2)) { showTags.toggle() }
                            } label: {
                                Image(systemName: "tag")
                                    .font(.system(size: 14, weight: .medium)).foregroundStyle(.white)
                                    .frame(width: 32, height: 32)
                                    .background(.black.opacity(0.4), in: Circle())
                            }
                            .buttonStyle(.plain).padding(12)
                        }
                    }
            }
            .buttonStyle(.plain)

            if !outfit.text.isEmpty {
                Text(outfit.text)
                    .font(.vkBody).foregroundStyle(t.textPrimary).lineSpacing(3)
                    .lineLimit(2).fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, t.pad).padding(.top, 12)
            }

            HStack(spacing: 20) {
                Button { store.toggleLike(outfit.id) } label: {
                    metric(outfit.liked ? "heart.fill" : "heart", "\(outfit.likes)",
                           tint: outfit.liked ? Color(hex: "FF3347") : t.textSecondary)
                }
                .buttonStyle(.plain)
                Button { nav.push(LooksRoute.outfit(outfit)) } label: {
                    metric("bubble.right", "\(outfit.comments)", tint: t.textSecondary)
                }
                .buttonStyle(.plain)
                metric("arrowshape.turn.up.right", "\(outfit.shares)", tint: t.textSecondary)
                Spacer()
                Button { store.toggleSave(outfit.id) } label: {
                    Image(systemName: outfit.saved ? "bookmark.fill" : "bookmark")
                        .font(.system(size: 18))
                        .foregroundStyle(outfit.saved ? t.accent : t.textSecondary)
                }
                .buttonStyle(.plain)
                Text(outfit.views).font(.vkMeta).foregroundStyle(t.textSecondary)
            }
            .padding(.horizontal, t.pad)
            .padding(.top, 12).padding(.bottom, 12)
        }
        .background(t.background)
    }

    private func metric(_ icon: String, _ value: String, tint: Color) -> some View {
        HStack(spacing: 6) {
            Image(systemName: icon).font(.system(size: 19))
            Text(value).font(.system(size: 15))
        }
        .foregroundStyle(tint)
    }

    private var tagStack: some View {
        VStack(alignment: .leading, spacing: 6) {
            ForEach(Array(outfit.items.enumerated()), id: \.element.id) { i, g in
                HStack(spacing: 6) {
                    Text("\(i + 1)").font(.system(size: 11, weight: .bold)).foregroundStyle(.black)
                        .frame(width: 18, height: 18).background(.white, in: Circle())
                    Text(g.title).font(.system(size: 13, weight: .medium)).foregroundStyle(.white)
                }
                .padding(.horizontal, 8).padding(.vertical, 5)
                .background(.black.opacity(0.55), in: Capsule())
            }
        }
        .padding(12)
    }
}

// MARK: - Строка «свопы рядом» (точка запроса гео)

private struct NearbyRow: View {
    @Environment(Nav.self) private var nav
    var body: some View {
        Button { nav.tab = 1; nav.push(LooksRoute.nearby) } label: {
            VKRow(title: "Свопы рядом с вами",
                  subtitle: "обмен вещами и встречи поблизости",
                  icon: "location")
        }
        .buttonStyle(HighlightStyle())
    }
}
