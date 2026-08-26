import SwiftUI

// «Меню» ВК: сетка плиток 64 радиус 18 с ярким градиентом и белым глифом,
// под ней секции с горизонтальными рядами. Настройки — плитка в сетке,
// как у ВК, и единственная дверь в них во всём приложении.

struct ServicesScreen: View {
    var captureState: String? = nil
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t

    // каждая плитка ведёт в живой экран; «для красоты» плиток нет
    private let tiles: [(String, String, [String], LooksRoute)] = [
        ("Обмен", "arrow.left.arrow.right", ["FF8A65", "F4511E"], .nearby),
        ("Гардероб", "hanger", ["5B7CFA", "3D5AFE"], .wardrobe),
        ("Знакомые", "person.2.fill", ["42B883", "1E9E63"], .mates),
        ("Сохранённое", "bookmark.fill", ["2ECC71", "10A05A"], .lock),
        ("Разбор голосом", "waveform", ["A78BFA", "7C4DFF"], .talk),
        ("Настройки", "gearshape.fill", ["A9B0BA", "838B95"], .settings),
    ]

    private var garments: [Garment] { store.garments }

    var body: some View {
        VStack(spacing: 0) {
            VKTabHeader(title: "Меню", avatar: "Ника Орлова",
                        avatarAction: { nav.push(LooksRoute.profile) }) { EmptyView() }
            ScrollView {
                if captureState == "loading" {
                    NativeStatePanel(kind: .loading,
                                     title: "Загружаем сервисы",
                                     detail: "Синхронизируем гардероб, события и сохранённые материалы.",
                                     placement: .page)
                        .padding(.horizontal, t.spacing.contentInset)
                        .padding(.top, 24)
                } else {
                    LazyVStack(spacing: 0) {
                        grid
                        GroupGap()
                        swaps
                        GroupGap()
                        wardrobe
                        Color.clear.frame(height: 90)
                    }
                }
            }
            .background(t.palette.background)
        }
        .background(t.palette.background)
    }

    // сетка 4 в ряд
    private var grid: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 0), count: 4),
                  spacing: 16) {
            ForEach(tiles.indices, id: \.self) { i in
                let tile = tiles[i]
                if tile.0 == "Гардероб" {
                    VKServiceTile(title: tile.0, icon: tile.1, colors: tile.2) {
                        nav.push(tile.3)
                    }
                    .nativeAction("services.open-wardrobe")
                } else {
                    VKServiceTile(title: tile.0, icon: tile.1, colors: tile.2) {
                        nav.push(tile.3)
                    }
                }
            }
        }
        .padding(.horizontal, 10)
        .padding(.top, 14).padding(.bottom, 18)
    }

    // Встречи по обмену: ряд карточек ведёт в тот же каталог событий рядом.
    private var swaps: some View {
        VStack(alignment: .leading, spacing: 0) {
            VKSectionHeader(title: "Обмен вещами", action: "Все") {
                nav.push(LooksRoute.nearby)
            }
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .top, spacing: 12) {
                    ForEach(store.events) { e in
                        Button { nav.push(LooksRoute.event(e)) } label: {
                            tile(glyph: "arrow.left.arrow.right", seed: e.going,
                                 title: e.title, sub: e.when)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, t.spacing.contentInset)
            }
            .scrollClipDisabled()
            .padding(.bottom, 16)
        }
    }

    // Секция гардероба: состояния вещей разные — так и бывает у живого списка.
    private var wardrobe: some View {
        VStack(alignment: .leading, spacing: 0) {
            VKSectionHeader(title: "Гардероб", action: plural(garments.count, "вещь", "вещи", "вещей")) {
                nav.push(LooksRoute.wardrobe)
            }
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .top, spacing: 12) {
                    ForEach(garments.prefix(8)) { g in
                        Button { nav.push(LooksRoute.wardrobe) } label: {
                            tile(glyph: g.glyph, seed: g.title.count,
                                 title: g.title, sub: g.state.label)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, t.spacing.contentInset)
            }
            .scrollClipDisabled()
            .padding(.bottom, 16)
        }
    }

    private func tile(glyph: String, seed: Int, title: String, sub: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            VKMedia(assetName: LooksMediaAssets.detail(seed), height: 145)
                .frame(width: 145)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.role(.body)).foregroundStyle(t.palette.textPrimary)
                    .lineLimit(2).multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                Text(sub).font(.vkMeta).foregroundStyle(t.palette.textSecondary).lineLimit(1)
            }
            .frame(width: 145, alignment: .leading)
        }
    }
}
