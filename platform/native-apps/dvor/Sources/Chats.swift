import SwiftUI

struct ChatRoom: Identifiable {
    let id = UUID()
    let title: String
    let preview: String
    let time: String
    var unread: Int = 0
}

struct ChatsView: View {
    @Environment(Nav.self) private var nav
    @State private var query = ""
    @State private var filter = "Все"

    private let filters = [("Все", nil as Int?), ("Подъезды", 2), ("Дом", nil), ("Личные", nil)]

    private let rooms = [
        ChatRoom(title: "3 подъезд · Полевая, 12", preview: "Пётр: мастер в четверг после двух", time: "8м", unread: 3),
        ChatRoom(title: "Весь дом", preview: "УК: воды нет 14–17 апреля", time: "1ч"),
        ChatRoom(title: "Парковка", preview: "Марина: место 14 заняли снова", time: "3ч"),
        ChatRoom(title: "Старший по подъезду", preview: "Код калитки 4417", time: "вчера"),
        ChatRoom(title: "Обмен и отдам", preview: "Ирина: отдам стеллаж, кв. 51", time: "вчера"),
    ]

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
                    ForEach(filters, id: \.0) { title, count in
                        DChip(title: title, count: count, active: filter == title) { filter = title }
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

                    bubble("Пётр, старший", "Мастер по домофону придёт в четверг после двух. Код калитки на время работ — 4417.", out: false)
                    bubble("Марина, кв. 48", "Спасибо! Доводчик на второй двери тоже посмотрят?", out: true)
                    bubble("Пётр, старший", "Заявку 4417 уже приняли, мастер посмотрит обе двери.", out: false)

                    DeniedNotice(key: .mic)
                    DeniedNotice(key: .speech)
                }
                .padding(D.inset)
            }
            .background(D.chatBG)

            composer
        }
        .navigationTitle("3 подъезд · Полевая, 12")
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
                        Text("Во втором подъезде опять не закрывается дверь, я вызвала мастера на четверг.")
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
