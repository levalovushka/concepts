import SwiftUI

// «Поиск» ВК: заголовок с мини-аватаром, поле поиска, табы с подчёркиванием
// и мозаика в три колонки разной высоты с бейджем типа контента в углу.

struct SearchScreen: View {
    var captureState: String? = nil
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t
    @State private var query = ""
    @State private var tab = 0

    var body: some View {
        VStack(spacing: 0) {
            VKTabHeader(title: "Поиск", avatar: "Ника Орлова",
                        avatarAction: { nav.push(LooksRoute.profile) }) { EmptyView() }

            VKSearchField(placeholder: "Образы, вещи и люди", text: $query)
                .padding(.horizontal, t.spacing.contentInset)
                .padding(.bottom, 10)

            VKTabs(items: ["Для вас", "Новое"], selection: $tab)
            Rectangle().fill(t.palette.separator).frame(height: 0.5)

            ScrollView {
                if captureState == "loading" {
                    NativeStatePanel(kind: .loading,
                                     title: "Ищем образы",
                                     detail: "Собираем подходящие публикации и вещи.",
                                     placement: .page)
                        .padding(.horizontal, t.spacing.contentInset)
                        .padding(.top, 24)
                } else if results.isEmpty {
                    NativeStatePanel(kind: .empty,
                                     title: "Ничего не нашли",
                                     detail: "Попробуйте другое название вещи, автора или стиля.",
                                     actionTitle: "Очистить запрос",
                                     action: { query = "" },
                                     placement: .page)
                        .padding(.horizontal, t.spacing.contentInset)
                        .padding(.top, 24)
                } else {
                    VKMosaic(items: results.map(\.item), nativeActionID: "search.open-search-result") { selected in
                        guard let result = results.first(where: { $0.item.id == selected.id }) else { return }
                        nav.push(LooksRoute.outfit(result.outfit))
                    }
                }
                Color.clear.frame(height: 90)
            }
            .background(t.palette.background)
        }
        .background(t.palette.background)
        .task(id: captureState) {
            switch captureState {
            case "query": query = "тренч"
            case "empty": query = "такого образа нет"
            default: break
            }
        }
    }

    private var results: [(item: VKMosaicItem, outfit: Outfit)] {
        let paired = store.discover.enumerated().map { index, item in
            (item: item, outfit: store.outfits[index % store.outfits.count])
        }
        let filtered: [(item: VKMosaicItem, outfit: Outfit)]
        let normalized = query.trimmingCharacters(in: .whitespacesAndNewlines)
        if normalized.isEmpty {
            filtered = paired
        } else {
            filtered = paired.filter { result in
                result.outfit.author.localizedCaseInsensitiveContains(normalized)
                    || result.outfit.text.localizedCaseInsensitiveContains(normalized)
                    || result.outfit.items.contains { item in
                        item.title.localizedCaseInsensitiveContains(normalized)
                            || item.brand.localizedCaseInsensitiveContains(normalized)
                    }
            }
        }
        return tab == 0 ? filtered : Array(filtered.reversed())
    }
}
