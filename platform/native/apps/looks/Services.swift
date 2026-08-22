import SwiftUI

// «Сервисы» — вкладка ВК один в один: строка виджетов, сетка иконок,
// секции с горизонтальными списками. Отличия продукта живут ВНУТРИ этой
// знакомой оболочки: свопы, барахолки, гардероб, знакомые.

struct ServicesScreen: View {
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t

    // каждая плитка отрабатывает заявленный доступ; «для красоты» плиток нет
    private let services: [(String, String, String, LooksRoute?)] = [
        ("Свопы", "arrow.left.arrow.right", "FF8A65", .nearby),
        ("Гардероб", "hanger", "5B7CFA", .wardrobe),
        ("Знакомые", "person.2.fill", "42B883", .mates),
        ("Разбор голосом", "waveform", "A78BFA", .talk),
        ("Отметка", "wifi", "3FA88C", .checkin),
        ("Виджет", "square.grid.2x2.fill", "E0834B", .widget),
        ("Пароли", "key.fill", "E0A83B", .fill),
        ("Поделиться", "square.and.arrow.up", "5AA9E6", .shareext),
    ]

    private let collections: [(String, String, String, String)] = [
        ("Осенние образы", "leaf.fill", "E0834B", "34 образа"),
        ("Секонд-находки", "tag.fill", "42B883", "нашли вчера"),
        ("Капсула на неделю", "square.stack.3d.up.fill", "5B7CFA", "7 сочетаний"),
        ("Кто рядом", "location.fill", "E0719A", "12 человек"),
    ]

    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(title: "Сервисы", avatar: "Ника Орлова") { EmptyView() }
            ScrollView {
                LazyVStack(spacing: t.cardGap) {
                    grid
                }
                .padding(.top, t.cardGap)
                .padding(.bottom, 72)
            }
            .background(t.background)
        }
        .background(t.background)
    }

    // сетка сервисов 4 в ряд
    private var grid: some View {
        Card {
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 0), count: 4), spacing: 18) {
                ForEach(services.indices, id: \.self) { i in
                    let s = services[i]
                    Button {
                        if let route = s.3 { nav.push(route) } else { nav.toast("Скоро") }
                    } label: {
                        VStack(spacing: 7) {
                            Image(systemName: s.1)
                                .font(.system(size: 21))
                                .foregroundStyle(Color(hex: s.2))
                                .frame(width: 52, height: 52)
                                .background(Color(hex: s.2).opacity(0.14),
                                            in: RoundedRectangle(cornerRadius: 15, style: .continuous))
                            Text(s.0).font(.dsCaption).foregroundStyle(t.textPrimary)
                                .lineLimit(1).minimumScaleFactor(0.85)
                        }
                    }
                    .pressable(scale: 0.94)
                }
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 16)
        }
    }

}

// MARK: - Клипы: вертикальные примерки (паттерн «Клипы» ВК)

struct ClipsScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @State private var index = 0

    var body: some View {
        TabView(selection: $index) {
            ForEach(Array(store.outfits.enumerated()), id: \.element.id) { i, outfit in
                ClipPage(outfit: outfit).tag(i)
            }
        }
        .tabViewStyle(.page(indexDisplayMode: .never))
        .ignoresSafeArea()
        .background(.black)
    }
}

private struct ClipPage: View {
    let outfit: Outfit
    @Environment(LooksStore.self) private var store
    @Environment(\.theme) private var t

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: "343A4A"), Color(hex: "12141A")],
                           startPoint: .top, endPoint: .bottom)

            // кадр примерки: главная вещь крупно, остальные — строкой под ней
            VStack(spacing: 26) {
                if let hero = outfit.items.first {
                    Image(systemName: hero.glyph)
                        .font(.system(size: 132, weight: .ultraLight))
                        .foregroundStyle(.white.opacity(0.96))
                }
                HStack(spacing: 34) {
                    ForEach(outfit.items.dropFirst()) { g in
                        Image(systemName: g.glyph)
                            .font(.system(size: 44, weight: .ultraLight))
                            .foregroundStyle(.white.opacity(0.45))
                    }
                }
            }
            .offset(y: -70)

            // низ: слева автор и вещи, справа колонка действий — в одном HStack,
            // поэтому пересечься они не могут
            VStack {
                Spacer()
                HStack(alignment: .bottom, spacing: 12) {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack(spacing: 10) {
                            Avatar(name: outfit.author, size: 36)
                            Text(outfit.author).font(.dsHeadline).foregroundStyle(.white)
                            Text("Подписаться")
                                .font(.system(size: 13, weight: .semibold)).foregroundStyle(.white)
                                .padding(.horizontal, 10).frame(height: 28)
                                .overlay(Capsule().stroke(.white.opacity(0.7), lineWidth: 1))
                        }
                        if !outfit.text.isEmpty {
                            Text(outfit.text).font(.dsSubhead)
                                .foregroundStyle(.white.opacity(0.92)).lineLimit(2)
                        }
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(outfit.items) { g in
                                    HStack(spacing: 6) {
                                        Image(systemName: g.glyph).font(.system(size: 13))
                                        Text(g.title).font(.system(size: 13, weight: .medium))
                                    }
                                    .foregroundStyle(.white)
                                    .padding(.horizontal, 10).frame(height: 30)
                                    .background(.white.opacity(0.18), in: Capsule())
                                }
                            }
                            .padding(.trailing, 8)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    VStack(spacing: 20) {
                        clipAction(icon: outfit.liked ? "heart.fill" : "heart",
                                   value: "\(outfit.likes)",
                                   tint: outfit.liked ? .red : .white) { store.toggleLike(outfit.id) }
                        clipAction(icon: "bubble.right", value: "\(outfit.comments)", tint: .white) {}
                        clipAction(icon: outfit.saved ? "bookmark.fill" : "bookmark",
                                   value: "\(outfit.shares)", tint: .white) { store.toggleSave(outfit.id) }
                    }
                    .frame(width: 52)
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 124)
            }
        }
    }

    private func clipAction(icon: String, value: String, tint: Color,
                            action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon).font(.system(size: 27)).foregroundStyle(tint)
                Text(value).font(.system(size: 12, weight: .medium)).foregroundStyle(.white)
            }
        }
        .pressable(scale: 0.9)
    }
}
