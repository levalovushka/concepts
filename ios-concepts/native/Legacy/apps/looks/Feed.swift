import SwiftUI
import UIKit

// Главная — лента ВК: белый фон, посты во всю ширину, между постами серая полоса.
// Действия поста — голые иконки с числами, без капсул (см. профиль, раздел 1).

struct FeedScreen: View {
    var captureState: String? = nil
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t

    var body: some View {
        VStack(spacing: 0) {
            VKTabHeader(title: "Главная", avatar: "Ника Орлова",
                        avatarAction: { nav.push(LooksRoute.profile) }) {
                Button { nav.present(cover: LooksRoute.create) } label: {
                    Image(systemName: "plus.circle")
                }
                .accessibilityLabel("Опубликовать образ")
                Button { nav.push(LooksRoute.notifications) } label: {
                    Image(systemName: t.icon(.notifications))
                        .overlay(alignment: .topTrailing) {
                            if store.unreadNotifications > 0 {
                            Text("\(store.unreadNotifications)").font(.role(.badge))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 5).padding(.vertical, 1)
                                .background(t.palette.badge, in: Capsule())
                                .offset(x: 9, y: -6)
                            }
                        }
                }
                .accessibilityLabel("Уведомления, \(store.unreadNotifications) новых")
            }

            ScrollView {
                LazyVStack(spacing: 0) {
                    StoriesRow()
                    GroupGap()
                    if captureState == "empty" {
                        NativeStatePanel(
                            kind: .empty,
                            title: "Лента пока пустая",
                            detail: "Подпишитесь на авторов или опубликуйте первый образ — новые записи появятся здесь.",
                            actionTitle: "Найти авторов",
                            action: { nav.push(LooksRoute.mates) },
                            placement: .page
                        )
                        .padding(.horizontal, t.spacing.contentInset)
                        .padding(.vertical, 24)
                    } else {
                        ForEach(store.outfits) { outfit in
                            PostCard(outfit: outfit)
                            GroupGap()
                        }
                        NearbyRow()
                    }
                    Color.clear.frame(height: 80)
                }
            }
            .refreshable { try? await Task.sleep(nanoseconds: 900_000_000) }
            .background(t.palette.background)
        }
        .background(t.palette.background)
    }
}

// MARK: - Истории

private struct StoriesRow: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(alignment: .top, spacing: 14) {
                ForEach(store.stories) { s in
                    Button {
                        if s.isMine { nav.present(cover: LooksRoute.create) }
                        else { nav.push(LooksRoute.author(s.name)) }
                    } label: {
                    VStack(spacing: 7) {
                        ZStack(alignment: .bottomTrailing) {
                            Avatar(name: s.name, size: 64, ring: !s.seen && !s.isMine)
                            if s.isMine {
                                Image(systemName: "plus")
                                    .font(.system(size: 12, weight: .bold)).foregroundStyle(.white)
                                    .frame(width: 22, height: 22)
                                    .background(t.palette.accent, in: Circle())
                                    .overlay(Circle().stroke(.white, lineWidth: 2.5))
                                    .offset(x: 1, y: 1)
                            }
                        }
                        Text(s.isMine ? "История" : (s.name.split(separator: " ").first.map(String.init) ?? s.name))
                            .font(.vkCaption).foregroundStyle(t.palette.textPrimary)
                            .lineLimit(1).frame(width: 72)
                    }
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(s.isMine ? "Добавить историю" : "История, \(s.name)")
                }
            }
            .padding(.horizontal, t.spacing.contentInset)
            .padding(.top, 12).padding(.bottom, 14)
        }
    }
}

// MARK: - Пост

private struct PostCard: View {
    let outfit: Outfit
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t
    @State private var showTags = false
    @State private var expanded = false
    @State private var showMenu = false
    @State private var subscribed = false
    @State private var hidden = false
    @State private var reported = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 10) {
                Button { nav.push(LooksRoute.author(outfit.author)) } label: {
                    HStack(spacing: 10) {
                Avatar(name: outfit.author, size: 40)
                VStack(alignment: .leading, spacing: 1) {
                    HStack(spacing: 4) {
                        Text(outfit.author).font(.vkName).foregroundStyle(t.palette.textPrimary)
                            .lineLimit(1)
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 13)).foregroundStyle(t.palette.accent)
                    }
                    Text(outfit.meta).font(.vkMeta).foregroundStyle(t.palette.textSecondary)
                }
                    }
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Профиль, \(outfit.author)")
                .layoutPriority(1)
                Spacer(minLength: 8)
                VKPill(title: subscribed ? "Вы подписаны" : "Подписаться") {
                    withAnimation(.easeOut(duration: 0.16)) { subscribed.toggle() }
                    nav.toast(subscribed ? "Вы подписались на автора" : "Подписка отменена")
                }
                Button { showMenu = true } label: {
                    Image(systemName: t.icon(.more)).font(.system(size: 17))
                        .foregroundStyle(t.palette.textSecondary)
                        .frame(width: 44, height: 44).contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Действия с публикацией")
            }
            .padding(.horizontal, t.spacing.contentInset)
            .padding(.vertical, 10)

            Button { nav.push(LooksRoute.outfit(outfit)) } label: {
                VKMedia(assetName: LooksMediaAssets.outfit(outfit.seed),
                        height: 340,
                        pageBadge: outfit.items.count > 1 ? "1/\(outfit.items.count)" : nil,
                        accessibilityLabel: "Образ автора \(outfit.author)")
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
                            .accessibilityLabel("Показать вещи на кадре")
                        }
                    }
            }
            .nativeAction("home.open-feed-post")
            .buttonStyle(.plain)

            if !outfit.text.isEmpty {
                // ВК обрывает текст поста и дописывает серое «Показать ещё»
                Button { withAnimation(.easeOut(duration: 0.18)) { expanded.toggle() } } label: {
                    Text("\(Text(outfit.text).foregroundStyle(t.palette.textPrimary))\(Text(expanded ? "" : "  Показать ещё").foregroundStyle(t.palette.textSecondary))")
                        .font(.vkBody).lineSpacing(3)
                        .lineLimit(expanded ? nil : 2)
                        .multilineTextAlignment(.leading)
                        .fixedSize(horizontal: false, vertical: true)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Текст поста")
                .padding(.horizontal, t.spacing.contentInset).padding(.top, 12)
            }

            VKPostActions(likes: outfit.likes, liked: outfit.liked,
                          comments: outfit.comments, shares: outfit.shares,
                          saved: outfit.saved, trailing: outfit.views,
                          onLike: { store.toggleLike(outfit.id) },
                          onComment: { nav.push(LooksRoute.outfit(outfit)) },
                          onShare: {
                              UIPasteboard.general.string = "looks://outfit/\(outfit.id.uuidString)"
                              nav.toast("Ссылка скопирована")
                          },
                          onSave: { store.toggleSave(outfit.id) })
                .padding(.horizontal, t.spacing.contentInset)
                .padding(.top, 12).padding(.bottom, 12)
        }
        .background(t.palette.background)
        .opacity(hidden ? 0 : 1)
        .frame(maxHeight: hidden ? 0 : nil)
        .clipped()
        .confirmationDialog("Публикация", isPresented: $showMenu) {
            Button("Скрыть из ленты") {
                withAnimation { hidden = true }
                nav.toast("Публикация скрыта")
            }
            Button(reported ? "Жалоба отправлена" : "Пожаловаться", role: .destructive) {
                reported = true
                nav.toast("Жалоба отправлена")
            }
            Button("Отмена", role: .cancel) {}
        }
    }

    private var tagStack: some View {
        VStack(alignment: .leading, spacing: 6) {
            ForEach(Array(outfit.items.enumerated()), id: \.element.id) { i, g in
                HStack(spacing: 6) {
                    Text("\(i + 1)").font(.role(.bubbleTime)).foregroundStyle(.black)
                        .frame(width: 18, height: 18).background(.white, in: Circle())
                    Text(g.title).font(.role(.groupHeader)).foregroundStyle(.white)
                }
                .padding(.horizontal, 8).padding(.vertical, 5)
                .background(.black.opacity(0.55), in: Capsule())
            }
        }
        .padding(12)
    }
}

// MARK: - Обмен вещами рядом (точка запроса гео)

private struct NearbyRow: View {
    @Environment(Nav.self) private var nav
    var body: some View {
        Button { nav.push(LooksRoute.nearby) } label: {
            VKRow(title: "Обмен вещами рядом",
                  subtitle: "обмен вещами и встречи поблизости",
                  icon: "location")
        }
        .buttonStyle(HighlightStyle())
    }
}
