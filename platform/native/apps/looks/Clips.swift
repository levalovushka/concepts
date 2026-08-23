import SwiftUI

// «Клипы» ВК: табы сверху, кадр во весь экран, правый рельс белых иконок
// с числами, внизу автор с обводочной капсулой «Подписаться», текст с «Ещё»
// и капсула «Оригинальный звук». Полоса воспроизведения по нижнему краю.

struct ClipsScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @State private var index = 0
    @State private var tab = 0

    var body: some View {
        ZStack(alignment: .top) {
            TabView(selection: $index) {
                ForEach(Array(store.visibleOutfits.enumerated()), id: \.element.id) { i, outfit in
                    ClipPage(outfit: outfit).tag(i)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .ignoresSafeArea()

            HStack(spacing: 16) {
                VKDarkTabs(items: ["Для вас", "Примерки", "Тренды"], selection: $tab)
                Spacer(minLength: 8)
                Button { nav.present(cover: LooksRoute.create) } label: {
                    Image(systemName: "plus").font(.system(size: 22, weight: .medium))
                        .foregroundStyle(.white)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Снять клип")
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
        }
        .background(.black)
    }
}

private struct ClipPage: View {
    let outfit: Outfit
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var muted = true
    @State private var expanded = false
    @State private var showMenu = false

    /// Обрезаем по слову, а не по символу: середина слова читается как сбой.
    private var shortText: String {
        let limit = 34
        guard outfit.text.count > limit else { return outfit.text }
        let cut = outfit.text.prefix(limit)
        let end = cut.lastIndex(of: " ") ?? cut.endIndex
        return String(cut[cut.startIndex..<end]) + "…"
    }

    var body: some View {
        ZStack {
            GeometryReader { geometry in
                Image(LooksMediaAssets.outfit(outfit.seed))
                    .resizable()
                    .scaledToFill()
                    .frame(width: geometry.size.width, height: geometry.size.height)
                    .clipped()
                    .overlay {
                        LinearGradient(
                            colors: [.black.opacity(0.08), .clear, .black.opacity(0.72)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    }
            }
            .ignoresSafeArea()

            // низ: слева автор и звук, справа рельс действий — в одном HStack,
            // поэтому пересечься они не могут
            VStack {
                Spacer()
                HStack(alignment: .bottom, spacing: 12) {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack(spacing: 10) {
                            Avatar(name: outfit.author, size: 36)
                            HStack(spacing: 4) {
                                Text(outfit.author).font(.role(.name))
                                    .foregroundStyle(.white)
                                Image(systemName: "checkmark.seal.fill")
                                    .font(.system(size: 13)).foregroundStyle(.white)
                            }
                            VKOutlineCapsule(title: "Подписаться")
                        }
                        if !outfit.text.isEmpty {
                            Button { withAnimation(.easeOut(duration: 0.18)) { expanded.toggle() } } label: {
                                // ВК обрывает описание и дописывает «Ещё» — без него
                                // строка выглядит просто обрезанной.
                                Text("\(Text(expanded ? outfit.text : shortText).foregroundStyle(.white.opacity(0.94)))\(Text(expanded ? "" : "  Ещё").foregroundStyle(.white.opacity(0.62)))")
                                    .font(.role(.body))
                                    .multilineTextAlignment(.leading)
                            }
                            .buttonStyle(.plain)
                            .accessibilityLabel("Описание клипа")
                        }
                        HStack(spacing: 10) {
                            Button { muted.toggle() } label: {
                                Image(systemName: muted ? "speaker.slash.fill" : "speaker.wave.2.fill")
                                    .font(.system(size: 15)).foregroundStyle(.white)
                            }
                            .buttonStyle(.plain)
                            .accessibilityLabel(muted ? "Включить звук" : "Выключить звук")
                            VKSoundCapsule(title: "Оригинальный звук")
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    VStack(spacing: 20) {
                        VKClipAction(icon: outfit.liked ? "heart.fill" : "heart",
                                     value: "\(outfit.likes)", label: "Нравится",
                                     tint: outfit.liked ? Color(hex: "FF3347") : .white) {
                            store.toggleLike(outfit.id)
                        }
                        VKClipAction(icon: "bubble.right", value: "\(outfit.comments)",
                                     label: "Комментарии") {
                            nav.push(LooksRoute.outfit(outfit))
                        }
                        ShareLink(item: "\(outfit.author): \(outfit.text)") {
                            VKClipActionLabel(icon: "arrowshape.turn.up.right",
                                              value: "\(outfit.shares)")
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel("Поделиться")
                        VKClipAction(icon: outfit.saved ? "bookmark.fill" : "bookmark",
                                     label: "Сохранить") { store.toggleSave(outfit.id) }
                        VKClipAction(icon: "hand.thumbsdown", label: "Не интересно") {
                            withAnimation { store.hide(outfit.id) }
                        }
                        VKClipAction(icon: "ellipsis", label: "Ещё") { showMenu = true }
                    }
                    .frame(width: 52)
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 14)

                // меню клипа: жалоба и скрытие меняют ленту, а не показывают снекбар
                Color.clear.frame(height: 0)
                    .confirmationDialog("Клип", isPresented: $showMenu) {
                        Button("Скрыть клип") { withAnimation { store.hide(outfit.id) } }
                        Button("Пожаловаться", role: .destructive) { withAnimation { store.report(outfit.id) } }
                        Button("Отмена", role: .cancel) {}
                    }

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
}
