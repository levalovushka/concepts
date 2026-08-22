import SwiftUI

// MARK: - Вход (набор vkontakte — по почте)

struct AuthScreen: View {
    let onDone: () -> Void
    @Environment(\.theme) private var t
    @State private var mail = ""
    @State private var code = ""
    @State private var step = 0
    @FocusState private var focused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Spacer().frame(height: 24)
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(t.accent)
                .frame(width: 60, height: 60)
                .overlay(Image(systemName: "hanger").font(.system(size: 28, weight: .medium)).foregroundStyle(.white))
            Spacer().frame(height: 20)
            Text(step == 0 ? "Образы" : "Код из письма")
                .font(.system(size: 30, weight: .bold)).foregroundStyle(t.textPrimary)
            Spacer().frame(height: 8)
            Text(step == 0
                 ? "Войдите по почте — образы и гардероб останутся с вами на новом устройстве"
                 : "Отправили код на \(mail)")
                .font(.system(size: 16)).foregroundStyle(t.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer().frame(height: 24)

            if step == 0 {
                TextField("Почта", text: $mail)
                    .keyboardType(.emailAddress).textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .font(.system(size: 17))
                    .padding(.horizontal, 14).frame(height: 48)
                    .background(t.fieldFill, in: RoundedRectangle(cornerRadius: t.controlRadius, style: .continuous))
                    .focused($focused)
                Spacer().frame(height: 12)
                PrimaryButton(title: "Получить код") {
                    withAnimation(.easeOut(duration: 0.2)) { step = 1; focused = true }
                }
                .disabled(!mail.contains("@"))
                .opacity(mail.contains("@") ? 1 : 0.45)
            } else {
                OTPField(code: $code) { if $0.count == 4 { onDone() } }
                    .focused($focused)
                Spacer().frame(height: 14)
                Button("Отправить код ещё раз") {}
                    .font(.system(size: 15)).foregroundStyle(t.accent)
            }

            Spacer()
            Text("Продолжая, вы принимаете пользовательское соглашение и политику конфиденциальности")
                .font(.system(size: 12)).foregroundStyle(t.textTertiary)
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
                        .font(.system(size: 26, weight: .semibold)).monospacedDigit()
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
                Button {} label: { Image(systemName: "square.and.pencil") }
            }
            SearchField(placeholder: "Поиск по сообщениям", text: $query)
                .padding(.horizontal, t.pad)
                .padding(.bottom, 10)

            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(filtered) { d in
                        Button { nav.push(LooksRoute.chat(d)) } label: {
                            DialogRow(dialog: d)
                        }
                        .buttonStyle(HighlightStyle())
                        if d.id != filtered.last?.id { RowDivider(leading: 76) }
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
                Text(dialog.name).font(.system(size: 16, weight: .medium)).foregroundStyle(t.textPrimary)
                    .lineLimit(1)
                Text(dialog.last).font(.system(size: 14)).foregroundStyle(t.textSecondary).lineLimit(1)
            }
            Spacer(minLength: 8)
            VStack(alignment: .trailing, spacing: 6) {
                Text(dialog.time).font(.system(size: 13)).foregroundStyle(t.textSecondary)
                if dialog.unread > 0 {
                    Text("\(dialog.unread)")
                        .font(.system(size: 12, weight: .semibold)).foregroundStyle(.white)
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
    @FocusState private var focused: Bool

    var body: some View {
        VStack(spacing: 0) {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 8) {
                        Spacer(minLength: 0).frame(maxHeight: .infinity)
                        ForEach(store.messages) { m in Bubble(message: m).id(m.id) }
                    }
                    .frame(maxWidth: .infinity, minHeight: 520, alignment: .bottom)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 12)
                }
                .onChange(of: store.messages.count) { _, _ in
                    withAnimation { proxy.scrollTo(store.messages.last?.id, anchor: .bottom) }
                }
            }
            .background(t.background)

            HStack(spacing: 10) {
                Button {} label: {
                    Image(systemName: "plus.circle.fill").font(.system(size: 26))
                        .foregroundStyle(t.textSecondary)
                }
                .buttonStyle(.plain)

                TextField("Сообщение", text: $draft, axis: .vertical)
                    .font(.system(size: 16)).lineLimit(1...4)
                    .padding(.horizontal, 14).padding(.vertical, 9)
                    .background(t.fieldFill, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                    .focused($focused)

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
                } else {
                    Button {
                        store.send(draft.trimmingCharacters(in: .whitespaces))
                        draft = ""
                    } label: {
                        Image(systemName: "arrow.up.circle.fill").font(.system(size: 28))
                            .foregroundStyle(t.accent)
                    }
                    .buttonStyle(.plain)
                    .transition(.scale.combined(with: .opacity))
                }
            }
            .animation(.easeOut(duration: 0.15), value: draft.isEmpty)
            .padding(.horizontal, 12).padding(.vertical, 8)
            .background(t.card.overlay(alignment: .top) { Rectangle().fill(t.separator).frame(height: 0.5) })
        }
        .navigationTitle(dialog.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { nav.push(LooksRoute.call) } label: { Image(systemName: "phone") }
            }
        }
    }
}

private struct Bubble: View {
    let message: Message
    @Environment(\.theme) private var t
    var body: some View {
        HStack {
            if message.mine { Spacer(minLength: 56) }
            VStack(alignment: .trailing, spacing: 2) {
                Text(message.text)
                    .font(.system(size: 16))
                    .foregroundStyle(message.mine ? .white : t.textPrimary)
                Text(message.time)
                    .font(.system(size: 11))
                    .foregroundStyle(message.mine ? .white.opacity(0.75) : t.textSecondary)
            }
            .padding(.horizontal, 12).padding(.vertical, 8)
            .background {
                if message.mine {
                    LinearGradient(colors: [Color(hex: "5B8DEF"), Color(hex: "8B5CF6")],
                                   startPoint: .topLeading, endPoint: .bottomTrailing)
                } else { t.card }
            }
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            if !message.mine { Spacer(minLength: 56) }
        }
        .transition(.move(edge: message.mine ? .trailing : .leading).combined(with: .opacity))
    }
}
