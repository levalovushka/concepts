import SwiftUI

// Главная «Хвостов» — лента ВК: композер сверху, моменты во всю ширину,
// между ними серая полоса. Единица контента — момент питомца, а не пост
// человека: в шапке карточки кличка и порода, а хозяин рядом.

struct FeedScreen: View {
    @Environment(TailsStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    private var isEmpty: Bool { ShotMode.isScreen("home", state: "empty") }
    private var isLoading: Bool { ShotMode.isScreen("home", state: "loading") }

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                composer
                GroupGap()

                if isLoading {
                    AppStatePanel(kind: .loading, title: "Обновляем ленту района",
                                  detail: "Смотрим, кто гулял рядом за последний час.")
                        .padding(t.pad)
                } else if isEmpty {
                    AppStatePanel(kind: .empty, title: "Пока пусто",
                                  detail: "Подпишитесь на площадки рядом или расскажите о своей прогулке.")
                        .padding(t.pad)
                } else {
                    WalkStrip()
                    GroupGap()
                    ForEach(store.visibleMoments) { moment in
                        MomentCard(moment: moment)
                        GroupGap()
                    }
                }
                Color.clear.frame(height: 88)
            }
        }
        .background(t.background)
        .rootHeaderBar {
            VKTabHeader(title: "Главная", avatar: store.me.name, dropdown: true,
                        avatarAction: { nav.push(TailsRoute.pet(store.me)) }) {
                Button { nav.present(cover: TailsRoute.create) } label: {
                    Image(systemName: "plus.circle")
                }
                .accessibilityLabel("Новый момент")
                Button { nav.push(TailsRoute.vaccine) } label: {
                    Image(systemName: "bell")
                        .overlay(alignment: .topTrailing) {
                            Text("2").textStyle(.badge)
                                .padding(.horizontal, 5).padding(.vertical, 1)
                                .background(t.badge, in: Capsule())
                                .offset(x: 9, y: -6)
                        }
                }
                .accessibilityLabel("Напоминания о здоровье")
            }
        }
    }

    private var composer: some View {
        Button { nav.present(cover: TailsRoute.create) } label: {
            HStack(spacing: 12) {
                Avatar(name: store.me.name, size: 38)
                Text("Как прошла прогулка?").textStyle(.body)
                    .foregroundStyle(t.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Text("Рассказать").textStyle(.action)
            }
            .padding(.horizontal, t.pad).frame(height: 56).contentShape(Rectangle())
        }
        .buttonStyle(HighlightStyle())
        .background(t.background)
        .accessibilityLabel("Рассказать о прогулке")
    }
}

// MARK: - Полоса ближайших прогулок

private struct WalkStrip: View {
    @Environment(TailsStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            VKSectionHeader(title: "Прогулки рядом", action: "Все") {
                nav.push(TailsRoute.walks)
            }
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .top, spacing: 10) {
                    ForEach(store.walks.prefix(4)) { walk in
                        Button { nav.push(TailsRoute.walk(walk)) } label: {
                            WalkChip(walk: walk)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, t.pad).padding(.bottom, 14)
            }
            .scrollClipDisabled()
        }
    }
}

struct WalkChip: View {
    let walk: Walk
    @Environment(\.theme) private var t

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
                Circle().fill(walk.state == .now ? t.positive : t.accent)
                    .frame(width: 7, height: 7)
                Text(walk.state.rawValue).textStyle(.meta)
                    .foregroundStyle(walk.state == .now ? t.positive : t.textSecondary)
            }
            Text(walk.place).textStyle(.name).lineLimit(1)
            Text("\(walk.when) · \(walk.distance)").textStyle(.meta).lineLimit(1)
            HStack(spacing: -8) {
                ForEach(walk.pets.prefix(3), id: \.self) { pet in
                    Avatar(name: pet, size: 22)
                        .overlay(Circle().stroke(t.background, lineWidth: 2))
                }
            }
            .padding(.top, 2)
        }
        .padding(12)
        .frame(width: 196, alignment: .leading)
        .background(t.fill, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

// MARK: - Карточка момента

private struct MomentCard: View {
    let moment: Moment
    @Environment(TailsStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var expanded = false
    @State private var showMenu = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button { nav.push(TailsRoute.pet(moment.pet)) } label: {
                HStack(spacing: 10) {
                    Avatar(name: moment.pet.name, size: 40)
                    VStack(alignment: .leading, spacing: 1) {
                        HStack(spacing: 6) {
                            Text(moment.pet.name).textStyle(.name)
                            Text(moment.pet.breed).textStyle(.meta)
                        }
                        Text("\(moment.published) · \(moment.pet.owner)").textStyle(.meta)
                    }
                    Spacer(minLength: 8)
                }
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .overlay(alignment: .trailing) {
                Button { showMenu = true } label: {
                    Image(systemName: "ellipsis").font(.system(size: 17))
                        .foregroundStyle(t.textSecondary)
                        .frame(width: 32, height: 32).contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Ещё")
            }
            .padding(.horizontal, t.pad).padding(.vertical, 10)

            if moment.kind != .walk {
                HStack(spacing: 6) {
                    Image(systemName: moment.kind.systemImage).font(.system(size: 13, weight: .semibold))
                    Text(moment.kind.rawValue).font(.role(.meta)).fontWeight(.semibold)
                }
                .foregroundStyle(moment.kind == .lost ? t.badge : t.accent)
                .padding(.horizontal, 10).frame(height: 26)
                .background((moment.kind == .lost ? t.badge : t.accent).opacity(0.1), in: Capsule())
                .padding(.horizontal, t.pad).padding(.bottom, 8)
            }

            Text(moment.title).textStyle(.cardTitle)
                .padding(.horizontal, t.pad).padding(.bottom, 4)

            Button { withAnimation(.easeOut(duration: 0.18)) { expanded.toggle() } } label: {
                (Text(moment.text).foregroundStyle(t.textPrimary)
                 + Text(expanded ? "" : "  Показать ещё").foregroundStyle(t.textSecondary))
                    .font(.role(.body)).lineSpacing(3)
                    .lineLimit(expanded ? nil : 3)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Текст момента")
            .padding(.horizontal, t.pad)

            HStack(spacing: 6) {
                Image(systemName: "mappin.and.ellipse").font(.system(size: 13))
                Text(moment.place).textStyle(.meta)
            }
            .foregroundStyle(t.textSecondary)
            .padding(.horizontal, t.pad).padding(.top, 8)

            VKPostActions(likes: moment.likes, liked: moment.liked,
                          comments: moment.replies.count, shares: 0,
                          saved: moment.saved, trailing: moment.views,
                          onLike: { store.toggleLike(moment.id) },
                          onComment: { nav.push(TailsRoute.pet(moment.pet)) },
                          shareItem: "\(moment.pet.name): \(moment.title)",
                          onSave: { store.toggleSave(moment.id) })
                .padding(.horizontal, t.pad).padding(.vertical, 12)

            if let reply = moment.replies.first {
                Button { nav.push(TailsRoute.pet(moment.pet)) } label: {
                    HStack(alignment: .top, spacing: 10) {
                        Avatar(name: reply.author, size: 28)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(reply.author).textStyle(.name)
                            Text(reply.text).textStyle(.body).lineLimit(2)
                                .multilineTextAlignment(.leading)
                            if moment.replies.count > 1 {
                                Text("Показать все \(tailsPlural(moment.replies.count, "ответ", "ответа", "ответов"))")
                                    .textStyle(.action)
                            }
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(.horizontal, t.pad).padding(.bottom, 12)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
        }
        .background(t.background)
        .confirmationDialog("Момент", isPresented: $showMenu) {
            Button("Скрыть из ленты") { withAnimation { store.hide(moment.id) } }
            Button("Пожаловаться", role: .destructive) { withAnimation { store.hide(moment.id) } }
            Button("Отмена", role: .cancel) {}
        }
    }
}

// MARK: - Шапка корневой вкладки над скроллом

extension View {
    /// Шапка закреплена над содержимым и красит зону статус-бара: внутри
    /// скролла под часами оставалась бы серая подложка страницы.
    func rootHeaderBar<Header: View>(@ViewBuilder _ header: () -> Header) -> some View {
        safeAreaInset(edge: .top, spacing: 0) {
            header()
                .background(Color.white)
                .overlay(alignment: .bottom) { Color(hex: "E7E8EC").frame(height: 0.5) }
        }
    }
}
