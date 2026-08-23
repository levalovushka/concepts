import SwiftUI

// «Поиск» ВК: заголовок с мини-аватаром, поле поиска, табы с подчёркиванием
// и мозаика в три колонки разной высоты с бейджем типа контента в углу.

struct SearchScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var query = ShotMode.isScreen("search", state: "query") ? "тренч" : ""
    @State private var tab = 0

    var body: some View {
        VStack(spacing: 0) {
            VKTabHeader(title: "Поиск", avatar: "Ника Орлова",
                        avatarAction: { nav.push(LooksRoute.profile) }) { EmptyView() }

            VKSearchField(placeholder: "Образы, вещи и люди", text: $query)
                .padding(.horizontal, t.pad)
                .padding(.bottom, 10)

            VKTabs(items: ["Для вас", "Новое"], selection: $tab)
            Rectangle().fill(t.separator).frame(height: 0.5)

            ScrollView {
                if ShotMode.isScreen("search", state: "loading") {
                    AppStatePanel(kind: .loading, title: "Подбираем образы",
                                  detail: "Смотрим, что носят рядом с вами.")
                        .padding(t.pad)
                } else if ShotMode.isScreen("search", state: "empty") {
                    AppStatePanel(kind: .empty, title: "Ничего не нашлось",
                                  detail: "Попробуйте вещь или марку: «тренч», «секонд», «Zara».")
                        .padding(t.pad)
                } else if ShotMode.isScreen("search", state: "query") {
                    VStack(alignment: .leading, spacing: 0) {
                        ForEach(["тренч оверсайз", "секонд Москва", "капсула на осень"], id: \.self) { hint in
                            HStack(spacing: 12) {
                                Image(systemName: "magnifyingglass").foregroundStyle(t.textSecondary).frame(width: 24)
                                Text(hint).textStyle(.rowTitle)
                                Spacer()
                                Image(systemName: "arrow.up.left").foregroundStyle(t.textSecondary)
                            }
                            .padding(.horizontal, t.pad).frame(height: 48)
                            RowSeparator(leading: 52)
                        }
                    }
                }
                // В пустом состоянии и в загрузке мозаики нет: панель «ничего
                // не нашлось» поверх найденного противоречит сама себе.
                let hideMosaic = ShotMode.isScreen("search", state: "empty")
                    || ShotMode.isScreen("search", state: "loading")
                VKMosaic(items: hideMosaic ? [] : (tab == 0 ? store.discover : store.discover.reversed())) { _ in
                    nav.push(LooksRoute.outfit(store.outfits[0]))
                }
                Color.clear.frame(height: 90)
            }
            .background(t.background)
        }
        .background(t.background)
    }
}
