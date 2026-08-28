import SwiftUI

/// Чат. Поля совпадают с секцией chats в fixtures концепта.
struct ChatRoom: Identifiable, Decodable {
    var id: String { title }
    let title: String
    let preview: String
    let time: String
    let unread: Int
}

struct ChatMessage: Identifiable, Decodable {
    var id: String { author + text }
    let author: String
    let text: String
    let outgoing: Bool
}

struct ChatsView: View {
    @Environment(Nav.self) private var nav
    @State private var query = ""
    @State private var filter = "Все"

    private let filters: [Filter] = Fixtures.load("chatFilters")

    private let rooms: [ChatRoom] = Fixtures.load("chats")

    var body: some View {
        Page(spacing: 10) {
            HStack {
                Text("Чаты").font(.system(size: 26, weight: .bold)).foregroundStyle(D.ink)
                Spacer()
                Image(systemName: "magnifyingglass").font(.system(size: 19, weight: .medium)).foregroundStyle(D.accent)
            }

            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass").font(.system(size: 15)).foregroundStyle(D.mute)
                TextField("Поиск по сообщениям", text: $query).font(.system(size: 16))
            }
            .padding(.horizontal, 12)
            .frame(height: 40)
            .background(D.card, in: RoundedRectangle(cornerRadius: 11, style: .continuous))

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 7) {
                    ForEach(filters) { item in
                        DChip(title: item.title, count: item.count, active: filter == item.title) { filter = item.title }
                    }
                }
                .padding(.vertical, 2)
            }
            .scrollClipDisabled()

            DCard {
                ForEach(Array(rooms.enumerated()), id: \.element.id) { index, room in
                    DRow(title: room.title, subtitle: room.preview) {
                        DAvatar(size: 46)
                    } trailing: {
                        VStack(alignment: .trailing, spacing: 5) {
                            Text(room.time).font(.system(size: 13)).foregroundStyle(D.mute)
                            if room.unread > 0 {
                                Text("\(room.unread)")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundStyle(.white)
                                    .padding(.horizontal, 6).padding(.vertical, 2)
                                    .background(D.red, in: Capsule())
                            }
                        }
                    } action: { nav.push(.chat) }
                    if index < rooms.count - 1 { DHair(inset: 68) }
                }
            }
        }
        .accessibilityIdentifier("screen.chats")
    }
}

/// Чат подъезда. Голосовое живёт здесь — за ним микрофон и распознавание речи.
struct ChatView: View {
    static let messages: [ChatMessage] = Fixtures.load("messages")

    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access
    @State private var draft = ""

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: 8) {
                    Text("сегодня").font(.system(size: 12)).foregroundStyle(D.mute)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 4)

                    ForEach(ChatView.messages) { message in
                        bubble(message.author, message.text, out: message.outgoing)
                    }

                    DeniedNotice(key: .mic)
                    DeniedNotice(key: .speech)
                }
                .padding(D.inset)
            }
            .background(D.chatBG)

            composer
        }
        .navigationTitle("\(Concept.me.entrance) подъезд · \(Concept.house.address)")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    access.activate(.commnotif, on: "chat")
                    nav.cover(.lockscreen)
                } label: { Image(systemName: "bell.badge") }
                .accessibilityLabel("Показывать как сообщение")
            }
        }
        .accessibilityIdentifier("screen.chat")
    }

    private func bubble(_ author: String, _ text: String, out: Bool) -> some View {
        HStack(alignment: .bottom, spacing: 8) {
            if out { Spacer(minLength: 40) } else { DAvatar(size: 32) }
            VStack(alignment: .leading, spacing: 3) {
                if !out {
                    Text(author).font(.system(size: 13, weight: .semibold)).foregroundStyle(D.accent)
                }
                Text(text).font(.system(size: 15)).foregroundStyle(D.ink)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(.horizontal, 11).padding(.vertical, 8)
            .background(out ? Color(hex: 0xE4E0FF) : D.card,
                        in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            if !out { Spacer(minLength: 40) }
        }
    }

    private var composer: some View {
        HStack(spacing: 10) {
            TextField("Сообщение", text: $draft)
                .font(.system(size: 16))
                .padding(.horizontal, 12)
                .frame(height: 38)
                .background(D.quietIn, in: Capsule())
            Button {
                Task {
                    let ok = await access.request([.mic, .speech], on: "chat")
                    if ok { nav.present(.voice) } else { nav.show("Нет доступа к микрофону") }
                }
            } label: {
                Image(systemName: "mic.fill").font(.system(size: 19)).foregroundStyle(D.accent)
                    .frame(width: 44, height: 44)
            }
            .accessibilityIdentifier("action.voice")
            .accessibilityLabel("Записать голосовое")
        }
        .padding(.horizontal, D.inset)
        .padding(.vertical, 6)
        .background(.regularMaterial)
    }
}

/// Голосовое с расшифровкой: расшифровка появляется, только если разрешено распознавание.
struct VoiceView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access

    var body: some View {
        StackPage(title: "Голосовое", spacing: 14) {
            HStack(spacing: 3) {
                ForEach(0..<34, id: \.self) { index in
                    Capsule().fill(D.accent.opacity(index < 22 ? 1 : 0.25))
                        .frame(width: 3, height: [8, 18, 30, 14, 24, 10, 20][index % 7])
                }
            }
            .frame(maxWidth: .infinity, minHeight: 60)
            .background(D.card, in: RoundedRectangle(cornerRadius: D.radius, style: .continuous))

            Text("0:14").font(.data(15)).foregroundStyle(D.sub).frame(maxWidth: .infinity)

            if access.granted(.speech) {
                DCard(padding: D.inset) {
                    VStack(alignment: .leading, spacing: 5) {
                        Text("Расшифровка").font(.system(size: 13)).foregroundStyle(D.mute)
                        Text(Fixtures.load("voiceTranscript", as: String.self))
                            .font(.system(size: 15)).foregroundStyle(D.ink)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            } else {
                DeniedNotice(key: .speech)
            }

            DButton(title: "Отправить в чат") {
                nav.sheet = nil
                nav.show("Голосовое отправлено")
            }
        }
        .accessibilityIdentifier("screen.voice")
    }
}
