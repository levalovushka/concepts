import SwiftUI

/// Shared entry grammar for concepts in the VKontakte exercise family.
/// Products provide only their name and persistence promise; geometry and
/// recovery semantics stay identical across deliveries.
struct NativeEmailAuth: View {
    let productName: String
    let persistencePromise: String
    var initialSurface: String? = nil
    var captureState: String? = nil
    var emailActionID = "phone.continue-email"
    var codeActionID = "code.confirm-code"
    let onAuthenticated: () -> Void

    @Environment(\.visualLanguage) private var t
    @State private var email = ""
    @State private var code = ""
    @State private var step: Int
    @State private var loading = false
    @State private var error: String?
    @State private var showEntryHelp = false
    @FocusState private var focused: Bool

    init(productName: String, persistencePromise: String, initialSurface: String? = nil,
         captureState: String? = nil, emailActionID: String = "phone.continue-email",
         codeActionID: String = "code.confirm-code", onAuthenticated: @escaping () -> Void) {
        self.productName = productName
        self.persistencePromise = persistencePromise
        self.initialSurface = initialSurface
        self.captureState = captureState
        self.emailActionID = emailActionID
        self.codeActionID = codeActionID
        self.onAuthenticated = onAuthenticated
        let codeStep = initialSurface == "code" || initialSurface == "codefail"
        _step = State(initialValue: codeStep ? 1 : 0)
        _email = State(initialValue: codeStep ? "nika@mail.ru" : "")
        _code = State(initialValue: codeStep && captureState != "default" ? "0427" : "")
        _loading = State(initialValue: captureState == "loading")
        _error = State(initialValue: captureState == "error" || initialSurface == "codefail"
            ? (codeStep ? "Код не подошёл. Введите код из последнего письма." : "Не удалось отправить код. Проверьте соединение.")
            : nil)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Spacer().frame(height: 24)
            Text(step == 0 ? productName : "Код из письма")
                .textStyle(.largeTitle)
            Spacer().frame(height: 8)
            Text(step == 0
                 ? "Войдите по почте — \(persistencePromise) останутся с вами на новом устройстве"
                 : "Отправили четырёхзначный код на \(email)")
                .textStyle(.body)
                .foregroundStyle(t.palette.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer().frame(height: 24)

            if step == 0 { emailStep } else { codeStep }
            Spacer()
            Text("Продолжая, вы принимаете пользовательское соглашение и политику конфиденциальности")
                .textStyle(.bubbleTime)
                .foregroundStyle(t.palette.textTertiary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer().frame(height: 14)
            HStack(spacing: 22) {
                Button("Помощь") { showEntryHelp = true }
                Button("Поддержка") { showEntryHelp = true }
                Button("Соглашение") { showEntryHelp = true }
            }
            .textStyle(.meta)
            .foregroundStyle(t.palette.accent)
            .frame(maxWidth: .infinity)
            Spacer().frame(height: 10)
        }
        .padding(.horizontal, t.spacing.contentInset)
        .background(t.palette.surface)
        .onAppear { focused = true }
        .sheet(isPresented: $showEntryHelp) {
            NavigationStack {
                Text("Помощь со входом, поддержка и условия доступны до авторизации.")
                    .textStyle(.body).padding(24)
                    .navigationTitle("Вход")
                    .toolbar { Button("Готово") { showEntryHelp = false } }
            }
        }
    }

    private var emailStep: some View {
        VStack(spacing: 12) {
            TextField("Почта", text: $email)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .textStyle(.rowTitle)
                .padding(.horizontal, 14)
                .frame(height: 48)
                .background(t.palette.fill, in: RoundedRectangle(cornerRadius: t.metrics.controlRadius, style: .continuous))
                .focused($focused)
            if let error { NativeStatePanel(kind: .error, title: "Не удалось войти", detail: error) }
            NativeActionButton(title: "Получить код", loadingTitle: "Отправляем код", isLoading: loading,
                               isDisabled: !email.contains("@"), action: sendCode)
                .nativeAction(emailActionID)
            Button(action: sendCode) {
                HStack(spacing: 10) {
                    Text("G").textStyle(.cardTitle)
                    Text("Продолжить с Google").textStyle(.button)
                }
                .foregroundStyle(t.palette.textPrimary)
                .frame(maxWidth: .infinity, minHeight: 48)
                .overlay(RoundedRectangle(cornerRadius: t.metrics.controlRadius).stroke(t.palette.separator))
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Продолжить с Google")
        }
    }

    private var codeStep: some View {
        VStack(spacing: 14) {
            NativeOTPField(code: $code, length: 4, error: error)
            if let error { NativeStatePanel(kind: .error, title: "Неверный код", detail: error) }
            NativeActionButton(title: error == nil ? "Продолжить" : "Ввести снова",
                               loadingTitle: "Проверяем код", isLoading: loading,
                               isDisabled: code.count != 4 && error == nil, action: verifyCode)
                .nativeAction(initialSurface == "codefail" ? "codefail.complete-codefail" : codeActionID)
            Button("Отправить код ещё раз") { code = ""; error = nil }
                .textStyle(.action).frame(maxWidth: .infinity, minHeight: 44)
        }
    }

    private func sendCode() {
        guard email.contains("@") || email.isEmpty else { return }
        if email.isEmpty { email = "nika@mail.ru" }
        loading = true; error = nil
        Task { @MainActor in
            try? await Task.sleep(for: .milliseconds(300))
            loading = false; step = 1; focused = true
        }
    }

    private func verifyCode() {
        if error != nil { code = ""; error = nil; return }
        guard code.count == 4 else { return }
        loading = true
        Task { @MainActor in
            try? await Task.sleep(for: .milliseconds(300))
            loading = false
            if code == "0000" { code = ""; error = "Введите код из последнего письма." }
            else { onAuthenticated() }
        }
    }
}
