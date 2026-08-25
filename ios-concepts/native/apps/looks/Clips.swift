import SwiftUI
import UIKit

// «Клипы» ВК: табы сверху, кадр во весь экран, правый рельс белых иконок
// с числами, внизу автор с обводочной капсулой «Подписаться», текст с «Ещё»
// и капсула «Оригинальный звук». Полоса воспроизведения по нижнему краю.

struct ClipsScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @State private var index = 0
    @State private var tab = 0

    private var clips: [Outfit] {
        switch tab {
        case 1: store.outfits.filter { $0.saved || $0.liked }
        case 2: Array(store.outfits.sorted { $0.likes > $1.likes }.prefix(4))
        default: store.outfits
        }
    }

    var body: some View {
        ZStack(alignment: .top) {
            TabView(selection: $index) {
                ForEach(Array(clips.enumerated()), id: \.element.id) { i, outfit in
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
        .onChange(of: tab) { _, _ in index = 0 }
    }
}

private struct ClipPage: View {
    let outfit: Outfit
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t
    @State private var muted = true
    @State private var expanded = false
    @State private var followed = false
    @State private var showMore = false
    @State private var authorHidden = false
    @State private var reported = false

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
                            Button(followed ? "Вы подписаны" : "Подписаться") {
                                followed.toggle()
                            }
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 12)
                            .frame(height: 30)
                            .overlay(Capsule().stroke(.white.opacity(0.72), lineWidth: 1))
                            .buttonStyle(.plain)
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
                                     tint: outfit.liked ? t.palette.badge : .white) {
                            store.toggleLike(outfit.id)
                        }
                        VKClipAction(icon: "bubble.right", value: "\(outfit.comments)",
                                     label: "Комментарии") {
                            nav.push(LooksRoute.outfit(outfit))
                        }
                        VKClipAction(icon: "arrowshape.turn.up.right", value: "\(outfit.shares)",
                                     label: "Поделиться") {
                            UIPasteboard.general.string = "looks://outfit/\(outfit.id.uuidString)"
                            nav.toast("Ссылка скопирована")
                        }
                        VKClipAction(icon: outfit.saved ? "bookmark.fill" : "bookmark",
                                     label: "Сохранить") { store.toggleSave(outfit.id) }
                        VKClipAction(icon: "arrow.triangle.branch", label: "Собрать свою версию") {
                            store.remix(outfit)
                            nav.toast("Ремикс добавлен в вашу ленту")
                        }
                        .nativeAction("clip.remix-clip")
                        VKClipAction(icon: "ellipsis", label: "Ещё") {
                            showMore = true
                        }
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

            if authorHidden {
                VStack(spacing: 14) {
                    Text("Автор скрыт")
                        .font(.role(.section))
                    Button("Вернуть в рекомендации") { authorHidden = false }
                        .font(.system(size: 16, weight: .medium))
                }
                .foregroundStyle(.white)
                .padding(24)
                .background(.black.opacity(0.82), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            }
        }
        .confirmationDialog("Действия с клипом", isPresented: $showMore, titleVisibility: .visible) {
            Button("Скопировать ссылку") {
                UIPasteboard.general.string = "looks://outfit/\(outfit.id.uuidString)"
            }
            Button("Не показывать автора") {
                authorHidden = true
            }
            Button(reported ? "Жалоба отправлена" : "Пожаловаться", role: .destructive) {
                reported = true
            }
            .disabled(reported)
            Button("Отмена", role: .cancel) {}
        }
    }
}
