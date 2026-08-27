import SwiftUI

/// Вход: почта или Google, затем выбор дома и проверка «я здесь живу».
/// Право писать выдаёт проверка, а не человек — принцип 1 вижена.
struct AuthFlow: View {
    @Environment(Nav.self) private var nav

    var body: some View {
        @Bindable var nav = nav
        NavigationStack(path: $nav.authPath) {
            PhoneView()
                .navigationDestination(for: Route.self) { Screen($0) }
        }
    }
}

struct PhoneView: View {
    @Environment(Nav.self) private var nav
    @State private var email = "marina@inbox.ru"

    var body: some View {
        Page(spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(D.accent.opacity(0.1))
                    .frame(width: 56, height: 56)
                    .overlay { Image(systemName: "house.fill").font(.system(size: 26)).foregroundStyle(D.accent) }
                    .padding(.bottom, 6)
                Text("Вход в «Двор»")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundStyle(D.ink)
                Text("Войдите по почте — так профиль и выбранный дом останутся с вами на новом устройстве.")
                    .font(.system(size: 15))
                    .foregroundStyle(D.sub)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(.top, 24)

            DCard(padding: D.inset) {
                VStack(alignment: .leading, spacing: 10) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("Электронная почта")
                            .font(.system(size: 13)).foregroundStyle(D.mute)
                        TextField("", text: $email)
                            .font(.system(size: 17))
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                    }
                    .padding(10)
                    .background(D.quietIn, in: RoundedRectangle(cornerRadius: 10, style: .continuous))

                    Label("Почта нужна только для входа и восстановления доступа.", systemImage: "info.circle")
                        .font(.system(size: 13)).foregroundStyle(D.mute)
                }
            }

            Spacer(minLength: 20)

            VStack(spacing: 8) {
                DButton(title: "Продолжить с почтой") { nav.pushAuth(.code) }
                DButton(title: "Продолжить с Google", quiet: true) { nav.pushAuth(.join) }
                Text("Продолжая, вы принимаете правила дома и политику конфиденциальности.")
                    .font(.system(size: 12))
                    .foregroundStyle(D.mute)
                    .multilineTextAlignment(.center)
                    .padding(.top, 4)
            }
        }
        .navigationBarHidden(true)
        .accessibilityIdentifier("screen.phone")
    }
}

struct CodeView: View {
    @Environment(Nav.self) private var nav
    @State private var code = ""

    var body: some View {
        StackPage(title: "Код из письма", spacing: 14) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Проверьте почту").font(.system(size: 22, weight: .bold)).foregroundStyle(D.ink)
                Text("Код отправлен на marina@inbox.ru").font(.system(size: 15)).foregroundStyle(D.sub)
            }
            DCard(padding: D.inset) {
                HStack(spacing: 8) {
                    ForEach(0..<6, id: \.self) { index in
                        Text(index < code.count ? String(Array(code)[index]) : "")
                            .font(.data(22, .semibold))
                            .frame(maxWidth: .infinity, minHeight: 52)
                            .background(D.quietIn, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
                    }
                }
                .overlay {
                    TextField("", text: $code)
                        .keyboardType(.numberPad)
                        .textContentType(.oneTimeCode)
                        .opacity(0.02)
                        .onChange(of: code) { _, value in
                            code = String(value.filter(\.isNumber).prefix(6))
                            if code.count == 6 { nav.pushAuth(.join) }
                        }
                }
            }
            Text("Отправить письмо повторно через 0:24").font(.system(size: 13)).foregroundStyle(D.mute)
            DButton(title: "Продолжить") { nav.pushAuth(.join) }
        }
        .accessibilityIdentifier("screen.code")
    }
}

/// Выбор дома и два способа подтвердить адрес: по сети или вручную.
struct JoinView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access

    var body: some View {
        StackPage(title: "Найдите свой дом", spacing: 12) {
            Text("Выберите дом").font(.system(size: 22, weight: .bold)).foregroundStyle(D.ink)
            Text("Найдите дом в справочнике — общая ветка жильцов откроется сразу.")
                .font(.system(size: 15)).foregroundStyle(D.sub).fixedSize(horizontal: false, vertical: true)

            DCard {
                DRow(title: Concept.house.address, subtitle: "\(Concept.house.corpuses) корпуса, \(Concept.house.flats) квартир") {
                    DBullet(symbol: "building.2")
                } trailing: {
                    Text("выбрать").font(.system(size: 14, weight: .medium)).foregroundStyle(D.accent)
                } action: {}
            }

            DSectionTitle(text: "Как подтвердим адрес")
            DCard {
                DRow(title: "Вы в границах дома", subtitle: "Геопозиция в радиусе 150 м") {
                    DBullet(symbol: "location")
                } trailing: { EmptyView() }
                DHair(inset: 56)
                DRow(title: "Вы в домашней сети", subtitle: "Имя сети совпадает с профилем дома") {
                    DBullet(symbol: "wifi")
                } trailing: { EmptyView() }
            }

            DeniedNotice(key: .location)

            DButton(title: "Я дома — проверить") {
                Task {
                    let ok = await access.request([.location], on: "join")
                    nav.pushAuth(ok ? .verify : .manual)
                }
            }
            .accessibilityIdentifier("action.checkHome")

            Button("Моего дома нет в списке") { nav.pushAuth(.manual) }
                .font(.system(size: 15)).foregroundStyle(D.accent)
                .frame(maxWidth: .infinity, minHeight: D.rowMin)
        }
        .accessibilityIdentifier("screen.join")
    }
}

/// Проверка сети. Имя текущей сети сверяется с профилем дома — это entitlement,
/// системного алерта у него нет.
struct VerifyView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access

    var body: some View {
        StackPage(title: "Проверка сети", spacing: 12) {
            DCard(padding: D.inset) {
                VStack(alignment: .leading, spacing: 12) {
                    HStack(spacing: 10) {
                        DBullet(symbol: "wifi", tint: D.green)
                        VStack(alignment: .leading, spacing: 1) {
                            Text("Сеть \(Concept.house.ssid)").font(.system(size: 16, weight: .medium))
                            Text("В профиле дома — \(Concept.house.ssid)").font(.system(size: 14)).foregroundStyle(D.sub)
                        }
                        Spacer()
                        Text("совпало").font(.system(size: 13, weight: .semibold)).foregroundStyle(D.green)
                    }
                    DHair(inset: 0)
                    HStack(spacing: 10) {
                        DBullet(symbol: "location.fill", tint: D.green)
                        VStack(alignment: .leading, spacing: 1) {
                            Text("До дома 38 м").font(.system(size: 16, weight: .medium))
                            Text("Граница двора — \(Concept.house.radiusMeters) м").font(.system(size: 14)).foregroundStyle(D.sub)
                        }
                        Spacer()
                        Text("в границах").font(.system(size: 13, weight: .semibold)).foregroundStyle(D.green)
                    }
                }
            }

            YardPlan(compact: true)

            Text("Обе проверки пройдены — ветка дома откроется сразу, без заявки на модерацию.")
                .font(.system(size: 14)).foregroundStyle(D.sub).fixedSize(horizontal: false, vertical: true)

            DButton(title: "Подтвердить дом") {
                access.activate(.wifiinfo, on: "verify")
                access.activate(.keychain, on: "verify")
                nav.homeConfirmed = true
                nav.enterApp()
            }
            .accessibilityIdentifier("action.confirmHome")
        }
        .accessibilityIdentifier("screen.verify")
    }
}

/// Запасной путь: адрес вручную, заявку смотрит старший по подъезду.
struct ManualView: View {
    @Environment(Nav.self) private var nav
    @State private var street = "Полевая"
    @State private var house = "12"
    @State private var flat = "74"

    var body: some View {
        StackPage(title: "Адрес вручную", spacing: 12) {
            DeniedNotice(key: .location)

            Text("Добавить дом").font(.system(size: 22, weight: .bold)).foregroundStyle(D.ink)
            Text("Заявку посмотрит старший по подъезду — обычно в тот же день. До подтверждения ветка дома доступна на чтение.")
                .font(.system(size: 15)).foregroundStyle(D.sub).fixedSize(horizontal: false, vertical: true)

            DCard(padding: D.inset) {
                VStack(spacing: 10) {
                    field("Улица", $street)
                    field("Дом", $house)
                    field("Квартира", $flat)
                }
            }

            DButton(title: "Отправить заявку") {
                nav.homeConfirmed = false
                nav.enterApp()
                nav.show("Заявка отправлена старшему по подъезду")
            }
        }
        .accessibilityIdentifier("screen.manual")
    }

    private func field(_ label: String, _ text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label).font(.system(size: 13)).foregroundStyle(D.mute)
            TextField("", text: text).font(.system(size: 17))
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(D.quietIn, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
    }
}
