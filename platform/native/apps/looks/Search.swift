import SwiftUI

// «Поиск» ВК: заголовок с мини-аватаром, поле поиска, табы с подчёркиванием
// и мозаика в три колонки разной высоты с бейджем типа контента в углу.

struct SearchScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var query = ""
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
                VKMosaic(items: tab == 0 ? store.discover : store.discover.reversed()) { _ in
                    nav.push(LooksRoute.outfit(store.outfits[0]))
                }
                Color.clear.frame(height: 90)
            }
            .background(t.background)
        }
        .background(t.background)
    }
}
