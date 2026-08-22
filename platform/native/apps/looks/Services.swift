import SwiftUI

// «Сервисы» — это «Меню» ВК: сетка плиток 64 радиус 18 с градиентом и белым
// глифом, под ней секции с горизонтальными рядами. Настройки — шестерёнка
// справа сверху, единственная дверь в них во всём приложении.

struct ServicesScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    // каждая плитка отрабатывает заявленный доступ; «для красоты» плиток нет
    private let services: [(String, String, [String], LooksRoute)] = [
        ("Свопы", "arrow.left.arrow.right", ["FF8A65", "F4511E"], .nearby),
        ("Гардероб", "hanger", ["5B7CFA", "3D5AFE"], .wardrobe),
        ("Знакомые", "person.2.fill", ["42B883", "1E9E63"], .mates),
        ("Разбор голосом", "waveform", ["A78BFA", "7C4DFF"], .talk),
    ]

    private var garments: [Garment] { store.outfits.flatMap(\.items) }

    var body: some View {
        VStack(spacing: 0) {
            VKTabHeader(title: "Сервисы", avatar: "Ника Орлова",
                        avatarAction: { nav.push(LooksRoute.profile) }) {
                Button { nav.push(LooksRoute.settings) } label: {
                    Image(systemName: "gearshape")
                }
                .accessibilityLabel("Настройки")
            }
            ScrollView {
                LazyVStack(spacing: 0) {
                    grid
                    GroupGap()
                    swaps
                    GroupGap()
                    wardrobe
                    Color.clear.frame(height: 90)
                }
            }
            .background(t.background)
        }
        .background(t.background)
    }

    // сетка сервисов 4 в ряд
    private var grid: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 0), count: 4),
                  spacing: 16) {
            ForEach(services.indices, id: \.self) { i in
                let s = services[i]
                Button { nav.push(s.3) } label: {
                    VStack(spacing: 8) {
                        Image(systemName: s.1)
                            .font(.system(size: 26, weight: .medium))
                            .foregroundStyle(.white)
                            .frame(width: 64, height: 64)
                            .background(
                                LinearGradient(colors: s.2.map { Color(hex: $0) },
                                               startPoint: .topLeading, endPoint: .bottomTrailing),
                                in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                        Text(s.0).font(.vkCaption).foregroundStyle(t.textPrimary)
                            .lineLimit(1).minimumScaleFactor(0.8)
                    }
                }
                .pressable(scale: 0.94)
            }
        }
        .padding(.horizontal, 10)
        .padding(.top, 14).padding(.bottom, 18)
    }

    // Секция свопов: ряд карточек ведёт в те же встречи, что и «Свопы рядом».
    private var swaps: some View {
        VStack(alignment: .leading, spacing: 0) {
            VKSectionHeader(title: "Свопы недели", action: "Все") {
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
                .padding(.horizontal, t.pad)
            }
            .scrollClipDisabled()
            .padding(.bottom, 16)
        }
    }

    // Секция гардероба: состояния вещей разные — так и бывает у живого списка.
    private var wardrobe: some View {
        VStack(alignment: .leading, spacing: 0) {
            VKSectionHeader(title: "Гардероб", action: "86 вещей") {
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
                .padding(.horizontal, t.pad)
            }
            .scrollClipDisabled()
            .padding(.bottom, 16)
        }
    }

    private func tile(glyph: String, seed: Int, title: String, sub: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            VKMedia(glyph: glyph, height: 145, seed: seed)
                .frame(width: 145)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.system(size: 15)).foregroundStyle(t.textPrimary)
                    .lineLimit(2).multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                Text(sub).font(.vkMeta).foregroundStyle(t.textSecondary).lineLimit(1)
            }
            .frame(width: 145, alignment: .leading)
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
    @State private var muted = true

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

            // верх: признаки видео — иначе кадр не читается как клип
            VStack {
                HStack(spacing: 10) {
                    Text("0:07 / 0:18")
                        .font(.system(size: 12, weight: .medium).monospacedDigit())
                        .foregroundStyle(.white.opacity(0.9))
                        .padding(.horizontal, 8).padding(.vertical, 4)
                        .background(.black.opacity(0.32), in: Capsule())
                    Spacer()
                    Button { muted.toggle() } label: {
                        Image(systemName: muted ? "speaker.slash.fill" : "speaker.wave.2.fill")
                            .font(.system(size: 13)).foregroundStyle(.white)
                            .frame(width: 32, height: 32)
                            .background(.black.opacity(0.32), in: Circle())
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal, 16).padding(.top, 60)
                Spacer()
            }

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
                        clipAction(icon: "arrowshape.turn.up.right", value: "\(outfit.shares)",
                                   tint: .white) {}
                        clipAction(icon: outfit.saved ? "bookmark.fill" : "bookmark",
                                   value: "", tint: .white) { store.toggleSave(outfit.id) }
                    }
                    .frame(width: 52)
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 14)

                // полоса воспроизведения
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule().fill(.white.opacity(0.25)).frame(height: 3)
                        Capsule().fill(.white).frame(width: geo.size.width * 0.39, height: 3)
                    }
                }
                .frame(height: 3)
                .padding(.horizontal, 16)
                .padding(.bottom, 104)
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
