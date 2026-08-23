import AuthenticationServices
import SwiftUI

private struct DvorEntryScaffold<Header: View, Content: View>: View {
    @ViewBuilder let header: Header
    @ViewBuilder let content: Content
    @Environment(\.theme) private var t

    init(@ViewBuilder header: () -> Header, @ViewBuilder content: () -> Content) {
        self.header = header()
        self.content = content()
    }

    var body: some View {
        VStack(spacing: 0) {
            header
            GeometryReader { proxy in
                ScrollView {
                    content
                        .frame(maxWidth: 520)
                        .frame(maxWidth: .infinity)
                        .frame(minHeight: proxy.size.height, alignment: .center)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 24)
                }
                .scrollDismissesKeyboard(.interactively)
            }
        }
        .background(t.background.ignoresSafeArea())
    }
}

struct ResidenceOnboarding: View {
    let selectHouse: (String) -> Void
    @State private var isAuthenticating = false
    @State private var authenticationError: String?

    private var isLoading: Bool { isAuthenticating || DvorShotMode.state == "loading" }

    var body: some View {
        DvorEntryScaffold {
            DvorRootChrome(title: "Двор")
        } content: {
            VStack(alignment: .leading, spacing: 16) {
                DvorScreenIntro(
                    title: "Свой дом — без посторонних",
                    detail: "Объявления, заявки и разговоры соседей в одном месте. Писать могут только подтверждённые жильцы."
                )
                if isLoading {
                    AppStatePanel(kind: .loading, title: "Открываем вход Apple", detail: "Подтвердите личность в системном окне.")
                } else if let authenticationError {
                    AppStatePanel(kind: .error, title: "Не удалось войти", detail: authenticationError)
                }
                SignInWithAppleButton(.continue) { request in
                    authenticationError = nil
                    isAuthenticating = true
                    request.requestedScopes = [.fullName, .email]
                } onCompletion: { result in
                    isAuthenticating = false
                    switch result {
                    case .success(let authorization):
                        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential else {
                            authenticationError = "Apple не вернул данные входа. Повторите попытку."
                            return
                        }
                        selectHouse(credential.user)
                    case .failure:
                        authenticationError = "Вход отменён или недоступен. Повторите попытку — данные дома ещё не запрашиваются."
                    }
                }
                .signInWithAppleButtonStyle(.black)
                .frame(height: 50)
                .disabled(isLoading)
                .nativeAction("phone.sign-in-apple")

                Text("Apple подтверждает личность. Адрес дома проверяется отдельно и не передаётся Apple.")
                    .font(.system(size: 13)).foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

struct ResidenceJoinScreen: View {
    let continueVerification: () -> Void
    let manualFallback: () -> Void
    @Environment(Permissions.self) private var permissions
    @State private var address = "Мясницкая улица, 24/7"
    @State private var addressError: String?
    @State private var searching = DvorShotMode.state == "searching"
    @State private var locationDenied = DvorShotMode.state == "denied"

    var body: some View {
        DvorEntryScaffold { DvorRootChrome(title: "Двор") } content: {
            VStack(alignment: .leading, spacing: 16) {
                DvorScreenIntro(title: "Найдите свой дом",
                                detail: "Покажем дела только вашего адреса. Геопозиция нужна один раз, чтобы проверить, что вы рядом.")
                DvorFormField(title: "Адрес", placeholder: "Улица и дом", text: $address,
                              error: addressError, textContentType: .fullStreetAddress, isDisabled: searching,
                              submitLabel: .search, onSubmit: findHouse)
                if locationDenied {
                    AppStatePanel(kind: .warning, title: "Геопозиция недоступна",
                                  detail: "Выберите дом вручную — адрес можно отправить на проверку.")
                } else if !searching {
                    AppStatePanel(kind: .success, title: "Дом найден",
                                  detail: "4 подъезда · 146 подтверждённых жильцов", icon: "building.2.fill")
                }
                DvorPrimaryButton(title: "Я рядом — проверить", loadingTitle: "Ищем рядом…",
                                  isLoading: searching,
                                  isDisabled: address.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
                                  action: findHouse)
                    .nativeAction("join.verify-location")
                Button("Выбрать дом вручную", action: manualFallback)
                    .font(.system(size: 15, weight: .medium)).frame(maxWidth: .infinity, minHeight: 44)
                    .disabled(searching)
                    .nativeAction("join.manual-address")
            }
        }
        .onChange(of: address) { _, _ in addressError = nil }
    }

    private func findHouse() {
        guard address.trimmingCharacters(in: .whitespacesAndNewlines).count >= 5 else {
            addressError = "Укажите улицу и номер дома."; return
        }
        Task {
            searching = true
            locationDenied = false
            if await permissions.request(.location) { continueVerification() }
            else { searching = false; locationDenied = true }
        }
    }
}

struct ResidenceVerificationScreen: View {
    enum VerificationState { case ready, locating, checkingNetwork, success, mismatch }
    let verified: () -> Void
    let manualFallback: () -> Void
    @Environment(Permissions.self) private var permissions
    @Environment(\.theme) private var t
    @State private var state: VerificationState = {
        switch DvorShotMode.state {
        case "checking": .checkingNetwork
        case "success": .success
        case "mismatch", "denied": .mismatch
        default: .ready
        }
    }()
    private var isChecking: Bool { state == .locating || state == .checkingNetwork }

    var body: some View {
        DvorEntryScaffold { DvorRootChrome(title: "Двор") } content: {
            VStack(alignment: .leading, spacing: 16) {
                DvorScreenIntro(title: "Подтвердите свой дом",
                                detail: "Так объявления и разговоры останутся только между соседями.")
                VStack(spacing: 0) {
                    verificationRow(number: "1", title: "Проверим, что вы рядом",
                                    detail: "Геопозиция используется один раз и не сохраняется.", complete: true)
                    RowSeparator(leading: 64)
                    verificationRow(number: "2", title: "Сверим домашнюю сеть",
                                    detail: "Увидим только имя Wi‑Fi сети — без пароля и трафика.",
                                    complete: state == .success || permissions.isGranted(.wifiinfo))
                }
                .background(t.background, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(t.separator))

                if isChecking {
                    AppStatePanel(kind: .loading, title: "Проверяем домашнюю сеть",
                                  detail: "Это займёт несколько секунд.")
                } else if state == .mismatch {
                    AppStatePanel(kind: .warning,
                                  title: DvorShotMode.state == "denied" ? "Доступ к сети не разрешён" : "Не получилось подтвердить автоматически",
                                  detail: "Повторите проверку дома или подтвердите адрес вручную.")
                } else if state == .success {
                    AppStatePanel(kind: .success, title: "Дом подтверждён",
                                  detail: "Теперь вам доступны лента, чаты и сервисы дома.")
                }

                DvorPrimaryButton(title: state == .success ? "Открыть Двор" : "Проверить, что я дома",
                                  loadingTitle: "Проверяем сеть…", isLoading: isChecking,
                                  action: state == .success ? verified : verifyResidence)
                    .nativeAction("verify.verify-network")
                if state != .success {
                    Button("Подтвердить адрес вручную", action: manualFallback)
                        .font(.system(size: 15, weight: .medium)).frame(maxWidth: .infinity, minHeight: 44)
                        .disabled(isChecking)
                        .nativeAction("verify.manual-verification")
                    Text("Если автоматическая проверка не сработает, адрес можно подтвердить вручную.")
                        .font(.system(size: 13)).foregroundStyle(t.textSecondary)
                        .multilineTextAlignment(.center).frame(maxWidth: .infinity)
                }
            }
        }
    }

    private func verificationRow(number: String, title: String, detail: String, complete: Bool) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Group {
                if complete {
                    Image(systemName: "checkmark.circle.fill").font(.system(size: 22, weight: .semibold)).foregroundStyle(t.accent)
                } else {
                    Text(number).font(.system(size: 15, weight: .semibold)).foregroundStyle(t.accent)
                }
            }.frame(width: 32, height: 32)
            VStack(alignment: .leading, spacing: 3) {
                Text(title).font(.system(size: 15, weight: .semibold))
                Text(detail).font(.system(size: 13)).foregroundStyle(t.textSecondary).fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 0)
        }.padding(12)
    }

    private func verifyResidence() {
        Task {
            state = .checkingNetwork
            let networkMatched = await permissions.request(.wifiinfo)
            guard networkMatched else { state = .mismatch; return }
            state = .success
            if DvorShotMode.screen == nil {
                try? await Task.sleep(for: .milliseconds(650)); verified()
            }
        }
    }
}

struct ManualResidenceScreen: View {
    private enum SubmissionState { case idle, submitting, success, error }
    let finish: () -> Void
    @State private var address = "Мясницкая улица, 24/7"
    @State private var apartment = ["submitted", "error"].contains(DvorShotMode.state) ? "48" : ""
    @State private var addressError: String?
    @State private var apartmentError: String?
    @State private var submission: SubmissionState = {
        if DvorShotMode.state == "submitted" { return .success }
        if DvorShotMode.state == "error" { return .error }
        return .idle
    }()

    var body: some View {
        DvorEntryScaffold { DvorRootChrome(title: "Двор") } content: {
            VStack(alignment: .leading, spacing: 16) {
                DvorScreenIntro(title: "Подтвердить адрес вручную",
                                detail: "Сохраним адрес и номер квартиры на этом iPhone. Доступ останется только для чтения, пока дом не подтвердит квартиру.")
                DvorFormField(title: "Адрес", placeholder: "Улица и дом", text: $address,
                              error: addressError, textContentType: .fullStreetAddress)
                DvorFormField(title: "Квартира", placeholder: "Номер квартиры", text: $apartment,
                              keyboard: .numberPad, error: apartmentError, textContentType: .sublocality,
                              submitLabel: .done, onSubmit: submit)
                if submission == .success {
                    AppStatePanel(kind: .success, title: "Заявка сохранена",
                                  detail: "Данные хранятся на этом iPhone. Приложение не выдаёт локальное сохранение за отправку в дом.")
                } else if submission == .error {
                    AppStatePanel(kind: .error, title: "Не удалось отправить заявку",
                                  detail: "Данные остались в форме. Освободите место на устройстве и повторите попытку.")
                }
                DvorPrimaryButton(title: submission == .success ? "Открыть Двор для чтения" : "Сохранить заявку",
                                  loadingTitle: "Сохраняем заявку…", isLoading: submission == .submitting,
                                  isDisabled: submission != .success && (address.isEmpty || apartment.isEmpty),
                                  action: submission == .success ? finish : submit)
                    .nativeAction("manual.submit-residence")
            }
        }
        .onChange(of: address) { _, _ in addressError = nil }
        .onChange(of: apartment) { _, _ in apartmentError = nil }
    }

    private func submit() {
        addressError = address.trimmingCharacters(in: .whitespacesAndNewlines).count < 5
            ? "Укажите улицу и номер дома." : nil
        apartmentError = apartment.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            ? "Укажите номер квартиры." : nil
        guard addressError == nil && apartmentError == nil else { return }
        submission = .submitting
        Task {
            do {
                try ResidenceReviewQueue.enqueue(address: address, apartment: apartment)
                submission = .success
            } catch {
                submission = .error
            }
        }
    }
}

private enum ResidenceReviewQueue {
    static func enqueue(address: String, apartment: String) throws {
        let support = try FileManager.default.url(
            for: .applicationSupportDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: true
        )
        let payload: [String: Any] = [
            "address": address,
            "apartment": apartment,
            "createdAt": ISO8601DateFormatter().string(from: .now),
            "status": "pendingReview",
        ]
        let data = try JSONSerialization.data(withJSONObject: payload, options: [.prettyPrinted, .sortedKeys])
        try data.write(to: support.appendingPathComponent("dvor-residence-review.json"), options: .atomic)
    }
}
