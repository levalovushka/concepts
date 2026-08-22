import SwiftUI

// «Сервисы» — вкладка ВК один в один: строка виджетов, сетка иконок,
// секции с горизонтальными списками. Отличия продукта живут ВНУТРИ этой
// знакомой оболочки: свопы, барахолки, гардероб, знакомые.

struct ServicesScreen: View {
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t

    private let services: [(String, String, String, LooksRoute?)] = [
        ("Свопы", "arrow.left.arrow.right", "FF8A65", .nearby),
        ("Гардероб", "hanger", "5B7CFA", .wardrobe),
        ("Знакомые", "person.2.fill", "42B883", .mates),
        ("Сохранённое", "bookmark.fill", "A78BFA", nil),
        ("Барахолки", "bag.fill", "F0724E", .nearby),
        ("Примерки", "video.fill", "E0719A", nil),
        ("Бренды", "tag.fill", "3FA88C", nil),
        ("Реклама", "sparkles", "E0A83B", .ads),
    ]

    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(title: "Сервисы", avatar: "Ника Орлова") {
                Button { nav.push(LooksRoute.search) } label: { Image(systemName: "magnifyingglass") }
            }
            ScrollView {
                LazyVStack(spacing: t.cardGap) {
                    widgets
                    grid
                    forYou
                }
                .padding(.vertical, t.cardGap)
            }
            .background(t.background)
        }
        .background(t.background)
    }

    // строка виджетов — как погода/плейлист/курс у ВК
    private var widgets: some View {
        HStack(spacing: t.cardGap) {
            widget(title: "3 свопа", sub: "рядом на выходных", icon: "arrow.left.arrow.right", tint: "FF8A65") {
                nav.push(LooksRoute.nearby)
            }
            widget(title: "Образ дня", sub: "собран для вас", icon: "sparkles", tint: "5B7CFA") {}
            widget(title: "86 вещей", sub: "в гардеробе", icon: "hanger", tint: "42B883") {
                nav.push(LooksRoute.wardrobe)
            }
        }
        .padding(.horizontal, t.pad)
    }

    private func widget(title: String, sub: String, icon: String, tint: String,
                        action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 6) {
                Image(systemName: icon).font(.system(size: 17, weight: .medium))
                    .foregroundStyle(Color(hex: tint))
                Text(title).font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(t.textPrimary).lineLimit(1)
                Text(sub).font(.system(size: 12)).foregroundStyle(t.textSecondary)
                    .lineLimit(2).fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(10)
            .frame(height: 96, alignment: .top)
            .background(t.card, in: RoundedRectangle(cornerRadius: t.cardRadius, style: .continuous))
        }
        .pressable()
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

    // секция «Для вас» — горизонтальный список, как у ВК
    private var forYou: some View {
        Card {
            Text("Для вас")
                .font(.system(size: 13, weight: .medium)).foregroundStyle(t.textSecondary)
                .padding(.horizontal, 14).padding(.top, 14).padding(.bottom, 10)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(["Осенние образы", "Секонд-находки", "Капсула на неделю", "Кто рядом"], id: \.self) { title in
                        VStack(alignment: .leading, spacing: 8) {
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .fill(LinearGradient(colors: [t.accent.opacity(0.22), t.accent.opacity(0.42)],
                                                     startPoint: .top, endPoint: .bottom))
                                .frame(width: 116, height: 116)
                                .overlay(Image(systemName: "square.stack.3d.up")
                                    .font(.system(size: 26, weight: .ultraLight)).foregroundStyle(t.accent))
                            Text(title).font(.dsCaption).foregroundStyle(t.textPrimary)
                                .frame(width: 116, alignment: .leading).lineLimit(2)
                        }
                    }
                }
                .padding(.horizontal, 14)
            }
            .scrollClipDisabled()
            .padding(.bottom, 16)
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
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var showTags = true

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: "2B2F3A"), Color(hex: "111319")],
                           startPoint: .top, endPoint: .bottom)
            // «кадр» примерки: вещи образа крупно
            VStack(spacing: 18) {
                ForEach(Array(outfit.items.prefix(3).enumerated()), id: \.element.id) { i, g in
                    Image(systemName: g.glyph)
                        .font(.system(size: i == 0 ? 96 : 54, weight: .ultraLight))
                        .foregroundStyle(.white.opacity(i == 0 ? 0.95 : 0.55))
                }
            }
            .offset(y: -40)

            // правая колонка действий — как в Клипах
            VStack(spacing: 22) {
                Spacer()
                clipAction(icon: outfit.liked ? "heart.fill" : "heart",
                           value: "\(outfit.likes)",
                           tint: outfit.liked ? .red : .white) { store.toggleLike(outfit.id) }
                clipAction(icon: "bubble.right", value: "\(outfit.comments)", tint: .white) {}
                clipAction(icon: outfit.saved ? "bookmark.fill" : "bookmark",
                           value: "Сохранить", tint: .white) { store.toggleSave(outfit.id) }
                Spacer().frame(height: 260)
            }
            .frame(maxWidth: .infinity, alignment: .trailing)
            .padding(.trailing, 14)

            // низ: автор, текст, отметки вещей
            VStack(alignment: .leading, spacing: 10) {
                Spacer()
                HStack(spacing: 10) {
                    Avatar(name: outfit.author, size: 36)
                    Text(outfit.author).font(.dsHeadline).foregroundStyle(.white)
                    Text("Подписаться")
                        .font(.system(size: 13, weight: .semibold)).foregroundStyle(.white)
                        .padding(.horizontal, 10).frame(height: 28)
                        .overlay(Capsule().stroke(.white.opacity(0.7), lineWidth: 1))
                }
                if !outfit.text.isEmpty {
                    Text(outfit.text).font(.dsSubhead).foregroundStyle(.white.opacity(0.92))
                        .lineLimit(2)
                        .padding(.trailing, 76)
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
                }
                .scrollClipDisabled()
                Spacer().frame(height: 118)
            }
            .padding(.horizontal, 16)
        }
    }

    private func clipAction(icon: String, value: String, tint: Color,
                            action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 5) {
                Image(systemName: icon).font(.system(size: 27)).foregroundStyle(tint)
                Text(value).font(.system(size: 12, weight: .medium)).foregroundStyle(.white)
            }
        }
        .pressable(scale: 0.9)
    }
}
