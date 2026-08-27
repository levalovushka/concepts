import SwiftUI

struct Post: Identifiable {
    let id = UUID()
    let author: String
    let meta: String
    let text: String
    var tags: [String] = []
    var warnTag: String?
    var official = false
    var likes = 0
    var comments = 0
    var views = 0
    var hasPhoto = false
}

enum Feed {
    static let posts: [Post] = [
        Post(author: "Управляющая компания",
             meta: "вчера в 19:04 · официально",
             text: "Горячую воду отключат с 14 по 17 апреля — опрессовка стояка. Заявки на перерасчёт — в теме.",
             tags: ["Весь дом"], warnTag: "Вода", official: true,
             likes: 34, comments: 12, views: 219),
        Post(author: "Марина, кв. 48",
             meta: "сегодня в 08:12 · 3 подъезд",
             text: "Доводчик на второй двери сорвало, бьёт по коляскам. Сняла, как стоит — если кто вызывает мастера, приложите к заявке.",
             tags: ["3 подъезд", "Заявка 4417"],
             likes: 18, comments: 7, views: 96, hasPhoto: true),
        Post(author: "Пётр, старший по подъезду",
             meta: "вчера в 21:30 · 3 подъезд",
             text: "Мастер по домофону придёт в четверг после двух. Код калитки на время работ — 4417.",
             tags: ["3 подъезд"],
             likes: 26, comments: 4, views: 141),
    ]

    static let stories = ["Вы", "2 подъезд", "Субботник", "Лифт", "Парковка"]
}

struct HomeView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access
    @State private var filter = "Всё в доме"

    private let filters = [("Всё в доме", nil as Int?), ("Объявления", 3), ("Проблемы", nil), ("Обмен", nil)]

    var body: some View {
        Page(spacing: 10) {
            header
            stories
            chips
            chronicleRow
            DeniedNotice(key: .photos)
            ForEach(Feed.posts) { post in PostCard(post: post) }
        }
        .accessibilityIdentifier("screen.home")
    }

    private var header: some View {
        HStack(spacing: 4) {
            Text("Полевая, 12").font(.system(size: 26, weight: .bold)).foregroundStyle(D.ink)
            Image(systemName: "chevron.down").font(.system(size: 14, weight: .semibold)).foregroundStyle(D.ink)
            Spacer()
            Button { nav.present(.problem) } label: {
                Image(systemName: "plus").font(.system(size: 21, weight: .medium)).foregroundStyle(D.accent)
            }
            .accessibilityLabel("Сообщить о проблеме")
            Button { nav.push(.post) } label: {
                Image(systemName: "bell").font(.system(size: 19, weight: .medium)).foregroundStyle(D.accent)
            }
            .accessibilityLabel("Что нового в доме")
            .padding(.leading, 12)
        }
    }

    /// Сторис подъезда: круглые аватары 56pt с кольцом акцента.
    private var stories: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(alignment: .top, spacing: 14) {
                ForEach(Array(Feed.stories.enumerated()), id: \.offset) { index, title in
                    VStack(spacing: 5) {
                        ZStack {
                            if index > 0 {
                                Circle()
                                    .strokeBorder(index < 3 ? D.accent : D.line, lineWidth: 2)
                                    .frame(width: 62, height: 62)
                            }
                            DPhoto(size: 54, circle: true, glyph: 17)
                            if index == 0 {
                                Circle().fill(D.accent).frame(width: 20, height: 20)
                                    .overlay { Image(systemName: "plus").font(.system(size: 11, weight: .bold)).foregroundStyle(.white) }
                                    .overlay { Circle().strokeBorder(D.page, lineWidth: 2) }
                                    .offset(x: 19, y: 19)
                            }
                        }
                        .frame(width: 62, height: 62)
                        Text(title).font(.system(size: 12)).foregroundStyle(D.ink).lineLimit(1)
                    }
                    .frame(width: 66)
                }
            }
            .padding(.vertical, 2)
        }
        .scrollClipDisabled()
    }

    private var chips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 7) {
                ForEach(filters, id: \.0) { title, count in
                    DChip(title: title, count: count, active: filter == title) { filter = title }
                }
            }
            .padding(.vertical, 2)
        }
        .scrollClipDisabled()
    }

    /// Хроника двора — фича за доступом к медиатеке.
    private var chronicleRow: some View {
        DCard {
            DRow(title: "Хроника двора", subtitle: "42 снимка за апрель") {
                RoundedRectangle(cornerRadius: 9, style: .continuous)
                    .fill(D.accent)
                    .frame(width: 34, height: 34)
                    .overlay { Image(systemName: "photo.stack").font(.system(size: 16)).foregroundStyle(.white) }
            } action: {
                Task {
                    let ok = await access.request([.photos], on: "home")
                    if ok { nav.push(.chronicle) } else { nav.show("Нет доступа к медиатеке") }
                }
            }
        }
        .accessibilityIdentifier("action.chronicle")
    }
}

struct PostCard: View {
    let post: Post
    @Environment(Nav.self) private var nav

    var body: some View {
        DCard(padding: D.inset) {
            VStack(alignment: .leading, spacing: 9) {
                HStack(spacing: 9) {
                    DAvatar(size: 40)
                    VStack(alignment: .leading, spacing: 1) {
                        Text(post.author).font(.system(size: 15, weight: .semibold)).foregroundStyle(D.ink)
                        Text(post.meta).font(.system(size: 13)).foregroundStyle(D.mute)
                    }
                    Spacer(minLength: 6)
                    if post.official {
                        Button("Тема") { nav.push(.post) }
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 11).padding(.vertical, 5)
                            .background(D.accent, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                            .buttonStyle(.plain)
                    }
                }

                Text(post.text)
                    .font(.system(size: 15))
                    .foregroundStyle(D.ink)
                    .fixedSize(horizontal: false, vertical: true)

                if post.hasPhoto { DPhoto(height: 168, glyph: 22) }

                if !post.tags.isEmpty || post.warnTag != nil {
                    HStack(spacing: 6) {
                        if let warn = post.warnTag { DTag(title: warn, warn: true) }
                        ForEach(post.tags, id: \.self) { DTag(title: $0, muted: true) }
                    }
                }

                HStack(spacing: 18) {
                    stat("heart", post.likes)
                    stat("bubble.left", post.comments)
                    Spacer()
                    stat("eye", post.views, muted: true)
                }
                .padding(.top, 2)
            }
        }
    }

    private func stat(_ symbol: String, _ value: Int, muted: Bool = false) -> some View {
        HStack(spacing: 5) {
            Image(systemName: symbol).font(.system(size: 15))
            Text("\(value)").font(.system(size: 14, weight: .medium))
        }
        .foregroundStyle(muted ? D.mute : D.accent)
    }
}
