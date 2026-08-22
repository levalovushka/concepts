import SwiftUI

// Социальные layout'ы для мимикрии под ВК: лента, мессенджер, профиль.
// Доступы вплетены в продуктовые места (гео в ленте, микрофон и звонок в чате,
// контакты в профиле), а не свалены карточками.

// MARK: - Аватар (кружок с инициалами — без картинок)

struct Avatar: View {
    let name: String
    var size: CGFloat = 40
    @Environment(\.conceptAccent) private var accent
    private var initials: String {
        let parts = name.split(separator: " ").prefix(2)
        return parts.map { String($0.first ?? " ") }.joined()
    }
    var body: some View {
        Circle().fill(accent.opacity(0.18))
            .frame(width: size, height: size)
            .overlay(Text(initials).font(.system(size: size * 0.4, weight: .semibold)).foregroundStyle(accent))
    }
}

// MARK: - Лента (посты как в ВК)

struct FeedData: Sendable {
    let posts: [Post]
    struct Post: Identifiable, Sendable {
        let id = UUID()
        let author: String
        let meta: String        // «2 ч · Москва»
        let text: String
        var media: Bool = true
        let likes: Int
        let comments: Int
        let shares: Int
    }
}

struct FeedView: View {
    let screenId: String
    let data: FeedData
    @Environment(\.appSpec) private var app
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 8) {
                // гео-точка запроса живёт в ленте как строка «рядом»
                if let geo = app?.permissions(on: screenId).first(where: { $0.key == .location }) {
                    NearbyBanner(spec: geo)
                }
                ForEach(data.posts) { p in PostCard(post: p) }
            }
            .padding(.vertical, 8)
        }
        .background(Color(.systemGroupedBackground))
    }
}

private struct NearbyBanner: View {
    let spec: PermissionSpec
    @Environment(Router.self) private var router
    @Environment(PermissionManager.self) private var perms
    @Environment(\.appSpec) private var app
    var body: some View {
        Button {
            Task {
                let ok = await perms.request(.location)
                if !ok { router.toast(spec.snack, id: "location") }
                else if let s = app?.screen(spec.target) { router.open(s) }
            }
        } label: {
            HStack(spacing: 12) {
                Image(systemName: "location.fill").foregroundStyle(Color.accentColor)
                VStack(alignment: .leading, spacing: 2) {
                    Text(spec.gesture.replacingOccurrences(of: "«", with: "").replacingOccurrences(of: "»", with: ""))
                        .font(.subheadline.weight(.semibold)).foregroundStyle(.primary)
                    Text(spec.feature).font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: "chevron.right").font(.caption.weight(.semibold)).foregroundStyle(Color(.tertiaryLabel))
            }
            .padding(14)
            .background(Color(.secondarySystemGroupedBackground))
        }
        .buttonStyle(.plain)
        .padding(.bottom, 4)
    }
}

private struct PostCard: View {
    let post: FeedData.Post
    @State private var liked = false
    @State private var likeCount: Int
    init(post: FeedData.Post) { self.post = post; _likeCount = State(initialValue: post.likes) }
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                Avatar(name: post.author)
                VStack(alignment: .leading, spacing: 1) {
                    Text(post.author).font(.subheadline.weight(.semibold))
                    Text(post.meta).font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: "ellipsis").foregroundStyle(.secondary)
            }
            if !post.text.isEmpty {
                Text(post.text).font(.body).fixedSize(horizontal: false, vertical: true)
            }
            if post.media {
                PatternTile(seed: post.author.count + post.text.count)
                    .frame(height: 220)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
            HStack(spacing: 22) {
                Button {
                    liked.toggle(); likeCount += liked ? 1 : -1
                } label: {
                    Label("\(likeCount)", systemImage: liked ? "heart.fill" : "heart")
                        .foregroundStyle(liked ? .red : .secondary)
                }
                Label("\(post.comments)", systemImage: "bubble.right")
                Label("\(post.shares)", systemImage: "arrowshape.turn.up.right")
                Spacer()
                Image(systemName: "bookmark")
            }
            .font(.footnote)
            .foregroundStyle(.secondary)
            .labelStyle(.titleAndIcon)
            .buttonStyle(.plain)
        }
        .padding(14)
        .background(Color(.secondarySystemGroupedBackground))
    }
}

// MARK: - Мессенджер: список диалогов

struct ChatListData: Sendable {
    let chats: [Chat]
    struct Chat: Identifiable, Sendable {
        let id = UUID()
        let name: String
        let last: String
        let time: String
        var unread: Int = 0
        let opens: String
    }
}

struct ChatListView: View {
    let data: ChatListData
    @Environment(Router.self) private var router
    @Environment(\.appSpec) private var app
    var body: some View {
        List(data.chats) { c in
            Button {
                if let s = app?.screen(c.opens) { router.open(s) }
            } label: {
                HStack(spacing: 12) {
                    Avatar(name: c.name, size: 48)
                    VStack(alignment: .leading, spacing: 3) {
                        Text(c.name).font(.body.weight(.semibold))
                        Text(c.last).font(.subheadline).foregroundStyle(.secondary).lineLimit(1)
                    }
                    Spacer(minLength: 8)
                    VStack(alignment: .trailing, spacing: 6) {
                        Text(c.time).font(.caption).foregroundStyle(.secondary)
                        if c.unread > 0 {
                            Text("\(c.unread)").font(.caption2.weight(.bold)).foregroundStyle(.white)
                                .padding(.horizontal, 7).padding(.vertical, 2)
                                .background(Color.accentColor, in: Capsule())
                        }
                    }
                }
                .padding(.vertical, 4)
            }
            .buttonStyle(.plain)
        }
        .listStyle(.plain)
    }
}

// MARK: - Мессенджер: тред

struct ThreadData: Sendable {
    let peer: String
    let messages: [Msg]
    struct Msg: Identifiable, Sendable {
        let id = UUID()
        let text: String
        let mine: Bool
        let time: String
    }
}

struct ThreadView: View {
    let screenId: String
    let data: ThreadData
    @Environment(\.appSpec) private var app
    @Environment(Router.self) private var router
    @Environment(PermissionManager.self) private var perms
    @State private var draft = ""

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 8) {
                    ForEach(data.messages) { m in Bubble(msg: m) }
                }
                .padding(.horizontal, 12).padding(.vertical, 10)
            }
            .background(Color(.systemGroupedBackground))

            // строка ввода: микрофон — точка запроса доступа
            HStack(spacing: 10) {
                Image(systemName: "paperclip").foregroundStyle(.secondary)
                TextField("Сообщение", text: $draft)
                    .padding(.horizontal, 12).padding(.vertical, 8)
                    .background(Color(.tertiarySystemFill), in: Capsule())
                if draft.isEmpty {
                    Button {
                        Task {
                            let ok = await perms.request(.mic)
                            if !ok, let g = app?.permissions.first(where: { $0.key == .mic }) {
                                router.toast(g.snack, id: "mic")
                            }
                        }
                    } label: { Image(systemName: "mic.fill").foregroundStyle(Color.accentColor) }
                } else {
                    Button { draft = "" } label: { Image(systemName: "arrow.up.circle.fill").foregroundStyle(Color.accentColor) }
                }
            }
            .font(.title3)
            .padding(.horizontal, 12).padding(.vertical, 8)
            .background(.bar)
        }
        .navigationTitle(data.peer)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            // звонок — точка запроса voip
            if app?.permissions.first(where: { $0.key == .voip }) != nil {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { Task { _ = await perms.request(.voip) } } label: { Image(systemName: "phone") }
                }
            }
        }
    }
}

private struct Bubble: View {
    let msg: ThreadData.Msg
    var body: some View {
        HStack {
            if msg.mine { Spacer(minLength: 48) }
            VStack(alignment: msg.mine ? .trailing : .leading, spacing: 2) {
                Text(msg.text).font(.body)
                    .foregroundStyle(msg.mine ? .white : .primary)
                    .padding(.horizontal, 12).padding(.vertical, 8)
                    .background(msg.mine ? AnyShapeStyle(Color.accentColor) : AnyShapeStyle(Color(.secondarySystemGroupedBackground)),
                                in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                Text(msg.time).font(.caption2).foregroundStyle(.secondary)
            }
            if !msg.mine { Spacer(minLength: 48) }
        }
    }
}

// MARK: - Профиль пользователя (стена)

struct ProfileData: Sendable {
    let name: String
    let status: String
    let stats: [Stat]
    let posts: Int
    struct Stat: Identifiable, Sendable { let id = UUID(); let value: String; let label: String }
}

struct ProfileView: View {
    let screenId: String
    let data: ProfileData
    @Environment(\.appSpec) private var app
    @Environment(Router.self) private var router
    @Environment(PermissionManager.self) private var perms

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // обложка + аватар
                ZStack(alignment: .bottomLeading) {
                    PatternTile(seed: 7).frame(height: 130)
                    Avatar(name: data.name, size: 84)
                        .overlay(Circle().stroke(Color(.systemBackground), lineWidth: 4))
                        .offset(x: 16, y: 42)
                }
                .padding(.bottom, 46)

                VStack(alignment: .leading, spacing: 4) {
                    Text(data.name).font(.title2.bold())
                    Text(data.status).font(.subheadline).foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 16)

                HStack {
                    ForEach(data.stats) { s in
                        VStack(spacing: 2) {
                            Text(s.value).font(.headline)
                            Text(s.label).font(.caption).foregroundStyle(.secondary)
                        }.frame(maxWidth: .infinity)
                    }
                }
                .padding(16)

                HStack(spacing: 10) {
                    ProfileButton(title: "Редактировать", filled: true) {}
                    // контакты — точка запроса: найти друзей
                    if let c = app?.permissions.first(where: { $0.key == .contacts }) {
                        ProfileButton(title: "Найти друзей", filled: false) {
                            Task {
                                let ok = await perms.request(.contacts)
                                if !ok { router.toast(c.snack, id: "contacts") }
                                else if let s = app?.screen(c.target) { router.open(s) }
                            }
                        }
                    }
                    Button { openSettings() } label: {
                        Image(systemName: "gearshape").frame(width: 44, height: 44)
                            .background(Color(.secondarySystemFill), in: RoundedRectangle(cornerRadius: 12))
                    }.buttonStyle(.plain)
                }
                .padding(.horizontal, 16)

                Text("Стена").font(.headline).frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 16).padding(.top, 18).padding(.bottom, 8)
                LazyVGrid(columns: [.init(.flexible(), spacing: 3), .init(.flexible(), spacing: 3), .init(.flexible(), spacing: 3)], spacing: 3) {
                    ForEach(0..<data.posts, id: \.self) { i in
                        PatternTile(seed: i + 1).aspectRatio(1, contentMode: .fill).clipped()
                    }
                }
                .padding(.horizontal, 3)
            }
        }
        .background(Color(.systemGroupedBackground))
    }
    private func openSettings() {
        if let s = app?.screen("settings") { router.open(s) }
    }
}

private struct ProfileButton: View {
    let title: String; let filled: Bool; let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title).font(.subheadline.weight(.semibold))
                .foregroundStyle(filled ? .white : Color.accentColor)
                .frame(maxWidth: .infinity).frame(height: 44)
                .background(filled ? AnyShapeStyle(Color.accentColor) : AnyShapeStyle(Color.accentColor.opacity(0.12)),
                            in: RoundedRectangle(cornerRadius: 12))
        }.buttonStyle(.plain)
    }
}
