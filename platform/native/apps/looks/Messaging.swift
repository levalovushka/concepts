import SwiftUI

// MARK: - Вход (набор vkontakte — по почте)

struct AuthScreen: View {
    let onDone: () -> Void
    @Environment(\.theme) private var t
    @State private var mail = ""
    @State private var code = ""
    @State private var step = ShotMode.screen == "code" || ShotMode.screen == "codefail" ? 1 : 0
    @State private var codeSentAgain = false
    @FocusState private var focused: Bool

    /// Объявленные состояния входа: ожидание письма и неверный код.
    private var isSending: Bool { ShotMode.state == "loading" }
    private var codeRejected: Bool { ShotMode.screen == "codefail" || ShotMode.state == "error" }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Spacer().frame(height: 24)
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(t.accent)
                .frame(width: 60, height: 60)
                .overlay(Image(systemName: "hanger").font(.system(size: 28, weight: .medium)).foregroundStyle(.white))
            Spacer().frame(height: 20)
            Text(step == 0 ? "Образы" : "Код из письма")
                .font(.role(.largeTitle)).foregroundStyle(t.textPrimary)
            Spacer().frame(height: 8)
            Text(step == 0
                 ? "Войдите по почте — образы и гардероб останутся с вами на новом устройстве"
                 : "Отправили код на \(mail)")
                .font(.system(size: 16)).foregroundStyle(t.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer().frame(height: 24)

            if step == 0 {
                if ShotMode.isScreen("phone", state: "error") {
                    AppStatePanel(kind: .error, title: "Почта не принята",
                                  detail: "Проверьте адрес: письмо с кодом вернулось обратно.")
                        .padding(.bottom, 12)
                }
                TextField("Почта", text: $mail)
                    .keyboardType(.emailAddress).textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .font(.system(size: 17))
                    .padding(.horizontal, 14).frame(height: 48)
                    .background(t.fieldFill, in: RoundedRectangle(cornerRadius: t.controlRadius, style: .continuous))
                    .focused($focused)
                Spacer().frame(height: 12)
                VKButton(title: "Получить код") {
                    withAnimation(.easeOut(duration: 0.2)) { step = 1; focused = true }
                }
                .disabled(!mail.contains("@"))
                .opacity(mail.contains("@") ? 1 : 0.45)
                Spacer().frame(height: 10)
                // Правило набора vkontakte: рядом с кодом — вход через Google,
                // чтобы профиль пережил смену телефона.
                Button { onDone() } label: {
                    HStack(spacing: 10) {
                        Text("G").font(.role(.cardTitle))
                            .foregroundStyle(t.textPrimary)
                            .frame(width: 24, height: 24)
                            .background(t.fieldFill, in: Circle())
                        Text("Продолжить с Google")
                            .font(.role(.cardTitle))
                            .foregroundStyle(t.textPrimary)
                    }
                    .frame(maxWidth: .infinity).frame(height: 48)
                    .overlay(RoundedRectangle(cornerRadius: t.controlRadius, style: .continuous)
                        .stroke(t.separator, lineWidth: 1))
                }
                .buttonStyle(.plain)
            } else {
                if codeRejected {
                    AppStatePanel(kind: .error, title: "Код не подошёл",
                                  detail: "Проверьте последнее письмо: код живёт пять минут.")
                        .padding(.bottom, 12)
                }
                if isSending {
                    AppStatePanel(kind: .loading, title: "Отправляем код",
                                  detail: "Письмо придёт в течение минуты.")
                        .padding(.bottom, 12)
                }
                OTPField(code: $code) { if $0.count == 4 { onDone() } }
                    .focused($focused)
                Spacer().frame(height: 14)
                Button(codeSentAgain ? "Новый код отправлен" : "Отправить код ещё раз") {
                    codeSentAgain = true
                }
                    .disabled(codeSentAgain)
                    .font(.system(size: 15)).foregroundStyle(t.accent)
            }

            Spacer()
            Text("Продолжая, вы принимаете пользовательское соглашение и политику конфиденциальности")
                .font(.role(.meta)).foregroundStyle(t.textTertiary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer().frame(height: 16)
            HStack(spacing: 22) {
                Text("Помощь"); Text("Поддержка"); Text("Соглашение")
            }
            .font(.system(size: 14)).foregroundStyle(t.accent)
            .frame(maxWidth: .infinity)
            Spacer().frame(height: 8)
        }
        .padding(.horizontal, t.pad)
        .background(t.card)
        .onAppear { focused = true }
    }
}

struct OTPField: View {
    @Binding var code: String
    var onChange: (String) -> Void
    @Environment(\.theme) private var t
    @FocusState private var kb: Bool

    var body: some View {
        ZStack {
            TextField("", text: $code)
                .keyboardType(.numberPad).focused($kb).opacity(0.01)
                .onChange(of: code) { _, v in
                    code = String(v.filter(\.isNumber).prefix(4))
                    onChange(code)
                }
            HStack(spacing: 10) {
                ForEach(0..<4, id: \.self) { i in
                    let ch = i < code.count ? String(Array(code)[i]) : ""
                    Text(ch)
                        .font(.role(.largeTitle)).monospacedDigit()
                        .foregroundStyle(t.textPrimary)
                        .frame(maxWidth: .infinity).frame(height: 56)
                        .background(t.fieldFill, in: RoundedRectangle(cornerRadius: t.controlRadius, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: t.controlRadius, style: .continuous)
                                .stroke(i == code.count ? t.accent : .clear, lineWidth: 2)
                        )
                }
            }
            .allowsHitTesting(false)
        }
        .contentShape(Rectangle())
        .onTapGesture { kb = true }
        .onAppear { kb = true }
    }
    func focused(_ b: FocusState<Bool>.Binding) -> some View { self }
}

// MARK: - Список диалогов

struct ChatsScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var query = ""

    var body: some View {
        VStack(spacing: 0) {
            VKTabHeader(title: "Сообщения", avatar: "Ника Орлова",
                        avatarAction: { nav.push(LooksRoute.profile) }) {
                Button { nav.push(LooksRoute.mates) } label: {
                    Image(systemName: "square.and.pencil")
                }
                .accessibilityLabel("Новое сообщение")
            }
            VKSearchField(placeholder: "Поиск по сообщениям", text: $query)
                .padding(.horizontal, t.pad)
                .padding(.bottom, 10)

            ScrollView {
                LazyVStack(spacing: 0) {
                    if ShotMode.isScreen("chats", state: "empty") {
                    AppStatePanel(kind: .empty, title: "Переписок пока нет",
                                  detail: "Напишите тому, чей образ понравился, — диалог появится здесь.")
                        .padding(t.pad)
                }
                ForEach(ShotMode.isScreen("chats", state: "empty") ? [] : filtered) { d in
                        Button { nav.push(LooksRoute.chat(d)) } label: {
                            DialogRow(dialog: d)
                        }
                        .buttonStyle(HighlightStyle())
                        if d.id != filtered.last?.id { RowSeparator(leading: 76) }
                    }
                }
                .background(t.card)
            }
        }
        .background(t.card)
    }

    private var filtered: [Dialog] {
        query.isEmpty ? store.dialogs
            : store.dialogs.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }
}

private struct DialogRow: View {
    let dialog: Dialog
    @Environment(\.theme) private var t
    var body: some View {
        HStack(spacing: 12) {
            ZStack(alignment: .bottomTrailing) {
                Avatar(name: dialog.name, size: 48)
                if dialog.online {
                    Circle().fill(t.positive).frame(width: 13, height: 13)
                        .overlay(Circle().stroke(t.card, lineWidth: 2))
                }
            }
            VStack(alignment: .leading, spacing: 3) {
                Text(dialog.name).font(.role(.action)).foregroundStyle(t.textPrimary)
                    .lineLimit(1)
                Text(dialog.last).font(.role(.meta)).foregroundStyle(t.textSecondary).lineLimit(1)
            }
            Spacer(minLength: 8)
            VStack(alignment: .trailing, spacing: 6) {
                Text(dialog.time).font(.role(.meta)).foregroundStyle(t.textSecondary)
                if dialog.unread > 0 {
                    Text("\(dialog.unread)")
                        .font(.role(.badge)).foregroundStyle(.white)
                        .padding(.horizontal, 7).padding(.vertical, 2)
                        .background(t.accent, in: Capsule())
                } else {
                    Spacer().frame(height: 18)
                }
            }
        }
        .padding(.horizontal, t.pad)
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
    @Environment(\.theme) private var t
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
                onCall: { nav.push(LooksRoute.call) }
            )

            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(Array(store.messages.enumerated()), id: \.element.id) { i, m in
                            if let day = m.day { DayDivider(text: day) }
                            Bubble(message: m, author: dialog.name,
                                   showsAvatar: startsGroup(i),
                                   progress: Double(i) / Double(max(store.messages.count - 1, 1)))
                                .padding(.top, messageSpacingBefore(i))
                                .id(m.id)
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                }
                .onChange(of: store.messages.count) { _, _ in
                    withAnimation { proxy.scrollTo(store.messages.last?.id, anchor: .bottom) }
                }
                .task {
                    try? await Task.sleep(for: .milliseconds(80))
                    proxy.scrollTo(store.messages.last?.id, anchor: .bottom)
                }
            }
            .background(t.background)

            if ShotMode.isScreen("voice", state: "denied") {
                AppStatePanel(kind: .warning, title: "Микрофон выключен",
                              detail: "Голосовое не записать — напишите текстом, остальное работает.")
                    .padding(.horizontal, 12).padding(.bottom, 8)
            }
            inputBar
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .toolbar(.hidden, for: .navigationBar)
        .confirmationDialog("Добавить к сообщению", isPresented: $showAttachments) {
            Button("Фото образа") { store.send("Фото · образ для свопа") }
            Button("Место встречи") { store.send("Новая Голландия · суббота, 15:00") }
            Button("Отмена", role: .cancel) {}
        }
    }

    /// Аватар рисуется только у первого сообщения подряд идущей группы.
    private func startsGroup(_ i: Int) -> Bool {
        let m = store.messages[i]
        if m.mine { return false }
        if i == 0 { return true }
        let prev = store.messages[i - 1]
        return prev.mine || m.day != nil
    }

    /// Внутри реплики сообщения плотные; при смене автора читается новая группа.
    private func messageSpacingBefore(_ i: Int) -> CGFloat {
        guard i > 0 else { return 0 }
        let message = store.messages[i]
        if message.day != nil { return 0 }
        return store.messages[i - 1].mine == message.mine ? 2 : 8
    }

    private var inputBar: some View {
        HStack(spacing: 12) {
            Button { showAttachments = true } label: {
                Image(systemName: "plus.circle.fill").font(.system(size: 28))
                    .foregroundStyle(t.accent)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Вложение")

            HStack(spacing: 10) {
                TextField("Сообщение", text: $draft, axis: .vertical)
                    .font(.system(size: 16)).lineLimit(1...4)
                    .focused($focused)
                Button { draft += draft.isEmpty ? "✨" : " ✨" } label: {
                    Image(systemName: "face.smiling").font(.system(size: 20))
                        .foregroundStyle(t.accent)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Эмодзи")
            }
            .padding(.horizontal, 14).padding(.vertical, 9)
            .background(t.fieldFill, in: RoundedRectangle(cornerRadius: 18, style: .continuous))

            if draft.trimmingCharacters(in: .whitespaces).isEmpty {
                Button {
                    Task {
                        if recording { recording = false; store.send("Голосовое · 0:07"); return }
                        let ok = await perms.request(.mic)
                        if ok { withAnimation { recording = true } }
                        else { nav.toast("Без микрофона напишите текстом", once: "mic") }
                    }
                } label: {
                    Image(systemName: recording ? "stop.circle.fill" : "mic.fill")
                        .font(.system(size: 22))
                        .foregroundStyle(recording ? t.danger : t.accent)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(recording ? "Остановить запись" : "Голосовое сообщение")
            } else {
                Button {
                    store.send(draft.trimmingCharacters(in: .whitespaces))
                    draft = ""
                } label: {
                    Image(systemName: "arrow.up.circle.fill").font(.system(size: 28))
                        .foregroundStyle(t.accent)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Отправить")
                .transition(.scale.combined(with: .opacity))
            }
        }
        .animation(.easeOut(duration: 0.15), value: draft.isEmpty)
        .padding(.horizontal, 12).padding(.vertical, 8)
        .background(t.card.overlay(alignment: .top) { Rectangle().fill(t.separator).frame(height: 0.5) })
    }
}

/// Разделитель даты — по центру серым, как в ВК.
private struct DayDivider: View {
    let text: String
    @Environment(\.theme) private var t
    var body: some View {
        Text(text)
            .font(.role(.meta)).foregroundStyle(t.textSecondary)
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
    @Environment(\.theme) private var t


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
                    .foregroundStyle(message.mine ? .white : t.textPrimary)
                HStack(spacing: 3) {
                    Text(message.time)
                        .font(.role(.bubbleTime))
                        .foregroundStyle(message.mine ? .white.opacity(0.8) : t.textSecondary)
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
            // Бабл — компонент профиля: заливка, радиус и срез общего градиента
            // треда живут там, а не повторяются в каждом концепте.
            .vkChatBubble(isMine: message.mine, progress: progress)

            if !message.mine { Spacer(minLength: 56) }
        }
        .transition(.move(edge: message.mine ? .trailing : .leading).combined(with: .opacity))
    }
}
