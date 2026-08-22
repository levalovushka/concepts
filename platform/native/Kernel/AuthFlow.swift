import SwiftUI

// Вход — один каркас на все концепты: номер → код из SMS → приложение.
// Разметка копируется без изменений; концепт подставляет только акцент и одну фразу.

struct AuthFlow: View {
    let appName: String
    let lede: String
    let mailAuth: Bool
    let onDone: () -> Void

    @State private var phone = ""
    @State private var showCode = false

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 20) {
                Spacer().frame(height: 8)
                Circle().fill(Color.accentColor.opacity(0.15))
                    .frame(width: 56, height: 56)
                    .overlay(Image(systemName: mailAuth ? "envelope.fill" : "phone.fill")
                        .foregroundStyle(Color.accentColor))
                Text(appName).font(.largeTitle.bold())
                Text(lede).font(.body).foregroundStyle(.secondary)

                VStack(spacing: 0) {
                    TextField(mailAuth ? "Почта" : "Номер телефона", text: $phone)
                        .keyboardType(mailAuth ? .emailAddress : .phonePad)
                        .textContentType(mailAuth ? .emailAddress : .telephoneNumber)
                        .padding()
                }
                .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: Grid.radius))

                Button {
                    showCode = true
                } label: {
                    Text(mailAuth ? "Прислать код на почту" : "Прислать код в SMS")
                        .frame(maxWidth: .infinity).padding(.vertical, 6)
                }
                .buttonStyle(.borderedProminent)
                .disabled(phone.count < 4)

                Text("Продолжая, вы принимаете пользовательское соглашение и политику конфиденциальности.")
                    .font(.caption2).foregroundStyle(.secondary)

                Spacer()

                HStack(spacing: 20) {
                    Text("Помощь"); Text("Поддержка"); Text("Соглашение")
                }
                .font(.footnote).foregroundStyle(Color.accentColor)
                .frame(maxWidth: .infinity)
            }
            .padding(Grid.edge)
            .navigationDestination(isPresented: $showCode) {
                CodeScreen(destination: phone, onDone: onDone)
            }
        }
    }
}

private struct CodeScreen: View {
    let destination: String
    let onDone: () -> Void
    @State private var code = ""
    @State private var failed = false
    @FocusState private var focused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Код из SMS").font(.largeTitle.bold())
            Text("Отправили код на \(destination)").font(.body).foregroundStyle(.secondary)

            ZStack {
                TextField("", text: $code)
                    .keyboardType(.numberPad)
                    .focused($focused)
                    .opacity(0.02)
                    .onChange(of: code) { _, v in
                        code = String(v.prefix(4).filter(\.isNumber))
                        failed = false
                        if code.count == 4 {
                            if code == "0000" { failed = true }
                            else { onDone() }
                        }
                    }
                HStack(spacing: 12) {
                    ForEach(0..<4, id: \.self) { i in
                        let ch = i < code.count ? String(Array(code)[i]) : ""
                        Text(ch)
                            .font(.title.monospacedDigit())
                            .frame(width: 56, height: 64)
                            .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: Grid.radius))
                            .overlay(RoundedRectangle(cornerRadius: Grid.radius)
                                .stroke(failed ? Color.red : (i == code.count ? Color.accentColor : Color.clear), lineWidth: 2))
                    }
                }
                .allowsHitTesting(false)
            }
            .onTapGesture { focused = true }

            if failed {
                Text("Неверный код. Попробуйте ещё раз.").font(.footnote).foregroundStyle(.red)
            }
            Button("Отправить код повторно") { }.font(.footnote)
            Spacer()
        }
        .padding(Grid.edge)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { focused = true }
    }
}
