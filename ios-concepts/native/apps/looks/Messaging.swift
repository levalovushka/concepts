import SwiftUI

// MARK: - Список диалогов

struct ChatsScreen: View {
    var captureState: String? = nil
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t
    @State private var query = ""

    var body: some View {
        VStack(spacing: 0) {
            VKTabHeader(title: "Сообщения", avatar: "Ника Орлова",
                        avatarAction: { nav.push(LooksRoute.profile) }) {
                Button { nav.push(LooksRoute.chat(store.dialogs[0])) } label: {
                    Image(systemName: "square.and.pencil")
                }
                .accessibilityLabel("Новое сообщение")
            }
            VKSearchField(placeholder: "Поиск по сообщениям", text: $query)
                .padding(.horizontal, t.spacing.contentInset)
                .padding(.bottom, 10)

            ScrollView {
                if captureState == "empty" {
                    NativeStatePanel(kind: .empty,
                                     title: "Сообщений пока нет",
                                     detail: "Начните разговор с автором или знакомым.",
                                     actionTitle: "Найти людей",
                                     action: { nav.push(LooksRoute.mates) },
                                     placement: .page)
                        .padding(.horizontal, t.spacing.contentInset)
                        .padding(.top, 24)
                } else {
                    LazyVStack(spacing: 0) {
                        ForEach(filtered) { d in
                            Button { nav.push(LooksRoute.chat(d)) } label: {
                                DialogRow(dialog: d)
                            }
                            .nativeAction("chats.open-chat")
                            .buttonStyle(HighlightStyle())
                            if d.id != filtered.last?.id { RowSeparator(leading: 76) }
                        }
                    }
                    .background(t.palette.surface)
                }
            }
        }
        .background(t.palette.surface)
    }

    private var filtered: [Dialog] {
        query.isEmpty ? store.dialogs
            : store.dialogs.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }
}

private struct DialogRow: View {
    let dialog: Dialog
    @Environment(\.visualLanguage) private var t
    var body: some View {
        HStack(spacing: 12) {
            ZStack(alignment: .bottomTrailing) {
                Avatar(name: dialog.name, size: 48)
                if dialog.online {
                    Circle().fill(t.palette.positive).frame(width: 13, height: 13)
                        .overlay(Circle().stroke(t.palette.surface, lineWidth: 2))
                }
            }
            VStack(alignment: .leading, spacing: 3) {
                Text(dialog.name).font(.role(.body)).foregroundStyle(t.palette.textPrimary)
                    .lineLimit(1)
                Text(dialog.last).font(.role(.meta)).foregroundStyle(t.palette.textSecondary).lineLimit(1)
            }
            Spacer(minLength: 8)
            VStack(alignment: .trailing, spacing: 6) {
                Text(dialog.time).font(.role(.meta)).foregroundStyle(t.palette.textSecondary)
                if dialog.unread > 0 {
                    Text("\(dialog.unread)")
                        .font(.role(.badge)).foregroundStyle(.white)
                        .padding(.horizontal, 7).padding(.vertical, 2)
                        .background(t.palette.accent, in: Capsule())
                } else {
                    Spacer().frame(height: 18)
                }
            }
        }
        .padding(.horizontal, t.spacing.contentInset)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
    }
}

// MARK: - Тред

struct ChatScreen: View {
    let dialog: Dialog
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.visualLanguage) private var t
    @State private var draft = ""
    @State private var recording = false
    @State private var showAttachments = false
    @FocusState private var focused: Bool

    var body: some View {
        VStack(spacing: 0) {
            VKChatHeader(
                title: dialog.name,
                subtitle: dialog.online ? "в сети" : "была сегодня в 17:51",
                onBack: { nav.pop() },
                onCall: { nav.push(LooksRoute.call(dialog.name)) }
            )

            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(Array(messages.enumerated()), id: \.element.id) { i, m in
                            if let day = m.day { DayDivider(text: day) }
                            Bubble(message: m, author: dialog.name,
                                   showsAvatar: startsGroup(i),
                                   progress: Double(i) / Double(max(messages.count - 1, 1)))
                                .padding(.top, messageSpacingBefore(i))
                                .id(m.id)
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                }
                .onChange(of: messages.count) { _, _ in
                    withAnimation { proxy.scrollTo(messages.last?.id, anchor: .bottom) }
                }
                .task {
                    try? await Task.sleep(for: .milliseconds(80))
                    proxy.scrollTo(messages.last?.id, anchor: .bottom)
                }
            }
            .background(t.palette.background)

            inputBar
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .toolbar(.hidden, for: .navigationBar)
        .confirmationDialog("Добавить к сообщению", isPresented: $showAttachments) {
            Button("Фото образа") { store.send("Фото · вещь для обмена", to: dialog.name) }
            Button("Место встречи") { store.send("Новая Голландия · суббота, 15:00", to: dialog.name) }
            Button("Отмена", role: .cancel) {}
        }
    }

    /// Аватар рисуется только у первого сообщения подряд идущей группы.
    private func startsGroup(_ i: Int) -> Bool {
        let m = messages[i]
        if m.mine { return false }
        if i == 0 { return true }
        let prev = messages[i - 1]
        return prev.mine || m.day != nil
    }

    /// Внутри реплики сообщения плотные; при смене автора читается новая группа.
    private func messageSpacingBefore(_ i: Int) -> CGFloat {
        guard i > 0 else { return 0 }
        let message = messages[i]
        if message.day != nil { return 0 }
        return messages[i - 1].mine == message.mine ? 2 : 8
    }

    private var messages: [Message] { store.messages(for: dialog.name) }

    private var inputBar: some View {
        HStack(spacing: 12) {
            Button { showAttachments = true } label: {
                Image(systemName: "plus.circle.fill").font(.system(size: 28))
                    .foregroundStyle(t.palette.accent)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Вложение")

            HStack(spacing: 10) {
                TextField("Сообщение", text: $draft, axis: .vertical)
                    .font(.system(size: 16)).lineLimit(1...4)
                    .focused($focused)
                Button { draft += draft.isEmpty ? "✨" : " ✨" } label: {
                    Image(systemName: "face.smiling").font(.system(size: 20))
                        .foregroundStyle(t.palette.accent)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Эмодзи")
            }
            .padding(.horizontal, 14).padding(.vertical, 9)
            .background(t.palette.fill, in: RoundedRectangle(cornerRadius: 18, style: .continuous))

            if draft.trimmingCharacters(in: .whitespaces).isEmpty {
                Button {
                    Task {
                        if recording { recording = false; store.send("Голосовое · 0:07", to: dialog.name); return }
                        let ok = await perms.request(.mic)
                        if ok { withAnimation { recording = true } }
                        else { nav.toast("Без микрофона напишите текстом", once: "mic") }
                    }
                } label: {
                    Image(systemName: recording ? "stop.circle.fill" : "mic.fill")
                        .font(.system(size: 22))
                        .foregroundStyle(recording ? t.palette.danger : t.palette.accent)
                }
                .nativeAction("voice.send-voice")
                .buttonStyle(.plain)
                .accessibilityLabel(recording ? "Остановить запись" : "Голосовое сообщение")
            } else {
                Button {
                    store.send(draft.trimmingCharacters(in: .whitespaces), to: dialog.name)
                    draft = ""
                } label: {
                    Image(systemName: "arrow.up.circle.fill").font(.system(size: 28))
                        .foregroundStyle(t.palette.accent)
                }
                .buttonStyle(.plain)
                .nativeAction("chat.send-message")
                .accessibilityLabel("Отправить")
                .transition(.scale.combined(with: .opacity))
            }
        }
        .animation(.easeOut(duration: 0.15), value: draft.isEmpty)
        .padding(.horizontal, 12).padding(.vertical, 8)
        .background(t.palette.surface.overlay(alignment: .top) { Rectangle().fill(t.palette.separator).frame(height: 0.5) })
    }
}

/// Разделитель даты — по центру серым, как в ВК.
private struct DayDivider: View {
    let text: String
    @Environment(\.visualLanguage) private var t
    var body: some View {
        Text(text)
            .font(.role(.meta)).foregroundStyle(t.palette.textSecondary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
    }
}

private struct Bubble: View {
    let message: Message
    let author: String
    var showsAvatar: Bool = false
    /// Положение сообщения в переписке: у ВК градиент исходящих тянется через
    /// весь тред — ранние баблы синие, поздние розовые, а не каждый сам по себе.
    var progress: Double = 0
    @Environment(\.visualLanguage) private var t

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            if message.mine {
                Spacer(minLength: 56)
            } else {
                // место под аватар держим всегда, иначе группа «скачет» по краю
                Group {
                    if showsAvatar { Avatar(name: author, size: 32) } else { Color.clear }
                }
                .frame(width: 32, height: 32)
            }

            HStack(alignment: .bottom, spacing: 6) {
                Text(message.text)
                    .font(.role(.body))
                    .foregroundStyle(message.mine ? .white : t.palette.textPrimary)
                HStack(spacing: 3) {
                    Text(message.time)
                        .font(.role(.bubbleTime))
                        .foregroundStyle(message.mine ? .white.opacity(0.8) : t.palette.textSecondary)
                    if message.mine {
                        Image(systemName: "checkmark")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(.white.opacity(0.8))
                            .overlay(alignment: .leading) {
                                Image(systemName: "checkmark")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundStyle(.white.opacity(0.8))
                                    .offset(x: -3)
                            }
                    }
                }
                .padding(.bottom, 1)
            }
            .padding(.horizontal, 12).padding(.vertical, 8)
            .background {
                if message.mine {
                    t.palette.accent
                } else { t.palette.fill }
            }
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))

            if !message.mine { Spacer(minLength: 56) }
        }
        .transition(.move(edge: message.mine ? .trailing : .leading).combined(with: .opacity))
    }
}
