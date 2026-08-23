import PhotosUI
import SwiftUI

// Вход, список диалогов, чат и звонок. Набор vkontakte входит по почте,
// поэтому первые экраны — почта и код, рядом «Продолжить с Google».

struct TailsAuthScreen: View {
    let onDone: () -> Void
    @Environment(\.theme) private var t
    @State private var mail = ""
    @State private var code = ""
    @State private var step = ShotMode.screen == "code" || ShotMode.screen == "codefail" ? 1 : 0
    @FocusState private var focused: Bool
    @State private var codeResent = false
    @State private var document: String?

    private var isSending: Bool { ShotMode.state == "loading" }
    private var codeRejected: Bool { ShotMode.screen == "codefail" || ShotMode.state == "error" }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Spacer().frame(height: 24)
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(t.accent).frame(width: 60, height: 60)
                .overlay(Image(systemName: "pawprint.fill").font(.system(size: 28, weight: .medium))
                    .foregroundStyle(.white))
            Spacer().frame(height: 20)
            Text(step == 0 ? "Хвосты" : "Код из письма").textStyle(.largeTitle)
            Spacer().frame(height: 8)
            Text(step == 0
                 ? "Войдите по почте — профиль питомца и прогулки останутся с вами на новом телефоне"
                 : "Отправили код на \(mail.isEmpty ? "почту" : mail)")
                .textStyle(.body).foregroundStyle(t.textSecondary)
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
                    .autocorrectionDisabled().font(.role(.rowTitle))
                    .padding(.horizontal, 14).frame(height: 48)
                    .background(t.fill, in: RoundedRectangle(cornerRadius: t.controlRadius, style: .continuous))
                    .focused($focused)
                Spacer().frame(height: 12)
                VKButton(title: "Получить код") {
                    withAnimation(.easeOut(duration: 0.2)) { step = 1; focused = true }
                }
                .disabled(!mail.contains("@"))
                .opacity(mail.contains("@") ? 1 : 0.45)
                Spacer().frame(height: 10)
                Button { onDone() } label: {
                    HStack(spacing: 10) {
                        Text("G").font(.role(.cardTitle)).foregroundStyle(t.textPrimary)
                            .frame(width: 24, height: 24).background(t.fill, in: Circle())
                        Text("Продолжить с Google").textStyle(.rowTitle)
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
                TailsOTPField(code: $code) { if $0.count == 4 { onDone() } }
                Spacer().frame(height: 14)
                Button(codeResent ? "Код отправлен" : "Отправить код ещё раз") {
                    withAnimation { codeResent = true }
                }
                .textStyle(.action)
                .disabled(codeResent)
            }

            Spacer()
            Text("Продолжая, вы принимаете пользовательское соглашение и политику конфиденциальности")
                .textStyle(.meta).foregroundStyle(t.textTertiary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer().frame(height: 16)
            HStack(spacing: 22) {
                ForEach(["Помощь", "Поддержка", "Соглашение"], id: \.self) { title in
                    Button(title) { document = title }.textStyle(.action)
                }
            }
            .frame(maxWidth: .infinity)
            Spacer().frame(height: 8)
        }
        .padding(.horizontal, t.pad)
        .background(t.background)
        .onAppear { focused = true }
        .sheet(item: Binding(get: { document.map(AuthDocument.init) },
                             set: { document = $0?.title })) { doc in
            AuthDocumentSheet(title: doc.title)
        }
    }
}

struct TailsOTPField: View {
    @Binding var code: String
    var onChange: (String) -> Void
    @Environment(\.theme) private var t
    @FocusState private var keyboard: Bool

    var body: some View {
        ZStack {
            TextField("", text: $code)
                .keyboardType(.numberPad).focused($keyboard).opacity(0.01)
                .onChange(of: code) { _, value in
                    code = String(value.filter(\.isNumber).prefix(4))
                    onChange(code)
                }
            HStack(spacing: 10) {
                ForEach(0..<4, id: \.self) { index in
                    Text(index < code.count ? String(Array(code)[index]) : "")
                        .font(.role(.code)).foregroundStyle(t.textPrimary)
                        .frame(maxWidth: .infinity).frame(height: 56)
                        .background(t.fill, in: RoundedRectangle(cornerRadius: t.controlRadius, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: t.controlRadius, style: .continuous)
                            .stroke(index == code.count ? t.accent : .clear, lineWidth: 2))
                }
            }
            .allowsHitTesting(false)
        }
        .contentShape(Rectangle())
        .onTapGesture { keyboard = true }
        .onAppear { keyboard = true }
    }
}

// MARK: - Список диалогов

struct ChatsScreen: View {
    @Environment(TailsStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var query = ""

    private var filtered: [Dialog] {
        query.isEmpty ? store.dialogs : store.dialogs.filter { $0.name.localizedCaseInsensitiveContains(query) }
    }

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                VKSearchField(placeholder: "Поиск по сообщениям", text: $query)
                    .padding(.horizontal, t.pad).padding(.bottom, 10)

                if ShotMode.isScreen("chats", state: "empty") {
                    AppStatePanel(kind: .empty, title: "Переписок пока нет",
                                  detail: "Напишите тому, с кем гуляли рядом, — диалог появится здесь.")
                        .padding(t.pad)
                } else {
                    ForEach(ShotMode.isScreen("chats", state: "empty") ? [] : filtered) { dialog in
                        Button { nav.push(TailsRoute.chat(dialog)) } label: { row(dialog) }
                            .buttonStyle(HighlightStyle())
                        RowSeparator(leading: 80)
                    }
                }
                Color.clear.frame(height: 88)
            }
        }
        .background(t.background)
        .rootHeaderBar {
            VKTabHeader(title: "Сообщения", avatar: store.me.name,
                        avatarAction: { nav.push(TailsRoute.pet(store.me)) }) {
                Button { nav.push(TailsRoute.mates) } label: { Image(systemName: "square.and.pencil") }
                    .accessibilityLabel("Новое сообщение")
            }
        }
    }

    private func row(_ dialog: Dialog) -> some View {
        HStack(spacing: 12) {
            Avatar(name: dialog.name, size: 52)
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text(dialog.name).textStyle(.cardTitle).lineLimit(1)
                    Spacer(minLength: 8)
                    Text(dialog.time).textStyle(.meta)
                }
                Text(dialog.subtitle).textStyle(.meta).lineLimit(1)
                HStack {
                    Text(dialog.last).textStyle(.meta).lineLimit(1)
                    Spacer(minLength: 8)
                    if dialog.unread > 0 {
                        Text("\(dialog.unread)").textStyle(.badge)
                            .frame(minWidth: 22, minHeight: 22)
                            .background(t.accent, in: Capsule())
                    }
                }
            }
        }
        .padding(.horizontal, t.pad).padding(.vertical, 10)
        .contentShape(Rectangle())
    }
}

// MARK: - Чат

struct ChatScreen: View {
    let dialog: Dialog
    @Environment(TailsStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    @Environment(\.dismiss) private var dismiss
    @State private var draft = ""
    @State private var recording = ShotMode.isScreen("voice", state: "default")
    @State private var attachment: PhotosPickerItem?

    private var micDenied: Bool { ShotMode.isScreen("voice", state: "denied") }

    var body: some View {
        VStack(spacing: 0) {
            VKChatHeader(title: dialog.name, subtitle: dialog.subtitle,
                         onBack: { dismiss() },
                         onCall: { nav.push(TailsRoute.call) })
            ScrollView {
                LazyVStack(spacing: 3) {
                    Spacer(minLength: 0).frame(maxHeight: .infinity)
                    if ShotMode.isScreen("chat", state: "empty") {
                        AppStatePanel(kind: .empty, title: "Начните разговор",
                                      detail: "Спросите, во сколько выходят гулять — это работает лучше всего.")
                            .padding(t.pad)
                    }
                    ForEach(Array(store.messages.enumerated()), id: \.element.id) { index, message in
                        if let day = message.day { dayDivider(day) }
                        bubble(message, progress: Double(index) / Double(max(store.messages.count - 1, 1)))
                    }
                }
                .frame(maxWidth: .infinity, minHeight: 480, alignment: .bottom)
                .padding(.horizontal, 12).padding(.vertical, 12)
            }
            .background(t.background)

            if micDenied {
                AppStatePanel(kind: .warning, title: "Микрофон выключен",
                              detail: "Голосовое не записать — напишите текстом, остальное работает.")
                    .padding(.horizontal, 12).padding(.bottom, 8)
            }
            if recording && !micDenied {
                HStack(spacing: 10) {
                    Circle().fill(t.badge).frame(width: 10, height: 10)
                    Text("Запись · 0:07").textStyle(.body)
                    Spacer()
                    Button("Отправить") {
                        store.send("Голосовое · 0:07")
                        withAnimation { recording = false }
                    }
                    .textStyle(.action)
                }
                .padding(.horizontal, 16).padding(.vertical, 10)
                .background(t.fill)
            }
            inputBar
        }
        .toolbar(.hidden, for: .tabBar)
    }

    private func dayDivider(_ text: String) -> some View {
        Text(text).textStyle(.meta)
            .frame(maxWidth: .infinity).padding(.vertical, 12)
    }

    private func bubble(_ message: Message, progress: Double) -> some View {
        HStack(alignment: .bottom, spacing: 8) {
            if message.mine { Spacer(minLength: 56) }
            HStack(alignment: .bottom, spacing: 6) {
                Text(message.text).font(.role(.body))
                Text(message.time).font(.role(.bubbleTime))
                    .foregroundStyle(message.mine ? .white.opacity(0.8) : t.textSecondary)
            }
            .vkChatBubble(isMine: message.mine, progress: progress)
            if !message.mine { Spacer(minLength: 56) }
        }
    }

    private var inputBar: some View {
        HStack(spacing: 12) {
            PhotosPicker(selection: $attachment, matching: .images) {
                Image(systemName: "plus.circle.fill").font(.system(size: 28)).foregroundStyle(t.accent)
            }
            .buttonStyle(.plain).accessibilityLabel("Приложить фото")

            TextField("Сообщение", text: $draft, axis: .vertical)
                .font(.role(.body)).lineLimit(1...4)
                .padding(.horizontal, 14).padding(.vertical, 9)
                .background(t.fill, in: RoundedRectangle(cornerRadius: 18, style: .continuous))

            if draft.trimmingCharacters(in: .whitespaces).isEmpty {
                Button {
                    Task {
                        let ok = await perms.request(.mic)
                        if ok { withAnimation { recording = true } }
                        else { nav.toast("Без микрофона напишите текстом", once: "mic") }
                    }
                } label: {
                    Image(systemName: "mic.fill").font(.system(size: 22)).foregroundStyle(t.accent)
                }
                .buttonStyle(.plain).accessibilityLabel("Голосовое сообщение")
            } else {
                Button {
                    store.send(draft.trimmingCharacters(in: .whitespaces))
                    draft = ""
                } label: {
                    Image(systemName: "arrow.up.circle.fill").font(.system(size: 28)).foregroundStyle(t.accent)
                }
                .buttonStyle(.plain).accessibilityLabel("Отправить")
            }
        }
        .padding(.horizontal, 12).padding(.vertical, 8)
        .background(t.background.overlay(alignment: .top) { t.separator.frame(height: 0.5) })
    }
}

// MARK: - Звонок догситтеру

struct CallScreen: View {
    @Environment(Permissions.self) private var perms
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var t
    @State private var connected = false
    @State private var muted = false
    @State private var loud = false

    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            Avatar(name: "Догситтер Оля", size: 108)
            Text("Догситтер Оля").font(.role(.largeTitle)).foregroundStyle(.white)
            Text(connected ? "0:12" : "Соединение…")
                .font(.role(.timer)).foregroundStyle(.white.opacity(0.7))
            Text("Номер остаётся у владельца: звонок идёт через «Хвосты»")
                .textStyle(.meta).foregroundStyle(.white.opacity(0.6))
                .multilineTextAlignment(.center).padding(.horizontal, 40)
            Spacer()
            HStack(spacing: 26) {
                callButton(muted ? "mic.slash.fill" : "mic.fill",
                           label: muted ? "Включить микрофон" : "Выключить микрофон",
                           tint: .white.opacity(muted ? 0.32 : 0.18)) { muted.toggle() }
                callButton("phone.down.fill", label: "Завершить звонок", tint: Color(hex: "E64646")) { dismiss() }
                callButton(loud ? "speaker.wave.3.fill" : "speaker.wave.2.fill",
                           label: loud ? "Выключить громкую связь" : "Громкая связь",
                           tint: .white.opacity(loud ? 0.32 : 0.18)) { loud.toggle() }
            }
            Spacer().frame(height: 40)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(LinearGradient(colors: [Color(hex: "2B3450"), Color(hex: "121722")],
                                   startPoint: .top, endPoint: .bottom).ignoresSafeArea())
        .task {
            let ok = await perms.request(.voip)
            withAnimation { connected = ok }
        }
    }

    private func callButton(_ icon: String, label: String, tint: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon).font(.system(size: 24)).foregroundStyle(.white)
                .frame(width: 66, height: 66).background(tint, in: Circle())
        }
        .pressable(scale: 0.92)
        .accessibilityLabel(label)
    }
}

// MARK: - Правовые документы на входе

struct AuthDocument: Identifiable, Hashable {
    let title: String
    var id: String { title }
}

/// Ревьюер должен находить эти тексты до входа, поэтому они открываются
/// внутри приложения, а не ссылкой наружу.
struct AuthDocumentSheet: View {
    let title: String
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var t

    private var body_: String {
        switch title {
        case "Помощь":
            "Как завести профиль питомца, присоединиться к прогулке и что делать, если питомец потерялся."
        case "Поддержка":
            "Напишите на help@tails.app — отвечаем в течение дня. Для срочных случаев с пропажей есть отдельная кнопка в моменте."
        default:
            "Пользовательское соглашение: правила публикации моментов, обработка геопозиции и данных о здоровье питомца."
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Text(title).textStyle(.largeTitle)
                Text(body_).textStyle(.body).foregroundStyle(t.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(t.pad)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(t.background)
        .presentationDetents([.medium])
        .overlay(alignment: .topTrailing) {
            Button("Готово") { dismiss() }.textStyle(.action).padding(t.pad)
        }
    }
}
