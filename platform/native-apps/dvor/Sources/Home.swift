import SwiftUI

/// Пост ленты. Поля совпадают с секцией threads в fixtures концепта.
struct Post: Identifiable, Decodable {
    var id: String { author + text }
    let author: String
    let meta: String
    let text: String
    let tags: [String]
    let warnTag: String?
    let official: Bool
    let likes: Int
    let replies: Int
    let views: Int
    let photo: Bool
}

struct Story: Identifiable, Decodable {
    var id: String { title }
    let title: String
    /// add — своя история, unseen — непросмотренная, seen — просмотренная.
    let kind: String
}

struct Filter: Identifiable, Decodable {
    var id: String { title }
    let title: String
    let count: Int?
}

/// Контент приходит из concept.json, а не живёт копией в коде.
enum Feed {
    static let posts: [Post] = Fixtures.load("threads")
    static let stories: [Story] = Fixtures.load("stories")
    static let filters: [Filter] = Fixtures.load("feedFilters")
    static let chronicle: Chronicle = Fixtures.load("chronicle")
}

struct Chronicle: Decodable {
    let count: Int
    let period: String
}

struct HomeView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access
    @State private var filter = Feed.filters.first?.title ?? ""

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
            Text(Concept.house.address).font(.system(size: 26, weight: .bold)).foregroundStyle(D.ink)
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
                ForEach(Array(Feed.stories.enumerated()), id: \.element.id) { index, story in
                    VStack(spacing: 5) {
                        ZStack {
                            if story.kind != "add" {
                                Circle()
                                    .strokeBorder(story.kind == "unseen" ? D.accent : D.line, lineWidth: 2)
                                    .frame(width: 62, height: 62)
                            }
                            DPhoto(size: 54, circle: true, glyph: 17)
                            if story.kind == "add" {
                                Circle().fill(D.accent).frame(width: 20, height: 20)
                                    .overlay { Image(systemName: "plus").font(.system(size: 11, weight: .bold)).foregroundStyle(.white) }
                                    .overlay { Circle().strokeBorder(D.page, lineWidth: 2) }
                                    .offset(x: 19, y: 19)
                            }
                        }
                        .frame(width: 62, height: 62)
                        Text(story.title).font(.system(size: 12)).foregroundStyle(D.ink).lineLimit(1)
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
                ForEach(Feed.filters) { item in
                    DChip(title: item.title, count: item.count, active: filter == item.title) { filter = item.title }
                }
            }
            .padding(.vertical, 2)
        }
        .scrollClipDisabled()
    }

    /// Хроника двора — фича за доступом к медиатеке.
    private var chronicleRow: some View {
        DCard {
            DRow(title: "Хроника двора", subtitle: "\(Feed.chronicle.count) снимка \(Feed.chronicle.period)") {
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

                if post.photo { DPhoto(height: 168, glyph: 22) }

                if !post.tags.isEmpty || post.warnTag != nil {
                    HStack(spacing: 6) {
                        if let warn = post.warnTag { DTag(title: warn, warn: true) }
                        ForEach(post.tags, id: \.self) { DTag(title: $0, muted: true) }
                    }
                }

                HStack(spacing: 18) {
                    stat("heart", post.likes)
                    stat("bubble.left", post.replies)
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
